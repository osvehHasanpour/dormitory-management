You are an expert Django architect. Implement the complete Django models for the "Dormitory Management System" based on the attached docker-compose.yml, Dockerfile, and requirements.txt.
The user already has a partial Django project with these files:

- docker-compose.yml (with PostgreSQL service named 'db', backend service, volumes for static/media)
- Dockerfile for backend (multi-stage with Python 3.12)
- requirements.txt (includes Django==6.0.6, DRF, graphene, drf-spectacular, psycopg2-binary, etc.)
- Existing manage.py and possibly some settings.

**Do NOT delete or overwrite existing files unnecessarily.** Update them intelligently (especially settings.py).

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
- Use AutoField (integer) as primary key for all models. Do NOT use UUIDField as PK anywhere.
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

**Role:**
- id (PK, AutoField)
- name (CharField, choices via TextChoices: student, supervisor, admin)
- description (TextField, blank=True)

**User** (extends AbstractUser):

CRITICAL instructions for User model — read carefully:

- Set `USERNAME_FIELD = 'personnel_code'` so Django uses personnel_code as the login identifier.
- Add field: `personnel_code` (CharField, max_length=20, unique=True) — this single field serves as the login username for ALL user types:
  - For students: their 9-digit student number (شماره دانشجویی)
  - For supervisors/admins: their personnel code (کد پرسنلی)
  The login form is identical for all roles; the system distinguishes role after authentication via the role FK.
- Add field: `national_code` (CharField, max_length=10, unique=True) — the user's national ID. This is used as the INITIAL password. In seed_data, call `set_password(user.national_code)` for every user. Do NOT store national_code in any password field; Django's password hashing handles it.
- `first_name`, `last_name` — inherited from AbstractUser. Do NOT redefine them.
- `is_active` — inherited from AbstractUser. Do NOT redefine it.
- `password` — managed entirely by Django. Do NOT add a `password_hash` field.
- `username` — override to be non-required and non-unique (set `username = None` pattern or set `blank=True, null=True, unique=False`), since `personnel_code` is the login field.
- `email` — inherited from AbstractUser; set `null=True, blank=True` (not required).
- `role` (FK to Role, null=True, blank=True, on_delete=SET_NULL)
- `block` (FK to dorms.Block, null=True, blank=True, on_delete=SET_NULL) — which dorm block the user belongs to
- `created_at` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)
- Set `REQUIRED_FIELDS = ['first_name', 'last_name', 'national_code']`

### 2. Dormitory Models

**Block:**

- id (PK)
- name
- total_floors
- room_numbers (JSONField)

**Room:**

- id (PK)
- block (FK to Block)
- room_number
- floor
- capacity

**RoomAssignment:**

- id (PK)
- user (FK to User)
- room (FK to Room)
- assigned_from (DateField)
- assigned_to (DateField, null=True, blank=True)
- is_current (BooleanField, default=True)

Constraint: Use a conditional UniqueConstraint (NOT unique_together) so that only one active assignment per user is allowed:
```python
from django.db.models import Q
class Meta:
    constraints = [
        models.UniqueConstraint(
            fields=['user'],
            condition=Q(is_current=True),
            name='unique_active_room_assignment_per_user'
        )
    ]
```
Do NOT use unique_together here — it would constrain (user, room, is_current) together which still allows one user to have two active assignments in different rooms.

### 3. Request System (Inheritance)

**RequestBase** (Multi-table Inheritance — concrete base model, NOT abstract):

- id (PK)
- request_type (TextChoices: maintenance, cleaning, item, booth)
- status (TextChoices: pending, in_progress, approved, rejected, completed)
- description (TextField)
- created_at (DateTimeField, auto_now_add=True)
- updated_at (DateTimeField, auto_now=True)
- user (FK to User, related_name='requests' — the requester)
- handled_by (FK to User, null=True, blank=True, related_name='handled_requests' — the supervisor)
- ai_content_flag (BooleanField, null=True, blank=True)

**MaintenanceRequest** (inherits from RequestBase via Multi-table inheritance):
// این مدل برای گزارش خرابی است
- maintenance_id (PK, FK to RequestBase — auto-created by MTI)
- location (CharField)
- photo_url (ImageField, upload_to='maintenance/', null=True, blank=True)
- description (TextField, blank=True)

**CleaningRequest** (inherits from RequestBase):
- cleaning_id (PK, FK to RequestBase — auto-created by MTI)
- location (CharField)
- preferred_date (DateField)
- description (TextField, blank=True)

**ItemRequest** (inherits from RequestBase):
- id (PK, FK to RequestBase — auto-created by MTI)
- item (FK to InventoryItem)
- quantity (PositiveIntegerField)
- delivery_status (CharField, blank=True)

**BoothRequest** (inherits from RequestBase):
- id (PK, FK to RequestBase — auto-created by MTI)
- name (CharField) — نام غرفه یا کسب‌وکار
- category (CharField) — نوع کالا یا خدمات
- event_date (DateField)
- approval_date (DateField, null=True, blank=True)

### 4. Other Models

**InventoryItem:**

- id (PK)
- item_name (CharField)
- category (CharField)
- quantity (PositiveIntegerField)
- description (TextField, blank=True)

**IdeaComplaint:**

- id (PK)
- user (FK to User)
- type (TextChoices: suggestion, idea, complaint)
- title (CharField)
- description (TextField)
- status (TextChoices: pending, reviewed, answered, rejected)
- supervisor_response (TextField, blank=True)
- upvotes (IntegerField, default=0)

**Vote:**

- id (PK)
- user (FK to User)
- idea (FK to IdeaComplaint)
- vote_type (TextChoices: up, down)
- voted_at (DateTimeField, auto_now_add=True)

Constraint: unique_together on (user, idea) — one vote per user per idea.

**Class:**

- id (PK)
- title (CharField)
- description (TextField, blank=True)
- capacity (PositiveIntegerField) — ظرفیت کل کلاس
- start_datetime (DateTimeField)
- end_datetime (DateTimeField)
- created_by (FK to User, related_name='created_classes' — supervisor)
- teacher (FK to User, related_name='taught_classes')
- category (TextChoices: educational, sports, cultural, art — آموزشی، ورزشی، فرهنگی، هنری)

CRITICAL — Capacity logic (do NOT add these as database columns):
- Do NOT add `remaining_capacity`, `registered_count`, or `is_full` as real model fields.
- Instead, add these as `@property` methods on the Class model:
```python
@property
def registered_count(self):
    return self.registrations.filter(is_cancelled=False).count()

@property
def remaining_capacity(self):
    return self.capacity - self.registered_count

@property
def is_full(self):
    return self.remaining_capacity <= 0
```
- In list views/querysets, use `.annotate(active_count=Count('registrations', filter=Q(registrations__is_cancelled=False)))` for performance instead of hitting the DB per object.
- During registration, enforce capacity inside `select_for_update()` + `transaction.atomic()` to prevent race conditions.

**ClassRegistration:**

- id (PK)
- user (FK to User, related_name='class_registrations')
- class_instance (FK to Class, db_column='class_id') ← use 'class_instance' since 'class' is a Python reserved word
- registered_at (DateTimeField, auto_now_add=True)
- is_cancelled (BooleanField, default=False) — دانشجو می‌تواند ثبت‌نام را لغو کند
- cancelled_at (DateTimeField, null=True, blank=True) — زمان لغو ثبت‌نام؛ فقط وقتی is_cancelled=True مقدار دارد

CRITICAL: When a registration is cancelled (is_cancelled set to True), set cancelled_at=now() in the same operation. One freed seat must become available again — handle this in the service/view layer by re-checking capacity after cancellation.

Constraint: unique_together on (user, class_instance) — یک دانشجو نمی‌تواند دوبار در یک کلاس ثبت‌نام کند (حتی پس از لغو، رکورد همان ردیف است با is_cancelled=True).

**Rating:**

- id (PK)
- user (FK to User, related_name='ratings')
- class_instance (FK to Class, db_column='class_id', related_name='ratings') — direct FK per ERD; Rating relates only to Class
- score (PositiveSmallIntegerField, validators=[MinValueValidator(1), MaxValueValidator(5)])
- created_at (DateTimeField, auto_now_add=True)

CRITICAL: Do NOT use GenericForeignKey, contenttypes, target_type, or target_id anywhere. The ERD shows Rating has a direct FK to Class only. No Generic relations.

Constraint: unique_together on (user, class_instance) — one rating per student per class.

**Announcement:**

- id (PK)
- title (CharField)
- content (TextField)
- created_by (FK to User)
- created_at (DateTimeField, auto_now_add=True)
- is_active (BooleanField, default=True)

**Notification:**

- id (PK)
- user (FK to User)
- message (TextField)
- related_request (FK to RequestBase, null=True, blank=True, on_delete=SET_NULL)
- is_read (BooleanField, default=False)
- created_at (DateTimeField, auto_now_add=True)

### Additional Requirements

- Proper Meta classes with ordering, verbose names in Persian.
- Signals: After RequestBase status changes → automatically create a Notification for the requester.
- ImageField handling for photo_url (use MEDIA_ROOT from docker).
- Indexes on frequently queried fields (user, status, created_at).
- Do NOT use django.contrib.contenttypes or GenericForeignKey anywhere. Rating uses a direct FK to Class as defined in the ERD.
- All models must be ready for DRF serializers and admin registration.

### Generate:

1. Full models.py files for each app.
2. signals.py in requests_app for the status-change notification.
3. admin.py registration for all key models.
4. A management command `seed_data.py` with sample data. No table should be empty. The command must fully populate the database with **at least 5 detailed, highly realistic records per model**.
   - Use meaningful Persian values: names like "علی رضایی", block names like "بلوک الف", maintenance tasks like "تعویض شیر آب آشپزخانه", class titles like "کلاس یوگا پیشرفته".
   - For every user created: call `user.set_password(user.national_code)` before saving.
   - The `role` field on User is a FK to the Role model — NOT a string. In seed_data you MUST first fetch or create Role objects, then assign them:
     ```python
     supervisor_role = Role.objects.get(name='supervisor')
     student_role = Role.objects.get(name='student')
     user.role = supervisor_role  # correct
     # NEVER: user.role = 'supervisor'  ← this will crash
     ```
   - Create Role records (student, supervisor, admin) FIRST before any User record.
   - Create at least 2 supervisors and 5 students, assigning the correct Role object to each.
   - All foreign keys must reference seeded records (no dangling FKs).
5. Update settings.py with necessary INSTALLED_APPS, AUTH_USER_MODEL, media/static config.

Respect the docker-compose (PostgreSQL on db service, DATABASE_URL) and requirements.

Do not use any placeholder comments like "# TODO". Produce production-ready, clean, well-documented code.
