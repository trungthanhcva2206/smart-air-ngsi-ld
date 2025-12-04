# 🌤️ Smart Air — AirTrack Frontend

**Smart Air AirTrack** is the frontend for a real-time air quality monitoring system.
The application displays a monitoring station map, an overview dashboard, real-time SSE charts, and an admin page for managing devices and accounts.

The interface is built using **React + Vite**, utilizing **GeoJSON**, **SSE**, and **RESTful APIs** to connect with the backend.

## Preview
- Interactive Map (Leaflet + MapLibre GL)
- Real-time/Historical charts with Recharts
- Overview Dashboard with SSE data
- Authentication System (Login/Register/Profile)
- Admin Page for managing stations – devices – accounts
- OpenAPI docs integration (iframe)

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

## Requirements
- Node.js 18+
- npm 8+ or Yarn
- Backend running at http://localhost:8081

## Environment Configuration
Create a `.env` file (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:8081
````

## Installation & Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Folder Structure

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

  - Check for `event-stream` 200 status if SSE fails.
  - GeoJSON files must not contain comments.
  - CORS must be enabled correctly on the backend.

## License

Apache License 2.0

## Authors

  - TT — trungthanhcva2206@gmail.com
  - Tankchoi — tadzltv22082004@gmail.com
  - Panh — panh812004.apn@gmail.com

## Support

If you encounter any issues, please:

1.  Check [Issues](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/issues)
2.  Read the [Documentation Wiki](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/wiki)
3.  Join [Discussions](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/discussions)
4.  Contact the authors
