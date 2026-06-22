
Markdown# 🏠 Integrated Dormitory Management System

![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Status](https://img.shields.io/badge/Status-Active%20Development-green)
![Django](https://img.shields.io/badge/Django-5.x-%23092E20)
![React](https://img.shields.io/badge/React-18.x-%2361DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%233178C6)
![Docker](https://img.shields.io/badge/Docker-%230db7ed)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-%23316192)


## ✨ Project Description

A **full-stack SOA-based** web platform that digitizes dormitory management. It connects **students**, **supervisors**, and **admins** with transparent, efficient digital workflows — replacing paper-based processes.

**Key Features** (aligned with SRS):
- Maintenance reports, cleaning & supply requests
- Class/event registration & rating
- Idea submission, voting & complaint handling
- Marketplace booth requests
- Announcements & notifications
- AI content moderation (in progress)

---

## 📐 Architecture Overview

```mermaid
graph TD
    A[Frontend - React + TS<br/>Port: 3000] <-->|REST + GraphQL| B[Backend - Django DRF<br/>Port: 8000]
    B <--> C[PostgreSQL<br/>Port: 5432]
    D[pgAdmin<br/>Port: 5050] <--> C
    style A fill:#61DAFB
    style B fill:#092E20,color:white
    style C fill:#316192,color:white
Architecture Pattern: Service-Oriented Architecture (SOA)
API Protocols: RESTful + GraphQL
API Docs: Swagger (/swagger/) + GraphQL Playground (/graphql/)

🛠️ Tech Stack

















LayerTechnologyFrontendReact 18 + TypeScript + ViteState MgmtRedux ToolkitUITailwind CSSBackendPython + Django + DRFAPIREST + GraphQL (Graphene)AuthJWT (SimpleJWT)DatabasePostgreSQL 16DocsSwagger (drf-yasg)ContainerDocker + Docker ComposeOtherCORS, Media Upload, Persian Support

📁 Project Structure (Dev Branch)
textdormitory-management/
├── backend/                          # Django (Modular)
│   ├── announcements/                # Announcements & notifications
│   ├── classes/                      # Class management
│   ├── config/                       # Settings
│   ├── core/                         # Shared utilities
│   ├── dorms/                        # Dormitory structure
│   ├── ideas/                        # Ideas, complaints, voting
│   ├── requests_app/                 # All requests (most active)
│   ├── users/                        # Auth & profiles
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── frontend/                         # React + TS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/ (Redux)
│   │   └── services/ (API)
│   ├── Dockerfile
│   └── nginx.conf
├── docs/                             # Documentation
│   ├── database.md
│   └── database_v3.md
├── docker-compose.yml
├── .env.example
└── README.md

⚡ Quick Start
Prerequisites

Docker Desktop
Git

Bashgit clone https://github.com/osvehHasanpour/dormitory-management.git
cd dormitory-management
git checkout Dev

cp .env.example .env
docker-compose up -d --build
First-time Setup
Bashdocker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

🌐 Service URLs
ServiceURLCredentialsFrontendhttp://localhost:3000-Backend APIhttp://localhost:8000/api/-Swaggerhttp://localhost:8000/swagger/-GraphQLhttp://localhost:8000/graphql/-Django Adminhttp://localhost:8000/admin/SuperuserpgAdminhttp://localhost:5050admin@dormitory.com / admin123

📊 UML Diagrams
1. High-Level Use Case Diagram (Text UML)
text[Actor] Student          [Actor] Supervisor         [Actor] Admin
     │                        │                          │
     ├─ Login/Logout ────────┼──────────────────────────┤
     ├─ Submit Request ──────┼─ Manage Requests ────────┤
     ├─ View Announcements ──┼─ Create Announcements ───┤
     ├─ Register Class ──────┼─ Manage Classes ─────────┤
     ├─ Submit Idea/Vote ────┼─ Review Ideas ───────────┤
     └─ Rate Services ───────┴──────────────────────────┘
2. Simplified Class Diagram (Key Models)
textUser (Abstract)
├── Student
├── Supervisor
└── Admin

Request (Polymorphic)
├── MaintenanceReport
├── CleaningRequest
├── SupplyRequest
└── BoothRequest

Announcement
Class/Event
Idea (with votes)
Rating

🐳 Docker Commands
Bashdocker-compose up -d --build
docker-compose down
docker-compose logs -f backend
docker-compose exec backend python manage.py makemigrations

🚀 Development Status
✅ Completed:

Full Docker setup
Modular backend (users, requests_app, ideas, classes, etc.)
JWT Authentication & role-based access
Request management (recent fixes for "My Requests")
Announcements & notifications
Database models & migrations

🔄 In Progress:

Advanced frontend pages
Testing & polishing


👥 Team

Osveh Hasanpour
Razieh Delvari
Mahshid Haji Shirmohammadi
Zeinab Golchin
Hanieh Tabianian

Supervisor: Dr. Mehran Alidoust Nia

🤝 Contributing

Fork & create feature branch
Follow Clean Code / SOLID
Submit PR with tests


⭐ Star this repo if you find it useful!
