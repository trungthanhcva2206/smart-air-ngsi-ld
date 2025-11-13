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
import { Map as MapGL, Source, Layer, Marker } from '@vis.gl/react-maplibre';
import { useEffect, useState, useRef, useCallback } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import hanoiGeoJSONUrl from '../../../assets/ha_noi_with_latlon2.geojson?url';

const hanoiCenter = [105.84, 21.035];
const API_URL = import.meta.env.VITE_API_ROUTE_URL || 'http://127.0.0.1:5000';

const Map = () => {
  const [geoData, setGeoData] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  
  // State cho autocomplete
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingEnd, setIsSearchingEnd] = useState(false);
  
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  
  const [cleanRoute, setCleanRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [directions, setDirections] = useState(null);
  const [mode, setMode] = useState('wind');
  const [colorMode, setColorMode] = useState('pm2_5');

  const [is3D, setIs3D] = useState(false);
  const mapRef = useRef(null);
  
  // Refs for debouncing
  const startDebounceRef = useRef(null);
  const endDebounceRef = useRef(null);

  // Tải GeoJSON và dữ liệu môi trường
  useEffect(() => {
    const p1 = fetch(hanoiGeoJSONUrl).then((res) => res.json());
    const p2 = fetch(`${API_URL}/api/get-env`).then((res) => res.json());

    Promise.all([p1, p2])
      .then(([geoData, envData]) => {
        const dataWithEnv = {
          ...geoData,
          features: geoData.features.map((f) => {
            const props = envData[f.properties['Tên đơn vị']] || { 
              NO: 0, O3: 0, NO2: 0, NOx: 0, SO2: 0, pm2_5: 0, pm10: 0, nh3: 0, windSpeed: 0
            };
            return {
              ...f,
              properties: {
                ...f.properties,
                NO: props.NO || 0,
                O3: props.O3 || 0,
                NO2: props.NO2 || 0,
                NOx: props.NOx || 0,
                SO2: props.SO2 || 0,
                pm2_5: props.pm2_5 || 0,
                pm10: props.pm10 || 0,
                nh3: props.nh3 || 0,
                windSpeed: props.windSpeed || 0,
              },
            };
          }),
        };
        setGeoData(dataWithEnv);
      })
      .catch((err) => console.error('Lỗi tải dữ liệu:', err));
  }, []);

  // Hàm tìm kiếm gợi ý địa điểm với useCallback
  const searchAddressSuggestions = useCallback(async (query, setSuggestions, setShow, setSearching) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShow(false);
      setSearching(false);
      return;
    }

    setSearching(true);
    const searchQuery = encodeURIComponent(`${query}, Hanoi, Vietnam`);
    const url = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=5&addressdetails=1`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SmartAirNGSI-LD/1.0'
        }
      });
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSuggestions(data);
        setShow(true);
      } else {
        setSuggestions([]);
        setShow(false);
      }
    } catch (err) {
      console.error('Lỗi tìm kiếm địa điểm:', err);
      setSuggestions([]);
      setShow(false);
    } finally {
      setSearching(false);
    }
  }, []);

  // Xử lý thay đổi input điểm đi với debouncing
  const handleStartAddressChange = (value) => {
    setStartAddress(value);
    
    // Xóa điểm và route nếu input trống
    if (value.trim() === '') {
      setStartPoint(null);
      setCleanRoute(null);
      setDirections(null);
    } else {
      setStartPoint(null);
    }
    
    if (startDebounceRef.current) {
      clearTimeout(startDebounceRef.current);
    }

    if (value.length >= 3) {
      setIsSearchingStart(true);
      startDebounceRef.current = setTimeout(() => {
        searchAddressSuggestions(
          value, 
          setStartSuggestions, 
          setShowStartSuggestions,
          setIsSearchingStart
        );
      }, 300);
    } else {
      setStartSuggestions([]);
      setShowStartSuggestions(false);
      setIsSearchingStart(false);
    }
  };

  // Xử lý thay đổi input điểm đến với debouncing
  const handleEndAddressChange = (value) => {
    setEndAddress(value);
    
    // Xóa điểm và route nếu input trống
    if (value.trim() === '') {
      setEndPoint(null);
      setCleanRoute(null);
      setDirections(null);
    } else {
      setEndPoint(null);
    }
    
    if (endDebounceRef.current) {
      clearTimeout(endDebounceRef.current);
    }

    if (value.length >= 3) {
      setIsSearchingEnd(true);
      endDebounceRef.current = setTimeout(() => {
        searchAddressSuggestions(
          value, 
          setEndSuggestions, 
          setShowEndSuggestions,
          setIsSearchingEnd
        );
      }, 300);
    } else {
      setEndSuggestions([]);
      setShowEndSuggestions(false);
      setIsSearchingEnd(false);
    }
  };

  // Cleanup debounce timers
  useEffect(() => {
    return () => {
      if (startDebounceRef.current) clearTimeout(startDebounceRef.current);
      if (endDebounceRef.current) clearTimeout(endDebounceRef.current);
    };
  }, []);

  // Xử lý chọn gợi ý
  const handleSelectSuggestion = (suggestion, isStart) => {
    const displayName = suggestion.display_name;
    if (isStart) {
      setStartAddress(displayName);
      setStartPoint({ lng: parseFloat(suggestion.lon), lat: parseFloat(suggestion.lat) });
      setShowStartSuggestions(false);
      setStartSuggestions([]);
      setIsSearchingStart(false);
    } else {
      setEndAddress(displayName);
      setEndPoint({ lng: parseFloat(suggestion.lon), lat: parseFloat(suggestion.lat) });
      setShowEndSuggestions(false);
      setEndSuggestions([]);
      setIsSearchingEnd(false);
    }
  };

  const geocodeAddress = async (address) => {
    const query = encodeURIComponent(`${address}, Hanoi, Vietnam`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SmartAirNGSI-LD/1.0'
        }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        return { lng: parseFloat(data[0].lon), lat: parseFloat(data[0].lat) };
      }
      return null;
    } catch (err) {
      console.error('Lỗi Geocoding:', err);
      return null;
    }
  };

  const handleFindRoute = async () => {
    if (!startAddress || !endAddress) {
      setError('Vui lòng nhập cả điểm đi và điểm đến.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setCleanRoute(null);
    setDirections(null);

    let startCoords = startPoint;
    let endCoords = endPoint;

    if (!startCoords) {
      startCoords = await geocodeAddress(startAddress);
      if (!startCoords) {
        setError(`Không tìm thấy địa chỉ: ${startAddress}`);
        setIsLoading(false);
        return;
      }
      setStartPoint(startCoords);
    }

    if (!endCoords) {
      endCoords = await geocodeAddress(endAddress);
      if (!endCoords) {
        setError(`Không tìm thấy địa chỉ: ${endAddress}`);
        setIsLoading(false);
        return;
      }
      setEndPoint(endCoords);
    }

    try {
      const response = await fetch(`${API_URL}/api/find-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: [startCoords.lng, startCoords.lat],
          end: [endCoords.lng, endCoords.lat],
          mode: mode,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Lỗi không xác định từ server');
      }

      const routeData = await response.json();
      
      if (!routeData.route_geojson || !routeData.directions) {
        throw new Error("Phản hồi từ server không đầy đủ.");
      }

      setCleanRoute(routeData.route_geojson);
      setDirections(routeData.directions);
      
    } catch (error) {
      console.error('Lỗi tìm đường:', error);
      setError(`Lỗi: ${error.message}`);
    }
    setIsLoading(false);
  };

  if (!geoData) return <div style={{padding: '20px'}}>Đang tải bản đồ và dữ liệu môi trường...</div>;

  const colorConfigs = {
    'none': {
      stops: [],
      colors: [],
      label: 'Không phân vùng'
    },
    'pm2_5': {
      stops: [0, 12, 25, 35, 50, 75],
      colors: ['#00e676', '#76ff03', '#ffeb3b', '#ff9800', '#ff5722', '#d32f2f'],
      label: 'PM2.5 (Bụi mịn)'
    },
    'pm10': {
      stops: [0, 25, 50, 75, 100, 150],
      colors: ['#00e676', '#76ff03', '#ffeb3b', '#ff9800', '#ff5722', '#d32f2f'],
      label: 'PM10 (Bụi thô)'
    },
    'nh3': {
      stops: [0, 50, 100, 150, 200, 300],
      colors: ['#00e676', '#76ff03', '#ffeb3b', '#ff9800', '#ff5722', '#d32f2f'],
      label: 'NH3 (Amoniac)'
    },
    'windSpeed': {
      stops: [0, 2, 4, 6, 8, 10],
      colors: ['#d32f2f', '#ff5722', '#ff9800', '#ffeb3b', '#76ff03', '#00e676'],
      label: 'Tốc độ gió (m/s)'
    },
    'NO2': {
      stops: [0, 40, 80, 120, 160, 200],
      colors: ['#00e676', '#76ff03', '#ffeb3b', '#ff9800', '#ff5722', '#d32f2f'],
      label: 'NO2'
    },
    'NO': {
      stops: [0, 20, 40, 60, 80, 100],
      colors: ['#00e676', '#76ff03', '#ffeb3b', '#ff9800', '#ff5722', '#d32f2f'],
      label: 'NO'
    },
    'O3': {
      stops: [0, 50, 100, 150, 200, 250],
      colors: ['#00e676', '#76ff03', '#ffeb3b', '#ff9800', '#ff5722', '#d32f2f'],
      label: 'O3 (Ozone)'
    },
    'NOx': {
      stops: [0, 30, 60, 90, 120, 150],
      colors: ['#00e676', '#76ff03', '#ffeb3b', '#ff9800', '#ff5722', '#d32f2f'],
      label: 'NOx'
    },
    'SO2': {
      stops: [0, 20, 40, 60, 80, 100],
      colors: ['#00e676', '#76ff03', '#ffeb3b', '#ff9800', '#ff5722', '#d32f2f'],
      label: 'SO2'
    }
  };

  const currentConfig = colorConfigs[colorMode];
  
  const fillColorExpression = 
    colorMode === 'none'
    ? 'transparent'
    : [
        'interpolate', 
        ['linear'], 
        ['get', colorMode],
        ...currentConfig.stops.flatMap((stop, i) => [stop, currentConfig.colors[i]])
      ];
  
  const extrusionHeightExpression = 
    (colorMode === 'none' || !is3D)
    ? 0
    : [
        'max',
        0,
        ['*', ['get', colorMode], 100]
      ];

  const POSITRON_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
  const STREETS_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

  const mapStyle = colorMode === 'none' ? STREETS_STYLE : POSITRON_STYLE;

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 56px)', position: 'relative' }}>
      
      {/* Bảng điều khiển */}
      <div style={{
        position: 'absolute', top: 20, left: 20, zIndex: 1, 
        backgroundColor: 'white', padding: '15px', borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontFamily: 'sans-serif', 
        minWidth: '320px', maxWidth: '400px'
      }}>
        <h3 style={{margin: '0 0 15px 0', fontSize: '18px', color: '#333'}}>
          🗺️ Tìm đường ít ô nhiễm - Hà Nội
        </h3>
        
        {/* Input điểm đi với autocomplete */}
        <div style={{ marginBottom: '12px', position: 'relative' }}>
          <label style={{display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px'}}>
            📍 Điểm đi:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Nhập địa điểm xuất phát (tối thiểu 3 ký tự)..."
              value={startAddress}
              onChange={(e) => handleStartAddressChange(e.target.value)}
              onFocus={() => {
                if (startSuggestions.length > 0) {
                  setShowStartSuggestions(true);
                }
              }}
              style={{ 
                width: '100%', 
                boxSizing: 'border-box',
                padding: '10px 36px 10px 10px',
                border: showStartSuggestions ? '2px solid #0A79DF' : '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border 0.2s'
              }}
            />
            {isSearchingStart && (
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                animation: 'spin 1s linear infinite'
              }}>
                <span style={{ fontSize: '16px' }}>⏳</span>
              </div>
            )}
            {!isSearchingStart && startPoint && (
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#4caf50'
              }}>✓</span>
            )}
          </div>
          
          {/* Danh sách gợi ý điểm đi */}
          {showStartSuggestions && startSuggestions.length > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #0A79DF',
                borderRadius: '6px',
                maxHeight: '240px',
                overflowY: 'auto',
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                zIndex: 100
              }}
              onMouseLeave={() => setShowStartSuggestions(false)}
            >
              {startSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion, true)}
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    borderBottom: index < startSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e3f2fd';
                    e.target.style.paddingLeft = '18px';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.paddingLeft = '14px';
                  }}
                >
                  <span style={{ fontSize: '16px' }}>📍</span>
                  <span style={{ flex: 1, lineHeight: '1.4' }}>{suggestion.display_name}</span>
                </div>
              ))}
            </div>
          )}
          
          {!isSearchingStart && startAddress.length >= 3 && startSuggestions.length === 0 && !startPoint && (
            <div style={{
              fontSize: '12px',
              color: '#ff9800',
              marginTop: '4px',
              padding: '6px',
              backgroundColor: '#fff3e0',
              borderRadius: '4px'
            }}>
              ⚠️ Không tìm thấy kết quả phù hợp
            </div>
          )}
        </div>
        
        {/* Input điểm đến với autocomplete */}
        <div style={{ marginBottom: '12px', position: 'relative' }}>
          <label style={{display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px'}}>
            🎯 Điểm đến:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Nhập điểm đến (tối thiểu 3 ký tự)..."
              value={endAddress}
              onChange={(e) => handleEndAddressChange(e.target.value)}
              onFocus={() => {
                if (endSuggestions.length > 0) {
                  setShowEndSuggestions(true);
                }
              }}
              style={{ 
                width: '100%', 
                boxSizing: 'border-box',
                padding: '10px 36px 10px 10px',
                border: showEndSuggestions ? '2px solid #0A79DF' : '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border 0.2s'
              }}
            />
            {isSearchingEnd && (
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                animation: 'spin 1s linear infinite'
              }}>
                <span style={{ fontSize: '16px' }}>⏳</span>
              </div>
            )}
            {!isSearchingEnd && endPoint && (
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#4caf50'
              }}>✓</span>
            )}
          </div>
          
          {/* Danh sách gợi ý điểm đến */}
          {showEndSuggestions && endSuggestions.length > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #0A79DF',
                borderRadius: '6px',
                maxHeight: '240px',
                overflowY: 'auto',
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                zIndex: 100
              }}
              onMouseLeave={() => setShowEndSuggestions(false)}
            >
              {endSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion, false)}
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    borderBottom: index < endSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e3f2fd';
                    e.target.style.paddingLeft = '18px';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.paddingLeft = '14px';
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🎯</span>
                  <span style={{ flex: 1, lineHeight: '1.4' }}>{suggestion.display_name}</span>
                </div>
              ))}
            </div>
          )}
          
          {!isSearchingEnd && endAddress.length >= 3 && endSuggestions.length === 0 && !endPoint && (
            <div style={{
              fontSize: '12px',
              color: '#ff9800',
              marginTop: '4px',
              padding: '6px',
              backgroundColor: '#fff3e0',
              borderRadius: '4px'
            }}>
              ⚠️ Không tìm thấy kết quả phù hợp
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            ⚙️ Chế độ tìm đường:
          </label>
          <label style={{ marginRight: '15px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="radio"
              name="mode"
              value="wind"
              checked={mode === 'wind'}
              onChange={() => setMode('wind')}
              style={{marginRight: '5px'}}
            /> 
            🌬️ Ưu tiên giảm ô nhiễm
          </label>
          <label style={{cursor: 'pointer', fontSize: '13px'}}>
            <input
              type="radio"
              name="mode"
              value="short"
              checked={mode === 'short'}
              onChange={() => setMode('short')}
              style={{marginRight: '5px'}}
            /> 
            🚀 Đường ngắn + sạch
          </label>
        </div>
        
        <button 
          onClick={handleFindRoute} 
          disabled={isLoading} 
          style={{ 
            width: '100%',
            padding: '10px',
            backgroundColor: isLoading ? '#ccc' : '#0A79DF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '🔍 Đang tìm đường...' : '🚗 Tìm đường'}
        </button>
        
        {error && (
          <p style={{ 
            color: '#d32f2f', 
            margin: '10px 0 0 0',
            padding: '8px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            ⚠️ {error}
          </p>
        )}
        
        {directions && directions.length > 0 && (
          <div style={{ 
            marginTop: '15px', 
            maxHeight: '220px',
            overflowY: 'auto', 
            border: '1px solid #e0e0e0', 
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0A79DF' }}>
              📋 Lộ trình chi tiết:
            </h4>
            <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', lineHeight: '1.6' }}>
              {directions.map((step, index) => (
                <li key={index} style={{ marginBottom: '6px' }}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <MapGL
        ref={mapRef}
        initialViewState={{
          longitude: hanoiCenter[0],
          latitude: hanoiCenter[1],
          zoom: 12,
          pitch: 0,
          bearing: 0
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        onMouseMove={(e) => {
          if (!is3D && e.features && e.features.length > 0 && e.features[0].layer.id === 'hanoi-fill') {
            setHoveredFeature(e.features[0]);
          } else {
            setHoveredFeature(null);
          }
        }}
        interactiveLayerIds={['hanoi-fill']}
      >
        
        <Source id="hanoi-zones" type="geojson" data={geoData}>
          
          <Layer
            id="hanoi-fill"
            type="fill"
            paint={{
              'fill-color': fillColorExpression,
              'fill-opacity': (colorMode === 'none' || is3D) ? 0 : 0.6, 
            }}
          />

          <Layer
            id="hanoi-3d-extrusion"
            type="fill-extrusion"
            paint={{
              'fill-extrusion-color': fillColorExpression,
              'fill-extrusion-opacity': (colorMode === 'none' || !is3D) ? 0 : 0.7, 
              'fill-extrusion-height': extrusionHeightExpression,
              'fill-extrusion-base': 0,
            }}
          />

          <Layer
            id="hanoi-outline"
            type="line"
            paint={{ 
              'line-color': '#1976d2', 
              'line-width': 1,
              'line-opacity': colorMode === 'none' ? 0 : 0.3,
            }}
          />
        </Source>

        {cleanRoute && (
          <Source id="clean-route" type="geojson" data={cleanRoute}>
            <Layer
              id="route-line-layer"
              type="line"
              paint={{
                'line-color': '#0A79DF',
                'line-width': 5,
                'line-opacity': 0.95,
              }}
            />
          </Source>
        )}
        
        {startPoint && <Marker longitude={startPoint.lng} latitude={startPoint.lat} color="green" />}
        {endPoint && <Marker longitude={endPoint.lng} latitude={endPoint.lat} color="red" />}

      </MapGL>

      {/* CSS Animation cho spinner */}
      <style>{`
        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>

      {/* Bộ chọn chế độ tô màu */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 1,
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        minWidth: '200px',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '10px',
          color: '#333',
          borderBottom: '2px solid #e3f2fd',
          paddingBottom: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>🎨 Chế độ hiển thị bản đồ</span>
          <button
            onClick={() => {
              if (is3D) { 
                mapRef.current?.easeTo({ pitch: 0, duration: 500 });
              }
              setIs3D(!is3D);
            }}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: '600',
              backgroundColor: is3D ? '#0A79DF' : '#f0f0f0',
              color: is3D ? 'white' : '#333',
              border: is3D ? '1px solid #0A79DF' : '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {is3D ? 'Tắt 3D' : 'Bật 3D'}
          </button>
        </div>

        {is3D && (
          <div style={{
            fontSize: '11px', 
            color: '#666', 
            backgroundColor: '#e3f2fd', 
            padding: '6px', 
            borderRadius: '4px', 
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Giữ <strong>Ctrl (hoặc ⌘) + Kéo chuột</strong> để nghiêng bản đồ
          </div>
        )}
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px'}}>
          {Object.entries(colorConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setColorMode(key)}
              style={{
                padding: '8px 10px',
                backgroundColor: colorMode === key ? '#0A79DF' : '#f5f5f5',
                color: colorMode === key ? 'white' : '#333',
                border: colorMode === key ? '2px solid #0A79DF' : '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: colorMode === key ? '600' : '400',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
            >
              {config.label}
            </button>
          ))}
        </div>

        {colorMode !== 'none' && (
          <div style={{marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e0e0e0'}}>
            <div style={{fontSize: '11px', fontWeight: '600', marginBottom: '6px', color: '#666'}}>
              Thang màu: {currentConfig.label}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <div style={{
                flex: 1,
                height: '20px',
                borderRadius: '4px',
                background: `linear-gradient(to right, ${currentConfig.colors.join(', ')})`
              }}></div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginTop: '4px'}}>
              <span>Tốt</span>
              <span>Xấu</span>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoveredFeature && colorMode !== 'none' && !is3D && (
        <div style={{
          position: 'absolute', 
          bottom: 20, 
          left: 20, 
          zIndex: 1,
          backgroundColor: 'rgba(255,255,255,0.98)', 
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          maxWidth: '340px',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1976d2',
            borderBottom: '2px solid #e3f2fd',
            paddingBottom: '8px'
          }}>
            📍 {hoveredFeature.properties['Tên đơn vị']}
          </div>
          
          <div style={{marginBottom: '12px'}}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '6px'
            }}>
              🌫️ Chất lượng không khí:
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px'}}>
              <div style={{padding: '6px', backgroundColor: '#e8f5e9', borderRadius: '4px'}}>
                <strong>NO:</strong> {hoveredFeature.properties.NO?.toFixed(2) ?? 'N/A'} µg/m³
              </div>
              <div style={{padding: '6px', backgroundColor: '#e1f5fe', borderRadius: '4px'}}>
                <strong>O3:</strong> {hoveredFeature.properties.O3?.toFixed(2) ?? 'N/A'} µg/m³
              </div>
              <div style={{padding: '6px', backgroundColor: '#fff3e0', borderRadius: '4px'}}>
                <strong>NO2:</strong> {hoveredFeature.properties.NO2?.toFixed(2) ?? 'N/A'} µg/m³
              </div>
              <div style={{padding: '6px', backgroundColor: '#fce4ec', borderRadius: '4px'}}>
                <strong>NOx:</strong> {hoveredFeature.properties.NOx?.toFixed(2) ?? 'N/A'} µg/m³
              </div>
              <div style={{padding: '6px', backgroundColor: '#f3e5f5', borderRadius: '4px'}}>
                <strong>SO2:</strong> {hoveredFeature.properties.SO2?.toFixed(2) ?? 'N/A'} µg/m³
              </div>
              <div style={{padding: '6px', backgroundColor: '#ffebee', borderRadius: '4px'}}>
                <strong>PM2.5:</strong> {hoveredFeature.properties.pm2_5?.toFixed(2) ?? 'N/A'} µg/m³
              </div>
              <div style={{padding: '6px', backgroundColor: '#ede7f6', borderRadius: '4px'}}>
                <strong>PM10:</strong> {hoveredFeature.properties.pm10?.toFixed(2) ?? 'N/A'} µg/m³
              </div>
              <div style={{padding: '6px', backgroundColor: '#e0f2f1', borderRadius: '4px'}}>
                <strong>NH3:</strong> {hoveredFeature.properties.nh3?.toFixed(2) ?? 'N/A'} µg/m³
              </div>
              <div style={{padding: '6px', backgroundColor: '#e8eaf6', borderRadius: '4px'}}>
                <strong>🌬️ Gió:</strong> {hoveredFeature.properties.windSpeed?.toFixed(2) ?? 'N/A'} m/s
              </div>
            </div>
          </div>
          
          <div style={{
            fontSize: '12px',
            color: '#666',
            paddingTop: '8px',
            borderTop: '1px solid #e0e0e0'
          }}>
            👥 Dân số: {hoveredFeature.properties['Dân số']?.toLocaleString() || 'N/A'}<br/>
            📏 Diện tích: {hoveredFeature.properties['Diện tích'] || 'N/A'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;