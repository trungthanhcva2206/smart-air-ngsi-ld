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
import osmnx as ox
import networkx as nx

# Tải mạng lưới đường đi (lái xe) của Hà Nội từ OpenStreetMap
G_hanoi = ox.graph_from_place("Hanoi, Vietnam", network_type="drive")

# G_hanoi bây giờ là một Graph networkx
# có thể có > 50,000 nút (ngã tư) và > 80,000 cạnh (đoạn đường)
print(f"Đã tải bản đồ: {G_hanoi.number_of_nodes()} nút, {G_hanoi.number_of_edges()} cạnh")

# Lưu lại để dùng sau
ox.save_graphml(G_hanoi, "hanoi_road_network.graphml")