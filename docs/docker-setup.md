# Docker & Deployment Setup

This document describes how the Dormitory Management System is containerized, configured, and run locally or in production.

---

## docker-compose.yml Overview

The stack defines **four services** on a single bridge network (`dormitory_network`) with three named volumes.

```mermaid
flowchart LR
    subgraph volumes [Named Volumes]
        PG_DATA[postgres_data]
        STATIC[static_files]
        MEDIA[media_files]
    end

    db[db<br/>postgres:16-alpine<br/>5432]
    pgadmin[pgadmin<br/>dpage/pgadmin4<br/>5050→80]
    backend[backend<br/>Django<br/>8000]
    frontend[frontend<br/>Nginx prod<br/>3000→80]

    db --- PG_DATA
    backend --- STATIC
    backend --- MEDIA
    backend --> db
    pgadmin --> db
    frontend --> backend
```

---

## Services

### `db` — PostgreSQL

| Setting | Value |
|---------|-------|
| Image | `postgres:16-alpine` |
| Container | `dormitory_db` |
| Port | `5432:5432` |
| Healthcheck | `pg_isready` every 10s |

**Environment variables:**

| Variable | Default |
|----------|---------|
| `POSTGRES_DB` | `dormitory_db` |
| `POSTGRES_USER` | `dormitory_user` |
| `POSTGRES_PASSWORD` | `dormitory_pass` |

**Volume:** `postgres_data` → `/var/lib/postgresql/data`

---

### `pgadmin` — Database GUI

| Setting | Value |
|---------|-------|
| Image | `dpage/pgadmin4:latest` |
| Container | `dormitory_pgadmin` |
| Port | `5050:80` |
| Depends on | `db` (healthy) |

**Environment variables:**

| Variable | Default |
|----------|---------|
| `PGADMIN_DEFAULT_EMAIL` | `admin@dormitory.com` |
| `PGADMIN_DEFAULT_PASSWORD` | `admin123` |

**Connect to DB from pgAdmin:**

- Host: `db` (inside Docker network) or `host.docker.internal` / `localhost` from host
- Port: `5432`
- Username / Password: same as `POSTGRES_*` above

---

### `backend` — Django

| Setting | Value |
|---------|-------|
| Build context | `./backend` |
| Dockerfile | `backend/Dockerfile` |
| Container | `dormitory_backend` |
| Port | `8000:8000` |
| Depends on | `db` (healthy) |

**Startup command:**

```bash
python manage.py migrate --noinput &&
python manage.py collectstatic --noinput &&
python manage.py runserver 0.0.0.0:8000
```

**Environment variables:**

| Variable | Purpose | Default |
|----------|---------|---------|
| `DEBUG` | Django debug mode | `True` |
| `SECRET_KEY` | Signing key for JWT/sessions | dev placeholder |
| `DATABASE_URL` | Full PostgreSQL connection string | Built from `POSTGRES_*` pointing at `db:5432` |
| `POSTGRES_HOST` | DB host | `db` |
| `POSTGRES_PORT` | DB port | `5432` |
| `POSTGRES_DB` | Database name | `dormitory_db` |
| `POSTGRES_USER` | DB user | `dormitory_user` |
| `POSTGRES_PASSWORD` | DB password | `dormitory_pass` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1,backend` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `http://localhost:3000,http://frontend:3000` |

**Volumes:**

| Mount | Purpose |
|-------|---------|
| `./backend:/app` | Live code reload in development |
| `static_files:/app/staticfiles` | Collected static assets |
| `media_files:/app/media` | Uploaded images (maintenance photos) |

---

### `frontend` — React

| Setting | Value |
|---------|-------|
| Build context | `./frontend` |
| Dockerfile | `frontend/Dockerfile` (defaults to **production** Nginx stage) |
| Container | `dormitory_frontend` |
| Port | `3000:80` (host 3000 → container Nginx 80) |
| Depends on | `backend` |

**Environment variables (build-time for Vite):**

| Variable | Default |
|----------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` |
| `VITE_GRAPHQL_URL` | `http://localhost:8000/graphql` |

**Volumes:**

| Mount | Purpose |
|-------|---------|
| `./frontend:/app` | Source bind (only meaningful for **development** stage) |
| `/app/node_modules` | Anonymous volume to preserve container node_modules |

> **Note:** Without `build.target: development`, Docker builds the Nginx production image. The `/app` bind mount does not affect served assets. See [Development vs Production](#development-vs-production) below.

---

## Volumes

| Volume | Used by | Purpose |
|--------|---------|---------|
| `postgres_data` | `db` | Persistent database storage |
| `static_files` | `backend` | Django `collectstatic` output |
| `media_files` | `backend` | User-uploaded media (`MEDIA_ROOT`) |

Removing volumes (`docker compose down -v`) **deletes all database data**.

---

## Network

All services join `dormitory_network` (bridge driver). Internal DNS names match service names (`db`, `backend`, `frontend`, `pgadmin`).

---

## Dockerfile Configurations

### Backend (`backend/Dockerfile`)

Multi-stage build on **Python 3.12-slim**:

1. **Builder stage** — installs `build-essential`, `libpq-dev`, pip packages from `requirements.txt`
2. **Runtime stage** — copies site-packages, application code, creates `/app/staticfiles` and `/app/media`

```dockerfile
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### Frontend (`frontend/Dockerfile`)

Three stages on **Node 20-alpine** + **Nginx alpine**:

| Stage | Purpose | CMD |
|-------|---------|-----|
| `development` | Vite dev server | `npm run dev -- --host 0.0.0.0 --port 3000` |
| `builder` | `npm run build` → `dist/` | — |
| `production` | Nginx serves static SPA | `nginx -g 'daemon off;'` |

**Nginx config** (`frontend/nginx.conf`):

- Serves SPA with `try_files` fallback to `index.html`
- Proxies `/api/` and `/graphql/` to `http://backend:8000`

---

## Environment File

Copy the template and adjust as needed:

```bash
cp env.example .env
```

Key variables are documented in [env.example](../env.example). Docker Compose reads `.env` automatically for variable substitution.

---

## How to Build and Run

### First-time setup

```bash
# Clone and enter project
cd dormitory-management

# Configure environment
cp env.example .env

# Build and start all services
docker compose up -d --build

# Seed sample data (optional but recommended)
docker compose exec backend python manage.py seed_data

# Create admin user (optional)
docker compose exec backend python manage.py createsuperuser
```

Migrations run automatically on backend startup via the compose command.

### Development vs Production

**Hot-reload frontend (recommended for UI work):**

Add to `docker-compose.yml` under `frontend.build`:

```yaml
build:
  context: ./frontend
  dockerfile: Dockerfile
  target: development   # ← use Vite dev server
ports:
  - "3000:3000"         # ← match dev server port
```

**Production frontend:**

```yaml
build:
  target: production
ports:
  - "3000:80"
```

Set in `.env`:

```
DEBUG=False
SECRET_KEY=<strong-random-key>
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

For production, replace `runserver` with Gunicorn/uWSGI in the backend command.

### Common Commands

```bash
# Start / stop
docker compose up -d
docker compose down

# Rebuild one service
docker compose up -d --build backend

# Backend logs
docker compose logs -f backend

# Run tests
docker compose exec backend python manage.py test

# Django shell
docker compose exec backend python manage.py shell

# PostgreSQL shell
docker compose exec db psql -U dormitory_user -d dormitory_db

# Stop and wipe data (destructive)
docker compose down -v
```

### Running without Docker

**Backend:**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
export DATABASE_URL=postgresql://dormitory_user:dormitory_pass@localhost:5432/dormitory_db
python manage.py migrate
python manage.py runserver
```

**Frontend:**

```bash
cd frontend
npm ci
npm run dev
```

Vite proxies `/api` to `http://localhost:8000` (see `frontend/vite.config.ts`).

---

## Service URL Reference

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/v1/ |
| Swagger | http://localhost:8000/api/docs/ |
| GraphQL | http://localhost:8000/graphql/ |
| Django Admin | http://localhost:8000/admin/ |
| pgAdmin | http://localhost:5050 |

---

## Deployment Checklist

- [ ] Set strong `SECRET_KEY` and `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` for production domain
- [ ] Use production frontend target (Nginx) or CDN for static assets
- [ ] Replace Django `runserver` with a production WSGI server
- [ ] Back up `postgres_data` volume regularly
- [ ] Configure HTTPS termination (reverse proxy / load balancer)
