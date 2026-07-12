# گزارش ارزیابی دقیق پروژه (Backend + Frontend)

## مشخصات ارزیابی

- **پروژه:** Integrated Dormitory Management System
- **تاریخ ارزیابی:** 2026-07-12
- **مبنای ارزیابی:** تحلیل مستقیم کد، تست‌ها، کانفیگ‌ها و زیرساخت موجود در ریپو
- **دامنه:** Backend, Frontend, Infra/CI-CD, Documentation

> این گزارش فقط بر اساس وضعیت فعلی کد در ریپو تهیه شده و موارد خارج از ریپو (مثل تنظیمات واقعی سرور production) در آن لحاظ نشده‌اند.

---

## خلاصه امتیاز پیشنهادی

- **امتیاز کل پیشنهادی:** **154 / 200**

توضیح:
- موارد «✅ داریم» امتیاز کامل گرفته‌اند.
- موارد «🟡 تاحدی» امتیاز نسبی گرفته‌اند.
- موارد «❌ نداریم» امتیاز صفر گرفته‌اند.

---

## ماتریس معیارها با شواهد دقیق

| معیار | وزن | وضعیت | امتیاز پیشنهادی | شواهد (مسیر فایل‌ها) | توضیح |
|---|---:|---|---:|---|---|
| HTTP status code | 5 | ✅ | 5 | `backend/core/api/responses.py`, `backend/core/exception_handler.py`, `backend/users/views.py`, `backend/requests_app/views.py`, `backend/classes/views.py`, `backend/ideas/views.py`, `backend/*/tests/*.py` | پاسخ‌ها با کدهای استاندارد 200/201/400/401/403/404/500 پیاده‌سازی و در تست‌ها پوشش داده شده‌اند. |
| Input validations | 5 | ✅ | 5 | `backend/*/serializers.py`, `backend/requests_app/services/request_service.py`, `backend/classes/services/class_service.py`, `frontend/src/hooks/useCleaningRequest.ts`, `frontend/src/hooks/useBoothRequest.ts`, `frontend/src/hooks/useSupervisorClassForm.ts`, `frontend/src/__tests__/cleaning/useCleaningRequest.test.tsx`, `frontend/src/__tests__/auth/useLogin.test.tsx` | اعتبارسنجی هم در بک‌اند (serializer/service) و هم در فرانت (Zod + فرم) وجود دارد. |
| External service and Database error handling | 5 | 🟡 | 3 | `backend/core/exception_handler.py`, `backend/config/settings.py`, `backend/*/selectors/*.py`, `backend/*/services/*.py`, `frontend/src/services/apiClient.ts`, `backend/users/services/auth_service.py` | مدیریت خطای DB/API داخلی خوب است؛ اما integration با سرویس خارجی third-party به شکل گسترده دیده نمی‌شود. |
| Logging | 5 | ✅ | 5 | `backend/config/settings.py` (LOGGING), `backend/core/middleware.py`, `backend/core/api/responses.py`, `backend/users/views.py`, `backend/dormitory/graphql_views.py` | لاگ‌گذاری ساختاریافته (access/security/error) و rotating file handlers وجود دارد. |
| Proper endpoint naming | 10 | ✅ | 10 | `backend/config/urls.py`, `backend/requests_app/urls.py`, `backend/classes/urls.py`, `backend/ideas/urls.py`, `backend/core/urls.py`, `backend/dorms/urls.py` | naming به‌صورت نسخه‌بندی‌شده (`/api/v1/...`) و نسبتاً RESTful و خوانا است. |
| Pagination/filtering/sorting | 10 | ✅ | 10 | `backend/config/settings.py` (`DEFAULT_PAGINATION_CLASS`), `backend/requests_app/views.py`, `backend/classes/views.py`, `backend/ideas/views.py`, `backend/ideas/selectors/idea_selectors.py`, `backend/ideas/selectors/supervisor_feedback_selectors.py`, `backend/classes/selectors/supervisor_class_selectors.py`, `backend/requests_app/selectors/request_selectors.py` | pagination و query filtering/sorting در چند ماژول کلیدی پیاده‌سازی شده است. |
| Authentication and authorization API | 5 | ✅ | 5 | `backend/users/views.py`, `backend/users/services/auth_service.py`, `backend/core/api/permissions.py`, `backend/requests_app/permissions.py`, `backend/classes/permissions.py`, `backend/ideas/permissions.py`, `backend/announcements/permissions.py`, `backend/config/settings.py` | JWT auth + policyهای مجوز مبتنی بر نقش در API موجود است. |
| Endpoints explanations in swagger | 5 | ✅ | 5 | `backend/config/urls.py` (`/api/schema`, `/api/docs`), `backend/config/settings.py` (`SPECTACULAR_SETTINGS`), `backend/users/views.py`, `backend/requests_app/views.py`, `backend/classes/views.py`, `backend/ideas/views.py`, `backend/announcements/views.py`, `backend/core/views.py`, `backend/dorms/views.py` | مستندسازی endpointها با `drf-spectacular` و `@extend_schema` انجام شده است. |
| Dockerfile (backend/frontend/database) | 15 | 🟡 | 10 | `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` | Dockerfile برای backend/frontend هست؛ database Dockerfile جدا ندارد و از image آماده `postgres:16-alpine` استفاده می‌شود. |
| Docker compose | 5 | ✅ | 5 | `docker-compose.yml` | سرویس‌های `db`, `pgadmin`, `backend`, `frontend` تعریف و شبکه‌بندی شده‌اند. |
| Volume and persistent data | 5 | ✅ | 5 | `docker-compose.yml` (volumes: `postgres_data`, `static_files`, `media_files`) | persistence برای DB و static/media لحاظ شده است. |
| Pipline ci(with test) | 10 | ✅ | 10 | `.github/workflows/ci.yml` | CI شامل اجرای تست backend (`python manage.py test`) و frontend (`npm run test:ci`) است. |
| Important unit tests | 15 | ✅ | 15 | Backend: `backend/*/tests/*.py`، Frontend: `frontend/src/__tests__/**/*.test.tsx` | تست‌های مهم برای auth/requests/classes/ideas/announcements/notifications/GraphQL و hooks/components وجود دارد. |
| Test documentation | 5 | ✅ | 5 | `docs/component_test.md`, `docs/backend-test-scenarios.md`, `docs/frontend-test-scenarios.md` | مستند سناریوهای تست موجود و به‌روز هستند. |
| Responsive for mobile/tablet/desktop | 15 | ✅ | 15 | `frontend/src/components/layout/PageShell.tsx`, `frontend/src/pages/student/*.tsx`, `frontend/src/pages/supervisor/*.tsx`, `frontend/src/components/**/*` (کلاس‌های `sm:`, `md:`, `lg:`) | استفاده از Tailwind breakpoints در صفحات و کامپوننت‌های اصلی به‌صورت گسترده دیده می‌شود. |
| Loading state | 5 | ✅ | 5 | `frontend/src/hooks/useAnnouncementsFeed.ts`, `frontend/src/hooks/useIdeasFeed.ts`, `frontend/src/hooks/useSupervisorClasses.ts`, `frontend/src/pages/student/ClassRegistrationPage.tsx`, `frontend/src/pages/student/MyRequestsPage.tsx`, `frontend/src/pages/supervisor/SupervisorRequestsPage.tsx`, `frontend/src/components/**/*Skeleton.tsx` | مدیریت loading با `isLoading` و اسکلتون‌های متعدد پیاده‌سازی شده است. |
| All main pages and options are fully functional | 10 | 🟡 | 6 | `frontend/src/App.tsx`, `frontend/src/pages/**/*`, `frontend/src/__tests__/**/*.test.tsx`, `frontend/src/__tests__/access/RoleBasedAccess.test.tsx` | بیشتر مسیرهای اصلی فعال‌اند؛ اما «fully functional برای همه صفحات» با شواهد فعلی کامل اثبات نمی‌شود (یک mismatch در RBAC فرانت ثبت شده). |
| Loading States (تکراری) | 5 | ✅ | 5 | همان شواهد Loading state بالا | مورد تکراری است و پوشش دارد. |
| Error States | 5 | ✅ | 5 | `frontend/src/components/ui/Toast.tsx`, `frontend/src/hooks/use*` (error)، `frontend/src/components/auth/LoginForm.tsx` (`role="alert"`), `backend/core/api/responses.py` | نمایش و مدیریت error state در UI و API وجود دارد. |
| GraphQL API implementation | 5 | ✅ | 5 | `backend/dormitory/schema/schema.py`, `backend/dormitory/schema/queries.py`, `backend/dormitory/schema/mutations.py`, `backend/dormitory/schema/types.py`, `backend/dormitory/graphql_views.py`, `backend/config/urls.py`, `backend/requests_app/tests/test_graphql.py` | GraphQL query/mutation + auth integration + تست پیاده‌سازی شده است. |
| RBAC (Role-Based Access Control) | 5 | 🟡 | 4 | Backend: `backend/core/api/permissions.py`, `backend/*/permissions.py`, `backend/*/views.py`; Frontend: `frontend/src/__tests__/access/RoleBasedAccess.test.tsx`, `frontend/src/App.tsx` | RBAC در بک‌اند خوب است؛ در فرانت یک عدم تطابق دسترسی در تست مستند شده است. |
| Deploy on server | 10 | 🟡 | 6 | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `README.md` | امکان deployment دستی با Docker/Compose وجود دارد؛ ولی اسناد/اسکریپت‌های deployment production سطح بالا (IaC/ops) کامل نیست. |
| CD | 5 | ❌ | 0 | (فایل workflow برای deploy یافت نشد) | فعلاً CI وجود دارد، CD خودکار تعریف نشده است. |
| Creativity | 5 | ✅ | 5 | `backend/config/urls.py`, `backend/dormitory/schema/*`, `frontend/src/components/*`, `frontend/src/pages/*` | ترکیب REST + GraphQL، طراحی فارسی، و تفکیک ماژولار backend/frontend نشان‌دهنده خلاقیت خوب است. |

---

## جزئیات تکمیلی مهم

### 1) Swagger/OpenAPI واقعی در پروژه
- مسیرهای مستندات:
  - `GET /api/schema/`
  - `GET /api/docs/`
- تعریف در: `backend/config/urls.py`
- کانفیگ اصلی در: `backend/config/settings.py` (`SPECTACULAR_SETTINGS`)
- endpoint-level docs در viewها با `@extend_schema`:
  - `backend/users/views.py`
  - `backend/requests_app/views.py`
  - `backend/requests_app/complaint_views.py`
  - `backend/requests_app/suggestion_views.py`
  - `backend/classes/views.py`
  - `backend/classes/supervisor_views.py`
  - `backend/ideas/views.py`
  - `backend/ideas/supervisor_views.py`
  - `backend/announcements/views.py`
  - `backend/core/views.py`
  - `backend/dorms/views.py`

### 2) GraphQL واقعی در پروژه
- schema:
  - `backend/dormitory/schema/schema.py`
  - `backend/dormitory/schema/queries.py`
  - `backend/dormitory/schema/mutations.py`
  - `backend/dormitory/schema/types.py`
- endpoint:
  - `backend/config/urls.py` (`/graphql/`)
- auth bridge:
  - `backend/dormitory/graphql_views.py`
- تست:
  - `backend/requests_app/tests/test_graphql.py`

### 3) CI واقعی
- workflow اصلی: `.github/workflows/ci.yml`
  - Backend: migrate + test
  - Frontend: jest + prettier check
- workflow دیگر: `.github/workflows/prettier.yaml` (main branch)

### 4) وضعیت CD
- هیچ workflow برای deploy خودکار (مثلاً release/deploy job) در `.github/workflows` دیده نشد.

---

## جمع‌بندی اجرایی

- پروژه از نظر **API engineering، تست، داکر، CI، RBAC بک‌اند، Swagger و GraphQL** در وضعیت خوبی قرار دارد.
- اصلی‌ترین gapها برای رسیدن به امتیاز بالاتر:
  1. **CD خودکار**
  2. **تکمیل RBAC در فرانت مطابق بک‌اند**
  3. **تکمیل داستان deployment production (اسناد/اسکریپت/infra-as-code)**
  4. (در صورت نیاز معیار) تعریف Dockerfile اختصاصی DB به‌جای image آماده

