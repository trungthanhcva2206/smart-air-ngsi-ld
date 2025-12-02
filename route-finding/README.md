# Route Finding Service - Dịch vụ Tìm đường

Dịch vụ tìm đường tối ưu dựa trên chất lượng không khí thời gian thực cho Hà Nội.

## 📋 Mục lục

- Tổng quan dự án
- Yêu cầu
- Cài đặt
- Chạy dịch vụ
- API Documentation
- Cấu trúc dữ liệu
- Kiến trúc
- Quản lý Request
- Logs
- Tài liệu tham khảo
- Troubleshooting
- License

## 🎯 Tổng quan dự án

Route Finding Service là một service Python tìm đường đi tối ưu giữa hai điểm ở Hà Nội, được thiết kế để đáp ứng các tiêu chuẩn Smart City:

### ✅ Các tiêu chí đạt được

1. **✅ Tích hợp dữ liệu NGSI-LD thời gian thực**
   - Kết nối SSE với Backend Java (port 8123)
   - Nhận cập nhật chất lượng không khí real-time
   - Cập nhật trọng số đồ thị động dựa trên PM2.5, AQI

2. **✅ Thuật toán tối ưu đa tiêu chí**
   - Dijkstra's algorithm với trọng số tùy chỉnh
   - 2 chế độ: Clean (sạch), Balanced (cân bằng)
   - Tính toán khoảng cách và mức độ ô nhiễm trung bình

3. **✅ Dữ liệu mở và chuẩn địa lý**
   - Mạng lưới đường bộ từ OpenStreetMap
   - NetworkX graph với ~50,000 nodes
   - GeoJSON format cho input/output

4. **✅ RESTful API đơn giản**
   - Endpoint tìm đường với GeoJSON response
   - Geocoding địa chỉ tiếng Việt
   - Health check và monitoring

## 📦 Yêu cầu

- Python 3.8+
- pip (trình quản lý gói Python)
- Backend Java service chạy trên port 8123
- RAM: ~300MB cho đồ thị

## 🚀 Cài đặt

### Bước 1: Cài đặt thư viện

```bash
cd smart-air-ngsi-ld

pip install -r requirements.txt
```

### Bước 2: Cấu hình environment

Tạo file `.env` từ `.env.example`:

```bash
copy .env.example .env
```

Chỉnh sửa `.env`:

```env
# Flask configuration
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=True

# Backend SSE endpoint
BACKEND_URL=http://localhost:8123
SSE_ENDPOINT=/api/sse/environment-data

# Graph configuration
GRAPH_FILE=hanoi_road_network.graphml
GEOJSON_FILE=ha_noi_with_latlon2.geojson

# Logging
LOG_LEVEL=INFO
```

### Bước 3: Xây dựng đồ thị mạng lưới đường bộ

Trước khi chạy API server, bạn cần xây dựng đồ thị mạng lưới đường bộ:

```bash
python build_road_graph.py
```

Lệnh này sẽ:
- Tải mạng lưới đường bộ Hà Nội từ OpenStreetMap
- Tạo đồ thị NetworkX với ~50,000 nodes và ~100,000 edges
- Lưu lại dưới dạng `hanoi_road_network.graphml`

**Lưu ý**: Bước này chỉ cần thực hiện **một lần**, trừ khi bạn muốn cập nhật mạng lưới đường bộ.

## 🏃 Chạy dịch vụ

### Khởi động Flask API server

```bash
python api_server.py
```

**Dịch vụ sẽ tự động:**
1. ✅ Tải đồ thị mạng lưới đường bộ
2. ✅ Kết nối đến Backend SSE endpoint
3. ✅ Bắt đầu nhận cập nhật chất lượng không khí
4. ✅ Cung cấp REST API trên `http://localhost:5000`

### Kiểm tra dịch vụ đang chạy

```bash
curl http://localhost:5000/health
```

Kết quả mong đợi:
```json
{
  "status": "healthy",
  "sse_connected": true,
  "graph_loaded": true,
  "districts_count": 30
}
```

## 📚 API Documentation

### 📖 Tài liệu API tham khảo

Dịch vụ cung cấp RESTful API đơn giản cho route finding và geocoding. Tất cả endpoints trả về JSON format.

**Base URL**: `http://localhost:5000`

---

### 1. Health Check

Kiểm tra trạng thái dịch vụ và thống kê.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "sse_connected": true,
  "graph_loaded": true,
  "districts_count": 30
}
```

**Status Codes**:
- `200 OK`: Dịch vụ hoạt động bình thường
- `503 Service Unavailable`: Dịch vụ gặp vấn đề

---

### 2. Find Route (Tìm đường)

Tìm đường tối ưu giữa hai điểm dựa trên chế độ được chọn.

**Endpoint**: `POST /find-route`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "start": [105.8342, 21.0278],  // [kinh độ, vĩ độ]
  "end": [105.8412, 21.0245],
  "mode": "clean"                 // "clean" | "balanced"
}
```

**Parameters**:

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `start` | Array[Float] | Có | Tọa độ điểm xuất phát [longitude, latitude] |
| `end` | Array[Float] | Có | Tọa độ điểm đích [longitude, latitude] |
| `mode` | String | Không | Chế độ tối ưu: `"clean"`, `"balanced"` (mặc định: `"balanced"`) |

**Các chế độ (mode)**:
- `clean`: Ưu tiên đường đi có chất lượng không khí tốt nhất
- `balanced`: Cân bằng giữa sạch và nhanh

**Response Success (200 OK)**:
```json
{
  "route": {
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [105.8342, 21.0278],
        [105.8356, 21.0265],
        [105.8412, 21.0245]
      ]
    },
    "properties": {
      "distance": 1250.5,        // Khoảng cách (mét)
      "avg_pm25": 28.3,          // PM2.5 trung bình (μg/m³)
      "avg_aqi": 65,             // AQI trung bình
      "duration_minutes": 15     // Thời gian ước tính (phút)
    }
  },
  "directions": [
    {
      "instruction": "Đi thẳng trên Đường Láng",
      "distance": 450,
      "duration": 5
    },
    {
      "instruction": "Rẽ phải vào Phố Huế",
      "distance": 800,
      "duration": 10
    }
  ]
}
```

**Response Error (400 Bad Request)**:
```json
{
  "error": "Invalid coordinates",
  "message": "Start and end must be [longitude, latitude] arrays"
}
```

**Response Error (404 Not Found)**:
```json
{
  "error": "No path found",
  "message": "Cannot find route between the given points"
}
```

**Status Codes**:
- `200 OK`: Tìm thấy đường
- `400 Bad Request`: Tham số không hợp lệ
- `404 Not Found`: Không tìm thấy đường
- `500 Internal Server Error`: Lỗi server

**Example Request (cURL)**:
```bash
curl -X POST http://localhost:5000/find-route \
  -H "Content-Type: application/json" \
  -d '{
    "start": [105.8342, 21.0278],
    "end": [105.8412, 21.0245],
    "mode": "clean"
  }'
```

**Example Request (JavaScript)**:
```javascript
const response = await fetch('http://localhost:5000/find-route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    start: [105.8342, 21.0278],
    end: [105.8412, 21.0245],
    mode: 'clean'
  })
});

const { route, directions } = await response.json();
```

---

### 3. Geocode Address (Chuyển đổi địa chỉ)

Chuyển đổi địa chỉ tiếng Việt thành tọa độ GPS.

**Endpoint**: `POST /geocode`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "address": "Hồ Hoàn Kiếm, Hà Nội"
}
```

**Parameters**:

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `address` | String | Có | Địa chỉ cần geocoding (tiếng Việt) |

**Response Success (200 OK)**:
```json
{
  "location": [105.8524, 21.0285],
  "display_name": "Hồ Hoàn Kiếm, Quận Hoàn Kiếm, Hà Nội, Việt Nam",
  "district": "Hoàn Kiếm"
}
```

**Response Error (404 Not Found)**:
```json
{
  "error": "Address not found",
  "message": "Cannot geocode the given address"
}
```

**Status Codes**:
- `200 OK`: Tìm thấy địa chỉ
- `400 Bad Request`: Thiếu tham số address
- `404 Not Found`: Không tìm thấy địa chỉ
- `500 Internal Server Error`: Lỗi server

**Example Request (cURL)**:
```bash
curl -X POST http://localhost:5000/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "Hồ Hoàn Kiếm, Hà Nội"}'
```

**Example Request (JavaScript)**:
```javascript
const response = await fetch('http://localhost:5000/geocode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: 'Hồ Hoàn Kiếm, Hà Nội'
  })
});

const { location, display_name } = await response.json();
```

---

### 🎯 API sử dụng trong Frontend

Frontend (React) tích hợp với dịch vụ qua các API calls:

```javascript
// frontend/src/components/Client/Map/Map.jsx

// Tìm đường
const findRoute = async (start, end, mode) => {
  const response = await fetch('http://localhost:5000/find-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start, end, mode })
  });
  return await response.json();
};

// Geocode địa chỉ
const geocodeAddress = async (address) => {
  const response = await fetch('http://localhost:5000/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  return await response.json();
};
```

## 📊 Cấu trúc dữ liệu

### 1. Road Network Graph (Đồ thị đường bộ)

File: `hanoi_road_network.graphml`

```python
# NetworkX Graph Structure
{
  "nodes": {
    "node_id": {
      "x": 105.8342,  # Kinh độ
      "y": 21.0278,   # Vĩ độ
      "street_count": 3
    }
  },
  "edges": {
    ("node1", "node2"): {
      "length": 450.5,      # Khoảng cách (m)
      "highway": "primary",
      "name": "Đường Láng",
      "oneway": False,
      "pm25": 28.3,         # PM2.5 (μg/m³) - dynamic
      "aqi": 65             # AQI - dynamic
    }
  }
}
```

### 2. GeoJSON Districts (Dữ liệu quận/phường)

File: `ha_noi_with_latlon2.geojson`

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "NAME": "Phường Ba Đình",
        "VARNAME": "Phuong Ba Dinh",
        "district": "Ba Đình",
        "pm25": 28.3,
        "aqi": 65
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [105.8342, 21.0278],
          [105.8356, 21.0265],
          ...
        ]]
      }
    }
  ]
}
```

### 3. SSE Event (Cập nhật real-time)

Backend gửi qua SSE endpoint:

```json
{
  "type": "environment-update",
  "data": {
    "district": "Phường Ba Đình",
    "pm25": 32.5,
    "aqi": 70,
    "timestamp": "2025-11-12T10:30:00Z"
  }
}
```

### 4. Route Response (Kết quả tìm đường)

```json
{
  "route": {
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [[105.8342, 21.0278], ...]
    },
    "properties": {
      "distance": 1250.5,
      "avg_pm25": 28.3,
      "avg_aqi": 65,
      "duration_minutes": 15
    }
  },
  "directions": [
    {
      "instruction": "Đi thẳng 450m",
      "distance": 450,
      "duration": 5
    }
  ]
}
```

## 🏗️ Kiến trúc

### Luồng dữ liệu

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Flow Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐       ┌──────────┐       ┌──────────────┐     │
│  │ Orion-LD │─────▶│ Backend  │ ────▶ │Python Service│     │
│  │          │       │  (Java)  │  SSE  │   (Flask)    │     │
│  └──────────┘       └──────────┘       └───────┬──────┘     │
│                                                 │           │
│                                                 ▼           │
│                                      ┌──────────────────┐   │
│                                      │ Update Weights   │   │
│                                      │ in Road Graph    │   │
│                                      └────────┬─────────┘   │
│                                               │             │
│                                               ▼             │
│                                      ┌──────────────────┐   │
│                                      │ Route Finding    │   │
│                                      │ (Dijkstra)       │   │
│                                      └────────┬─────────┘   │
│                                               │             │
│                                               ▼             │
│  ┌──────────┐                       ┌──────────────────┐    │
│  │ Frontend │◀─────────────────────│ GeoJSON Response  │    │
│  │ (React)  │                       └──────────────────┘    │
│  └──────────┘                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Cấu trúc thư mục

```
route-finding/
├── api_server.py                    # Flask API server + SSE client
├── build_road_graph.py              # Script xây dựng đồ thị từ OSM
├── hanoi_road_network.graphml       # Đồ thị đường bộ (NetworkX)
├── ha_noi_with_latlon2.geojson      # Dữ liệu GeoJSON 30 quận/phường
├── requirements.txt                 # Python dependencies
├── .env                             # Config (không commit)
├── .env.example                     # Template config
└── README.md                        # File này
```

### Thuật toán Route Finding

#### 1. Nhận request
```python
{
  "start": [105.8342, 21.0278],
  "end": [105.8412, 21.0245],
  "mode": "clean"
}
```

#### 2. Tìm nearest nodes
```python
start_node = ox.distance.nearest_nodes(G, start[0], start[1])
end_node = ox.distance.nearest_nodes(G, end[0], end[1])
```

#### 3. Tính trọng số cạnh

**Chế độ "clean"**:
```python
weight = distance * (1 + pm25_factor)
# pm25_factor = (pm25_current - pm25_min) / (pm25_max - pm25_min)
# PM2.5 thấp → factor nhỏ → trọng số thấp → ưu tiên cao
```

**Chế độ "fast"**:
```python
weight = distance
# Chỉ tính khoảng cách, bỏ qua chất lượng không khí
```

**Chế độ "balanced"**:
```python
weight = distance * (1 + 0.5 * pm25_factor)
# Cân bằng 50-50 giữa khoảng cách và chất lượng không khí
```

#### 4. Dijkstra's Algorithm
```python
path = nx.shortest_path(G, start_node, end_node, weight='weight')
```

#### 5. Trả về GeoJSON
```python
route_coords = [(G.nodes[node]['x'], G.nodes[node]['y']) for node in path]
geojson = {
  "type": "LineString",
  "coordinates": route_coords
}
```

### Cập nhật trọng số real-time

```python
# SSE Event Handler
def on_environment_update(event):
    district = event['district']
    pm25 = event['pm25']
    aqi = event['aqi']
    
    # Tìm tất cả edges trong district
    edges = find_edges_in_district(district)
    
    # Cập nhật trọng số
    for edge in edges:
        G[edge[0]][edge[1]]['pm25'] = pm25
        G[edge[0]][edge[1]]['aqi'] = aqi
        G[edge[0]][edge[1]]['weight'] = calculate_weight(edge, pm25)
```

## ⚙️ Quản lý Request

### Giới hạn và tối ưu

- **Graph Loading**: Một lần khi khởi động (~2-3 giây)
- **SSE Connection**: Persistent connection, không có request limit
- **Route Calculation**: ~100-500ms per request
- **Memory Usage**: ~200-300MB cho đồ thị loaded

### Performance Optimization

```python
# Cache frequently used paths
@lru_cache(maxsize=1000)
def find_route_cached(start, end, mode):
    return find_route(start, end, mode)

# Preload graph on startup
G = ox.load_graphml('hanoi_road_network.graphml')

# Use spatial index for nearest node search
spatial_index = create_spatial_index(G)
```

### Cân nhắc Scale

- **Horizontal scaling**: Chạy nhiều instances với load balancer
- **Caching**: Redis cho frequently requested routes
- **Database**: PostgreSQL/PostGIS cho persistent storage
- **Message Queue**: RabbitMQ cho async processing

## 📝 Logs

Logs được ghi vào:
- **Console** (stdout)

### Log Levels

```env
LOG_LEVEL=DEBUG  # Logs chi tiết (development)
LOG_LEVEL=INFO   # Hoạt động bình thường (production)
LOG_LEVEL=WARNING # Chỉ cảnh báo/lỗi
```

### Log Format

```
[2025-11-12 10:30:00] INFO: SSE connected to http://localhost:8123
[2025-11-12 10:30:15] INFO: Received environment update for Phường Ba Đình
[2025-11-12 10:30:20] INFO: Route calculated: 1250.5m, avg PM2.5: 28.3
[2025-11-12 10:30:25] ERROR: No path found between points
```

## 📚 Tài liệu tham khảo

### Thư viện và công nghệ

- **Flask**: https://flask.palletsprojects.com/
- **NetworkX**: https://networkx.org/documentation/stable/
- **OSMnx**: https://osmnx.readthedocs.io/
- **SSE (Server-Sent Events)**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

### Standards và Ontologies

- **NGSI-LD**: https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.08.01_60/gs_CIM009v010801p.pdf
- **FIWARE**: https://www.fiware.org/
- **Smart Data Models**: https://smartdatamodels.org/

### Algorithms

- **Dijkstra's Algorithm**: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
- **A* Search**: https://en.wikipedia.org/wiki/A*_search_algorithm
- **OpenStreetMap**: https://www.openstreetmap.org/

## 🛠️ Troubleshooting

### Lỗi: SSE không kết nối được

```
❌ Cannot connect to backend SSE endpoint
```

**Nguyên nhân**:
- Backend Java chưa chạy
- Sai URL trong `.env`
- Firewall chặn port 8123

**Giải pháp**:
1. Kiểm tra backend đang chạy:
```bash
curl http://localhost:8123/health
```

2. Kiểm tra cấu hình `.env`:
```env
BACKEND_URL=http://localhost:8123
```

3. Tắt firewall tạm thời hoặc mở port 8123

---

### Lỗi: Không tìm thấy file graph

```
❌ Road network graph not found: hanoi_road_network.graphml
```

**Nguyên nhân**:
- Chưa chạy `build_road_graph.py`
- File bị xóa hoặc di chuyển

**Giải pháp**:
```bash
python build_road_graph.py
```

---

### Lỗi: Không tìm thấy đường đi

```
❌ No path found between points
```

**Nguyên nhân**:
- Tọa độ ngoài phạm vi Hà Nội
- Điểm xuất phát/đích quá xa đường
- Khu vực không có đường nối

**Giải pháp**:
1. Kiểm tra tọa độ trong phạm vi Hà Nội:
   - Vĩ độ: 20.9 - 21.1°N
   - Kinh độ: 105.7 - 105.9°E

2. Thử điểm khác gần đường hơn

3. Kiểm tra log để xem nearest nodes:
```bash
tail -f route_finding.log
```

---

### Lỗi: ModuleNotFoundError

```
❌ ModuleNotFoundError: No module named 'flask'
```

**Nguyên nhân**:
- Chưa cài đặt dependencies
- Môi trường ảo chưa được kích hoạt

**Giải pháp**:
```bash
# Kích hoạt môi trường ảo
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Cài đặt lại dependencies
pip install -r requirements.txt
```

---

### Lỗi: Memory Error khi load graph

```
❌ MemoryError: Unable to allocate array
```

**Nguyên nhân**:
- RAM không đủ (< 1GB available)
- Graph quá lớn

**Giải pháp**:
1. Tăng RAM cho process
2. Simplify graph:
```python
# Trong build_road_graph.py
G = ox.graph_from_place(
    "Hanoi, Vietnam",
    network_type='drive',
    simplify=True,  # Thêm dòng này
    truncate_by_edge=True
)
```

---

### Lỗi: SSE connection timeout

```
❌ SSE connection timeout after 30s
```

**Nguyên nhân**:
- Backend SSE endpoint không response
- Network latency cao

**Giải pháp**:
1. Tăng timeout trong `api_server.py`:
```python
# Tăng timeout từ 30s lên 60s
sse_client = SSEClient(url, timeout=60)
```

2. Kiểm tra network:
```bash
ping localhost
```

---

### Lỗi: Invalid GeoJSON response

```
❌ Invalid GeoJSON: coordinates must be [longitude, latitude]
```

**Nguyên nhân**:
- Đảo ngược lat/lon
- Tọa độ không hợp lệ

**Giải pháp**:
- Đảm bảo format: `[longitude, latitude]`
- Kinh độ trước, vĩ độ sau
- Ví dụ: `[105.8342, 21.0278]` ✅
- SAI: `[21.0278, 105.8342]` ❌

## 📄 License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

## 👥 Contributors

- **TT** - [trungthanhcva2206@gmail.com](mailto:trungthanhcva2206@gmail.com)
- **Tankchoi** - [tadzltv22082004@gmail.com](mailto:tadzltv22082004@gmail.com)
- **Panh** - [panh812004.apn@gmail.com](mailto:panh812004.apn@gmail.com)

## 💡 Support

Nếu gặp vấn đề, vui lòng:

1. Xem [Issues](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/issues)
2. Xem [Documentation Wiki](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/wiki)
3. Trao đổi [Discussions](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/discussions)
4. Liên hệ authors

**Copyright © 2025 CHK. All rights reserved.**
