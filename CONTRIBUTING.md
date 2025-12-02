# Hướng dẫn đóng góp - Smart Air NGSI-LD

Cảm ơn bạn đã quan tâm và muốn đóng góp vào dự án **Smart Air NGSI-LD**!

Dự án luôn chào đón các đóng góp từ cộng đồng bao gồm sửa lỗi, thêm tính năng mới, cải thiện tài liệu, tối ưu ETL, mở rộng ontology hoặc cải thiện mô hình NGSI-LD.

---

## 📋 Mục lục

- [Cách thức đóng góp](#-cách-thức-đóng-góp)
- [Các loại đóng góp](#-các-loại-đóng-góp)
- [Quy tắc viết code](#-quy-tắc-viết-code--cấu-trúc-dự-án)
- [Kiểm tra trước khi gửi PR](#-kiểm-tra-trước-khi-gửi-pr)
- [Gửi Pull Request](#-gửi-pull-request-pr)
- [Quy tắc mở Issue](#-quy-tắc-mở-issue)
- [Development Setup](#-development-setup)
- [Testing Guidelines](#-testing-guidelines)
- [Code Review Process](#-code-review-process)

---

## 🚀 Cách thức đóng góp

### 1. Fork repository

Nhấn **Fork** ở góc trên bên phải để tạo bản sao của dự án vào tài khoản của bạn.

### 2. Clone về máy

```bash
git clone https://github.com/<your-username>/smart-air-ngsi-ld.git
cd smart-air-ngsi-ld
```

### 3. Thêm upstream remote

```bash
git remote add upstream https://github.com/trungthanhcva2206/smart-air-ngsi-ld.git
git fetch upstream
```

### 4. Tạo branch mới cho mỗi thay đổi

Tên branch nên rõ ràng theo chuẩn:

| Loại | Format | Ví dụ |
|-------|--------|-------|
| Tính năng mới | `feature/<tên-tính-năng>` | `feature/add-sensor-model` |
| Sửa lỗi | `fix/<mô-tả-lỗi>` | `fix/context-mapping-observation` |
| Cải thiện hiệu năng | `perf/<mô-tả>` | `perf/optimize-etl-pipeline` |
| Tài liệu | `docs/<mô-tả>` | `docs/update-readme` |
| Refactor | `refactor/<mô-tả>` | `refactor/restructure-backend` |
| Test | `test/<mô-tả>` | `test/add-unit-tests` |

**Ví dụ:**
```bash
git checkout -b feature/add-etl-converter
```

---

## 🎯 Các loại đóng góp

### 1. Backend Development (Spring Boot)

**Khu vực:** `backend/`

- Thêm REST API endpoints mới
- Cải thiện xử lý NGSI-LD notifications
- Tối ưu SSE streaming performance
- Thêm notification channels (Email, Telegram, Blynk)
- Cải thiện JWT authentication & authorization
- Database schema migrations
- Integration với FIWARE components (Orion-LD, QuantumLeap, IoT Agent)

**Skills cần có:**
- Java 21+, Spring Boot 3.x
- Spring WebFlux, Spring Data JPA
- PostgreSQL, RESTful API design
- NGSI-LD standard knowledge

### 2. Frontend Development (React)

**Khu vực:** `frontend/`

- UI/UX improvements
- Real-time data visualization với SSE
- Dashboard components (weather, air quality)
- Map integration (Leaflet, Mapbox)
- Responsive design
- Accessibility (a11y) improvements
- State management optimization
- Component testing

**Skills cần có:**
- React 18+, TypeScript
- Tailwind CSS, Chart libraries
- SSE/WebSocket handling
- Modern frontend tooling (Vite, ESLint)

### 3. ETL Pipeline & Data Processing

**Khu vực:** `etl/`, `scripts/`

- NGSI-LD entity converters
- Data validation & transformation
- CSV/JSON data parsers
- Sensor data normalization
- Historical data import scripts
- Data quality checks
- Performance optimization

**Skills cần có:**
- Python 3.x, Pandas
- JSON-LD, NGSI-LD context mapping
- Data processing pipelines
- API integration

### 4. FIWARE & Infrastructure

**Khu vực:** `docker-compose/`, `config/`

- Orion-LD configuration optimization
- IoT Agent setup & device provisioning
- QuantumLeap time-series configuration
- Docker networking & volumes
- Environment variables management
- Security hardening
- Monitoring setup (Prometheus, Grafana)

**Skills cần có:**
- Docker, Docker Compose
- FIWARE architecture
- Linux system administration
- DevOps practices

### 5. Documentation

**Khu vực:** `docs/`, `README.md`, API docs

- API documentation (OpenAPI/Swagger)
- Architecture diagrams
- Deployment guides
- Tutorial & examples
- Troubleshooting guides
- Translations (English/Vietnamese)
- Video tutorials

**Skills cần có:**
- Technical writing
- Markdown, Mermaid diagrams
- Documentation tools

### 6. Security & Performance

- Security audit & fixes
- SQL injection prevention
- XSS/CSRF protection
- Rate limiting implementation
- Caching strategies
- Database query optimization
- API response time improvements
- Memory leak detection

**Skills cần có:**
- Security best practices
- Performance profiling tools
- Code analysis tools

---

## 🔍 Quy tắc viết code & cấu trúc dự án

### 1. Coding Style

#### Java (Backend)
- Follow **Google Java Style Guide**
- Use meaningful variable/method names
- Add JavaDoc for public APIs
- Maximum line length: 120 characters
- Use Spring Boot best practices

```java
/**
 * Processes NGSI-LD notifications from Orion-LD.
 *
 * @param notification The incoming NGSI-LD notification
 * @return Processing status
 */
@PostMapping("/api/notify/ngsi")
public ResponseEntity<String> handleNotification(@RequestBody NgsiNotification notification) {
    // Implementation
}
```

#### JavaScript/TypeScript (Frontend)
- Follow **Airbnb JavaScript Style Guide**
- Use TypeScript for type safety
- ESLint + Prettier for formatting
- Functional components with hooks

```typescript
interface AirQualityData {
  pm25: number;
  aqi: number;
  timestamp: string;
}

export const AirQualityCard: React.FC<{ data: AirQualityData }> = ({ data }) => {
  // Implementation
};
```

#### Python (ETL)
- Follow **PEP 8**
- Use type hints (Python 3.10+)
- Docstrings for all functions
- Black formatter

```python
def convert_to_ngsi_ld(sensor_data: dict) -> dict:
    """
    Converts raw sensor data to NGSI-LD format.
    
    Args:
        sensor_data: Raw sensor reading dictionary
        
    Returns:
        NGSI-LD formatted entity
    """
    # Implementation
```

#### JSON-LD & NGSI-LD
- Format theo chuẩn NGSI-LD context
- Validate với `@context`
- Use consistent entity types

```json
{
  "id": "urn:ngsi-ld:AirQualityObserved:HoanKiem:001",
  "type": "AirQualityObserved",
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://smartdatamodels.org/context.jsonld"
  ]
}
```

#### Docker & YAML
- Docker files: chuẩn hóa version & variables
- YAML: indent 2 spaces
- Use multi-stage builds
- Pin versions explicitly

```yaml
services:
  backend:
    image: smart-air-backend:${VERSION:-latest}
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    depends_on:
      - orion
      - postgres
```

### 2. File Organization

**Không push các file sau:**
- `.DS_Store` (macOS)
- `.idea/`, `.vscode/` (IDE configs)
- `__pycache__/`, `*.pyc` (Python)
- `node_modules/` (Node.js)
- `target/` (Maven)
- `*.log` (Log files)
- `.env` (Credentials)

**Đảm bảo có `.gitignore` phù hợp!**

### 3. Commit Message chuẩn

Sử dụng **Conventional Commits**:

| Type | Ý nghĩa | Ví dụ |
|------|---------|-------|
| `feat:` | Tính năng mới | `feat(api): add air quality alerts endpoint` |
| `fix:` | Sửa lỗi | `fix(sse): resolve connection timeout issue` |
| `docs:` | Tài liệu | `docs: update deployment guide` |
| `style:` | Format code, không đổi logic | `style: format with prettier` |
| `refactor:` | Cải tổ lại code | `refactor(backend): simplify notification service` |
| `perf:` | Tối ưu hiệu năng | `perf(etl): optimize data transformation` |
| `test:` | Thêm/sửa test | `test: add unit tests for transformer` |
| `chore:` | Công việc phụ trợ | `chore: update dependencies` |
| `ci:` | CI/CD changes | `ci: add GitHub Actions workflow` |

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Ví dụ commit tốt:**
```
feat(etl): add NGSI-LD converter for PM2.5 sensor

- Implement data transformation logic
- Add validation for sensor readings
- Support batch processing

Closes #123
```

**Ví dụ commit không tốt:**
```
update code
fix bug
changes
```

---

## 🧪 Kiểm tra trước khi gửi PR

### Backend Checklist
- [ ] Code compile không lỗi (`mvn clean compile`)
- [ ] All tests pass (`mvn test`)
- [ ] No unused imports
- [ ] JavaDoc đầy đủ cho public methods
- [ ] Application starts successfully
- [ ] REST endpoints hoạt động đúng
- [ ] Database migrations chạy thành công
- [ ] No security vulnerabilities (`mvn dependency-check:check`)

### Frontend Checklist
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] No console errors/warnings
- [ ] Responsive design works on mobile
- [ ] Accessibility checks pass

### ETL Checklist
- [ ] Python code follows PEP 8
- [ ] Type hints present
- [ ] JSON-LD valid (`jsonld playground`)
- [ ] Data transformation correct
- [ ] Entity successfully created in Orion-LD
- [ ] Error handling implemented

### General Checklist
- [ ] Docker Compose chạy ổn (`docker-compose up`)
- [ ] No file rác trong commit
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (for features)
- [ ] Environment variables documented
- [ ] No hardcoded secrets

---

## 📤 Gửi Pull Request (PR)

### 1. Update branch với upstream

```bash
git fetch upstream
git rebase upstream/develop
```

### 2. Push branch lên repo cá nhân

```bash
git push origin feature/add-etl-converter
```

### 3. Mở PR

Truy cập: https://github.com/trungthanhcva2206/smart-air-ngsi-ld/pulls

### 4. PR Template

```markdown
## Description
Mô tả ngắn gọn về thay đổi

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Integration tests pass

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
Refs #456

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### 5. PR Review Process

1. **Automated Checks:** CI/CD pipeline chạy tests
2. **Code Review:** Ít nhất 1 maintainer review
3. **Discussion:** Resolve comments và feedback
4. **Approval:** PR được approve
5. **Merge:** Maintainer merge vào `develop`

**Lưu ý:**
- PR nên nhỏ và focused (< 500 lines thay đổi)
- 1 PR = 1 feature/fix
- Response feedback trong 48h
- Squash commits trước khi merge

---

## 🗂 Quy tắc mở Issue

### Báo lỗi (Bug Report)

**Template:**
```markdown
## Bug Description
Mô tả rõ ràng và ngắn gọn về lỗi

## Environment
- OS: [e.g. Windows 11, Ubuntu 22.04]
- Java Version: [e.g. 21.0.1]
- Spring Boot Version: [e.g. 3.2.0]
- Docker Version: [e.g. 24.0.6]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Execute '...'
4. See error

## Expected Behavior
Mô tả hành vi mong đợi

## Actual Behavior
Mô tả hành vi thực tế

## Logs/Screenshots
```
[paste logs here]
```

## Possible Fix
(Optional) Gợi ý cách fix
```

### Đề xuất tính năng (Feature Request)

**Template:**
```markdown
## Feature Description
Mô tả tính năng muốn thêm

## Motivation
Tại sao cần tính năng này? Giải quyết vấn đề gì?

## Proposed Solution
Đề xuất cách implement

## Alternatives Considered
Các giải pháp thay thế đã xem xét

## Additional Context
- Ảnh hưởng tới kiến trúc / entity
- Breaking changes
- Dependencies mới
- Mockup/wireframes (nếu có)

## Implementation Checklist
- [ ] Backend changes
- [ ] Frontend changes
- [ ] ETL updates
- [ ] Documentation
- [ ] Tests
```

### Câu hỏi/Thảo luận (Question/Discussion)

**Template:**
```markdown
## Question
Câu hỏi của bạn

## Context
Ngữ cảnh và thông tin liên quan

## What I've Tried
Những gì đã thử

## Additional Information
Thông tin bổ sung
```

---

## 🛠 Development Setup

### Backend Setup

```bash
cd backend

# Install dependencies
mvn clean install

# Copy environment config
cp src/main/resources/application.example.properties \
   src/main/resources/application.properties

# Edit configuration
nano src/main/resources/application.properties

# Run tests
mvn test

# Run application
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Edit configuration
nano .env

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean volumes
docker-compose down -v
```

---


## 👀 Code Review Process

### For Contributors

- **Be responsive:** Reply to review comments trong 48h
- **Be open:** Chấp nhận feedback và học hỏi
- **Explain:** Giải thích decisions nếu cần
- **Update:** Fix issues và push changes

### For Reviewers

- **Be constructive:** Gợi ý cải thiện, không chỉ chỉ trích
- **Be specific:** Point out exact lines/issues
- **Be timely:** Review trong 48-72h
- **Approve clearly:** Rõ ràng về approve/request changes

### Review Checklist

- [ ] Code đúng với requirements
- [ ] Tests adequate và pass
- [ ] No security issues
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Follows style guide
- [ ] No unnecessary changes
- [ ] Commit messages clear

---

## 📞 Communication Channels

- **GitHub Issues:** Bug reports, feature requests
- **GitHub Discussions:** Q&A, ideas, general discussion
- **Pull Requests:** Code reviews, technical discussions
- **Email:** Contact maintainers directly (xem README)

---

## 🎖 Recognition

Contributors sẽ được:
- ✨ Tên trong CONTRIBUTORS.md
- 🏆 GitHub contributor badge
- 📢 Mention trong release notes
- 💌 Cảm ơn từ maintainers

---

## 📚 Resources

### Learning Materials
- [NGSI-LD Primer](https://fiware-datamodels.readthedocs.io/)
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/)
- [React Documentation](https://react.dev/)
- [FIWARE Academy](https://fiware-academy.readthedocs.io/)

### Tools
- [JSON-LD Playground](https://json-ld.org/playground/)
- [Postman Collections](./docs/postman/)
- [Docker Hub Images](https://hub.docker.com/u/fiware)

---

## ❤️ Cảm ơn

Mọi đóng góp — dù nhỏ — đều rất quý giá và giúp dự án phát triển bền vững.

**Happy Contributing! 🎉**

---

*Last updated: December 2025*
