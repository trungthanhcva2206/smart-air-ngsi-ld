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
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
"""
import os
import sys
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def build_road_graph():
    """Build road network graph for Hanoi"""
    try:
        graph_file = Path(os.getenv('GRAPH_FILE', 'hanoi_road_network.graphml'))
        
        # ✅ NẾU FILE ĐÃ TỒN TẠI, SKIP BUILD
        if graph_file.exists():
            file_size = graph_file.stat().st_size / (1024 * 1024)  # MB
            logger.info(f"✅ Graph file '{graph_file}' already exists ({file_size:.2f} MB)")
            logger.info("⏭️  Skipping build. Using existing graph.")
            return True
        
        logger.info("❌ Graph file not found. Building new graph...")
        logger.info("🔨 This may take 5-10 minutes. Please wait...")
        
        # Import osmnx (chỉ import khi cần build)
        try:
            import osmnx as ox
        except ImportError:
            logger.error("❌ osmnx not installed!")
            logger.error("Install with: pip install osmnx")
            return False
        
        # Tải mạng lưới đường đi (lái xe) của Hà Nội từ OpenStreetMap
        logger.info("📡 Downloading road network from OpenStreetMap...")
        G_hanoi = ox.graph_from_place("Hanoi, Vietnam", network_type="drive")
        
        # Log thông tin graph
        num_nodes = G_hanoi.number_of_nodes()
        num_edges = G_hanoi.number_of_edges()
        logger.info(f"📊 Loaded map: {num_nodes:,} nodes, {num_edges:,} edges")
        
        # Lưu lại để dùng sau
        logger.info(f"💾 Saving graph to {graph_file}...")
        ox.save_graphml(G_hanoi, filepath=graph_file)
        
        logger.info(f"✅ Graph built successfully!")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error building graph: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = build_road_graph()
    sys.exit(0 if success else 1)