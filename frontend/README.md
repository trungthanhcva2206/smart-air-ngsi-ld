# 🌤️ Smart Air — AirTrack Frontend

**Smart Air AirTrack** là frontend cho hệ thống quan trắc chất lượng không khí thời gian thực.  
Ứng dụng hiển thị bản đồ trạm quan trắc, dashboard tổng quan, biểu đồ SSE realtime, trang admin quản lý thiết bị & tài khoản.

Giao diện được xây dựng bằng **React + Vite**, sử dụng **GeoJSON**, **SSE**, và **RESTful API** để kết nối với backend.

## Preview
- Bản đồ tương tác (Leaflet / Mapbox-style)
- Chart realtime/ history với Recharts
- Dashboard tổng quan với dữ liệu SSE
- Trang Admin quản lý trạm – thiết bị – tài khoản
- Tích hợp OpenAPI docs (iframe)

## Tech Stack
- React 18 + Vite  
- React Router v6  
- SSE via EventSource  
- Leaflet / react-leaflet  
- Recharts  
- Axios (interceptors + nprogress)  
- Bootstrap 5 + SCSS  
- Docker (optional)

## Yêu cầu
- Node.js 18+
- npm 8+ hoặc Yarn
- Backend chạy tại http://localhost:8081

## Cấu hình môi trường
Tạo file .env:

```
VITE_API_URL=http://localhost:8081
VITE_API_ROUTE_URL=http://127.0.0.1:5000
```

## Cài đặt & Chạy Dev
Install:
```
npm install
```

Run dev:
```
npm run dev
```

Build:
```
npm run build
npm run preview
```

## Cấu trúc thư mục
```
/src
  assets/
  components/
    Client/
    Admin/
  hooks/
  services/
  utils/
  App.jsx
  main.jsx
```

## SSE Hooks
- usePlatformsSSE
- useDistrictSSE
- useWeatherHistory
- useAirQualityHistory
- useAggregatedDistrictHistory
- useAirQualityMonitor

## Troubleshooting
- Kiểm tra event-stream 200 khi SSE lỗi
- GeoJSON không được comment
- CORS phải bật đúng

## License
Apache License 2.0

## Authors
- TT — trungthanhcva2206@gmail.com
- Tankchoi — tadzltv22082004@gmail.com
- Panh — panh812004.apn@gmail.com

## Support

Nếu gặp vấn đề, vui lòng:

1. Xem [Issues](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/issues)
2. Xem [Documentation Wiki](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/wiki)
3. Trao đổi [Discussions](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/discussions)
4. Liên hệ authors
