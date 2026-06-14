You are an expert Django architect. Implement the complete Django models for the "Dormitory Management System" based on the attached docker-compose.yml, Dockerfile, and requirements.txt.
The user already has a partial Django project with these files:

- docker-compose.yml (with PostgreSQL service named 'db', backend service, volumes for static/media)
- Dockerfile for backend (multi-stage with Python 3.12)
- requirements.txt (includes Django==6.0.6, DRF, graphene, drf-spectacular, psycopg2-binary, etc.)
- Existing manage.py and possibly some settings.

**Do NOT delete or overwrite existing files unnecessarily.** Update them intelligently if needed (especially settings.py).

### Task: Complete the Django backend foundation for Dormitory Management System

1. **Check existing structure** and only create missing apps/folders/files.
2. **Use domain-driven structure** with the following apps:
   - core
   - users
   - dorms
   - requests_app (use this name because 'requests' is reserved)
   - classes
   - ideas
   - announcements

3. **Update settings.py** (dormitory_backend/settings.py or wherever it is):
   - Add all new apps to INSTALLED_APPS
   - Set AUTH_USER_MODEL = 'users.User'
   - Configure DATABASE (use DATABASE_URL from environment or default to PostgreSQL)
   - Add MEDIA_ROOT, MEDIA_URL, STATIC_ROOT for photo_url and files (respect docker volumes)
   - Add necessary middleware (corsheaders, etc.)
   - Add REST_FRAMEWORK and SPECTACULAR settings for Swagger

### Project Context

- Use Django 5+ / 6+ with PostgreSQL.
- Project structure should be domain-driven (multiple apps).
- All models must support Persian (Farsi) verbose_name and verbose_name_plural.
- Use UUIDField as primary key where appropriate. or use autofilled. just one of them. i do not want both of them for my project.
- Timestamps: auto_now_add for created_at, auto_now for updated_at.
- Use django.db.models.TextChoices for status and type fields.
- Support soft delete where logical (is_active).
- Follow the exact fields, relationships, and cardinalities from the ERD.

### Required Apps (create them):

- core (shared)
- dorms (Block, Room, RoomAssignment)
- users
- requests_app (RequestBase + children)
- classes
- ideas
- announcements

### 1. User & Authentication Models

- Extend AbstractUser.
- Role model: id, name(student, supervisor, admin), description.
- User has role, block , first_name, last_name, password_hash, is_active, etc.
- Dorm/Block association.

### 2. Dormitory Models

**Block:**

- id (PK)
- name
- total_floors
- room_numbers (JSON or TextField)

**Room:**

- id (PK)
- block (FK)
- room_number
- floor
- capacity

**RoomAssignment:**

- id (PK)
- user (FK)
- room (FK)
- assigned_from (Date)
- assigned_to (Date, nullable)
- is_current (Boolean)

### 3. Request System (Inheritance)

**RequestBase** (Multi-table Inheritance):

- id (PK)
- request_type (Choices: maintenance, cleaning, item, booth)
- status (Choices: pending, in_progress, approved, rejected, completed)
- description
- created_at, updated_at
- user (FK to User - requester)
- handled_by (FK to User - supervisor, nullable)
- ai_content_flag (Boolean, nullable)

**MaintenanceRequest** (inherits from RequestBase): //this is for گزارش خرابی

- location
- photo_url (ImageField or URLField, optional)

**CleaningRequest** (inherits from RequestBase):

- location
- preferred_date (Date)

**ItemRequest** (inherits from RequestBase):

- item (FK to InventoryItem)
- quantity
- delivery_status

**BoothRequest** (inherits from RequestBase):

- name
- category
- event_date
- approval_date

### 4. Other Models

**InventoryItem:**

- id (PK)
- item_name
- category
- quantity

**IdeaComplaint:**

- id (PK)
- user (FK)
- type (suggestion, idea, complaint)
- title
- description
- status
- supervisor_response (TextField)
- upvotes (Integer, default=0)

**Vote:**

- id (PK)
- user (FK)
- idea (FK to IdeaComplaint)
- vote_type (up/down)
- voted_at

**Class:**

- id (PK)
- title
- description
- capacity
- start_datetime
- end_datetime
- created_by (FK to User - supervisor)
- teacher (FK to User)

**ClassRegistration:**

- id (PK)
- user (FK - student)
- class (FK)
- registered_at

**Rating:**

- id (PK)
- user (FK)
- target_type (class, service, staff)
- target_id (GenericForeignKey or separate fields)
- score (Integer 1-5)

**Announcement:**

- id (PK)
- title
- content
- created_by (FK)
- created_at
- is_active (Boolean)

**Notification:**

- id (PK)
- user (FK)
- message
- related_request (FK to RequestBase, nullable)

### Additional Requirements

- Proper Meta classes with ordering, verbose names in Persian.
- Signals: After request status change → create Notification.
- ImageField handling for photo_url (use MEDIA_ROOT from docker).
- Constraints: Unique together where needed (e.g., current room assignment).
- Indexes on frequently queried fields (user, status, created_at).
- Use django.contrib.contenttypes for any Generic relations if needed for Rating.
- All models must be ready for DRF serializers and admin registration.


Generate:

1. Full models.py files for each app.
2. Necessary signals.py if needed.
3. Example admin.py registration for key models.
4. A management command seed_data.py with sample data. No table should be empty. The command must fully populate the database with **at least 5 detailed, highly realistic records** 
- Use high-quality, meaningful Persian (Farsi) structural mock values (e.g., names like "علی رضایی", block names like "بلوک 3", maintenance tasks like "تعویض شیر آب آشپزخانه").
5. Update settings.py with necessary INSTALLED_APPS, AUTH_USER_MODEL, media/static config.

Respect the docker-compose (PostgreSQL on db service, DATABASE_URL) and requirements.

Do not use any placeholder comments like "# TODO". Produce production-ready, clean, well-documented code.
