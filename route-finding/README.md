# Route Finding Service

Optimal route finding service based on real-time air quality for Hanoi.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Running the Service](#running-the-service)
- [API Documentation](#api-documentation)
- [Data Structure](#data-structure)
- [Architecture](#architecture)
- [Request Management](#request-management)
- [Logs](#logs)
- [References](#references)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🎯 Project Overview

**Route Finding Service** is a Python service that finds the optimal path between two points in Hanoi, designed to meet Smart City standards:

### ✅ Achieved Criteria

1. **✅ Real-time NGSI-LD Data Integration**
   - Connects to Java Backend via SSE (port 8123)
   - Receives real-time air quality updates
   - Updates dynamic graph weights based on PM2.5, AQI

2. **✅ Multi-criteria Optimization Algorithm**
   - Dijkstra's algorithm with custom weights
   - 2 modes: Clean, Balanced
   - Calculates distance and average pollution levels

3. **✅ Open Data and Geospatial Standards**
   - Road network from OpenStreetMap
   - NetworkX graph with ~50,000 nodes
   - GeoJSON format for input/output

4. **✅ Simple RESTful API**
   - Route finding endpoint with GeoJSON response
   - Geocoding for Vietnamese addresses
   - Health check and monitoring

## 📦 Requirements

- Python 3.8+
- pip (Python package manager)
- Java Backend service running on port 8123
- RAM: ~300MB for the graph

## 🚀 Installation

### Step 1: Install Libraries

```bash
cd smart-air-ngsi-ld

pip install -r requirements.txt
````

### Step 2: Configure Environment

Create a `.env` file from `.env.example`:

```bash
copy .env.example .env
```

Edit `.env`:

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

### Step 3: Build Road Network Graph

Before running the API server, you need to build the road network graph:

```bash
python build_road_graph.py
```

This command will:

  - Download the Hanoi road network from OpenStreetMap
  - Create a NetworkX graph with \~50,000 nodes and \~100,000 edges
  - Save it as `hanoi_road_network.graphml`

**Note**: This step only needs to be done **once**, unless you want to update the road network.

## 🏃 Running the Service

### Start Flask API Server

```bash
python api_server.py
```

**The service will automatically:**

1.  ✅ Load the road network graph
2.  ✅ Connect to the Backend SSE endpoint
3.  ✅ Start receiving air quality updates
4.  ✅ Provide REST API on `http://localhost:5000`

### Check Service Status

```bash
curl http://localhost:5000/health
```

Expected result:

```json
{
  "status": "healthy",
  "sse_connected": true,
  "graph_loaded": true,
  "districts_count": 30
}
```

## 📚 API Documentation

### 📖 API Reference

The service provides a simple RESTful API for route finding and geocoding. All endpoints return JSON format.

**Base URL**: `http://localhost:5000`

-----

### 1\. Health Check

Checks service status and statistics.

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

  - `200 OK`: Service is operating normally
  - `503 Service Unavailable`: Service is encountering issues

-----

### 2\. Find Route

Finds the optimal route between two points based on the selected mode.

**Endpoint**: `POST /find-route`

**Request Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "start": [105.8342, 21.0278],  // [longitude, latitude]
  "end": [105.8412, 21.0245],
  "mode": "clean"                 // "clean" | "balanced"
}
```

**Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `start` | Array[Float] | Yes | Start point coordinates [longitude, latitude] |
| `end` | Array[Float] | Yes | End point coordinates [longitude, latitude] |
| `mode` | String | No | Optimization mode: `"clean"`, `"balanced"` (default: `"balanced"`) |

**Modes**:

  - `clean`: Prioritizes routes with the best air quality
  - `balanced`: Balances between clean air and speed

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
      "distance": 1250.5,        // Distance (meters)
      "avg_pm25": 28.3,          // Average PM2.5 (μg/m³)
      "avg_aqi": 65,             // Average AQI
      "duration_minutes": 15     // Estimated duration (minutes)
    }
  },
  "directions": [
    {
      "instruction": "Go straight on Lang Street",
      "distance": 450,
      "duration": 5
    },
    {
      "instruction": "Turn right into Pho Hue",
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

  - `200 OK`: Route found
  - `400 Bad Request`: Invalid parameters
  - `404 Not Found`: Route not found
  - `500 Internal Server Error`: Server error

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

-----

### 3\. Geocode Address

Converts a Vietnamese address into GPS coordinates.

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

| Parameter | Type | Required | Description |
|---|---|---|---|
| `address` | String | Yes | Address to geocode (Vietnamese) |

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

  - `200 OK`: Address found
  - `400 Bad Request`: Missing address parameter
  - `404 Not Found`: Address not found
  - `500 Internal Server Error`: Server error

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

-----

### 🎯 Frontend API Integration

The Frontend (React) integrates with the service via the following API calls:

```javascript
// frontend/src/components/Client/Map/Map.jsx

// Find Route
const findRoute = async (start, end, mode) => {
  const response = await fetch('http://localhost:5000/find-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start, end, mode })
  });
  return await response.json();
};

// Geocode Address
const geocodeAddress = async (address) => {
  const response = await fetch('http://localhost:5000/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  return await response.json();
};
```

## 📊 Data Structure

### 1\. Road Network Graph

File: `hanoi_road_network.graphml`

```python
# NetworkX Graph Structure
{
  "nodes": {
    "node_id": {
      "x": 105.8342,  # Longitude
      "y": 21.0278,   # Latitude
      "street_count": 3
    }
  },
  "edges": {
    ("node1", "node2"): {
      "length": 450.5,      # Distance (m)
      "highway": "primary",
      "name": "Đường Láng",
      "oneway": False,
      "pm25": 28.3,         # PM2.5 (μg/m³) - dynamic
      "aqi": 65             # AQI - dynamic
    }
  }
}
```

### 2\. GeoJSON Districts

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

### 3\. SSE Event (Real-time update)

Backend sends via SSE endpoint:

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

### 4\. Route Response

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
      "instruction": "Go straight 450m",
      "distance": 450,
      "duration": 5
    }
  ]
}
```

## 🏗️ Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Data Flow Architecture                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐        ┌──────────┐        ┌──────────────┐   │
│  │ Orion-LD │─────▶│ Backend  │ ────▶ │Python Service│   │
│  │          │        │  (Java)  │  SSE  │   (Flask)    │   │
│  └──────────┘        └──────────┘        └───────┬──────┘   │
│                                                 │           │
│                                                 ▼           │
│                                      ┌──────────────────┐   │
│                                      │ Update Weights   │   │
│                                      │ in Road Graph    │   │
│                                      └────────┬─────────┘   │
│                                                 │           │
│                                                 ▼           │
│                                      ┌──────────────────┐   │
│                                      │ Route Finding    │   │
│                                      │ (Dijkstra)       │   │
│                                      └────────┬─────────┘   │
│                                                 │           │
│                                                 ▼           │
│  ┌──────────┐                        ┌──────────────────┐   │
│  │ Frontend │◀─────────────────────│ GeoJSON Response │   │
│  │ (React)  │                        └──────────────────┘   │
│  └──────────┘                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
route-finding/
├── api_server.py                    # Flask API server + SSE client
├── build_road_graph.py              # Script to build graph from OSM
├── hanoi_road_network.graphml       # Road network graph (NetworkX)
├── ha_noi_with_latlon2.geojson      # GeoJSON data for 30 districts
├── requirements.txt                 # Python dependencies
├── .env                             # Config (do not commit)
├── .env.example                     # Template config
└── README.md                        # This file
```

### Route Finding Algorithm

[Image of Dijkstra algorithm logic]

#### 1\. Receive request

```python
{
  "start": [105.8342, 21.0278],
  "end": [105.8412, 21.0245],
  "mode": "clean"
}
```

#### 2\. Find nearest nodes

```python
start_node = ox.distance.nearest_nodes(G, start[0], start[1])
end_node = ox.distance.nearest_nodes(G, end[0], end[1])
```

#### 3\. Calculate edge weights

**"Clean" mode**:

```python
weight = distance * (1 + pm25_factor)
# pm25_factor = (pm25_current - pm25_min) / (pm25_max - pm25_min)
# Low PM2.5 → small factor → low weight → high priority
```

**"Fast" mode**:

```python
weight = distance
# Only calculate distance, ignore air quality
```

**"Balanced" mode**:

```python
weight = distance * (1 + 0.5 * pm25_factor)
# 50-50 balance between distance and air quality
```

#### 4\. Dijkstra's Algorithm

```python
path = nx.shortest_path(G, start_node, end_node, weight='weight')
```

#### 5\. Return GeoJSON

```python
route_coords = [(G.nodes[node]['x'], G.nodes[node]['y']) for node in path]
geojson = {
  "type": "LineString",
  "coordinates": route_coords
}
```

### Real-time Weight Updates

```python
# SSE Event Handler
def on_environment_update(event):
    district = event['district']
    pm25 = event['pm25']
    aqi = event['aqi']
    
    # Find all edges in district
    edges = find_edges_in_district(district)
    
    # Update weights
    for edge in edges:
        G[edge[0]][edge[1]]['pm25'] = pm25
        G[edge[0]][edge[1]]['aqi'] = aqi
        G[edge[0]][edge[1]]['weight'] = calculate_weight(edge, pm25)
```

## ⚙️ Request Management

### Limits and Optimization

  - **Graph Loading**: Once at startup (\~2-3 seconds)
  - **SSE Connection**: Persistent connection, no request limit
  - **Route Calculation**: \~100-500ms per request
  - **Memory Usage**: \~200-300MB for loaded graph

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

### Scale Considerations

  - **Horizontal scaling**: Run multiple instances with load balancer
  - **Caching**: Redis for frequently requested routes
  - **Database**: PostgreSQL/PostGIS for persistent storage
  - **Message Queue**: RabbitMQ for async processing

## 📝 Logs

Logs are written to:

  - **Console** (stdout)

### Log Levels

```env
LOG_LEVEL=DEBUG   # Detailed logs (development)
LOG_LEVEL=INFO    # Normal operation (production)
LOG_LEVEL=WARNING # Warnings/Errors only
```

### Log Format

```
[2025-11-12 10:30:00] INFO: SSE connected to http://localhost:8123
[2025-11-12 10:30:15] INFO: Received environment update for Phường Ba Đình
[2025-11-12 10:30:20] INFO: Route calculated: 1250.5m, avg PM2.5: 28.3
[2025-11-12 10:30:25] ERROR: No path found between points
```

## 📚 References

### Libraries and Technologies

  - **Flask**: https://flask.palletsprojects.com/
  - **NetworkX**: https://networkx.org/documentation/stable/
  - **OSMnx**: https://osmnx.readthedocs.io/
  - **SSE (Server-Sent Events)**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent\_events

### Standards and Ontologies

  - **NGSI-LD**: https://www.etsi.org/deliver/etsi\_gs/CIM/001\_099/009/01.08.01\_60/gs\_CIM009v010801p.pdf
  - **FIWARE**: https://www.fiware.org/
  - **Smart Data Models**: https://smartdatamodels.org/

### Algorithms

  - **Dijkstra's Algorithm**: https://en.wikipedia.org/wiki/Dijkstra%27s\_algorithm
  - **A* Search*\*: https://en.wikipedia.org/wiki/A\*\_search\_algorithm
  - **OpenStreetMap**: https://www.openstreetmap.org/

## 🛠️ Troubleshooting

### Error: SSE cannot connect

```
❌ Cannot connect to backend SSE endpoint
```

**Cause**:

  - Java Backend is not running
  - Wrong URL in `.env`
  - Firewall blocking port 8123

**Solution**:

1.  Check if backend is running:

<!-- end list -->

```bash
curl http://localhost:8123/health
```

2.  Check `.env` configuration:

<!-- end list -->

```env
BACKEND_URL=http://localhost:8123
```

3.  Temporarily disable firewall or open port 8123

-----

### Error: Graph file not found

```
❌ Road network graph not found: hanoi_road_network.graphml
```

**Cause**:

  - `build_road_graph.py` has not been run
  - File deleted or moved

**Solution**:

```bash
python build_road_graph.py
```

-----

### Error: No path found

```
❌ No path found between points
```

**Cause**:

  - Coordinates outside Hanoi range
  - Start/End points too far from any road
  - Area not connected by roads

**Solution**:

1.  Check coordinates within Hanoi range:

      - Latitude: 20.9 - 21.1°N
      - Longitude: 105.7 - 105.9°E

2.  Try points closer to roads

3.  Check log to see nearest nodes:

<!-- end list -->

```bash
tail -f route_finding.log
```

-----

### Error: ModuleNotFoundError

```
❌ ModuleNotFoundError: No module named 'flask'
```

**Cause**:

  - Dependencies not installed
  - Virtual environment not activated

**Solution**:

```bash
# Activate virtual environment
venv\Scripts\activate   # Windows
source venv/bin/activate  # Linux/Mac

# Reinstall dependencies
pip install -r requirements.txt
```

-----

### Error: Memory Error when loading graph

```
❌ MemoryError: Unable to allocate array
```

**Cause**:

  - Insufficient RAM (\< 1GB available)
  - Graph too large

**Solution**:

1.  Increase RAM for the process
2.  Simplify graph:

<!-- end list -->

```python
# In build_road_graph.py
G = ox.graph_from_place(
    "Hanoi, Vietnam",
    network_type='drive',
    simplify=True,  # Add this line
    truncate_by_edge=True
)
```

-----

### Error: SSE connection timeout

```
❌ SSE connection timeout after 30s
```

**Cause**:

  - Backend SSE endpoint not responding
  - High network latency

**Solution**:

1.  Increase timeout in `api_server.py`:

<!-- end list -->

```python
# Increase timeout from 30s to 60s
sse_client = SSEClient(url, timeout=60)
```

2.  Check network:

<!-- end list -->

```bash
ping localhost
```

-----

### Error: Invalid GeoJSON response

```
❌ Invalid GeoJSON: coordinates must be [longitude, latitude]
```

**Cause**:

  - Inverted lat/lon
  - Invalid coordinates

**Solution**:

  - Ensure format: `[longitude, latitude]`
  - Longitude first, Latitude second
  - Example: `[105.8342, 21.0278]` ✅
  - WRONG: `[21.0278, 105.8342]` ❌

## 📄 License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

## 👥 Contributors

  - **TT** - [trungthanhcva2206@gmail.com](mailto:trungthanhcva2206@gmail.com)
  - **Tankchoi** - [tadzltv22082004@gmail.com](mailto:tadzltv22082004@gmail.com)
  - **Panh** - [panh812004.apn@gmail.com](mailto:panh812004.apn@gmail.com)

## 💡 Support

If you encounter issues, please:

1.  Check [Issues](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/issues)
2.  Read [Documentation Wiki](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/wiki)
3.  Join [Discussions](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/discussions)
4.  Contact authors

**Copyright © 2025 TAA. All rights reserved.**
