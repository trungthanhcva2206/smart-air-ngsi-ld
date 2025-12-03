# Contribution Guidelines - Smart Air NGSI-LD

Thank you for your interest and desire to contribute to the **Smart Air NGSI-LD** project\!

This project always welcomes contributions from the community, including bug fixes, new features, documentation improvements, ETL optimization, ontology expansion, or NGSI-LD model improvements.

-----

## 📋 Table of Contents

- [How to Contribute](#-how-to-contribute)
- [Contribution Types](#-contribution-types)
- [Code Style & Project Structure](#-code-style--project-structure)
- [Pre-PR Checklist](#-pre-pr-checklist)
- [Submitting a Pull Request (PR)](#-submitting-a-pull-request-pr)
- [Issue Guidelines](#-issue-guidelines)
- [Development Setup](#-development-setup)
- [Code Review Process](#-code-review-process)

-----

## 🚀 How to Contribute

### 1\. Fork the repository

Click **Fork** in the top right corner to create a copy of the project in your account.

### 2\. Clone to your local machine

```bash
git clone https://github.com/<your-username>/smart-air-ngsi-ld.git
cd smart-air-ngsi-ld
```

### 3\. Add upstream remote

```bash
git remote add upstream https://github.com/trungthanhcva2206/smart-air-ngsi-ld.git
git fetch upstream
```

### 4\. Create a new branch for each change

Branch names should be clear and follow this standard:

| Type | Format | Example |
|-------|--------|-------|
| New Feature | `feature/<feature-name>` | `feature/add-sensor-model` |
| Bug Fix | `fix/<bug-description>` | `fix/context-mapping-observation` |
| Performance | `perf/<description>` | `perf/optimize-etl-pipeline` |
| Documentation | `docs/<description>` | `docs/update-readme` |
| Refactor | `refactor/<description>` | `refactor/restructure-backend` |
| Test | `test/<description>` | `test/add-unit-tests` |

**Example:**

```bash
git checkout -b feature/add-etl-converter
```

-----

## 🎯 Contribution Types

### 1\. Backend Development (Spring Boot)

**Area:** `backend/`

  - Add new REST API endpoints
  - Improve NGSI-LD notification handling
  - Optimize SSE streaming performance
  - Add notification channels (Email, Telegram, Blynk)
  - Improve JWT authentication & authorization
  - Database schema migrations
  - Integration with FIWARE components (Orion-LD, QuantumLeap, IoT Agent)

**Required Skills:**

  - Java 21+, Spring Boot 3.x
  - Spring WebFlux, Spring Data JPA
  - PostgreSQL, RESTful API design
  - NGSI-LD standard knowledge

### 2\. Frontend Development (React)

**Area:** `frontend/`

  - UI/UX improvements
  - Real-time data visualization with SSE
  - Dashboard components (weather, air quality)
  - Map integration (Leaflet, Mapbox)
  - Responsive design
  - Accessibility (a11y) improvements
  - State management optimization
  - Component testing

**Required Skills:**

  - React 18+, TypeScript
  - Tailwind CSS, Chart libraries
  - SSE/WebSocket handling
  - Modern frontend tooling (Vite, ESLint)

### 3\. ETL Pipeline & Data Processing

**Area:** `etl/`, `scripts/`

  - NGSI-LD entity converters
  - Data validation & transformation
  - CSV/JSON data parsers
  - Sensor data normalization
  - Historical data import scripts
  - Data quality checks
  - Performance optimization

**Required Skills:**

  - Python 3.x, Pandas
  - JSON-LD, NGSI-LD context mapping
  - Data processing pipelines
  - API integration

### 4\. FIWARE & Infrastructure

**Area:** `docker-compose/`, `config/`

  - Orion-LD configuration optimization
  - IoT Agent setup & device provisioning
  - QuantumLeap time-series configuration
  - Docker networking & volumes
  - Environment variables management
  - Security hardening
  - Monitoring setup (Prometheus, Grafana)

**Required Skills:**

  - Docker, Docker Compose
  - FIWARE architecture
  - Linux system administration
  - DevOps practices

### 5\. Documentation

**Area:** `docs/`, `README.md`, API docs

  - API documentation (OpenAPI/Swagger)
  - Architecture diagrams
  - Deployment guides
  - Tutorials & examples
  - Troubleshooting guides
  - Translations (English/Vietnamese)
  - Video tutorials

**Required Skills:**

  - Technical writing
  - Markdown, Mermaid diagrams
  - Documentation tools

### 6\. Security & Performance

  - Security audit & fixes
  - SQL injection prevention
  - XSS/CSRF protection
  - Rate limiting implementation
  - Caching strategies
  - Database query optimization
  - API response time improvements
  - Memory leak detection

**Required Skills:**

  - Security best practices
  - Performance profiling tools
  - Code analysis tools

-----

## 🔍 Code Style & Project Structure

### 1\. Coding Style

#### Java (Backend)

  - Follow **Google Java Style Guide**
  - Use meaningful variable/method names
  - Add JavaDoc for public APIs
  - Maximum line length: 120 characters
  - Use Spring Boot best practices

<!-- end list -->

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

<!-- end list -->

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

<!-- end list -->

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

  - Format according to NGSI-LD context standards
  - Validate with `@context`
  - Use consistent entity types

<!-- end list -->

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

  - Docker files: Standardize versions & variables
  - YAML: Indent with 2 spaces
  - Use multi-stage builds
  - Pin versions explicitly

<!-- end list -->

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

### 2\. File Organization

**Do not push the following files:**

  - `.DS_Store` (macOS)
  - `.idea/`, `.vscode/` (IDE configs)
  - `__pycache__/`, `*.pyc` (Python)
  - `node_modules/` (Node.js)
  - `target/` (Maven)
  - `*.log` (Log files)
  - `.env` (Credentials)

**Ensure a suitable `.gitignore` exists\!**

### 3\. Standard Commit Messages

Use **Conventional Commits**:

| Type | Meaning | Example |
|------|---------|-------|
| `feat:` | New feature | `feat(api): add air quality alerts endpoint` |
| `fix:` | Bug fix | `fix(sse): resolve connection timeout issue` |
| `docs:` | Documentation | `docs: update deployment guide` |
| `style:` | Formatting (no logic change) | `style: format with prettier` |
| `refactor:` | Code restructuring | `refactor(backend): simplify notification service` |
| `perf:` | Performance improvement | `perf(etl): optimize data transformation` |
| `test:` | Add/edit tests | `test: add unit tests for transformer` |
| `chore:` | Maintenance tasks | `chore: update dependencies` |
| `ci:` | CI/CD changes | `ci: add GitHub Actions workflow` |

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example of a good commit:**

```
feat(etl): add NGSI-LD converter for PM2.5 sensor

- Implement data transformation logic
- Add validation for sensor readings
- Support batch processing

Closes #123
```

**Example of a bad commit:**

```
update code
fix bug
changes
```

-----

## 🧪 Pre-PR Checklist

### Backend Checklist

  - [ ] Code compiles without errors (`mvn clean compile`)
  - [ ] All tests pass (`mvn test`)
  - [ ] No unused imports
  - [ ] Complete JavaDoc for public methods
  - [ ] Application starts successfully
  - [ ] REST endpoints function correctly
  - [ ] Database migrations run successfully
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
  - [ ] JSON-LD is valid (`jsonld playground`)
  - [ ] Data transformation is correct
  - [ ] Entity successfully created in Orion-LD
  - [ ] Error handling implemented

### General Checklist

  - [ ] Docker Compose runs smoothly (`docker-compose up`)
  - [ ] No garbage files in the commit
  - [ ] Documentation updated
  - [ ] CHANGELOG.md updated (for features)
  - [ ] Environment variables documented
  - [ ] No hardcoded secrets

-----

## 📤 Submitting a Pull Request (PR)

### 1\. Update branch with upstream

```bash
git fetch upstream
git rebase upstream/develop
```

### 2\. Push branch to your personal repo

```bash
git push origin feature/add-etl-converter
```

### 3\. Open PR

Visit: [https://github.com/trungthanhcva2206/smart-air-ngsi-ld/pulls](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/pulls)

### 4\. PR Template

```markdown
## Description
Brief description of the changes

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

### 5\. PR Review Process

1.  **Automated Checks:** CI/CD pipeline runs tests
2.  **Code Review:** At least 1 maintainer reviews the code
3.  **Discussion:** Resolve comments and feedback
4.  **Approval:** PR is approved
5.  **Merge:** Maintainer merges into `develop`

**Notes:**

  - PRs should be small and focused (\< 500 lines changed)
  - 1 PR = 1 feature/fix
  - Respond to feedback within 48h
  - Squash commits before merging

-----

## 🗂 Issue Guidelines

### Bug Report

**Template:**

```markdown
## Bug Description
Clear and concise description of the bug

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
Description of expected behavior

## Actual Behavior
Description of actual behavior

## Logs/Screenshots
```

[paste logs here]

```

## Possible Fix
(Optional) Suggested fix
```

### Feature Request

**Template:**

```markdown
## Feature Description
Description of the feature you want to add

## Motivation
Why is this feature needed? What problem does it solve?

## Proposed Solution
Proposed implementation approach

## Alternatives Considered
Alternative solutions considered

## Additional Context
- Impact on architecture / entity
- Breaking changes
- New dependencies
- Mockup/wireframes (if any)

## Implementation Checklist
- [ ] Backend changes
- [ ] Frontend changes
- [ ] ETL updates
- [ ] Documentation
- [ ] Tests
```

### Question/Discussion

**Template:**

```markdown
## Question
Your question

## Context
Context and relevant information

## What I've Tried
What steps you have already taken

## Additional Information
Supplementary information
```

-----

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

-----

## 👀 Code Review Process

### For Contributors

  - **Be responsive:** Reply to review comments within 48h
  - **Be open:** Accept feedback and learn
  - **Explain:** Explain decisions if necessary
  - **Update:** Fix issues and push changes

### For Reviewers

  - **Be constructive:** Suggest improvements, don't just criticize
  - **Be specific:** Point out exact lines/issues
  - **Be timely:** Review within 48-72h
  - **Approve clearly:** Be clear about approval/request changes

### Review Checklist

  - [ ] Code meets requirements
  - [ ] Tests are adequate and pass
  - [ ] No security issues
  - [ ] Performance is acceptable
  - [ ] Documentation updated
  - [ ] Follows style guide
  - [ ] No unnecessary changes
  - [ ] Commit messages are clear

-----

## 📞 Communication Channels

  - **GitHub Issues:** Bug reports, feature requests
  - **GitHub Discussions:** Q\&A, ideas, general discussion
  - **Pull Requests:** Code reviews, technical discussions
  - **Email:** Contact maintainers directly (see README)

-----

## 🎖 Recognition

Contributors will receive:

  - ✨ Name in CONTRIBUTORS.md
  - 🏆 GitHub contributor badge
  - 📢 Mention in release notes
  - 💌 Appreciation from maintainers

-----

## 📚 Resources

### Learning Materials

  - [NGSI-LD Primer](https://fiware-datamodels.readthedocs.io/)
  - [Spring Boot Documentation](https://docs.spring.io/spring-boot/)
  - [React Documentation](https://react.dev/)
  - [FIWARE Academy](https://fiware-academy.readthedocs.io/)

### Tools

  - [JSON-LD Playground](https://json-ld.org/playground/)
  - [Postman Collections](https://www.google.com/search?q=./docs/postman/)
  - [Docker Hub Images](https://hub.docker.com/u/fiware)

-----

## ❤️ Thank You

Every contribution — no matter how small — is very valuable and helps the project grow sustainably.

**Happy Contributing\! 🎉**

-----

*Last updated: December 2025*
