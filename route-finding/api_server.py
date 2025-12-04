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
 * @Copyright (C) 2025 CHK. All rights reserved
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
import sseclient
import json
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
SSE_ENDPOINT = os.getenv("SSE_ENDPOINT", "http://localhost:8123/api/sse/environment-data")
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
    """
    Normalize zone name to match Spring Boot format
    Example: "Phường Hoàn Kiếm" -> "PhuongHoanKiem"
    """
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

def sse_listener():
    """
    Listen to SSE stream from Spring Boot Backend
    Updates mock_env_data and G_main when new data arrives
    Auto-reconnects on connection loss
    """
    global G_main, G_base, zones_gdf, data_lock, edges_gdf_main, mock_env_data
    
    logger.info(f"[SSE Listener] 🔌 Đang kết nối tới SSE endpoint: {SSE_ENDPOINT}")
    
    while True:
        try:
            response = requests.get(SSE_ENDPOINT, stream=True, timeout=None)
            client = sseclient.SSEClient(response)
            
            logger.info("[SSE Listener] ✅ Kết nối SSE thành công!")
            
            for event in client.events():
                try:
                    if event.event == "environment.initial":
                        logger.info("[SSE Listener] 📦 Nhận dữ liệu ban đầu từ Backend...")
                        handle_environment_data(json.loads(event.data))
                    
                    elif event.event == "environment.update":
                        logger.info("[SSE Listener] 🔄 Nhận cập nhật dữ liệu môi trường...")
                        handle_environment_data(json.loads(event.data))
                    
                    elif event.event == "keep-alive":
                        logger.debug("[SSE Listener] ❤️ Keep-alive received")
                        
                except json.JSONDecodeError as e:
                    logger.error(f"[SSE Listener] Lỗi parse JSON: {e}")
                except Exception as e:
                    logger.error(f"[SSE Listener] Lỗi xử lý event: {e}")
        
        except requests.exceptions.RequestException as e:
            logger.error(f"[SSE Listener] ❌ Lỗi kết nối SSE: {e}")
            logger.info("[SSE Listener] 🔄 Đang thử kết nối lại sau 5 giây...")
            time.sleep(5)
        except Exception as e:
            logger.error(f"[SSE Listener] ❌ Lỗi không xác định: {e}")
            time.sleep(5)

def handle_environment_data(spring_data):
    """
    Process environment data from SSE stream
    Updates mock_env_data and recalculates graph costs
    
    Args:
        spring_data: Dict with format {stationName: AirQualityDataDTO}
    """
    global G_main, G_base, zones_gdf, data_lock, edges_gdf_main, mock_env_data
    
    try:
        if not spring_data:
            logger.warning("[SSE Handler] Nhận dữ liệu rỗng, bỏ qua.")
            return
        
        logger.info(f"[SSE Handler] 🔄 Đang xử lý {len(spring_data)} điểm dữ liệu...")
        
        zone_names = zones_gdf["Tên đơn vị"].tolist()
        zone_name_mapping = {zone: normalize_zone_name(zone) for zone in zone_names}
        reverse_mapping = {v: k for k, v in zone_name_mapping.items()}

        station_to_zone = {
        }
        
        all_data = {}
        for spring_key, data in spring_data.items():
            all_data = {}
        for spring_key, data in spring_data.items():
            # Ưu tiên mapping từ station_to_zone
            original_name = station_to_zone.get(spring_key)
            if not original_name:
                original_name = reverse_mapping.get(spring_key)

            if original_name:
                all_data[original_name] = {
                    "NO": data.get('no', 0),
                    "O3": data.get('o3', 0),
                    "NO2": data.get('no2', 0),
                    "NOx": data.get('nox', 0),
                    "SO2": data.get('so2', 0),
                    "pm2_5": data.get('pm2_5', 0),
                    "pm10": data.get('pm10', 0),
                    "nh3": data.get('nh3', 0),
                    "windSpeed": data.get('windSpeed', 0),
                }
                logger.debug(f"✓ Mapped: '{spring_key}' -> '{original_name}'")
        
        if not all_data:
            logger.warning("[SSE Handler] Không map được dữ liệu nào!")
            return
        
        # Create DataFrame from new data
        df = pd.DataFrame.from_dict(all_data, orient='index')
        df = df.reindex(zone_names)
        mean_vals = df.mean()
        df = df.fillna(mean_vals)
        df.loc["_mean_"] = mean_vals
        
        # Update mock_env_data
        with data_lock:
            mock_env_data = df.to_dict(orient='index')
            logger.info("[SSE Handler] ✅ Đã cập nhật mock_env_data")
        
        # Recalculate graph costs
        logger.info("[SSE Handler] 🔄 Đang tính toán lại chi phí cho đồ thị...")
        G_main_new = precalculate_all_costs(G_base.copy(), zones_gdf, df)
        
        with data_lock:
            G_main = G_main_new
            edges_gdf_main = ox.graph_to_gdfs(G_main, nodes=False, edges=True)
            logger.info("[SSE Handler] ✅ Đã cập nhật G_main và edges_gdf_main!")
            
    except Exception as e:
        logger.error(f"[SSE Handler] ❌ Lỗi xử lý dữ liệu: {e}")

def precalculate_all_costs(road_graph, zones_gdf, env_df):
    """
    Precalculate routing costs for all edges based on environmental data
    Uses vectorized operations for performance
    """
    logger.info("Đang vector hóa GDFs (nodes/edges)...")
    nodes_gdf = ox.graph_to_gdfs(road_graph, edges=False)
    edges_gdf = ox.graph_to_gdfs(road_graph, nodes=False)
    mean_vals = env_df.loc["_mean_"]
    zones_with_env = zones_gdf.merge(env_df, left_on="Tên đơn vị", right_index=True, how="left").fillna(mean_vals)
    
    logger.info("Đang thực hiện Spatial Join (nodes vào zones)...")
    nodes_in_zones = gpd.sjoin(nodes_gdf, zones_with_env, how="left", predicate="within")
    
    env_columns = ["NO", "O3", "NO2", "NOx", "SO2", "pm2_5", "pm10", "nh3", "windSpeed"]
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
    avg_pm10 = (edges_with_data['pm10_u'] + edges_with_data['pm10_v']) / 2
    avg_nh3 = (edges_with_data['nh3_u'] + edges_with_data['nh3_v']) / 2
    avg_windspeed = (edges_with_data['windSpeed_u'] + edges_with_data['windSpeed_v']) / 2
    
    length = edges_with_data['length']
    
    # Cost for clean air route (higher weight on pollutants)
    # Wind speed càng cao → giảm chi phí (gió mạnh thổi bay ô nhiễm)
    cost_wind = (length + 
                 avg_no * 10 + avg_o3 * 8 + avg_no2 * 12 + 
                 avg_nox * 9 + avg_so2 * 7 + avg_pm25 * 15 +
                 avg_pm10 * 12 + avg_nh3 * 8 - avg_windspeed * 5)
    
    # Cost for shortest route (lower weight on pollutants)
    cost_short = (length * 1.5 + 
                  avg_no * 6 + avg_o3 * 5 + avg_no2 * 8 + 
                  avg_nox * 5 + avg_so2 * 4 + avg_pm25 * 10 +
                  avg_pm10 * 7 + avg_nh3 * 5 - avg_windspeed * 3)
    
    logger.info("Đang gán thuộc tính chi phí vào đồ thị...")
    nx.set_edge_attributes(road_graph, cost_wind.to_dict(), 'cost_wind')
    nx.set_edge_attributes(road_graph, cost_short.to_dict(), 'cost_short')
       # --- GÁN THUỘC TÍNH POLLUTANTS VÀ CÁC TRƯỜNG TIỆN ÍCH (để edges_gdf có dữ liệu) ---
    try:
        # trung bình 2 đầu (đã tính ở trên)
        nx.set_edge_attributes(road_graph, avg_pm25.to_dict(), 'pm2_5')
        nx.set_edge_attributes(road_graph, avg_pm10.to_dict(), 'pm10')
        nx.set_edge_attributes(road_graph, avg_windspeed.to_dict(), 'windSpeed')

        # giữ cả giá trị ở hai đầu nếu cần (u/v)
        nx.set_edge_attributes(road_graph, edges_with_data['pm2_5_u'].to_dict(), 'pm2_5_u')
        nx.set_edge_attributes(road_graph, edges_with_data['pm2_5_v'].to_dict(), 'pm2_5_v')
        nx.set_edge_attributes(road_graph, edges_with_data['pm10_u'].to_dict(), 'pm10_u')
        nx.set_edge_attributes(road_graph, edges_with_data['pm10_v'].to_dict(), 'pm10_v')
    except Exception as e:
        logger.warning(f"Không thể gán thuộc tính pollutants lên graph: {e}")
    logger.info("✅ Tính toán trước chi phí thành công!")
    return road_graph

def find_route_classical(graph, start_node, end_node, weight_attr):
    """
    Find shortest path using Dijkstra's algorithm
    """
    logger.info(f"Đang tìm đường đi cổ điển (weight={weight_attr})...")
    try:
        path = nx.shortest_path(graph, start_node, end_node, weight=weight_attr)
        return path
    except nx.NetworkXNoPath:
        logger.error("Không tìm thấy đường đi.")
        return None

def load_all_data():
    """
    Load initial data: road network, zones
    Then start SSE listener thread for real-time updates
    SSE will provide initial environment data via "environment.initial" event
    """
    global G_main, G_base, zones_gdf, edges_gdf_main, mock_env_data
    
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

    # Khởi tạo với dữ liệu mặc định
    logger.info("Khởi tạo đồ thị với dữ liệu môi trường mặc định...")
    default_data = {zone: {
        "NO": 0.0, "O3": 0.0, "NO2": 0.0,
        "NOx": 0.0, "SO2": 0.0, "pm2_5": 0.0,"pm10": 0.0,
        "nh3": 0.0,
        "windSpeed": 0.0,
    } for zone in zone_names}
    env_df_initial = pd.DataFrame.from_dict(default_data, orient='index')
    mean_vals = env_df_initial.mean()
    env_df_initial.loc["_mean_"] = mean_vals
    
    with data_lock:
        mock_env_data = env_df_initial.to_dict(orient='index')
        G_main = precalculate_all_costs(G_base.copy(), zones_gdf, env_df_initial)
        edges_gdf_main = ox.graph_to_gdfs(G_main, nodes=False, edges=True)
        
    logger.info("✅ Đồ thị đã được khởi tạo với giá trị mặc định")
    logger.info("⏳ Chờ dữ liệu thực từ SSE stream...")

    # Khởi động SSE listener
    logger.info("🔌 Khởi động SSE listener để nhận real-time updates...")
    sse_thread = threading.Thread(target=sse_listener)
    sse_thread.daemon = True
    sse_thread.start()
    
    logger.info("✅ Hệ thống đã sẵn sàng!")

@app.route("/api/get-env", methods=["GET"])
def get_env_data():
    """
    Trả về dữ liệu môi trường mới nhất cho từng phường/xã
    Dữ liệu này đã được cập nhật từ SSE Spring Boot (bao gồm cả thiết bị thật)
    """
    global mock_env_data, data_lock

    with data_lock:
        # Trả về dữ liệu mới nhất cho từng zone (phường/xã)
        # Format: {zone_name: {NO, O3, NO2, NOx, SO2, pm2_5, pm10, nh3, windSpeed}}
        return jsonify(mock_env_data)

@app.route("/api/find-route", methods=["POST"])
def find_route_api():
    """
    Find optimal route between two points
    Supports two modes: 'wind' (clean air) and 'short' (shortest)
    """
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
        if abs(delta) < 30:
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
    prev_end_bearing = None

    for i, (_, edge) in enumerate(route_edges_gdf.iterrows()):
        geom = edge.geometry
        if geom.geom_type != "LineString":
            continue

        coords = list(geom.coords)
        if len(coords) < 2:
            continue

        start_bearing = bearing(coords[0], coords[1])
        end_bearing = bearing(coords[-2], coords[-1])

        road_name = edge.get("name")
        if isinstance(road_name, list):
            road_name = road_name[0] if road_name else "Đường không tên"
        elif not isinstance(road_name, str) or pd.isna(road_name):
            road_name = "Đường không tên"
        
        dist_m = edge.get("length", 0)

        if i == 0:
            current_road = road_name
            current_distance = dist_m
            directions_text.append(f"Xuất phát trên {current_road}")
        else:
            turn = turn_direction(prev_end_bearing, start_bearing) 
            
            if road_name == current_road and turn == "đi thẳng":
                current_distance += dist_m
            else: 
                if current_distance > 0 and directions_text:
                    last_instruction = directions_text.pop()
                    directions_text.append(f"{last_instruction} (khoảng {int(current_distance)} m).")
                
                if road_name == current_road: 
                    directions_text.append(f"{turn.capitalize()} để tiếp tục trên {road_name}")
                else: 
                    directions_text.append(f"{turn.capitalize()} vào {road_name}")
                
                current_road = road_name
                current_distance = dist_m

        prev_end_bearing = end_bearing 

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

@app.route("/api/find-both-routes", methods=["POST"])
def find_both_routes():
    global G_main, data_lock, edges_gdf_main

    data = request.json
    start_coords = data.get("start")
    end_coords = data.get("end")

    if not start_coords or not end_coords:
        return jsonify({"error": "Thiếu tọa độ"}), 400

    with data_lock:
        G = G_main
        edges_gdf = edges_gdf_main

    try:
        start_node = ox.nearest_nodes(G, *start_coords)
        end_node = ox.nearest_nodes(G, *end_coords)

        # Tìm 2 tuyến
        path_wind = find_route_classical(G, start_node, end_node, "cost_wind")
        path_short = find_route_classical(G, start_node, end_node, "cost_short")

        def build_route(path_nodes):
            edge_pairs = list(zip(path_nodes[:-1], path_nodes[1:]))
            r_edges = edges_gdf.loc[
                edges_gdf.index.map(lambda idx: (idx[0], idx[1]) in edge_pairs)
            ]
            geo = r_edges.to_crs(epsg=4326).__geo_interface__

            total_dist = r_edges["length"].sum()
            if "pm2_5" in r_edges.columns:
                avg_pm25 = float(r_edges["pm2_5"].mean() or 0.0)
            elif all(c in r_edges.columns for c in ["pm2_5_u", "pm2_5_v"]):
                avg_pm25 = float(r_edges[["pm2_5_u", "pm2_5_v"]].mean(axis=1).mean() or 0.0)
            else:
                avg_pm25 = 0.0
            time_min = total_dist / 1000 / 30 * 60   # vận tốc 30km/h

            return {
                "geojson": geo,
                "distance_m": float(total_dist),
                "time_min": float(time_min),
                "pm25_avg": float(avg_pm25),
            }

        result_wind = build_route(path_wind)
        result_short = build_route(path_short)

        return jsonify({
            "wind": result_wind,
            "short": result_short,
        })

    except Exception as e:
        logger.error(f"Lỗi: {e}")
        return jsonify({"error": "Lỗi xử lý"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint for Docker and load balancers
    Returns service status and graph availability
    """
    global G_main, zones_gdf, mock_env_data
    
    try:
        # Check if graph is loaded
        graph_loaded = G_main is not None and zones_gdf is not None
        
        # Check if environment data is available
        env_data_available = len(mock_env_data) > 0
        
        # Get data stats
        num_zones = len(zones_gdf) if zones_gdf is not None else 0
        num_nodes = G_main.number_of_nodes() if G_main is not None else 0
        num_edges = G_main.number_of_edges() if G_main is not None else 0
        
        status = {
            "status": "healthy" if graph_loaded else "initializing",
            "service": "route-finding",
            "graph_loaded": graph_loaded,
            "env_data_available": env_data_available,
            "stats": {
                "zones": num_zones,
                "nodes": num_nodes,
                "edges": num_edges,
                "env_data_points": len(mock_env_data)
            }
        }
        
        return jsonify(status), 200 if graph_loaded else 503
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

if __name__ == "__main__":
    load_all_data()
    logger.info(f"✅ Máy chủ Backend đã sẵn sàng. http://{FLASK_HOST}:{FLASK_PORT}")
    app.run(debug=FLASK_DEBUG, host=FLASK_HOST, port=FLASK_PORT)