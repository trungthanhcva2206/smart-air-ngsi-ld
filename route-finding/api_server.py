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
 * @Project Air Track NGSI-LD
 * @Authors 
 *    - TT (trungthanhcva2206@gmail.com)
 *    - Tankchoi (tadzltv22082004@gmail.com)
 *    - Panh (panh812004.apn@gmail.com)
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
"""
import os
import logging
import geopandas as gpd
import networkx as nx
import osmnx as ox
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
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

load_dotenv()
warnings.filterwarnings("ignore", category=UserWarning, module="osmnx")
warnings.filterwarnings("ignore", category=FutureWarning)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

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
edges_gdf_main = None
WATCHDOG_TIMEOUT = 120

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

def sse_listener():
    global G_main, G_base, zones_gdf, data_lock, edges_gdf_main, mock_env_data
    reconnect_delay = 5
    logger.info(f"[SSE] Connecting to {SSE_ENDPOINT}")
    while True:
        try:
            response = requests.get(SSE_ENDPOINT, stream=True, timeout=WATCHDOG_TIMEOUT)
            if response.status_code != 200:
                logger.warning(f"[SSE] Error {response.status_code}")
                time.sleep(reconnect_delay)
                reconnect_delay = min(reconnect_delay * 2, 60)
                continue
            client = sseclient.SSEClient(response)
            logger.info("[SSE] Connected successfully")
            reconnect_delay = 5
            for event in client.events():
                try:
                    if event.event in ["environment.initial", "environment.update"]:
                        handle_environment_data(json.loads(event.data))
                    elif event.event == "keep-alive":
                        logger.debug("[SSE] Keep-alive")
                except json.JSONDecodeError as e:
                    logger.error(f"[SSE] JSON error: {e}")
                except Exception as e:
                    logger.error(f"[SSE] Event error: {e}")
        except requests.exceptions.ReadTimeout:
            logger.warning(f"[SSE] Timeout after {WATCHDOG_TIMEOUT}s, reconnecting...")
        except requests.exceptions.RequestException as e:
            logger.error(f"[SSE] Connection error: {e}")
            time.sleep(reconnect_delay)
            reconnect_delay = min(reconnect_delay * 2, 60)
        except Exception as e:
            logger.error(f"[SSE] Unknown error: {e}")
            time.sleep(5)

def handle_environment_data(spring_data):
    global G_main, G_base, zones_gdf, data_lock, edges_gdf_main, mock_env_data
    try:
        if not spring_data:
            logger.warning("[Handler] Empty data")
            return
        logger.info(f"[Handler] Processing {len(spring_data)} data points")
        zone_names = zones_gdf["Tên đơn vị"].tolist()
        zone_name_mapping = {zone: normalize_zone_name(zone) for zone in zone_names}
        reverse_mapping = {v: k for k, v in zone_name_mapping.items()}
        station_to_zone = {}
        all_data = {}
        for spring_key, data in spring_data.items():
            original_name = station_to_zone.get(spring_key)
            if not original_name:
                original_name = reverse_mapping.get(spring_key)
            if original_name:
                pm25_value = (data.get('pm25', None) or data.get('pm2_5', None) or data.get('pm2.5', None) or data.get('PM25', None) or data.get('PM2_5', None) or 0)
                pm10_value = (data.get('pm10', None) or data.get('PM10', None) or 0)
                all_data[original_name] = {
                    "NO": float(data.get('no', data.get('NO', 0))),
                    "O3": float(data.get('o3', data.get('O3', 0))),
                    "NO2": float(data.get('no2', data.get('NO2', 0))),
                    "NOx": float(data.get('nox', data.get('NOx', 0))),
                    "SO2": float(data.get('so2', data.get('SO2', 0))),
                    "pm2_5": float(pm25_value),
                    "pm10": float(pm10_value),
                    "nh3": float(data.get('nh3', data.get('NH3', 0))),
                    "windSpeed": float(data.get('windSpeed', data.get('wind_speed', 0))),
                }
                logger.debug(f"Mapped: {spring_key} -> {original_name} | PM2.5={pm25_value}")
        if not all_data:
            logger.warning("[Handler] No data mapped")
            return
        df = pd.DataFrame.from_dict(all_data, orient='index')
        df = df.reindex(zone_names)
        logger.info(f"[DEBUG] PM2.5 range: {df['pm2_5'].min()}-{df['pm2_5'].max()}, mean={df['pm2_5'].mean()}")
        mean_vals = df.mean()
        df = df.fillna(mean_vals)
        df.loc["_mean_"] = mean_vals
        logger.info(f"[DEBUG] PM2.5 mean: {mean_vals['pm2_5']}, PM10 mean: {mean_vals['pm10']}")
        with data_lock:
            mock_env_data = df.to_dict(orient='index')
            logger.info("[Handler] Updated mock_env_data")
        logger.info("[Handler] Recalculating graph costs...")
        G_main_new = precalculate_all_costs(G_base.copy(), zones_gdf, df)
        with data_lock:
            G_main = G_main_new
            edges_gdf_main = ox.graph_to_gdfs(G_main, nodes=False, edges=True)
            logger.info("[Handler] Updated G_main and edges_gdf_main")
    except Exception as e:
        logger.error(f"[Handler] Error: {e}")
        import traceback
        logger.error(traceback.format_exc())

def precalculate_all_costs(road_graph, zones_gdf, env_df):
    logger.info("Vectorizing GDFs...")
    nodes_gdf = ox.graph_to_gdfs(road_graph, edges=False)
    edges_gdf = ox.graph_to_gdfs(road_graph, nodes=False)
    mean_vals = env_df.loc["_mean_"]
    logger.info(f"[DEBUG] Mean PM2.5: {mean_vals.get('pm2_5')}, PM10: {mean_vals.get('pm10')}")
    zones_with_env = zones_gdf.merge(env_df, left_on="Tên đơn vị", right_index=True, how="left").fillna(mean_vals)
    logger.info("Spatial join nodes to zones...")
    nodes_in_zones = gpd.sjoin(nodes_gdf, zones_with_env, how="left", predicate="within")
    env_columns = ["NO", "O3", "NO2", "NOx", "SO2", "pm2_5", "pm10", "nh3", "windSpeed"]
    nodes_in_zones[env_columns] = nodes_in_zones[env_columns].fillna(mean_vals)
    node_env_data = nodes_in_zones[env_columns]
    logger.info("Merging costs to edges...")
    edges_with_data = edges_gdf.merge(node_env_data, left_on='u', right_index=True, how='left')
    edges_with_data = edges_with_data.merge(node_env_data, left_on='v', right_index=True, how='left', suffixes=('_u', '_v'))
    edges_with_data = edges_with_data.fillna(mean_vals)
    logger.info("Calculating costs...")
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
    logger.info(f"[DEBUG] PM2.5 stats: min={avg_pm25.min()}, max={avg_pm25.max()}, mean={avg_pm25.mean()}")
    cost_wind = (length * 1.0 + avg_no * 10 + avg_o3 * 8 + avg_no2 * 12 + avg_nox * 9 + avg_so2 * 7 + avg_pm25 * 50 + avg_pm10 * 30 + avg_nh3 * 8 - avg_windspeed * 5)
    cost_short = length * 1.0
    logger.info("Setting edge attributes...")
    nx.set_edge_attributes(road_graph, cost_wind.to_dict(), 'cost_wind')
    nx.set_edge_attributes(road_graph, cost_short.to_dict(), 'cost_short')
    try:
        nx.set_edge_attributes(road_graph, avg_pm25.to_dict(), 'pm2_5')
        nx.set_edge_attributes(road_graph, avg_pm10.to_dict(), 'pm10')
        nx.set_edge_attributes(road_graph, avg_windspeed.to_dict(), 'windSpeed')
        nx.set_edge_attributes(road_graph, edges_with_data['pm2_5_u'].to_dict(), 'pm2_5_u')
        nx.set_edge_attributes(road_graph, edges_with_data['pm2_5_v'].to_dict(), 'pm2_5_v')
        nx.set_edge_attributes(road_graph, edges_with_data['pm10_u'].to_dict(), 'pm10_u')
        nx.set_edge_attributes(road_graph, edges_with_data['pm10_v'].to_dict(), 'pm10_v')
        logger.info("[DEBUG] PM2.5 and PM10 assigned to edges")
    except Exception as e:
        logger.warning(f"Cannot assign pollutants: {e}")
    logger.info("Cost calculation complete")
    return road_graph

def find_route_classical(graph, start_node, end_node, weight_attr):
    logger.info(f"Finding route with weight={weight_attr}")
    try:
        path = nx.shortest_path(graph, start_node, end_node, weight=weight_attr)
        return path
    except nx.NetworkXNoPath:
        logger.error("No path found")
        return None

def load_all_data():
    global G_main, G_base, zones_gdf, edges_gdf_main, mock_env_data
    if not os.path.exists(GRAPH_FILE):
        logger.error(f"File not found: {GRAPH_FILE}")
        exit()
    logger.info(f"Loading road network from {GRAPH_FILE}")
    G_base = ox.load_graphml(GRAPH_FILE)
    logger.info(f"Loading zones from {GEOJSON_FILE}")
    zones_gdf = gpd.read_file(GEOJSON_FILE)
    zones_gdf = zones_gdf.to_crs(G_base.graph["crs"])
    zone_names = zones_gdf["Tên đơn vị"].tolist()
    logger.info(f"Found {len(zone_names)} zones")
    logger.info("Initializing graph with default data")
    default_data = {zone: {"NO": 0.0, "O3": 0.0, "NO2": 0.0, "NOx": 0.0, "SO2": 0.0, "pm2_5": 0.0, "pm10": 0.0, "nh3": 0.0, "windSpeed": 0.0} for zone in zone_names}
    env_df_initial = pd.DataFrame.from_dict(default_data, orient='index')
    mean_vals = env_df_initial.mean()
    env_df_initial.loc["_mean_"] = mean_vals
    with data_lock:
        mock_env_data = env_df_initial.to_dict(orient='index')
        G_main = precalculate_all_costs(G_base.copy(), zones_gdf, env_df_initial)
        edges_gdf_main = ox.graph_to_gdfs(G_main, nodes=False, edges=True)
    logger.info("Graph initialized with defaults")
    logger.info("Starting SSE listener...")
    sse_thread = threading.Thread(target=sse_listener)
    sse_thread.daemon = True
    sse_thread.start()
    logger.info("System ready")

@app.route("/api/get-env", methods=["GET"])
def get_env_data():
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
        return jsonify({"error": "Missing coordinates"}), 400
    weight_attr = "cost_wind" if mode == "wind" else "cost_short"
    logger.info(f"Using weight: {weight_attr}")
    with data_lock:
        if G_main is None or edges_gdf_main is None:
            return jsonify({"error": "Graph not loaded"}), 500
        G_current = G_main
        edges_gdf = edges_gdf_main
    try:
        start_node = ox.nearest_nodes(G_current, *start_coords)
        end_node = ox.nearest_nodes(G_current, *end_coords)
        path_nodes = find_route_classical(G_current, start_node, end_node, weight_attr)
    except Exception as e:
        logger.error(f"Route finding error: {e}")
        return jsonify({"error": "Server error"}), 500
    if path_nodes is None:
        return jsonify({"error": "No path found"}), 404
    edge_tuples = list(zip(path_nodes[:-1], path_nodes[1:]))
    route_edges_gdf = edges_gdf.loc[edges_gdf.index.map(lambda idx: (idx[0], idx[1]) in edge_tuples)]
    route_geojson_gdf = route_edges_gdf.to_crs(epsg=4326)
    route_geojson = route_geojson_gdf.__geo_interface__
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
        return jsonify({"route_geojson": route_geojson, "directions": ["Cannot create route"], "mode": mode})
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
    return jsonify({"route_geojson": route_geojson, "directions": directions_text, "mode": mode})

@app.route("/api/find-both-routes", methods=["POST"])
def find_both_routes():
    global G_main, data_lock, edges_gdf_main
    data = request.json
    start_coords = data.get("start")
    end_coords = data.get("end")
    if not start_coords or not end_coords:
        return jsonify({"error": "Missing coordinates"}), 400
    with data_lock:
        G = G_main
        edges_gdf = edges_gdf_main
    try:
        start_node = ox.nearest_nodes(G, *start_coords)
        end_node = ox.nearest_nodes(G, *end_coords)
        path_wind = find_route_classical(G, start_node, end_node, "cost_wind")
        path_short = find_route_classical(G, start_node, end_node, "cost_short")
        def build_route(path_nodes):
            if path_nodes is None:
                return {"geojson": {"type": "FeatureCollection", "features": []}, "distance_m": 0.0, "time_min": 0.0, "pm25_avg": 0.0}
            edge_pairs = list(zip(path_nodes[:-1], path_nodes[1:]))
            r_edges = edges_gdf.loc[edges_gdf.index.map(lambda idx: (idx[0], idx[1]) in edge_pairs)]
            geo = r_edges.to_crs(epsg=4326).__geo_interface__
            total_dist = r_edges["length"].sum()
            if "pm2_5" in r_edges.columns:
                avg_pm25 = float(r_edges["pm2_5"].mean() or 0.0)
            elif all(c in r_edges.columns for c in ["pm2_5_u", "pm2_5_v"]):
                avg_pm25 = float(r_edges[["pm2_5_u", "pm2_5_v"]].mean(axis=1).mean() or 0.0)
            else:
                avg_pm25 = 0.0
            time_min = total_dist / 1000 / 30 * 60
            return {"geojson": geo, "distance_m": float(total_dist), "time_min": float(time_min), "pm25_avg": float(avg_pm25)}
        result_wind = build_route(path_wind)
        result_short = build_route(path_short)
        return jsonify({"wind": result_wind, "short": result_short})
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": "Processing error"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    global G_main, zones_gdf, mock_env_data
    try:
        graph_loaded = G_main is not None and zones_gdf is not None
        env_data_available = len(mock_env_data) > 0
        num_zones = len(zones_gdf) if zones_gdf is not None else 0
        num_nodes = G_main.number_of_nodes() if G_main is not None else 0
        num_edges = G_main.number_of_edges() if G_main is not None else 0
        status = {"status": "healthy" if graph_loaded else "initializing", "service": "route-finding", "graph_loaded": graph_loaded, "env_data_available": env_data_available, "stats": {"zones": num_zones, "nodes": num_nodes, "edges": num_edges, "env_data_points": len(mock_env_data)}}
        return jsonify(status), 200 if graph_loaded else 503
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

if __name__ == "__main__":
    load_all_data()
    logger.info(f"Server ready at http://{FLASK_HOST}:{FLASK_PORT}")
    app.run(debug=FLASK_DEBUG, host=FLASK_HOST, port=FLASK_PORT)