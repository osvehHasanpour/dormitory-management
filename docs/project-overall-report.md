# Integrated Dormitory Management System  
## Overall Project Report (English)

## 1. Executive Summary

The repository contains a full-stack dormitory management platform with:

- **Backend:** Django + Django REST Framework + GraphQL (Graphene)
- **Frontend:** React + TypeScript + Vite
- **Database:** PostgreSQL
- **Containerization:** Docker + Docker Compose
- **CI:** GitHub Actions

The system supports student and supervisor workflows for maintenance requests, cleaning, room supplies, classes, ideas/complaints, announcements, and notifications. The codebase is modular, test-backed, and includes API documentation via Swagger/OpenAPI.

---

## 2. Product Scope and Core Capabilities

### Main user-facing domains

1. **Authentication and profile management**
2. **Dormitory block/floor data access**
3. **Requests management** (maintenance, cleaning, item, booth)
4. **Classes and enrollment/rating flows**
5. **Ideas, voting, complaints, and supervisor feedback**
6. **Announcements and notifications**

### Roles observed in the project

- **Student**
- **Supervisor**
- **Admin**

Role handling is strongly represented in backend permissions and business logic.

---

## 3. Architecture Overview

## 3.1 Backend architecture

- Project root: `backend/`
- Framework: Django
- API style:
  - REST endpoints under `/api/v1/...`
  - GraphQL endpoint at `/graphql/`
- Modular apps:
  - `users`
  - `dorms`
  - `requests_app`
  - `classes`
  - `ideas`
  - `announcements`
  - `core`
  - `dormitory` (GraphQL schema package)

### API documentation

- OpenAPI schema: `/api/schema/`
- Swagger UI: `/api/docs/`
- Implemented with **drf-spectacular** and endpoint annotations (`extend_schema`).

## 3.2 Frontend architecture

- Project root: `frontend/`
- Stack: React + TypeScript + Vite
- Structure:
  - `src/pages` for page-level routes
  - `src/components` for reusable UI/features
  - `src/hooks` for business/UI state logic
  - `src/services` for API integration
  - `src/context` for auth and theme contexts

The frontend uses context-driven state and hook-centric logic for user flows.

---

## 4. API and Data Layer

## 4.1 REST API characteristics

- Versioned routes (`/api/v1/...`)
- Consistent success/error response envelope in many modules
- Validation at serializer and service layers
- Pagination enabled globally (DRF `PageNumberPagination`) and customized in feature views
- Filtering/sorting implemented in selectors for key modules

## 4.2 GraphQL implementation

- GraphQL schema and resolvers located in:
  - `backend/dormitory/schema/schema.py`
  - `backend/dormitory/schema/queries.py`
  - `backend/dormitory/schema/mutations.py`
  - `backend/dormitory/schema/types.py`
- JWT-aware GraphQL view:
  - `backend/dormitory/graphql_views.py`

GraphQL currently covers supervisor request queries and status mutation scenarios with authorization checks.

## 4.3 Database

- PostgreSQL 16 via Docker Compose service (`db`)
- Django migrations across all domain apps
- Persisted volumes for DB and media/static artifacts

---

## 5. Security, Auth, and RBAC

### Authentication

- JWT (SimpleJWT): login, refresh, blacklist/logout
- Auth endpoints under `api/v1/auth/`

### Authorization

- Backend RBAC helpers and permission classes:
  - `backend/core/api/permissions.py`
  - app-level permission modules in `requests_app`, `classes`, `ideas`, `announcements`

### Observed note

A frontend access test documents a mismatch where an authenticated student can render a supervisor dashboard page directly at UI layer; backend RBAC remains the authoritative guard.

---

## 6. Testing and Quality Status

## 6.1 Backend tests

Backend tests are broad and include:

- Auth
- Notifications
- Dorm block/floor APIs
- Request workflows + status transitions
- GraphQL flows
- Classes workflows
- Announcements workflows
- Ideas/voting/supervisor feedback workflows

Test locations: `backend/*/tests/` and some app-level `tests.py`.

## 6.2 Frontend tests

Frontend tests cover:

- Login/logout flows
- Form submission and validation scenarios
- Hooks for requests/classes/ideas/supervisor actions
- Announcement and idea interactions
- Dialog and navigation behavior

Test location: `frontend/src/__tests__/`.

## 6.3 Test documentation

Project includes test scenario documentation under `docs/`, including backend and frontend scenario reports.

---

## 7. DevOps, Containers, and CI/CD

## 7.1 Containerization

- Backend Dockerfile: `backend/Dockerfile`
- Frontend Dockerfile: `frontend/Dockerfile`
- Compose orchestration: `docker-compose.yml`

Services include `db`, `pgadmin`, `backend`, and `frontend`.

## 7.2 Persistence

Compose volumes:

- `postgres_data`
- `static_files`
- `media_files`

## 7.3 CI status

GitHub Actions workflows:

- `.github/workflows/ci.yml`  
  Runs backend tests and frontend test/format checks.
- `.github/workflows/prettier.yaml`

## 7.4 CD status

No automated deployment pipeline (CD) is currently visible in the repository workflows.

---

## 8. Frontend UX State Coverage (Implementation Level)

The frontend implementation includes:

- **Loading states:** `isLoading` patterns + multiple skeleton components
- **Error states:** toast/alert messaging and retry actions in several pages
- **Responsive layout:** extensive Tailwind breakpoints (`sm`, `md`, `lg`) across major pages/components

---

## 9. Strengths

1. Clear modular backend architecture by domain
2. Combined REST + GraphQL support
3. Strong API documentation coverage (Swagger annotations)
4. Good automated test coverage in both backend and frontend
5. Real Dockerized local environment with persistent data volumes
6. Working CI pipeline with backend/frontend checks

---

## 10. Improvement Opportunities

1. Add **automated CD** workflow for staging/production deployments
2. Align **frontend route-level RBAC** behavior with backend authorization expectations
3. Expand production deployment documentation/playbooks (ops runbooks, environment hardening)
4. Optionally add stricter non-functional checks in CI (security scan, SAST, dependency audit gates)

---

## 11. Conclusion

This is a solid, actively developed full-stack system with good structural quality and meaningful test coverage. The project is already suitable for structured team development and CI-based collaboration. The primary next maturity step is operational: introducing deployment automation (CD) and tightening end-to-end role-based access behavior at the UI layer.

