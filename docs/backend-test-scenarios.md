# Backend Test Scenarios (Backend)

## 1. Overview

### Purpose of the backend test suite

The backend test suite verifies that the Integrated Dormitory Management System backend enforces:

- Authentication and authorization rules by role (student, supervisor, admin)
- Business workflows and state transitions in service-layer logic
- REST and GraphQL contract behavior (status codes, payload envelope, field presence)
- Data isolation (users can only access their own resources where required)
- Side effects (status history entries, notifications, and SLA flags)

### Testing strategy used in the project

The project uses a layered strategy:

1. **API integration tests (`APITestCase`)**
   - Validate endpoint behavior, authentication/permission checks, request validation, and response payloads.
   - Cover both REST APIs and GraphQL operations.

2. **Workflow/service tests (`TestCase`)**
   - Validate business rules directly in services/selectors (state machine transitions, limits, idempotency, lifecycle constraints).

3. **Scenario-oriented role testing**
   - Most modules explicitly test student/supervisor/admin behavior to verify RBAC and ownership boundaries.

4. **Positive, Negative, and Edge coverage**
   - Successful flows, expected failures, and boundary/idempotent/terminal-state behavior are all covered in core modules.

---

## 2. Feature-Based Test Scenarios

## 2.1 Authentication & Profile (`users`)

### Positive Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Login success | `POST users:login` | Student logs in with valid credentials | Valid student user exists with room/block assignment | Submit `personnel_code` + valid `password` | `200 OK`, JWT access/refresh returned, user profile fields included |
| Profile retrieval | `GET users:profile` | Authenticated user fetches profile | Valid bearer token | Call profile endpoint with token | `200 OK`, profile includes role/block/room fields |
| Token refresh rotation | `POST users:token-refresh` | Refresh token generates new token pair | Valid refresh token | Submit refresh token | `200 OK`, new `access` and `refresh` returned |
| Logout blacklist | `POST users:logout` then refresh | Logout invalidates refresh token | Authenticated user with valid refresh token | Logout using refresh token, then call refresh endpoint | Logout succeeds; refresh attempt fails (`401`) |

### Negative Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Invalid login credentials | `POST users:login` | Wrong password rejected | User exists | Submit valid personnel code + wrong password | `400 Bad Request`, failure envelope with `credentials` error |
| Unauthenticated profile access | `GET users:profile` | Profile requires authentication | No token | Call profile endpoint | `401 Unauthorized`, failure envelope with auth error |

### Edge Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Refresh token after blacklist | `POST users:token-refresh` | Previously blacklisted refresh token cannot be reused | User logged out with same refresh token | Re-submit old refresh token | `401 Unauthorized`, token unusable after logout |

---

## 2.2 Dorm Blocks & Floors (`dorms`)

### Positive Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Block listing | `GET dorms:block-list` | Authenticated student lists blocks | Student token + block data exists | Call block list endpoint | `200 OK`, blocks returned |
| Distinct floor listing | `GET dorms:block-floors` | Floors are returned as distinct options per block | Block has rooms on multiple floors | Call block floors by block id | `200 OK`, distinct floor labels returned |

### Negative Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Block list auth required | `GET dorms:block-list` | Unauthenticated user cannot list blocks | No token | Call block list endpoint | `401 Unauthorized` |
| Missing block floor lookup | `GET dorms:block-floors` | Non-existent block id rejected | Authenticated user | Request floors for invalid id | `404 Not Found` |

### Edge Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Floor list de-duplication | `GET dorms:block-floors` | Multiple rooms on same floor should not duplicate floor options | Block with rooms across repeated floors | Fetch block floors | Unique floor options in result |

---

## 2.3 Notifications (`core`)

### Positive Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| List own notifications | `GET notifications:notification-list` | Student sees only own notifications | Student + other user notifications exist | Call list endpoint as student | Only student notifications returned |
| Unread first ordering | `GET notifications:notification-list` + selector | Unread notifications are prioritized | Mix of read/unread notifications | Call list/selector | Unread entries appear before read ones |
| Unread count in response | `GET notifications:notification-list` | Response includes unread count aggregate | At least one unread notification | Call list endpoint | `unread_count` present and accurate |
| Mark single notification read | `POST notifications:notification-mark-read` | Student marks own notification as read | Student has unread notification | Post read action by notification id | `200 OK`, notification becomes read |
| Mark all read | `POST notifications:notification-mark-all-read` | Student marks all own unread notifications as read | Student has unread notifications | Post read-all action | `200 OK`, `updated_count` equals unread amount |

### Negative Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| List requires auth | `GET notifications:notification-list` | Unauthenticated access denied | No token | Call list endpoint | `401 Unauthorized` |
| Mark other user's notification | `POST notifications:notification-mark-read` | User cannot modify another user notification | Student + other user notification exists | Attempt mark-read on foreign notification id | `404 Not Found` |
| Mark non-existent notification | `POST notifications:notification-mark-read` | Missing notification id rejected | Authenticated user | Mark-read with invalid id | `404 Not Found` |
| Mark read requires auth | `POST notifications:notification-mark-read` | Unauthenticated mark-read denied | No token | Post read action | `401 Unauthorized` |
| Mark all read requires auth | `POST notifications:notification-mark-all-read` | Unauthenticated mark-all denied | No token | Post read-all | `401 Unauthorized` |

### Edge Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Mark-read idempotency | `NotificationService.mark_read` + REST | Re-marking an already read notification is safe | Target notification already read | Mark read repeatedly | State remains read, no failure |
| Mark-all when none unread | `NotificationService.mark_all_read` + REST | No unread notifications returns zero updates | All notifications already read | Execute mark-all | `updated_count = 0` |
| Isolation on mark-all | `NotificationService.mark_all_read` + REST | Mark-all affects only current user | Multiple users have unread notifications | Student calls mark-all | Other users’ notifications remain unread |
| Missing selector fetch | `NotificationSelector.get_by_id_for_user` | Missing notification id raises service error | Authenticated user | Fetch missing id | Service error with `404` semantics |

---

## 2.4 Requests Domain (`requests_app`)

### Positive Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Create maintenance request | `POST requests:maintenance-request-list` | Student creates maintenance request | Authenticated student | Submit maintenance payload | `201 Created`, status initialized as `pending` |
| Student own request listing | `GET requests:maintenance-request-list` | Student list is scoped to own requests | Requests exist for multiple students | Call list as student | Only own maintenance requests returned |
| Supervisor request listing | `GET requests:maintenance-request-list` | Supervisor can list all maintenance requests | Requests exist from multiple students | Call list as supervisor | All relevant requests visible |
| Inventory item list | `GET requests:inventory-items` | Student can browse inventory items | Authenticated student | Call inventory endpoint | `200 OK`, item list returned |
| Create cleaning request | `POST requests:cleaning-request-list` | Student submits cleaning request | Authenticated student | Submit valid cleaning payload | `201 Created` |
| Create booth request | `POST requests:booth-request-list` | Student submits booth request | Authenticated student | Submit valid booth payload | `201 Created` |
| My requests aggregated list | `GET requests:my-requests` | Student can list all own request types | Mixed request types exist | Call my-requests endpoint | Own requests across types returned |
| Filter my requests by type | `GET requests:my-requests?request_type=...` | Type filter narrows my requests | Mixed type requests for same student | Call endpoint with `request_type` | Only filtered type returned |
| Student own detail | `GET requests:student-request-detail` | Student reads own request details and timeline field | Own request exists | Fetch own detail | `200 OK`, includes `status_timeline` |
| Typed detail fields (item/booth) | `GET requests:student-request-detail` | Detail includes type-specific fields | Item/booth requests exist | Fetch detail for each type | Item quantity and booth fields present |
| Supervisor status change | `PATCH requests:maintenance-request-change-status` | Supervisor moves request to in-progress | Pending maintenance request exists | Patch status with comment | `200 OK`, status changes, `handled_by` set |
| Supervisor response persistence | Status change endpoint + student detail | Supervisor note is stored and visible to student | Existing request | Supervisor patches `supervisor_response`, student fetches detail | Response text persisted and returned |
| Staff assignment on status change | Status change endpoint | Supervisor assigns staff while changing status | Request exists | Patch with `assigned_staff` | Assigned staff saved and returned |
| Timeline endpoint | `GET requests:maintenance-request-timeline` | Student views request status timeline | Request has status history entries | Call timeline endpoint | `200 OK`, timeline items returned |
| Initial history on create | Create endpoints + `RequestStatusHistory` | New request creates initial status history row | Authenticated student | Create request | History row with `previous_status = None`, `new_status = pending` |
| GraphQL list for supervisor | GraphQL `allRequests` query | Supervisor can query requests list | Requests exist | Execute query as supervisor | Success with total count + items |
| GraphQL status mutation | GraphQL `changeRequestStatus` | Supervisor can change status via mutation | Pending request exists | Execute mutation as supervisor | Status updates and handler recorded |
| GraphQL side-effect notification | GraphQL `changeRequestStatus` | Status change sends notification to request owner | Student-owned request exists | Supervisor mutates status | Notification count increases for student |

### Negative Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Student cannot read others' maintenance detail | `GET requests:maintenance-request-detail` | Ownership enforcement on maintenance detail | Other student request exists | Student requests foreign detail | `403 Forbidden` |
| Supervisor cannot create maintenance | `POST requests:maintenance-request-list` | Supervisor create action blocked | Authenticated supervisor | Attempt create maintenance | `403 Forbidden` |
| Item quantity over inventory | `POST requests:item-request-list` | Quantity above inventory stock rejected | Item exists with lower stock | Submit excessive quantity | `400 Bad Request`, `quantity` error |
| Item quantity above policy max | `POST requests:item-request-list` | Quantity above max allowed (3) rejected | Item exists | Submit quantity `4` | `400 Bad Request`, `quantity` error |
| Invalid request type filter | `GET requests:my-requests?request_type=invalid` | Invalid filter input rejected | Authenticated student | Query with invalid type | `400 Bad Request` |
| Student cannot view other student's aggregated detail | `GET requests:student-request-detail` | Ownership check on unified detail endpoint | Other student request exists | Fetch foreign request detail | `403 Forbidden` |
| Student cannot change status | `PATCH requests:maintenance-request-change-status` | Non-supervisor status change blocked | Student-authenticated request owner | Patch status | `403 Forbidden`, request remains pending |
| Reject without reason | Status change endpoint/service | Reject transition requires reason | Pending request exists | Supervisor sets status `rejected` without reason | `400 Bad Request`, `rejection_reason` required |
| Invalid status transition | REST + GraphQL + state machine | Invalid transition (e.g., pending -> completed) rejected | Pending request exists | Attempt forbidden transition | Failure with message containing transition-not-allowed text |
| Student cannot query all requests (GraphQL) | GraphQL `allRequests` query | Role-based restriction on privileged query | Authenticated student | Execute `allRequests` | `success=false`, permission error |
| Student cannot mutate status (GraphQL) | GraphQL `changeRequestStatus` | Role-based restriction on status mutation | Authenticated student | Execute mutation | `success=false`, permission error |
| Unauthenticated GraphQL protected query | GraphQL `allRequests` query | Auth required on query | No token | Execute query | `success=false`, authentication error |

### Edge Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Preserve existing supervisor response | Status change endpoint | Status update without new response keeps old value | Request has existing `supervisor_response` | Patch status only | Previous response text remains unchanged |
| Rejected state terminal | `RequestService.change_status` | Rejected request cannot transition to active states | Request already rejected | Attempt transition to in-progress | Service error |
| Transition by request type | `validate_transition` | `pending -> approved` allowed for cleaning but blocked for maintenance | Requests differentiated by type | Validate transition in both contexts | Cleaning allowed; maintenance rejected |
| Cleaning active request cap | REST + `RequestService.create_cleaning` | Student cannot have more than 3 active cleaning requests | Student already has 3 active cleaning requests | Create fourth cleaning request | `400`/service error with limit message |
| Feedback combined active cap | `ComplaintService` | Combined complaint/suggestion active count capped at 5 | Student has 5 active feedback items | Create sixth feedback item | Service error; after one answered, creation succeeds |
| Status history persistence | `RequestStatusHistory` | Every status change records previous/new statuses + actor/comment | Request status changed by supervisor | Change status with comment | History row persists complete metadata |

---

## 2.5 Feedback API (Complaints/Suggestions via `requests_app`)

### Positive Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Submit complaint | `POST complaints:complaint-create` | Student submits complaint with category | Authenticated student | Send complaint payload | `201 Created`, type `complaint`, status `pending` |
| List own complaints | `GET complaints:my-complaints` | Student lists own complaints | Student complaint exists | Fetch my complaints | Own complaint appears in results |
| Submit suggestion | `POST suggestions:suggestion-create` | Student submits suggestion | Authenticated student | Send suggestion payload | `201 Created`, type `suggestion` |
| List own suggestions | `GET suggestions:my-suggestions` | Student lists own suggestions | Student suggestion exists | Fetch my suggestions | Own suggestion appears in results |

### Negative Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Cannot view another student's complaint | `GET complaints:complaint-detail` | Ownership rule on complaint detail | Other student's complaint exists | Fetch foreign complaint detail | `403 Forbidden` |

### Edge Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Complaint category required | `POST complaints:complaint-create` | Complaint creation enforces category field | Authenticated student | Submit complaint without `category` | `400 Bad Request` with `category` error |

---

## 2.6 Classes (`classes`)

### Positive Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Student class listing | `GET classes:class-list` | Students see only active classes | Active and ended classes exist | Call class list as student | Active classes included; ended excluded |
| Class detail data contract | `GET classes:class-detail` | Detail includes popup-related fields | Active class exists | Fetch class detail | `is_enrolled`, `can_rate`, `remaining_capacity`, rating/day/time fields returned |
| Register active class | `POST classes:class-register` | Student registers in active class | Capacity available | Post register | `201 Created`, enrollment exists |
| Cancel and re-register | `DELETE/POST classes:class-register` | Student can cancel and then register again | Existing registration | Cancel then register again | Cancel succeeds; re-register succeeds |
| My active classes | `GET classes:my-classes` | Student sees active enrollments | Active enrollment exists | Call my classes endpoint | Enrollment/class returned |
| Rate ended class | `POST classes:class-rate` | Enrolled student rates completed class | Ended class + enrollment exists | Post score | `201 Created`, rating saved, `can_rate=false` afterward |
| My ended classes | `GET classes:my-ended-classes` | Student lists completed enrollments available for rating | Enrollment in ended class | Call endpoint | Ended class returned with `can_rate=true` |
| Supervisor create class | `POST supervisor_classes:class-list` | Supervisor creates class with schedule and metadata | Authenticated supervisor | Submit class payload | `201 Created`, class active with expected fields |
| Supervisor list/filter/detail | `GET supervisor_classes:class-list/detail` | Supervisor can list all and filter by status | Active + completed classes exist | List all; list by status; fetch detail | Correct classes returned; detail includes metrics (`enrolled_count`, `ratings_count`) |
| Supervisor update class | `PUT supervisor_classes:class-detail` | Supervisor updates class mutable fields | Existing class | Update title/capacity/location | `200 OK`, fields persisted |
| Supervisor cancel class | `DELETE supervisor_classes:class-detail` | Supervisor cancels class | Active class exists | Delete endpoint call | Class status becomes `cancelled` |
| Supervisor enrollments overview | `GET supervisor_classes:class-enrollments` | Supervisor sees enrolled students | Active class has enrollments | Fetch enrollments | Count and student list returned |
| Supervisor ratings overview | `GET supervisor_classes:class-ratings` | Supervisor sees ratings aggregation/results | Ended class has ratings | Fetch ratings | Ratings count, average score, and comments returned |

### Negative Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Supervisor blocked from student classes API | `GET classes:class-list` | Student-facing classes API disallows supervisor role | Authenticated supervisor | Call student class list | `403 Forbidden` |
| Duplicate registration blocked | `POST classes:class-register` | Same student cannot register twice concurrently | Existing active registration | Post register again | `400 Bad Request`, registration error |
| Rating before class ends blocked | `POST classes:class-rate` | Rating cannot be submitted before class completion | Active class + enrollment | Submit rating | `400 Bad Request` |
| Duplicate rating blocked | `POST classes:class-rate` | Student cannot submit second rating for same class | Existing rating present | Submit another rating | `400 Bad Request`, rating error |
| Student/admin blocked on supervisor endpoints | `supervisor_classes:*` | Only supervisors can manage classes | Student/admin authenticated | Attempt create/update/delete/list-enrollments | `403 Forbidden` |
| Past start time rejected on create | `POST supervisor_classes:class-list` | Class start date validation enforced | Supervisor authenticated | Submit class with past `start_datetime` | `400 Bad Request`, `start_datetime` error |
| Capacity below enrollments rejected | `PUT supervisor_classes:class-detail` | Cannot reduce capacity below active enrollments | Class has active enrollments > new capacity | Update `capacity` below enrolled count | `400 Bad Request`, `capacity` error |
| Cancelled class cannot be updated | `PUT supervisor_classes:class-detail` | Lifecycle lock after cancellation | Class already cancelled | Attempt update | `400 Bad Request`, status-related error |
| Cancelled class registration blocked | `POST classes:class-register` | Students cannot register canceled classes | Class status cancelled | Attempt register | `400 Bad Request`, class error |

### Edge Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Capacity boundary | `ClassService.register` | Third registration blocked when capacity is 2 | 2 existing active registrations | Third student registers | Service error indicates capacity full |
| Cancellation frees seat | `ClassService.cancel_registration` + register | Cancelled registration releases slot for others | Full class and one cancel action | Cancel one registration, register another student | New registration succeeds |
| Re-register reuses same row | `ClassService.register/cancel_registration` | User re-registration restores canceled record instead of creating duplicate row | User registered then canceled | Re-register same user | Same `ClassRegistration` row reused (`is_cancelled` toggled) |
| Rating requires enrollment | `ClassService.submit_rating` | Non-enrolled student cannot rate ended class | Ended class exists without enrollment | Submit rating | Service error about enrollment requirement |
| Finished/status filters | `GET supervisor_classes:class-list?status=...` | `finished` returns non-active classes; active filter excludes expired classes | Mix of active/completed/expired-active classes | Query with `finished` and `active` filters | Filtered lists reflect expected lifecycle logic |
| Expired active auto-completion | Supervisor class list call | Class with past end time and active status is auto-marked completed on list retrieval | Expired class still marked active | Fetch supervisor class list | Class status updated to `completed` |
| Cancelled class hidden for students | `GET classes:class-list` | Cancelled classes removed from student browsing list | Active class set cancelled | Student fetches class list | Cancelled class not present |

---

## 2.7 Announcements (`announcements`)

### Positive Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Student/supervisor active announcement list | `GET announcements:announcement-list` | Authenticated users list active announcements | Active + inactive announcements exist | Call list as student/supervisor | Active announcements returned |
| List/detail payload contract | Announcement list/detail endpoints | Created-by identity metadata returned | Announcement exists | Fetch list/detail | Required fields present; `created_by.display_name` and avatar returned |
| Supervisor creates announcement | `POST announcements:announcement-list` | Supervisor posts new announcement | Authenticated supervisor | Submit title/content | `201 Created`, announcement persisted |
| Admin creates/updates/deactivates announcement | Announcement CRUD endpoints | Admin role can manage announcements | Authenticated admin | Create/update/delete announcement | Operations succeed with expected state changes |
| Supervisor update and patch | `PUT/PATCH announcements:announcement-detail` | Supervisor can full/partial update | Active announcement exists | Put/patch title/content | `200 OK`, fields updated |
| Supervisor deactivation | `DELETE announcements:announcement-detail` | Supervisor can soft-deactivate announcement | Active announcement exists | Delete announcement | `200 OK`, `is_active=false` |
| Notification broadcast on create | Announcement create + `Notification` side effect | Creating announcement notifies active students | Active student accounts exist | Create announcement | New notifications created for active students |
| Service-layer broadcast and update | `AnnouncementService` | Service handles create/update/deactivate lifecycle | Supervisor actor | Call create/update/deactivate | Announcement lifecycle and notifications work as expected |

### Negative Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Unauthenticated list/create blocked | Announcement list/create endpoints | Auth required | No token | Call list/create | `401 Unauthorized` |
| Student cannot create/update/deactivate | Announcement CRUD endpoints | Student role cannot manage announcements | Authenticated student | Attempt create/update/delete | `403 Forbidden` |
| Missing required fields | `POST announcements:announcement-list` | Title/content required | Authenticated supervisor | Submit payload missing title or content | `400 Bad Request` with field errors |
| Whitespace-only fields rejected | Create endpoint | Title/content cannot be blank after trimming | Authenticated supervisor | Submit `"   "` title or content | `400 Bad Request` |
| Title max length validation | Create endpoint | Overlength title rejected | Authenticated supervisor | Submit title > 200 chars | `400 Bad Request`, title error |
| Empty update body rejected | `PUT announcements:announcement-detail` + service update | Update requires at least one field | Authenticated manager | Submit empty payload | `400 Bad Request` / service error |
| Student cannot access inactive detail | `GET announcements:announcement-detail` | Students cannot view inactive announcement | Inactive announcement exists | Fetch inactive detail as student | `404 Not Found` |
| Nonexistent detail lookup | Detail endpoint | Missing announcement id returns not found | Authenticated user | Fetch non-existing id | `404 Not Found` |
| Deactivate already inactive | Delete endpoint + service | Already inactive announcement cannot be deactivated again | Announcement already inactive | Delete request | `400 Bad Request` with lifecycle message |
| Service create by student blocked | `AnnouncementService.create` | Service-level RBAC enforced | Student actor | Call create service | Service error with `403` |

### Edge Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Whitespace normalization | Create/update endpoints + service | Leading/trailing whitespace is stripped | Authenticated supervisor | Create/update with padded text | Saved fields are trimmed |
| Notification recipient scope | Announcement service and API | Inactive users should not receive broadcast notifications | Both active and inactive students exist | Create announcement | Only active students receive notifications |
| Notification content format | Announcement service | Notification message embeds announcement title | Announcement created | Check latest student notification | Message contains announcement title |
| Supervisor visibility of inactive detail | Detail endpoint | Supervisor can still inspect inactive announcement | Inactive announcement exists | Fetch detail as supervisor | `200 OK` |

---

## 2.8 Ideas & Voting (`ideas`)

### Positive Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Submit idea | `POST ideas:idea-list-create` | Student submits new idea | Authenticated student | Create idea payload | `201 Created`, status `pending`, `is_owner=true` |
| Public reviewed list | `GET ideas:idea-list-create` | Public feed includes reviewed ideas | Reviewed + pending ideas exist | Fetch list as student | Reviewed ideas appear |
| My ideas includes pending | `GET ideas:my-ideas` | Owner can list own pending ideas | Student has pending idea | Fetch my ideas | Own pending idea included |
| Owner can view pending detail | `GET ideas:idea-detail` | Owner can access pending idea details | Pending idea owned by current user | Fetch detail | `200 OK` |
| Vote on reviewed idea | `POST ideas:idea-vote` | Student votes up on reviewed idea | Reviewed idea owned by another student | Submit vote | `200 OK`, vote saved, counters updated |
| Vote toggle workflow | Vote endpoint workflow | Re-vote with opposite type updates vote; same vote toggles removal | Existing vote from user | Upvote, downvote, downvote again | Update message then remove message; final vote removed |
| Ordering by votes | `GET ideas:idea-list-create?ordering=...` | Feed sorts by `most_votes` and `least_votes` | Ideas with different vote totals | Query with both ordering modes | Results sorted by vote totals as expected |
| Public list includes supervisor response for non-owner | Idea list endpoint | Reviewed idea response text visible in feed | Reviewed idea has supervisor response | Fetch list as non-owner | `supervisor_response` returned and `is_owner=false` |

### Negative Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Non-owner blocked from pending detail | `GET ideas:idea-detail` | Pending idea not visible to non-owner | Pending idea owned by another student | Fetch detail as non-owner | `403 Forbidden` |
| Cannot vote own idea | `POST ideas:idea-vote` | Idea author cannot vote on own idea | Authenticated author | Post vote on own reviewed idea | `403 Forbidden` |
| Unauthenticated idea list blocked | `GET ideas:idea-list-create` | Auth required on tested idea list endpoint | No token | Fetch list | `401 Unauthorized` |

### Edge Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Vote replacement and removal consistency | Vote endpoint + `Vote` model | Repeated votes keep counters and persisted vote state consistent | Existing idea and voter | Perform up -> down -> down sequence | Counter values and persisted votes remain consistent |
| High/low vote ordering stability | List endpoint with ordering | Different vote magnitudes rank ideas correctly | Multiple ideas with known vote counts | Query ordered feeds | Highest appears first for `most_votes`, lowest for `least_votes` |

---

## 2.9 Supervisor Feedback Workflow (`ideas` supervisor APIs)

### Positive Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Supervisor feedback listing with filters | `GET supervisor_feedback:feedback-list` | Supervisor filters feedback by type/category | Mixed complaints/ideas/suggestions exist | Query with `type` and `category` params | Filtered result set returned |
| Legacy suggestion compatibility | Supervisor feedback list/detail | Legacy `suggestion` records are mapped into idea flow | Legacy suggestion exists | Query type=idea and fetch detail | Legacy item included; payload type mapped to `idea` with display text |
| Supervisor response within SLA | `PATCH supervisor_feedback:feedback-respond` | Complaint response inside SLA window tracked | Complaint created within SLA threshold | Submit `response_text` | Status becomes `answered`, `responded_within_sla=true`, responder fields set |
| Supervisor response after SLA | Same respond endpoint | Late response marks SLA miss | Complaint created beyond SLA threshold | Submit response | `responded_within_sla=false` |
| Response creates notification | Feedback respond endpoint + `Notification` | Student gets notification when feedback answered | Complaint exists | Supervisor responds | Notification linked to feedback is created unread |
| Approve idea for public voting | `PATCH supervisor_feedback:idea-review` with approve | Approved idea appears in student idea list | Pending idea exists | Supervisor approves then another student fetches list | Idea becomes reviewed and visible |
| Admin can respond to feedback | `PATCH supervisor_feedback:feedback-respond` | Admin role also allowed to respond | Complaint exists | Admin submits response | Response accepted with admin as responder |
| Student complaint with category | `POST complaints:complaint-create` | Complaint with explicit category succeeds | Authenticated student | Submit valid complaint + category | `201 Created`, category persisted |
| Student sees supervisor response | Complaint detail endpoint | Student can read response metadata after supervisor answer | Complaint answered by supervisor | Student fetches complaint detail | Status/response_text/responded_within_sla returned |
| Mark under review | `PATCH supervisor_feedback:feedback-mark-review` | Feedback can be marked reviewed | Pending complaint exists | Call mark-review endpoint | Status becomes `reviewed` |
| Reject feedback with reason | `PATCH supervisor_feedback:feedback-reject` | Supervisor can reject feedback with reason | Complaint exists | Submit non-empty `response_text` | Status becomes `rejected` |

### Negative Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Student cannot access supervisor feedback list | `GET supervisor_feedback:feedback-list` | Supervisor-only endpoint blocks student | Student authenticated | Fetch supervisor list | `403 Forbidden` |
| Reject idea requires reason | `PATCH supervisor_feedback:idea-review` with reject | Reject action without reason blocked | Pending idea exists | Reject without `response_text` | `400 Bad Request`, error on `response_text` |
| Complaint category required | `POST complaints:complaint-create` | Complaint creation without category is invalid | Authenticated student | Submit complaint missing category | `400 Bad Request`, category error |
| Reject feedback reason required | `PATCH supervisor_feedback:feedback-reject` | Empty reason rejected | Complaint exists | Reject with empty response text | `400 Bad Request` |

### Edge Cases

| Feature name | Tested endpoint/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Type normalization for legacy data | Supervisor feedback detail | Legacy suggestion data appears as idea in supervisor payload | Legacy suggestion record | Fetch feedback detail | Type normalized to `idea` without data loss |
| SLA boundary behavior | Feedback respond endpoint | SLA flag explicitly tracked for both timely and delayed responses | Complaints created at different ages | Respond to each | Correct `responded_within_sla` value persisted and returned |

---

## 2.10 Dormitory GraphQL App (`dormitory`)

### Positive Cases

No executable test scenarios currently asserted in `backend/dormitory/tests.py` (placeholder only).

### Negative Cases

No executable test scenarios currently asserted in `backend/dormitory/tests.py`.

### Edge Cases

No executable test scenarios currently asserted in `backend/dormitory/tests.py`.

