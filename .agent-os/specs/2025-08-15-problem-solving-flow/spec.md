# Spec Requirements Document

> Spec: Problem Solving Flow
> Created: 2025-08-15
> Status: Planning

## Overview

This spec covers the end-to-end user journey for viewing and solving a programming problem. It involves connecting the frontend pages for listing and detailing problems to the backend API, and implementing the submission logic to judge code against both shown and hidden test cases.

## User Stories

### Browse Problems

*   **As a** user,
*   **I want to** see a list of all available problems,
*   **so that** I can choose one to solve.
*   **Details**: The `/problems` page should display a paginated list of problems with their titles, difficulties, and tags, fetched from the backend.

### View a Problem

*   **As a** user,
*   **I want to** select a problem and view its full description,
*   **so that** I can understand the requirements and prepare to solve it.
*   **Details**: The `/problems/<id>` page should show the problem's title, detailed description, constraints, and a few example (shown) test cases to help me understand the expected input/output format.

### Submit a Solution

*   **As a** user,
*   **I want to** write and submit my code for a specific problem,
*   **so that** I can see if my solution is correct.
*   **Details**: On the problem detail page, I should have a code editor to write my solution. When I submit, the code is sent to the backend and judged against a full set of test cases (both the shown examples and additional hidden ones). I should receive a final result, such as "Accepted", "Wrong Answer", "Time Limit Exceeded", etc.

## Spec Scope

1.  **Problems List Page**: Connect the `Questions.tsx` page to the `/api/problems/` endpoint to display a list of problems.
2.  **Problem Detail Page**: Connect the `QuestionDetail.tsx` page to the `/api/problems/<id>/` endpoint. The API response must be updated to include only the *shown* test cases.
3.  **Backend Test Case Model**: Modify the `TestCase` model in `problems/models.py` to include a boolean field, e.g., `is_hidden`, to differentiate between shown and hidden test cases.
4.  **Backend Submission View**: Update the `submit_solution` view in `problems/views.py`. It must fetch all test cases (shown and hidden) for the given problem and run the user's code against each of them.
5.  **Code Submission API**: The `submitSolution` function in `src/lib/api.ts` will be used to send the code from the frontend editor to the backend.
6.  **Display Result**: The frontend will display the final verdict from the backend after a submission is processed.

## Out of Scope

-   The complete implementation of the sandboxed code execution engine (this spec defines the interface to it, but not its internal build).
-   A detailed list of all past submissions for a problem.
-   Real-time submission status updates (the user will wait for the final result).

## Expected Deliverable

1.  Users can browse a list of problems fetched from the backend.
2.  Users can view a problem's details, including its description and example (shown) test cases.
3.  Users can submit code, which is then judged against all (shown and hidden) test cases on the backend.
4.  The frontend clearly displays the final result of the submission.
