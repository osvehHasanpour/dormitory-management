# Frontend E2E Test Scenarios

## Overview

This document defines the frontend end-to-end (E2E) test scenarios implemented for the Dormitory Management System.

The tests are implemented using **Playwright** and focus on validating the application's primary user workflows. The objective is to verify the core functionality of the system while keeping the test suite lightweight, maintainable, and suitable for Continuous Integration (CI).

Each test verifies one or more of the following:

* User interaction
* Navigation
* Authentication and authorization
* Form submission and validation
* UI behavior
* Success and error states

---

# 1. Authentication

## Scenario 1: Successful Login

**Preconditions**

* A valid user account exists.

**Expected Results**

* User is authenticated successfully.
* User is redirected to the Dashboard.

---

## Scenario 2: Invalid Login

**Expected Results**

* Authentication fails.
* An error message is displayed.
* User remains on the Login page.

---

## Scenario 3: Logout

**Preconditions**

* User is logged in.

**Expected Results**

* User session is terminated.
* User is redirected to the Login page.

---

# 2. Cleaning Requests

## Scenario 1: Submit a Cleaning Request

**Preconditions**

* User is logged in as a Student.

**Expected Results**

* Cleaning request is submitted successfully.

---

## Scenario 2: Submit a Cleaning Request with Missing Required Information

**Preconditions**

* User is logged in as a Student.

**Expected Results**

* Request is not submitted.
* Validation message is displayed.
* User remains on the Cleaning Request page.

---

# 3. Room Equipment Request

## Scenario 1: Submit an Equipment Request

**Preconditions**

* User is logged in as a Student.

**Expected Results**

* Equipment request is successfully submitted.

---

# 4. Booth Request

## Scenario 1: Submit a Booth Request

**Preconditions**

* User is logged in as a Student.

**Expected Results**

* Booth request is successfully submitted.

---

# 5. Class Registration

## Scenario 1: View Available Classes and Register

**Preconditions**

* User is logged in as a Student.
* At least one class has available capacity.

**Expected Results**

* Available classes are displayed.
* Registration succeeds.
* The selected class appears in the student's registered classes.

---

# 6. Announcements

## Scenario 1: Create an Announcement

**Preconditions**

* User is logged in as a Supervisor.

**Expected Results**

* Announcement is successfully created.
* It appears in the announcements list.

---

## Scenario 2: View Announcements

**Preconditions**

* User is logged in as a Student.

**Expected Results**

* Available announcements are displayed correctly.

---

# 7. Request Management

## Scenario 1: Update Request Status

**Preconditions**

* User is logged in as a Supervisor.
* At least one request exists.

**Expected Results**

* Request status is updated successfully.
* Updated status is displayed.

---

# 8. Class Management

## Scenario 1: Create a Class

**Preconditions**

* User is logged in as a Supervisor.

**Expected Results**

* Class is successfully created.
* The new class appears in the class list.

---

# 9. Ideas & Voting

## Scenario 1: Like an Idea

**Preconditions**

* User is logged in as a Student.
* At least one idea exists.

**Expected Results**

* Like is successfully recorded.
* Vote counter is updated.

---

# 10. Ideas Management

## Scenario 1: View and Respond to Ideas

**Preconditions**

* User is logged in as a Supervisor.
* At least one idea exists.

**Expected Results**

* Response is successfully saved.
* Updated response is displayed.

---

# 11. Role-Based Access

## Scenario 1: Unauthorized Access

**Preconditions**

* User is logged in as a Student.

**Expected Results**

* Student cannot access Supervisor-only pages.
* User is redirected or an authorization error is displayed.

---

# Implementation Requirements

Requirements:

- Organize tests by feature.
- Keep tests independent.
- Reuse authenticated sessions where appropriate.
- Otherwise use stable selectors.
- Do not use `waitForTimeout()`.
- Wait for navigation, network requests, or visible UI changes.
- Use reusable helper functions where appropriate.
- Use clear and descriptive test names.
