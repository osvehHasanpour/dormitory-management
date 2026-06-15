# 🏠 Dormitory Management System

A full-stack SOA-based dormitory management platform built with **Django REST Framework**, **React (TypeScript)**, and **PostgreSQL** — fully containerized with Docker.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
│                                                         │
│  ┌──────────────┐    REST/GraphQL   ┌────────────────┐  │
│  │   Frontend   │ ◄───────────────► │    Backend     │  │
│  │  React + TS  │                   │ Django DRF     │  │
│  │  Port: 3000  │                   │  Port: 8000    │  │
│  └──────────────┘                   └───────┬────────┘  │
│                                             │           │
│                                    ┌────────▼────────┐  │
│                                    │   PostgreSQL    │  │
│                                    │  Port: 5432     │  │
│                                    └────────┬────────┘  │
│                                             │           │
│                                    ┌────────▼────────┐  │
│                                    │    pgAdmin      │  │
│                                    │  Port: 5050     │  │
│                                    └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Architecture Pattern:** Service-Oriented Architecture (SOA)
**API Protocols:** RESTful API + GraphQL
**API Docs:** Swagger (drf-yasg) at `/swagger/`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js + TypeScript |
| **State Management** | Redux Toolkit |
| **UI Framework** | Tailwind CSS |
| **Frontend Testing** | Jest + React Testing Library |
| **Backend** | Python + Django REST Framework |
| **API** | RESTful + GraphQL |
| **API Docs** | Swagger (drf-yasg) |
| **Database** | PostgreSQL 16 |
| **DB GUI** | pgAdmin 4 |
| **Containerization** | Docker + Docker Compose |
| **Version Control** | Git + GitHub |
| **Design** | Figma |
| **Project Mgmt** | Jira |

---

## 📁 Project Structure

```
dormitory-management/
├── backend/                    # Django project
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   └── <your_django_apps>/
├── frontend/                   # React + TypeScript
│   ├── Dockerfile
│   ├── nginx.conf              # For production builds
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── store/              # Redux
│       ├── services/           # API calls
│       └── App.tsx
├── docker-compose.yml          # Full stack orchestration
├── .env.example                # Environment variable template
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/) installed

### 1. Clone the repository

```bash
git clone https://github.com/osvehHasanpour/dormitory-management.git
cd dormitory-management
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your values if needed (defaults work for local dev)
```

### 3. Add the Dockerfiles

Copy the files from this README or from the repo:

**`backend/Dockerfile`** — see [Backend Dockerfile](#backend-dockerfile) section below

**`frontend/Dockerfile`** — see [Frontend Dockerfile](#frontend-dockerfile) section below

**`frontend/nginx.conf`** — needed for production builds

### 4. Update Django settings for PostgreSQL

In `backend/settings.py`, replace the `DATABASES` section:

```python
import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'dormitory_db'),
        'USER': os.environ.get('POSTGRES_USER', 'dormitory_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'dormitory_pass'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}
```

### 5. Add required Python packages

Make sure `backend/requirements.txt` includes:

```
django>=4.2
djangorestframework
django-cors-headers
psycopg2-binary
drf-yasg
graphene-django
djangorestframework-simplejwt
python-decouple
```

### 6. Start all services

```bash
docker-compose up -d --build
```

This starts:
- 🐘 PostgreSQL on `localhost:5432`
- 🐍 Django backend on `http://localhost:8000`
- ⚛️ React frontend on `http://localhost:3000`
- 🗄️ pgAdmin on `http://localhost:5050`

### 7. Run migrations (first time only)

```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

---

## 🌐 Service URLs

| Service | URL | Credentials |
|---|---|---|
| Frontend | http://localhost:3000 | — |
| Backend API | http://localhost:8000/api/ | — |
| Swagger Docs | http://localhost:8000/swagger/ | — |
| GraphQL | http://localhost:8000/graphql/ | — |
| Django Admin | http://localhost:8000/admin/ | superuser credentials |
| pgAdmin | http://localhost:5050 | admin@dormitory.com / admin123 |

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Start with rebuild (after code changes to Dockerfiles)
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Run Django management commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py shell

# Access database shell
docker-compose exec db psql -U dormitory_user -d dormitory_db

# Rebuild a single service
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

---

## 🔧 Backend Dockerfile

Save this as `backend/Dockerfile`:

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .
RUN mkdir -p /app/staticfiles /app/media
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

---

## ⚛️ Frontend Dockerfile

Save this as `frontend/Dockerfile`:

```dockerfile
# Development stage
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# Production build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production serve with Nginx
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🖥️ Frontend Setup Notes

If your frontend uses **Vite** (recommended with React + TypeScript), make sure `frontend/package.json` has:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

And `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': 'http://backend:8000',
      '/graphql': 'http://backend:8000',
    }
  }
})
```

---

## 🗄️ pgAdmin Setup

1. Open http://localhost:5050
2. Login: `admin@dormitory.com` / `admin123`
3. Add New Server:
   - **Name:** Dormitory DB
   - **Host:** `db`
   - **Port:** `5432`
   - **Username:** `dormitory_user`
   - **Password:** `dormitory_pass`

---

## 🧪 Testing

```bash
# Backend tests
docker-compose exec backend python manage.py test

# Frontend tests
docker-compose exec frontend npm test

# Frontend tests with coverage
docker-compose exec frontend npm run test:coverage
```

---

## 📦 How to Push to GitHub

```bash
# Stage all files including new Dockerfiles
git add .

# Commit
git commit -m "feat: add full Docker setup with frontend, backend, PostgreSQL"

# Push
git push origin main
```

---

## 🚀 Production Deployment

For production, switch the frontend target in `docker-compose.yml`:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    target: production   # ← add this line
```

And set these in your `.env`:

```
DEBUG=False
SECRET_KEY=<strong-random-key>
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

---

## 👥 Contributors

- [@osvehHasanpour](https://github.com/osvehHasanpour)

---

## 📄 License

This project is for educational/internal use.
