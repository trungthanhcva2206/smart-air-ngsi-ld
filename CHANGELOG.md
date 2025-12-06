# Changelog

All notable changes to the Smart Air NGSI-LD project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Advanced analytics dashboard
- Machine learning models for air quality prediction
- Mobile application (iOS/Android)
- Multi-language support (English, Vietnamese)
- GraphQL API support
- Webhook notifications for third-party integrations

---
## [1.1.0] - 2025-12-06

### 🛠 Updated

#### Docker & Deployment
- 🔧 Updated all Dockerfiles across backend, frontend, and AI service
- 🔧 Optimized image size using multi-stage builds (Java, Node, Python)
- 🔧 Improved caching layers for faster rebuild times
- 🔧 Upgraded base images to latest stable versions (2025 editions)
- 🔧 Enhanced Docker Compose with:
  - Health checks for all services
  - Restart policies (`on-failure`, `always`)
  - Improved `.env` variable mapping
  - Named volumes for persistence

## [1.0.0] - 2025-12-02

### 🎉 First Stable Release

The first production-ready release of Smart Air NGSI-LD platform with complete FIWARE integration and real-time monitoring capabilities.

### Added

#### Backend
- ✅ Complete Spring Boot backend with Java 21+ support
- ✅ NGSI-LD notification receiver endpoint (`/api/notify/ngsi`)
- ✅ Real-time data streaming via Server-Sent Events (SSE)
- ✅ Open Data API for public access to weather and air quality data
- ✅ JWT-based authentication and authorization system
- ✅ Role-based access control (RBAC) for admin and users
- ✅ Resident management system with station mapping
- ✅ Multi-channel notification system:
  - Email notifications via SMTP
  - Telegram bot integration
  - Blynk IoT platform support
- ✅ Automatic Orion-LD subscription management on startup
- ✅ PostgreSQL database integration with JPA/Hibernate
- ✅ OpenAPI 3.0 (Swagger) documentation
- ✅ Health check endpoints for monitoring
- ✅ Comprehensive logging with SLF4J + Logback

#### FIWARE Integration
- ✅ Orion-LD context broker integration (v1.6.0+)
- ✅ IoT Agent configuration for device management
- ✅ QuantumLeap time-series data storage
- ✅ Docker Compose orchestration for all FIWARE components
- ✅ NGSI-LD entity management (CRUD operations)
- ✅ Subscription lifecycle management

#### Data Processing & ETL
- ✅ NGSI-LD entity transformers for:
  - Air Quality observations (PM2.5, PM10, CO2)
  - Weather data (temperature, humidity, pressure)
  - Sensor metadata
- ✅ CSV/JSON data import scripts
- ✅ Data validation and normalization pipeline
- ✅ GeoJSON support for spatial queries
- ✅ District-based data filtering

#### Frontend
- ✅ React 18+ single-page application
- ✅ Real-time dashboard with SSE integration
- ✅ Interactive map with Leaflet/Mapbox
- ✅ Air quality visualization with charts
- ✅ Weather monitoring panels
- ✅ Platform/sensor management interface
- ✅ User authentication and profile management
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript support for type safety

#### API Endpoints
- ✅ Authentication: `/api/auth/register`, `/api/auth/login`
- ✅ Open Data: `/api/open/weather/latest`, `/api/open/airquality/latest`
- ✅ Platforms: `/api/open/platforms`, `/api/open/districts`
- ✅ SSE Streams: `/api/sse/weather/{district}`, `/api/sse/airquality/alerts`
- ✅ Resident Management: `/api/residents/me`
- ✅ Subscriptions: `/api/subscriptions/create`, `/api/subscriptions/list`

#### Infrastructure
- ✅ Docker containerization for all services
- ✅ Docker Compose setup for development and production
- ✅ Environment variable configuration system
- ✅ Network isolation and security policies
- ✅ Volume management for data persistence
- ✅ Service health checks and restart policies

#### Documentation
- ✅ Comprehensive README with quick start guide
- ✅ API documentation with examples
- ✅ Architecture diagrams and data flow explanations
- ✅ Deployment guides for Windows/Linux/Mac
- ✅ Troubleshooting section with common issues
- ✅ Contributing guidelines (CONTRIBUTING.md)
- ✅ Code of conduct
- ✅ License (Apache 2.0)

#### Ontology & Data Models
- ✅ SOSA/SSN ontology implementation
- ✅ Smart Data Models alignment
- ✅ Custom context definitions for air quality entities
- ✅ JSON-LD context files
- ✅ Entity relationship mappings

### Changed
- Migrated from prototype architecture to production-ready system
- Improved error handling and validation across all services
- Enhanced security with JWT token expiration and refresh
- Optimized database queries for better performance
- Refactored ETL pipeline for scalability

### Fixed
- Docker network connectivity issues on Windows
- SSE connection timeout problems
- CORS policy configuration for frontend-backend communication
- Line ending issues in shell scripts (CRLF → LF)
- PostgreSQL connection pool exhaustion
- Memory leaks in long-running SSE connections

### Security
- Added rate limiting for public API endpoints
- Implemented SQL injection prevention
- Added XSS protection headers
- Secured sensitive configuration with environment variables
- Added input validation and sanitization
- Implemented HTTPS support for production

---

## [0.0.1] - 2025-11-5

### 🚀 Pre-release / Prototype

Initial prototype release with core NGSI-LD functionality and basic FIWARE integration.

### Added

#### Core Features
- ✅ Basic NGSI-LD broker setup with Orion-LD
- ✅ Simple ETL pipeline for sensor data transformation
- ✅ MongoDB database integration
- ✅ Basic Docker Compose configuration
- ✅ Initial ontology definitions (Sensor, Observation)
- ✅ Proof-of-concept frontend dashboard

#### Backend (Prototype)
- Basic Spring Boot application structure
- Simple REST API for data retrieval
- Manual NGSI-LD entity creation
- Basic logging functionality
- H2 in-memory database for development

#### Data Processing
- Python scripts for CSV data import
- Simple JSON-LD converter
- Basic entity validation
- Manual data upload via scripts

#### Infrastructure
- Docker containers for Orion-LD and MongoDB
- Basic docker-compose.yml setup
- Development environment configuration
- Local testing setup

#### Documentation
- Initial README with project description
- Basic setup instructions
- Sample data files
- Architecture overview

### Known Issues in v0.0.1
- No authentication system
- Manual subscription management required
- Limited error handling
- No real-time streaming capabilities
- Frontend not fully functional
- No production deployment guide
- Missing test coverage
- No CI/CD pipeline

---

## Migration Guide

### From v0.0.1 to v1.0.0

**⚠️ Breaking Changes:**
- Database schema changed from MongoDB to PostgreSQL
- API endpoints restructured (added `/api/open/` prefix)
- Authentication now required for protected endpoints
- NGSI-LD context format updated to latest standard
- Docker Compose file completely rewritten

**Migration Steps:**

1. **Backup your data:**
   ```bash
   # Export entities from old Orion-LD
   curl http://localhost:1026/ngsi-ld/v1/entities > backup-entities.json
   ```

2. **Update Docker Compose:**
   ```bash
   # Stop old containers
   docker-compose down -v
   
   # Pull new images
   docker-compose pull
   
   # Start new stack
   docker-compose up -d
   ```

3. **Database Migration:**
   ```bash
   # Create PostgreSQL database
   createdb smartair
   
   # Run migration scripts
   cd backend
   mvn flyway:migrate
   ```

4. **Update Configuration:**
   ```bash
   # Copy new config template
   cp application.example.properties application.properties
   
   # Update your credentials
   nano application.properties
   ```

5. **Import Data:**
   ```bash
   # Use new ETL scripts
   cd etl
   python import_entities.py --file backup-entities.json
   ```

6. **Create Admin User:**
   ```bash
   curl -X POST http://localhost:8081/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Admin","email":"admin@smartair.local","password":"SecurePass123!"}'
   ```

---

## Version History

| Version | Release Date | Status | Highlights |
|---------|-------------|--------|------------|
| 1.0.0 | 2025-12-02 | Stable | Production-ready with full features |
| 0.0.1 | 2025-11-5 | Pre-release | Initial prototype |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to this project.

---

## Support

For issues and questions:
- 📖 [Documentation Wiki](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/wiki)
- 🐛 [Report Issues](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/issues)
- 💬 [Discussions](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/discussions)

---

## Authors

- **TT** - [trungthanhcva2206@gmail.com](mailto:trungthanhcva2206@gmail.com)
- **Tankchoi** - [tadzltv22082004@gmail.com](mailto:tadzltv22082004@gmail.com)
- **Panh** - [panh812004.apn@gmail.com](mailto:panh812004.apn@gmail.com)
