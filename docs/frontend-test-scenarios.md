# Frontend Test Scenarios (Frontend)

## 1. Overview

### Purpose of the frontend test suite

The frontend test suite verifies that key student and supervisor user flows work correctly at UI/hook level, including:

- Authentication and session behavior
- Request and feedback submission/update flows
- Class registration and supervisor class creation flows
- Announcement and ideas feed interactions
- Navigation side effects and role-access behavior currently observed in the app

The tests focus on validating what users see and do (forms, buttons, dialogs, navigation) and what hooks do with service responses (state updates, success/error handling).

### Testing strategy used in the project

The project primarily uses:

1. **Component interaction tests**
   - Render pages/components and simulate user actions.
   - Assert visible UI text, alerts, and interaction outcomes.

2. **Hook behavior tests**
   - Render hooks with mocked context/providers and services.
   - Assert state transitions, service-call payloads, and callback invocations.

3. **Context-driven integration-style checks**
   - Use auth context and memory routing wrappers to test authenticated vs unauthenticated behavior and redirect/navigation effects.

4. **Scenario-based validation**
   - Tests are organized as user scenarios (login success/failure, submit request, update status, vote idea, etc.).

### Main testing tools and libraries used

- **Jest** (test runner/mocking, fake timers)
- **@testing-library/react** (`render`, `screen`, `fireEvent`, `waitFor`, `renderHook`, `act`)
- **@testing-library/jest-dom** (DOM assertions)
- **JSDOM** environment (`jest-environment-jsdom`)
- **React Context test wrappers** (`TestProviders`, `AuthContext.Provider`, `MemoryRouter`)

---

## 2. Feature-Based Test Scenarios

## 2.1 Authentication & Session

### Positive Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Successful login form flow | `LoginForm` + `authService.login` + `AuthContext.login` | User logs in with valid credentials | Auth context provided; login service mocked success | Enter username/password, click **ورود** | Login service called with credentials; context `login` called; navigates to `/dashboard`; no alert shown |
| Successful login hook flow | `useLogin` + `authService.login` | Hook logs in and routes to role dashboard path | Auth context provided; login service mocked success | Call `submitLogin` with valid credentials | Service called with payload; auth login called; navigates to `/dashboard`; hook error cleared |
| Logout confirmation flow | `BottomNav` + `LogoutConfirmDialog` + `authService.logoutRequest` | User confirms logout from bottom nav | Authenticated context with refresh token | Click **خروج**, then **بله خروج** | Navigates to `/login`; logout request called with refresh token; auth `logout` called |
| Confirm action in logout dialog | `LogoutConfirmDialog` | Confirm button triggers confirm callback | Dialog open | Click **بله خروج** | `onConfirm` called once |

### Negative Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Invalid credentials in form | `LoginForm` + `authService.login` | Failed login surfaces error and blocks redirect | Login service mocked reject | Submit wrong credentials | Alert with server error text appears; navigation is not called |
| Empty username validation | `useLogin` | Username is required | Hook rendered | Submit with blank/whitespace username | Hook error: `نام کاربری الزامی است.`; no service call |
| Empty password validation | `useLogin` | Password is required | Hook rendered | Submit with empty password | Hook error: `رمز عبور الزامی است.`; no service call |
| Server login error propagation | `useLogin` + `authService.login` | Backend error is shown by hook state | Login service mocked reject | Submit credentials | Hook `error` equals server message; no navigation |

### Edge Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Closed dialog non-render | `LogoutConfirmDialog` | Dialog should not exist when closed | `isOpen=false` | Render component | `alertdialog` is absent |
| Cancel dialog via scrim close button | `LogoutConfirmDialog` | Cancel callback can be triggered from close control | Dialog open | Click close button (`بستن`) | `onCancel` called once |
| Cancel dialog via Escape key | `LogoutConfirmDialog` | Escape key cancels dialog | Dialog open | Fire `Escape` keydown on window | `onCancel` called once |

---


## 2. Announcements

### Positive Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Create announcement success | `AnnouncementForm` + `announcementService.createAnnouncement` | Supervisor submits a valid announcement | Supervisor auth context with access token; service mocked success | Fill title/content, click **ارسال اطلاعیه** | Service called with payload + token; success alert shown; navigates to `/supervisor/announcements` after timer |
| View announcements list | `AnnouncementsPage` + `announcementService.fetchAnnouncements` | Student sees fetched announcements | Student auth context; service mocked list | Render announcements page | Page heading appears; announcement title/content shown; fetch called with access token |

### Edge Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Delayed redirect after create | `AnnouncementForm` | Redirect is time-delayed after success toast | Fake timers enabled | Submit valid form, advance timers | Navigation occurs after configured delay |

---

## 2.3 Ideas & Voting

### Positive Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Like action from idea card | `IdeaCard` | Clicking like triggers vote callback with correct payload | Idea card rendered with idea data | Click **پسندیدن ایده** | `onVote` called with `(ideaId, "up")` |
| Feed vote state update | `useIdeasFeed` + `ideaService.fetchIdeas/voteIdea` | Successful vote updates local feed counters and user vote | Authenticated context; fetch + vote mocked success | Initialize hook, invoke `vote(ideaId, "up")` | Vote service called with token; local `likes_count` and `user_vote` updated |


### Edge Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Counter rendering in Persian numerals context | `IdeaCard` | Existing counts are shown and used before interaction | Idea with pre-filled counts | Render card and inspect vote count text | Count is displayed and then updated via callback path |

---

## 2.4 Student Requests (Booth, Cleaning, Item)

### Positive Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Submit booth request | `useBoothRequest` + `boothService.submitBoothRequest` | Authenticated student submits booth request | Authenticated context; service mocked success | Call `submitRequest` with valid booth form values | Service called with values + access token; success message set; navigates to `/my-requests` after timer |
| Submit cleaning request | `useCleaningRequest` + `cleaningService.submitCleaningRequest` | Authenticated student submits cleaning request | Authenticated context; service mocked success | Call `submitRequest` with form values and block/floor context | Service called with values + token + block/floor labels; success message set; navigates to `/my-requests` |
| Submit item request | `useItemRequest` + `itemService.submitItemRequest` | Authenticated student submits item request | Authenticated context with room assignment; service mocked success | Call `submitRequest` with item values | Service called with values + token; success message set; navigates to `/my-requests` |

### Negative Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Cleaning submit blocked when unauthenticated | `useCleaningRequest` | Unauthenticated user cannot submit cleaning request | `isAuthenticated=false`, no tokens | Call `submitRequest` | Error message shown; submit service not called; no navigation |
| Cleaning form missing required fields | `CleaningRequestForm` + `useCleaningRequest` schema | Required inputs are enforced at UI level | Form rendered without filling required fields | Click **ارسال درخواست نظافت** | Validation messages shown for block/floor/line/space/description |

### Edge Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Timed redirect after successful request submit | `useBoothRequest`, `useCleaningRequest`, `useItemRequest` | Success flow includes delayed route change | Fake timers enabled | Submit successfully, advance timers | Redirect to `/my-requests` occurs after delay |

---

## 2.5 Supervisor Request Management

### Positive Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Update request status success | `useSupervisorRequestUpdate` + `requestService.updateSupervisorRequestStatus` | Supervisor updates request status and response text | Authenticated context; service mocked success | Set form values (`status`, `supervisor_response`), submit item | Service called with token/type/id/payload; success toast shown; `onSuccess` called with updated item |

### Edge Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Payload shape for status update | `useSupervisorRequestUpdate` | Ensures expected request payload fields are forwarded | Valid item and form values | Submit update | Payload includes status and supervisor response in expected shape |

---

## 2.6 Classes (Student + Supervisor)

### Positive Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Student sees available classes and registers | `useClassRegistration` + `classService.fetchActiveClasses/fetchMyClasses/registerClass` | Hook loads classes, registers selected class, then refreshes data | Authenticated context; services mocked success | Initialize hook, call `registerInClass(classId)` | Register service called; success feedback shown; active/enrolled lists re-fetched |
| Supervisor creates class | `useSupervisorClassForm` + `supervisorClassService.createSupervisorClass` | Supervisor class form submits creation payload | Authenticated context; create service mocked success | Reset form with valid values, submit in create mode | Create service called; `onSuccess` called with created class and mode |

### Edge Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Post-registration refresh behavior | `useClassRegistration` | Hook refreshes multiple tabs after successful registration | Active/enrolled data mocked with sequential responses | Perform successful register action | Fetch for my-classes is triggered and active list reload count increases |

---

## 2.7 Supervisor Feedback (Ideas/Complaints)

### Positive Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Submit supervisor response | `useSupervisorFeedbackResponse` + `supervisorFeedbackService.respondToFeedback` | Supervisor responds to feedback item successfully | Authenticated context; response service mocked success | Set `response_text`, apply `"answered"` action | Service called with token/id/response text; success toast shown; `onSuccess` invoked; form value retained/reset to updated response |


### Edge Cases

| Feature name | Tested component/page/hook/service | Scenario description | Preconditions | Test steps | Expected result |
|---|---|---|---|---|---|
| Action-to-service mapping | `useSupervisorFeedbackResponse` | `"answered"` action maps to respond API call with typed payload | Valid feedback item + auth | Invoke `applyStatusAction(item, "answered")` | Correct service function invoked with expected arguments |

---

## 3. Positive, Negative, and Edge Case Coverage Summary

### Positive coverage highlights

- Login, logout, and navigation success paths
- Student request submissions (booth/cleaning/item)
- Announcement creation and listing
- Idea voting callback and feed-state update
- Supervisor request update, class creation, feedback response
- Student class registration with subsequent data refresh

### Negative coverage highlights

- Invalid login behavior (form + hook)
- Empty login credentials validation (hook)
- Cleaning request unauthenticated block
- Cleaning form required-field validation errors

### Edge coverage highlights

- Logout dialog rendering/cancel/escape behavior
- Timed redirects after successful create/submit flows
- Role-based access mismatch currently observed (student rendering supervisor dashboard)
- Hook-level payload/state refresh expectations after successful actions

---

## 4. UI and Interaction Coverage

### User interactions covered by tests

- Typing in text inputs/password fields
- Clicking submit/action buttons (login, create, vote, update status)
- Clicking navigation-triggering actions
- Opening and confirming/canceling logout dialog
- Keyboard interaction (`Escape`) for dialog cancel

### Form validation scenarios covered

- Login username required
- Login password required
- Cleaning request required fields:
  - block
  - floor
  - line
  - space type
  - description

### Navigation and routing scenarios covered

- Login success navigates to dashboard
- Logout confirmation navigates to login
- Successful student submissions navigate to `/my-requests`
- Successful announcement creation navigates to `/supervisor/announcements`
- MemoryRouter-based route rendering in tests for page-level scenarios

### State management scenarios covered

- **Auth context interactions**: login/logout method invocation and token usage
- **Hook local state transitions**:
  - loading/error/success message updates
  - feedback toast updates
  - idea vote count and `user_vote` state updates
  - classes list refresh after registration
- **Service-integration boundaries**:
  - proper request payloads passed to service functions
  - callback (`onSuccess`) invocation with updated domain objects

