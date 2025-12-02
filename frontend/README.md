# 🌤️ Smart Air — AirTrack Frontend

**Smart Air AirTrack** là frontend cho hệ thống quan trắc chất lượng không khí thời gian thực.  
Ứng dụng hiển thị bản đồ trạm quan trắc, dashboard tổng quan, biểu đồ SSE realtime, trang admin quản lý thiết bị & tài khoản.

Giao diện được xây dựng bằng **React + Vite**, sử dụng **GeoJSON**, **SSE**, và **RESTful API** để kết nối với backend.

## Preview
- Bản đồ tương tác (Leaflet + MapLibre GL)
- Chart realtime/history với Recharts
- Dashboard tổng quan với dữ liệu SSE
- Hệ thống xác thực (Login/Register/Profile)
- Trang Admin quản lý trạm – thiết bị – tài khoản
- Tích hợp OpenAPI docs (iframe)

## Tech Stack
- React 19 + Vite 7
- React Router v7
- Redux Toolkit + Redux Persist (Authentication)
- React Hook Form (Form validation)
- SSE via EventSource
- Leaflet / react-leaflet + MapLibre GL
- Recharts
- Axios (interceptors + nprogress)
- Bootstrap 5 + SCSS
- React Toastify (Notifications)
- Docker (optional)

## Yêu cầu
- Node.js 18+
- npm 8+ hoặc Yarn
- Backend chạy tại http://localhost:8081

## Cấu hình môi trường
Tạo file `.env` (copy từ `.env.example`):

```env
VITE_API_URL=http://localhost:8081
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
      Auth/          # Login, Register, Profile
      Header/        # Navigation
      StationMap/    # Map with platforms
      StationDetail/ # Platform detail page
      StationInfo/   # Info panel
      Chart/         # Weather/AirQuality charts
      Analysis/      # Analytics dashboard
      AirQuality/    # Air quality page
      OpenData/      # Open data page
      About/         # About page
      Map/           # Route planning (optional)
    Admin/           # Admin dashboard
  hooks/             # Custom SSE hooks
  services/          # API services (auth, platform)
  store/             # Redux store + slices
  utils/             # Axios config, helpers
  App.jsx
  main.jsx
```

## SSE Hooks
- `usePlatformSSE` - Real-time platform/station updates
- `useDistrictSSE` - Weather + Air quality for specific district
- `useHistoricalSSE` - Historical weather/air quality data
- `useAnalysisHistorySSE` - Analytics historical data
- `useAirQualityMonitor` - Air quality monitoring

## API Services
- `authService` - Login, Register, Update Profile
- `platformService` - Get platforms/stations

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
