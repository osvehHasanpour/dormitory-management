# Frontend Test Scenarios

## Overview

This document defines the required frontend end-to-end (E2E) test scenarios for the Dormitory Management System. The purpose of these scenarios is to provide comprehensive coverage of all major user interactions within the application.

The frontend implementation is already complete. These scenarios should be implemented as automated Playwright tests without modifying the existing application behavior.

Each scenario should validate:

- User interaction
- UI behavior
- Form validation
- Navigation
- Success and error states
- Role-based access where applicable

---

# 1. Authentication

## 1.1 Login

### Scenario 1: Successful Login

**Preconditions**

- A valid user account exists.

**Steps**

1. Open the Login page.
2. Enter a valid username.
3. Enter a valid password.
4. Click **Login**.

**Expected Results**

- Authentication succeeds.
- User is redirected to the Dashboard.
- User session is created.
- Protected pages become accessible.

---

### Scenario 2: Invalid Login

**Steps**

1. Open the Login page.
2. Enter an invalid username or password.
3. Click **Login**.

**Expected Results**

- Error message is displayed.
- User remains on the Login page.
- Authentication is not created.

---

## 1.2 Logout

### Scenario 1: Successful Logout

**Preconditions**

- User is logged in.

**Steps**

1. Click **Logout**.
2. Confirm the logout action.

**Expected Results**

- Session is terminated.
- User is redirected to the Login page.

---

### Scenario 2: Cancel Logout

**Preconditions**

- User is logged in.

**Steps**

1. Click **Logout**.
2. Cancel the confirmation dialog.

**Expected Results**

- User remains on the current page.
- Session remains active.

---

# 2. Cleaning Request

## Scenario 1: Successful Cleaning Request

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Cleaning Request page.
2. Complete all required fields.
3. Submit the request.

**Expected Results**

- Request is successfully created.
- Request appears in the student's request list.

---

## Scenario 2: Missing Required Information

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Open the Cleaning Request page.
2. Leave one or more required fields empty.
3. Submit the request.

**Expected Results**

- Request is not submitted.
- Validation errors are displayed.

---

# 3. Room Equipment Request

## Scenario 1: Successful Equipment Request

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Room Equipment Request page.
2. Select the requested equipment.
3. Complete all required fields.
4. Submit the request.

**Expected Results**

- Request is successfully submitted.

---

## Scenario 2: Missing Required Information

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Room Equipment Request page.
2. Leave one or more required fields empty.
3. Submit the request.

**Expected Results**

- Request is rejected.
- Validation errors are displayed.

---

# 4. Maintenance Report

## Scenario 1: Submit Report Without Image

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Maintenance Report page.
2. Complete all required fields.
3. Submit the report.

**Expected Results**

- Report is successfully submitted.

---

## Scenario 2: Submit Report With Image

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Maintenance Report page.
2. Complete all required fields.
3. Upload an image.
4. Submit the report.

**Expected Results**

- Uploaded image is attached to the report.

---

## Scenario 3: Missing Required Information

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Maintenance Report page.
2. Leave one or more required fields empty.
3. Submit the report.

**Expected Results**

- Report is not submitted.
- Validation errors are displayed.

---

# 5. Booth Request

## Scenario 1: Successful Booth Request

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Booth Request page.
2. Complete all required fields.
3. Submit the request.

**Expected Results**

- Booth request is successfully submitted.

---

## Scenario 2: Missing Required Information

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Booth Request page.
2. Leave one or more required fields empty.
3. Submit the request.

**Expected Results**

- Request is rejected.
- Validation errors are displayed.

# 6. Class Registration

## Scenario 1: Register for a Class with Available Capacity

**Preconditions**

- User is logged in as a Student.
- At least one class has available capacity.

**Steps**

1. Navigate to the Class Registration page.
2. Select a class with available seats.
3. Click **Register**.

**Expected Results**

- Registration is successful.
- The class appears in the student's registered classes.
- The remaining class capacity decreases.

---

## Scenario 2: Register for a Full Class

**Preconditions**

- User is logged in as a Student.
- The selected class has reached maximum capacity.

**Steps**

1. Navigate to the Class Registration page.
2. Select a full class.
3. Click **Register**.

**Expected Results**

- Registration fails.
- A suitable message is displayed.
- Student is not registered.

---

## Scenario 3: No Available Classes

**Preconditions**

- User is logged in as a Student.
- No classes are available.

**Steps**

1. Navigate to the Class Registration page.

**Expected Results**

- An empty state is displayed.
- An appropriate message informs the user that no classes are currently available.

---

# 7. Create Announcement

## Scenario 1: Successful Announcement Creation

**Preconditions**

- User is logged in as a Supervisor.

**Steps**

1. Navigate to the Announcements page.
2. Click **Create Announcement**.
3. Complete all required fields.
4. Submit the announcement.

**Expected Results**

- Announcement is successfully created.
- New announcement appears in the announcements list.

---

## Scenario 2: Missing Required Information

**Preconditions**

- User is logged in as a Supervisor.

**Steps**

1. Navigate to the Create Announcement page.
2. Leave one or more required fields empty.
3. Submit the form.

**Expected Results**

- Announcement is not created.
- Validation errors are displayed.

---

# 8. View Announcements

## Scenario 1: Announcements Available

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Announcements page.

**Expected Results**

- All available announcements are displayed.
- Announcement information is shown correctly.

---

## Scenario 2: No Announcements Available

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Announcements page.

**Expected Results**

- Empty state is displayed.
- Appropriate message informs the user that no announcements are available.

---

# 9. Request Management (Supervisor)

## Scenario 1: View Requests

**Preconditions**

- User is logged in as a Supervisor.

**Steps**

1. Navigate to the Requests Dashboard.

**Expected Results**

- List of submitted requests is displayed.
- Request information is shown correctly.

---

## Scenario 2: No Requests Available

**Preconditions**

- User is logged in as a Supervisor.

**Steps**

1. Navigate to the Requests Dashboard.

**Expected Results**

- Empty state is displayed.

---

## Scenario 3: Update Request Status

**Preconditions**

- User is logged in as a Supervisor.
- At least one request exists.

**Steps**

1. Open a request.
2. Change its status.
3. Save changes.

**Expected Results**

- Status is updated successfully.
- Updated status is visible in the request list.

---

## Scenario 4: Respond to a Request

**Preconditions**

- User is logged in as a Supervisor.
- At least one request exists.

**Steps**

1. Open a request.
2. Enter a response.
3. Save the response.

**Expected Results**

- Response is saved successfully.
- Response is displayed with the request.

---

# 10. Suggestions & Complaints

## Scenario 1: Successful Submission

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Suggestions & Complaints page.
2. Complete all required fields.
3. Submit the form.

**Expected Results**

- Submission is successful.

---

## Scenario 2: Missing Required Information

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Suggestions & Complaints page.
2. Leave one or more required fields empty.
3. Submit the form.

**Expected Results**

- Submission is rejected.
- Validation errors are displayed.

---

# 11. Suggestions & Complaints Management (Supervisor)

## Scenario 1: View Suggestions & Complaints

**Preconditions**

- User is logged in as a Supervisor.

**Steps**

1. Navigate to the Suggestions & Complaints page.

**Expected Results**

- List of submissions is displayed.
- Each record contains the required information.

---

## Scenario 2: No Records Available

**Preconditions**

- User is logged in as a Supervisor.

**Steps**

1. Navigate to the Suggestions & Complaints page.

**Expected Results**

- Empty state is displayed.

---

## Scenario 3: Submit a Response

**Preconditions**

- User is logged in as a Supervisor.
- At least one submission exists.

**Steps**

1. Open a suggestion or complaint.
2. Enter a response.
3. Save the response.

**Expected Results**

- Response is successfully saved.
- Response is visible to the student.

---

# 12. Ideas & Voting

## Scenario 1: Like an Idea

**Preconditions**

- User is logged in as a Student.
- At least one idea exists.

**Steps**

1. Navigate to the Ideas page.
2. Open an idea.
3. Click **Like**.

**Expected Results**

- Like is successfully recorded.
- Vote counter increases.

---

## Scenario 2: Dislike an Idea

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Open an idea.
2. Click **Dislike**.

**Expected Results**

- Dislike is recorded.
- Vote counter updates correctly.

---

## Scenario 3: Remove Vote

**Preconditions**

- User has already voted.

**Steps**

1. Click the selected vote again.

**Expected Results**

- Vote is removed.
- Vote counter updates correctly.

---

## Scenario 4: No Ideas Available

**Preconditions**

- User is logged in as a Student.

**Steps**

1. Navigate to the Ideas page.

**Expected Results**

- Empty state is displayed.
- Appropriate message informs the user that no ideas are available.

# 13. Class Management

## Scenario 1: Create a New Class

**Preconditions**

- User is logged in as a Supervisor.

**Steps**

1. Navigate to the Class Management page.
2. Click **Create Class**.
3. Complete all required fields.
4. Submit the form.

**Expected Results**

- Class is successfully created.
- Newly created class appears in the class list.

---

## Scenario 2: Missing Required Information

**Preconditions**

- User is logged in as a Supervisor.

**Steps**

1. Navigate to the Create Class page.
2. Leave one or more required fields empty.
3. Submit the form.

**Expected Results**

- Class is not created.
- Validation errors are displayed.

---

## Scenario 3: Edit a Class

**Preconditions**

- User is logged in as a Supervisor.
- At least one class exists.

**Steps**

1. Navigate to the Class Management page.
2. Select an existing class.
3. Modify one or more fields.
4. Save the changes.

**Expected Results**

- Class information is successfully updated.
- Updated information is visible in the class list.

---

## Scenario 4: Cancel a Class

**Preconditions**

- User is logged in as a Supervisor.
- At least one class exists.

**Steps**

1. Navigate to the Class Management page.
2. Select a class.
3. Click **Cancel Class**.
4. Confirm the action.

**Expected Results**

- Class status changes to **Cancelled**.
- Updated status is displayed.

---

## Scenario 5: View Class List

**Preconditions**

- User is logged in as a Supervisor.

**Steps**

1. Navigate to the Class Management page.

**Expected Results**

- List of classes is displayed.
- Class information is shown correctly.

---

# 14. Class Rating

## Scenario 1: Submit a Rating

**Preconditions**

- User is logged in as a Student.
- Student has completed at least one class.

**Steps**

1. Navigate to **My Classes**.
2. Open a completed class.
3. Select a rating between 1 and 5.
4. Submit the rating.

**Expected Results**

- Rating is successfully saved.

---

## Scenario 2: Class Not Completed

**Preconditions**

- User is logged in as a Student.
- Student has an ongoing class.

**Steps**

1. Navigate to **My Classes**.
2. Open an ongoing class.

**Expected Results**

- Rating functionality is unavailable.
- User cannot submit a rating.

---

## Scenario 3: No Rating Selected

**Preconditions**

- User is logged in as a Student.
- Completed class exists.

**Steps**

1. Open the rating page.
2. Submit without selecting a rating.

**Expected Results**

- Rating is not submitted.
- Validation error is displayed.

---



# General Testing Requirements

Every implemented Playwright test should verify the actual behavior of the application.

Each feature should include tests for:

- Successful user flow
- Form validation
- Required field validation
- Navigation
- Success messages
- Error messages
- Empty states (where applicable)
- Role-based access (where applicable)

The generated tests should not only verify page rendering but also ensure that user interactions produce the expected application behavior.

---

# Playwright Guidelines

The testing implementation should follow these principles:

- Use Playwright with TypeScript.
- Organize tests by feature.
- Keep tests independent.
- Reuse authenticated sessions whenever possible.
- Prefer `data-testid` selectors when available.
- Otherwise use stable selectors.
- Avoid using `waitForTimeout()`.
- Wait for page navigation, network requests, or visible UI changes.
- Generate reusable helper functions when appropriate.
- Use clear and descriptive test names.

---

# Expected Deliverables

The frontend testing implementation should include:

- Playwright configuration.
- Authentication setup.
- End-to-end tests for all scenarios defined in this document.
- Reusable helper utilities.
- Test fixtures when appropriate.
- HTML test reporting.
- Required package.json scripts.
- GitHub Actions workflow for automated execution.

---

# Acceptance Criteria

The implementation will be considered complete when:

- All scenarios in this document have corresponding Playwright tests.
- All tests execute successfully.
- Tests are independent and maintainable.
- The frontend builds successfully.
- The CI workflow executes all frontend tests automatically.
- The Playwright report is generated after each test run.
- No existing application functionality has been modified.
