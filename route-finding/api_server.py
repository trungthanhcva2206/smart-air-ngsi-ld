"""
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @Project smart-air-ngsi-ld
 * @Authors 
 *    - TT (trungthanhcva2206@gmail.com)
 *    - Tankchoi (tadzltv22082004@gmail.com)
 *    - Panh (panh812004.apn@gmail.com)
 * @Copyright (C) 2024 CHK. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
"""
import os
import logging
import geopandas as gpd
import networkx as nx
import osmnx as ox
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from shapely.geometry import LineString
import warnings
import math
import unicodedata
import re
import threading
import time
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

warnings.filterwarnings("ignore", category=UserWarning, module="osmnx")
warnings.filterwarnings("ignore", category=FutureWarning)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Load configuration from environment variables
GRAPH_FILE = os.getenv("GRAPH_FILE", "hanoi_road_network.graphml")
GEOJSON_FILE = os.getenv("GEOJSON_FILE", "ha_noi_with_latlon2.geojson")
SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8081/api/v1/environment-data")
REFRESH_INTERVAL_SECONDS = int(os.getenv("REFRESH_INTERVAL_SECONDS", "3600"))
FLASK_HOST = os.getenv("FLASK_HOST", "127.0.0.1")
FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"

G_base = None
G_main = None
zones_gdf = None
mock_env_data = {}
data_lock = threading.Lock()

# Biến toàn cục cho Edges GDF (để tăng tốc)
edges_gdf_main = None

def normalize_zone_name(zone_name):
    if not zone_name:
        return zone_name
    
    text = zone_name.replace('Đ', 'D').replace('đ', 'd')
    nfd = unicodedata.normalize('NFD', text)
    without_accents = nfd.encode('ascii', 'ignore').decode('utf-8')
    without_accents = re.sub(r'[^\w\s]', ' ', without_accents)
    words = without_accents.split()
    pascal_case = ''.join(word.capitalize() for word in words)
    
    logger.debug(f"normalize_zone_name: '{zone_name}' -> '{pascal_case}'")
    return pascal_case

def get_data_from_spring(zone_names, zone_name_mapping):
    global mock_env_data
    
    logger.info(f"Đang kết nối tới Spring Boot tại {SPRING_BOOT_URL}...")
    try:
        response = requests.get(SPRING_BOOT_URL, timeout=10)
        response.raise_for_status()
        spring_data = response.json()
        logger.info(f"Spring Boot trả về {len(spring_data)} điểm dữ liệu.")
    except requests.exceptions.RequestException as e:
        logger.error(f"LỖI: Không thể kết nối hoặc lấy dữ liệu từ Spring Boot: {e}")
        raise

    if not spring_data:
        logger.warning("Spring Boot trả về dữ liệu rỗng! Sử dụng giá trị mặc định.")
        default_data = {zone: {
            "NO": 0.0, "O3": 0.0, "NO2": 0.0, 
            "NOx": 0.0, "SO2": 0.0, "pm2_5": 0.0
        } for zone in zone_names}
        df = pd.DataFrame.from_dict(default_data, orient='index')
        
        with data_lock:
            mock_env_data = df.to_dict(orient='index')
        
        mean_vals = df.mean()
        df.loc["_mean_"] = mean_vals
        return df

    all_data = {}
    reverse_mapping = {v: k for k, v in zone_name_mapping.items()}
    
    logger.info(f"Reverse mapping có {len(reverse_mapping)} entries")
    
    for spring_key, data in spring_data.items():
        try:
            original_name = reverse_mapping.get(spring_key)
            
            if original_name:
                all_data[original_name] = {
                    "NO": data.get('no', 0),
                    "O3": data.get('o3', 0),
                    "NO2": data.get('no2', 0),
                    "NOx": data.get('nox', 0),
                    "SO2": data.get('so2', 0),
                    "pm2_5": data.get('pm2_5', 0),
                }
                logger.info(f"✓ Mapped: '{spring_key}' -> '{original_name}'")
            else:
                logger.warning(f"✗ Không tìm thấy mapping cho key từ Spring: '{spring_key}'")
        except Exception as e:
            logger.warning(f"Lỗi khi xử lý dữ liệu cho key '{spring_key}': {e}")
    
    if not all_data:
        logger.warning("Không map được dữ liệu nào từ Spring Boot! Sử dụng giá trị mặc định.")
        default_data = {zone: {
            "NO": 0.0, "O3": 0.0, "NO2": 0.0,
            "NOx": 0.0, "SO2": 0.0, "pm2_5": 0.0
        } for zone in zone_names}
        df = pd.DataFrame.from_dict(default_data, orient='index')
        
        with data_lock:
            mock_env_data = df.to_dict(orient='index')
        
        mean_vals = df.mean()
        df.loc["_mean_"] = mean_vals
        return df
            
    df = pd.DataFrame.from_dict(all_data, orient='index')
    df = df.reindex(zone_names)
    mean_vals = df.mean()
    
    missing_zones = df[df['NO'].isnull()].index
    if not missing_zones.empty:
        logger.warning(f"Các vùng sau không có dữ liệu từ Spring, dùng giá trị trung bình: {list(missing_zones)}")
        df = df.fillna(mean_vals)
    
    with data_lock:
        mock_env_data = df.to_dict(orient='index')
        
    df.loc["_mean_"] = mean_vals
    logger.info(f"✅ Đã tạo DataFrame với {len(all_data)} zones có dữ liệu thực")
    return df

def periodic_data_updater():
    global G_main, G_base, zones_gdf, data_lock, edges_gdf_main
    
    while True:
        logger.info(f"[Background Updater] Đang ngủ trong {REFRESH_INTERVAL_SECONDS} giây...")
        time.sleep(REFRESH_INTERVAL_SECONDS)
        
        try:
            logger.info("[Background Updater] Đã thức dậy! Bắt đầu cập nhật dữ liệu...")
            
            zone_names = zones_gdf["Tên đơn vị"].tolist()
            zone_name_mapping = {zone: normalize_zone_name(zone) for zone in zone_names}
            env_df_new = get_data_from_spring(zone_names, zone_name_mapping)
            
            G_main_new = precalculate_all_costs(G_base.copy(), zones_gdf, env_df_new)
            
            with data_lock:
                G_main = G_main_new
                logger.info("[Background Updater] Đang cập nhật Edges GDF...")
                edges_gdf_main = ox.graph_to_gdfs(G_main, nodes=False, edges=True)
                logger.info("[Background Updater] ✅ Đã cập nhật G_main và edges_gdf_main!")
        
        except Exception as e:
            logger.error(f"[Background Updater] Lỗi khi cập nhật dữ liệu: {e}")
            logger.error("[Background Updater] Sẽ thử lại sau 1 giờ.")

def precalculate_all_costs(road_graph, zones_gdf, env_df):
    logger.info("Đang vector hóa GDFs (nodes/edges)...")
    nodes_gdf = ox.graph_to_gdfs(road_graph, edges=False)
    edges_gdf = ox.graph_to_gdfs(road_graph, nodes=False)
    mean_vals = env_df.loc["_mean_"]
    zones_with_env = zones_gdf.merge(env_df, left_on="Tên đơn vị", right_index=True, how="left").fillna(mean_vals)
    
    logger.info("Đang thực hiện Spatial Join (nodes vào zones)...")
    nodes_in_zones = gpd.sjoin(nodes_gdf, zones_with_env, how="left", predicate="within")
    
    env_columns = ["NO", "O3", "NO2", "NOx", "SO2", "pm2_5"]
    nodes_in_zones[env_columns] = nodes_in_zones[env_columns].fillna(mean_vals)
    node_env_data = nodes_in_zones[env_columns]
    
    logger.info("Đang merge chi phí vào các cạnh (edges)...")
    edges_with_data = edges_gdf.merge(node_env_data, left_on='u', right_index=True, how='left')
    edges_with_data = edges_with_data.merge(node_env_data, left_on='v', right_index=True, how='left', suffixes=('_u', '_v'))
    edges_with_data = edges_with_data.fillna(mean_vals)
    
    logger.info("Đang tính toán chi phí (vectorized)...")
    
    avg_no = (edges_with_data['NO_u'] + edges_with_data['NO_v']) / 2
    avg_o3 = (edges_with_data['O3_u'] + edges_with_data['O3_v']) / 2
    avg_no2 = (edges_with_data['NO2_u'] + edges_with_data['NO2_v']) / 2
    avg_nox = (edges_with_data['NOx_u'] + edges_with_data['NOx_v']) / 2
    avg_so2 = (edges_with_data['SO2_u'] + edges_with_data['SO2_v']) / 2
    avg_pm25 = (edges_with_data['pm2_5_u'] + edges_with_data['pm2_5_v']) / 2
    
    length = edges_with_data['length']
    
    cost_wind = (length + 
                 avg_no * 10 + avg_o3 * 8 + avg_no2 * 12 + 
                 avg_nox * 9 + avg_so2 * 7 + avg_pm25 * 15)
    
    cost_short = (length * 1.5 + 
                  avg_no * 6 + avg_o3 * 5 + avg_no2 * 8 + 
                  avg_nox * 5 + avg_so2 * 4 + avg_pm25 * 10)
    
    logger.info("Đang gán thuộc tính chi phí vào đồ thị...")
    nx.set_edge_attributes(road_graph, cost_wind.to_dict(), 'cost_wind')
    nx.set_edge_attributes(road_graph, cost_short.to_dict(), 'cost_short')
    logger.info("✅ Tính toán trước chi phí thành công!")
    return road_graph

def find_route_classical(graph, start_node, end_node, weight_attr):
    logger.info(f"Đang tìm đường đi cổ điển (weight={weight_attr})...")
    try:
        path = nx.shortest_path(graph, start_node, end_node, weight=weight_attr)
        return path
    except nx.NetworkXNoPath:
        logger.error("Không tìm thấy đường đi.")
        return None

def load_all_data():
    global G_main, G_base, zones_gdf, edges_gdf_main
    
    if not os.path.exists(GRAPH_FILE):
        logger.error(f"Không tìm thấy tệp {GRAPH_FILE}")
        exit()

    logger.info(f"Đang tải bản đồ đường đi từ {GRAPH_FILE}...")
    G_base = ox.load_graphml(GRAPH_FILE)
    
    logger.info(f"Đang tải bản đồ vùng từ {GEOJSON_FILE}...")
    zones_gdf = gpd.read_file(GEOJSON_FILE)
    zones_gdf = zones_gdf.to_crs(G_base.graph["crs"])
    zone_names = zones_gdf["Tên đơn vị"].tolist()
    
    logger.info(f"Tìm thấy {len(zone_names)} zones trong GeoJSON")
    logger.info(f"Ví dụ: {zone_names[:3]}")

    logger.info("Tạo mapping zone names...")
    zone_name_mapping = {zone: normalize_zone_name(zone) for zone in zone_names}
    
    logger.info(f"Mapping examples:")
    for i, (original, normalized) in enumerate(zone_name_mapping.items()):
        if i < 5:
            logger.info(f"  '{original}' -> '{normalized}'")

    logger.info("Lần tải đầu tiên: Lấy dữ liệu từ Spring Boot...")
    env_df_initial = get_data_from_spring(zone_names, zone_name_mapping)
    
    with data_lock:
        G_main = precalculate_all_costs(G_base.copy(), zones_gdf, env_df_initial)
        logger.info("Chuyển đổi G_main sang Edges GeoDataFrame (một lần)...")
        edges_gdf_main = ox.graph_to_gdfs(G_main, nodes=False, edges=True)
        logger.info("✅ Chuyển đổi Edges GDF hoàn tất.")
        
    logger.info("✅ Dữ liệu bản đồ và môi trường (TỪ SPRING BOOT) đã được tải lần đầu.")

    logger.info(f"Khởi động tiến trình cập nhật dữ liệu nền (refresh mỗi {REFRESH_INTERVAL_SECONDS} giây)...")
    updater_thread = threading.Thread(target=periodic_data_updater)
    updater_thread.daemon = True
    updater_thread.start()

@app.route("/api/get-env", methods=["GET"])
def get_env_api():
    global mock_env_data, data_lock
    with data_lock:
        return jsonify(mock_env_data)

@app.route("/api/find-route", methods=["POST"])
def find_route_api():
    global G_main, data_lock, edges_gdf_main
    
    data = request.json
    start_coords = data.get("start")
    end_coords = data.get("end")
    mode = data.get("mode", "wind")

    if not start_coords or not end_coords:
        return jsonify({"error": "Thiếu tọa độ bắt đầu hoặc kết thúc"}), 400

    if mode == "wind":
        weight_attr = "cost_wind"
        logger.info("Sử dụng 'cost_wind' làm trọng số.")
    else:
        weight_attr = "cost_short"
        logger.info("Sử dụng 'cost_short' làm trọng số.")
    
    with data_lock:
        if G_main is None or edges_gdf_main is None:
             return jsonify({"error": "Đồ thị chưa được tải, vui lòng khởi động lại server."}), 500
        G_current = G_main
        edges_gdf = edges_gdf_main
    
    try:
        start_node = ox.nearest_nodes(G_current, *start_coords)
        end_node = ox.nearest_nodes(G_current, *end_coords)
        path_nodes = find_route_classical(G_current, start_node, end_node, weight_attr)
    except Exception as e:
        logger.error(f"Lỗi trong quá trình tìm đường: {e}")
        return jsonify({"error": "Lỗi máy chủ khi tìm đường."}), 500
    
    if path_nodes is None:
        return jsonify({"error": "Không tìm thấy đường đi"}), 404

    edge_tuples = list(zip(path_nodes[:-1], path_nodes[1:]))
    route_edges_gdf = edges_gdf.loc[edges_gdf.index.map(lambda idx: (idx[0], idx[1]) in edge_tuples)]
    route_geojson_gdf = route_edges_gdf.to_crs(epsg=4326)
    route_geojson = route_geojson_gdf.__geo_interface__

    # ===== LOGIC CHỈ ĐƯỜNG MỚI (CHÍNH XÁC HƠN) v2.0 =====
    def bearing(p1, p2):
        lon1, lat1, lon2, lat2 = map(math.radians, [p1[0], p1[1], p2[0], p2[1]])
        dlon = lon2 - lon1
        x = math.sin(dlon) * math.cos(lat2)
        y = math.cos(lat1)*math.sin(lat2) - math.sin(lat1)*math.cos(lat2)*math.cos(dlon)
        return (math.degrees(math.atan2(x, y)) + 360) % 360

    def turn_direction(b1, b2):
        delta = (b2 - b1 + 540) % 360 - 180
        if abs(delta) < 30: # Ngưỡng 30 độ cho "đi thẳng"
            return "đi thẳng"
        elif delta > 0:
            return "rẽ phải"
        else:
            return "rẽ trái"

    directions_text = []
    
    if route_edges_gdf.empty:
        return jsonify({
            "route_geojson": route_geojson,
            "directions": ["Không thể tạo lộ trình chi tiết."],
            "mode": mode
        })

    current_road = None
    current_distance = 0
    prev_end_bearing = None # Lưu góc (bearing) của *cuối* đoạn đường trước

    for i, (_, edge) in enumerate(route_edges_gdf.iterrows()):
        geom = edge.geometry
        if geom.geom_type != "LineString":
            continue

        coords = list(geom.coords)
        if len(coords) < 2:
            continue # Bỏ qua nếu geometry không hợp lệ

        # Góc (bearing) của *đầu* đoạn đường này (dùng 2 điểm đầu)
        start_bearing = bearing(coords[0], coords[1])
        # Góc (bearing) của *cuối* đoạn đường này (dùng 2 điểm cuối)
        end_bearing = bearing(coords[-2], coords[-1])

        road_name = edge.get("name")
        if isinstance(road_name, list):
            road_name = road_name[0] if road_name else "Đường không tên"
        elif not isinstance(road_name, str) or pd.isna(road_name):
            road_name = "Đường không tên"
        
        dist_m = edge.get("length", 0)

        if i == 0:
            # Đoạn đường đầu tiên
            current_road = road_name
            current_distance = dist_m
            directions_text.append(f"Xuất phát trên {current_road}")
        else:
            # So sánh góc ra của đoạn TRƯỚC (prev_end_bearing) với góc vào của đoạn NÀY (start_bearing)
            turn = turn_direction(prev_end_bearing, start_bearing) 
            
            # Nếu tên đường giống nhau VÀ là đi thẳng -> gộp lại
            if road_name == current_road and turn == "đi thẳng":
                current_distance += dist_m
            else: 
                # Nếu không, (1) chốt lại khoảng cách cho đoạn đường trước
                if current_distance > 0 and directions_text:
                    last_instruction = directions_text.pop()
                    directions_text.append(f"{last_instruction} (khoảng {int(current_distance)} m).")
                
                # (2) Thêm chỉ dẫn rẽ/đổi đường mới
                if road_name == current_road: 
                    # Cùng tên đường nhưng rẽ gắt (ví dụ: quay đầu, rẽ ở ngã 3)
                    directions_text.append(f"{turn.capitalize()} để tiếp tục trên {road_name}")
                else: 
                    # Khác tên đường
                    directions_text.append(f"{turn.capitalize()} vào {road_name}")
                
                # (3) Đặt lại tên đường và khoảng cách
                current_road = road_name
                current_distance = dist_m

        # Cập nhật góc ra cho vòng lặp tiếp theo
        prev_end_bearing = end_bearing 

    # Chốt lại khoảng cách cho đoạn đường cuối cùng
    if current_distance > 0 and directions_text:
        last_instruction = directions_text.pop()
        directions_text.append(f"{last_instruction} (khoảng {int(current_distance)} m).")

    directions_text.append("Đến điểm đích.")
    # ===== KẾT THÚC LOGIC CHỈ ĐƯỜNG v2.0 =====
    
    return jsonify({
        "route_geojson": route_geojson,
        "directions": directions_text,
        "mode": mode
    })

if __name__ == "__main__":
    load_all_data()
    logger.info(f"✅ Máy chủ Backend đã sẵn sàng. http://{FLASK_HOST}:{FLASK_PORT}")
    app.run(debug=FLASK_DEBUG, host=FLASK_HOST, port=FLASK_PORT)