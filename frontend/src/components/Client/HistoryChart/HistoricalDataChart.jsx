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
import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

// ========== SSE HOOKS ==========

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8123';

const useWeatherHistory = (district) => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!district) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const url = `${BASE_URL}/api/sse/weather/${district}/history`;
    console.log('🔌 Connecting to weather history SSE:', url);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('weather.history', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📊 Received weather history:', data);
        setHistoryData(data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error parsing weather history:', err);
        setError('Lỗi khi xử lý dữ liệu lịch sử thời tiết');
      }
    });

    eventSource.onerror = (err) => {
      console.error('❌ Weather history SSE error:', err);
      setError('Không thể kết nối đến server');
      setLoading(false);
    };

    eventSource.onopen = () => {
      console.log('✅ Connected to weather history SSE');
      setError(null);
    };

    return () => {
      console.log('🔌 Closing weather history SSE');
      eventSource.close();
    };
  }, [district]);

  return { historyData, loading, error };
};

const useAirQualityHistory = (district) => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!district) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const url = `${BASE_URL}/api/sse/airquality/${district}/history`;
    console.log('🔌 Connecting to air quality history SSE:', url);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('airquality.history', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📊 Received air quality history:', data);
        setHistoryData(data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error parsing air quality history:', err);
        setError('Lỗi khi xử lý dữ liệu lịch sử chất lượng không khí');
      }
    });

    eventSource.onerror = (err) => {
      console.error('❌ Air quality history SSE error:', err);
      setError('Không thể kết nối đến server');
      setLoading(false);
    };

    eventSource.onopen = () => {
      console.log('✅ Connected to air quality history SSE');
      setError(null);
    };

    return () => {
      console.log('🔌 Closing air quality history SSE');
      eventSource.close();
    };
  }, [district]);

  return { historyData, loading, error };
};

// ========== DATA TRANSFORMATION ==========

const transformHistoryToChartData = (quantumLeapData) => {
  if (!quantumLeapData?.attributes || !quantumLeapData?.index) {
    return [];
  }

  const { attributes, index } = quantumLeapData;
  
  return index.map((timestamp, i) => {
    const dataPoint = { 
      timestamp: new Date(timestamp).toLocaleDateString('vi-VN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit'
      }),
      fullTimestamp: new Date(timestamp).toLocaleString('vi-VN')
    };
    
    attributes.forEach(attr => {
      dataPoint[attr.attrName] = attr.values[i];
    });
    
    return dataPoint;
  });
};

// ========== CHART COMPONENTS ==========

const WeatherChartTabs = ({ chartData }) => {
  const [activeTab, setActiveTab] = useState('temperature');

  const tabs = [
    { id: 'temperature', label: '🌡️ Nhiệt độ', key: 'temperature', unit: '°C', color: '#ff7300' },
    { id: 'humidity', label: '💧 Độ ẩm', key: 'humidity', unit: '%', color: '#387908' },
    { id: 'pressure', label: '🔽 Áp suất', key: 'pressure', unit: 'hPa', color: '#3498db' },
    { id: 'windSpeed', label: '💨 Tốc độ gió', key: 'windSpeed', unit: 'm/s', color: '#95a5a6' },
    { id: 'precipitation', label: '🌧️ Lượng mưa', key: 'precipitation', unit: 'mm', color: '#2980b9' },
    { id: 'visibility', label: '👁️ Tầm nhìn', key: 'visibility', unit: 'm', color: '#9b59b6' },
    { id: 'dewPoint', label: '💦 Điểm sương', key: 'dewPoint', unit: '°C', color: '#16a085' },
    { id: 'feelsLike', label: '🌡️ Cảm giác', key: 'feelsLike', unit: '°C', color: '#e74c3c' },
    { id: 'uvIndex', label: '☀️ Chỉ số UV', key: 'uvIndex', unit: '', color: '#f39c12' }
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`color${activeTab}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={activeTabData.color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={activeTabData.color} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              border: '2px solid #4f46e5',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey={activeTabData.key}
            stroke={activeTabData.color}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#color${activeTab})`}
            name={`${activeTabData.label} (${activeTabData.unit})`}
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {(() => {
          const values = chartData.map(d => d[activeTabData.key]).filter(v => v != null);
          if (values.length === 0) return null;
          
          const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
          const max = Math.max(...values).toFixed(2);
          const min = Math.min(...values).toFixed(2);
          const latest = values[values.length - 1].toFixed(2);

          return (
            <>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">📊 Trung bình</p>
                <p className="text-2xl font-bold text-blue-600">{avg} {activeTabData.unit}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-xs text-gray-600 mb-1">📈 Cao nhất</p>
                <p className="text-2xl font-bold text-red-600">{max} {activeTabData.unit}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">📉 Thấp nhất</p>
                <p className="text-2xl font-bold text-green-600">{min} {activeTabData.unit}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">🕐 Hiện tại</p>
                <p className="text-2xl font-bold text-purple-600">{latest} {activeTabData.unit}</p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

const AirQualityChartTabs = ({ chartData }) => {
  const [activeTab, setActiveTab] = useState('pm25');

  const tabs = [
    { id: 'pm25', label: '🌫️ PM2.5', key: 'pm25', unit: 'µg/m³', color: '#e74c3c' },
    { id: 'pm10', label: '🌫️ PM10', key: 'pm10', unit: 'µg/m³', color: '#9b59b6' },
    { id: 'no2', label: '💨 NO₂', key: 'no2', unit: 'µg/m³', color: '#3498db' },
    { id: 'so2', label: '☁️ SO₂', key: 'so2', unit: 'µg/m³', color: '#f39c12' },
    { id: 'co', label: '💨 CO', key: 'co', unit: 'mg/m³', color: '#95a5a6' },
    { id: 'o3', label: '🌤️ O₃', key: 'o3', unit: 'µg/m³', color: '#1abc9c' },
    { id: 'aqi', label: '📊 AQI', key: 'airQualityIndex', unit: '', color: '#e67e22' }
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`color${activeTab}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={activeTabData.color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={activeTabData.color} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              border: '2px solid #9b59b6',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey={activeTabData.key}
            stroke={activeTabData.color}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#color${activeTab})`}
            name={`${activeTabData.label} (${activeTabData.unit})`}
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {(() => {
          const values = chartData.map(d => d[activeTabData.key]).filter(v => v != null);
          if (values.length === 0) return null;
          
          const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
          const max = Math.max(...values).toFixed(2);
          const min = Math.min(...values).toFixed(2);
          const latest = values[values.length - 1].toFixed(2);

          return (
            <>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">📊 Trung bình</p>
                <p className="text-2xl font-bold text-purple-600">{avg} {activeTabData.unit}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-xs text-gray-600 mb-1">⚠️ Cao nhất</p>
                <p className="text-2xl font-bold text-red-600">{max} {activeTabData.unit}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">✅ Thấp nhất</p>
                <p className="text-2xl font-bold text-green-600">{min} {activeTabData.unit}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <p className="text-xs text-gray-600 mb-1">🕐 Hiện tại</p>
                <p className="text-2xl font-bold text-indigo-600">{latest} {activeTabData.unit}</p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

// ========== ALL ATTRIBUTES OVERVIEW ==========

const AllAttributesOverview = ({ historyData, dataType }) => {
  if (!historyData?.attributes) return null;

  const attributes = historyData.attributes;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100 mb-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">📋 Tổng quan Tất cả Attributes</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attributes.map((attr, index) => {
          const values = attr.values.filter(v => v != null);
          if (values.length === 0) return null;

          const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
          const max = Math.max(...values).toFixed(2);
          const min = Math.min(...values).toFixed(2);

          const colors = [
            'from-blue-400 to-blue-600',
            'from-purple-400 to-purple-600',
            'from-pink-400 to-pink-600',
            'from-red-400 to-red-600',
            'from-orange-400 to-orange-600',
            'from-yellow-400 to-yellow-600',
            'from-green-400 to-green-600',
            'from-teal-400 to-teal-600',
            'from-cyan-400 to-cyan-600'
          ];

          const colorClass = colors[index % colors.length];

          return (
            <div 
              key={attr.attrName}
              className={`bg-gradient-to-br ${colorClass} rounded-xl p-5 text-white shadow-lg`}
            >
              <p className="text-sm opacity-90 mb-2 font-medium">{attr.attrName}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>📊 TB:</span>
                  <span className="font-bold">{avg}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>📈 Max:</span>
                  <span className="font-bold">{max}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>📉 Min:</span>
                  <span className="font-bold">{min}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>🔢 Số điểm:</span>
                  <span className="font-bold">{values.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========== MAIN COMPONENT ==========

const HistoricalDataChart = () => {
  const [district, setDistrict] = useState('PhuongBaDinh');
  const [dataType, setDataType] = useState('weather');

  // SSE Connections
  const weatherHistory = useWeatherHistory(dataType === 'weather' ? district : null);
  const airQualityHistory = useAirQualityHistory(dataType === 'airquality' ? district : null);

  // Select active data based on type
  const { historyData, loading, error } = dataType === 'weather' ? weatherHistory : airQualityHistory;

  // Transform data for charts
  const chartData = transformHistoryToChartData(historyData);

  const districts = [
    { value: 'PhuongBaDinh', label: 'Phường Ba Đình' },
    { value: 'PhuongHoanKiem', label: 'Phường Hoàn Kiếm' },
    { value: 'PhuongDongDa', label: 'Phường Đống Đa' },
    { value: 'PhuongCauGiay', label: 'Phường Cầu Giấy' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                📊 Dữ Liệu Lịch Sử 30 Ngày - Tất Cả Attributes
              </h1>
              <p className="text-gray-600 text-lg">
                Hiển thị toàn bộ dữ liệu từ QuantumLeap qua SSE
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-green-700 font-medium">Live Streaming</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-indigo-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📍 Chọn Quận/Phường
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {districts.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📈 Loại Dữ Liệu
              </label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="weather">🌤️ Thời Tiết</option>
                <option value="airquality">🌫️ Chất Lượng Không Khí</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-5 rounded-lg mb-6 shadow-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
              <p className="font-semibold">⏳ Đang kết nối và tải dữ liệu lịch sử từ QuantumLeap...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-lg mb-6 shadow-md">
            <p className="font-semibold">❌ Lỗi: {error}</p>
            <p className="text-sm mt-1">Kiểm tra kết nối SSE tại: {BASE_URL}</p>
          </div>
        )}

        {!loading && !error && chartData.length === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-5 rounded-lg mb-6 shadow-md">
            <p className="font-semibold">⚠️ Chưa có dữ liệu</p>
            <p className="text-sm mt-1">Đợi Orion-LD gửi notification mới để trigger QuantumLeap query</p>
          </div>
        )}

        {/* All Attributes Overview */}
        {historyData && chartData.length > 0 && (
          <AllAttributesOverview historyData={historyData} dataType={dataType} />
        )}

        {/* Main Chart with Tabs */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {dataType === 'weather' ? '🌡️ Biểu Đồ Chi Tiết Thời Tiết' : '🌫️ Biểu Đồ Chi Tiết Chất Lượng Không Khí'}
            </h2>
            
            {dataType === 'weather' ? (
              <WeatherChartTabs chartData={chartData} />
            ) : (
              <AirQualityChartTabs chartData={chartData} />
            )}
          </div>
        )}

        {/* Data Info */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-md">
              <p className="text-sm text-gray-600 mb-2 font-medium">📊 Tổng số điểm dữ liệu</p>
              <p className="text-4xl font-bold text-blue-600">{chartData.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-md">
              <p className="text-sm text-gray-600 mb-2 font-medium">📅 Thời gian đầu</p>
              <p className="text-sm font-semibold text-green-600">
                {chartData[0]?.fullTimestamp || 'N/A'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-md">
              <p className="text-sm text-gray-600 mb-2 font-medium">📅 Thời gian cuối</p>
              <p className="text-sm font-semibold text-purple-600">
                {chartData[chartData.length - 1]?.fullTimestamp || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Raw Data Table */}
        {historyData && chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🗂️ Dữ Liệu Thô từ QuantumLeap</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">📦 Entity Info:</p>
              <div className="space-y-1 text-xs font-mono">
                <p><span className="font-bold">ID:</span> {historyData.entityId}</p>
                <p><span className="font-bold">Type:</span> {historyData.entityType}</p>
                <p><span className="font-bold">Attributes:</span> {historyData.attributes?.length || 0}</p>
                <p><span className="font-bold">Data Points:</span> {historyData.index?.length || 0}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="p-3 text-left font-semibold">Attribute</th>
                    <th className="p-3 text-left font-semibold">Type</th>
                    <th className="p-3 text-left font-semibold">Sample Values (First 5)</th>
                    <th className="p-3 text-left font-semibold">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.attributes?.map((attr, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-blue-600">{attr.attrName}</td>
                      <td className="p-3 text-gray-600">
                        {typeof attr.values[0] === 'number' ? '🔢 Number' : '📝 String'}
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-700">
                        {attr.values.slice(0, 5).map(v => 
                          typeof v === 'number' ? v.toFixed(2) : v
                        ).join(', ')}...
                      </td>
                      <td className="p-3 text-gray-600">{attr.values.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HistoricalDataChart;