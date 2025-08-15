# Spec Tasks

This document breaks down the work required to implement the Problem Solving Flow spec.

## Tasks

- [x] 1. **Backend: Update Models & Database**
    - [x] 1.1 Add `is_hidden = models.BooleanField(default=False)` to the `TestCase` model in `backend/problems/models.py`.
    - [x] 1.2 Run `python manage.py makemigrations problems` to generate the migration file.
    - [x] 1.3 Run `python manage.py migrate` to apply the schema change to the database.

- [x] 2. **Backend: Implement API Logic**
    - [x] 2.1 Write tests for the `problem_detail` view to assert that it only returns test cases where `is_hidden` is `False`.
    - [x] 2.2 Write tests for the `submit_solution` view to ensure it correctly evaluates against all test cases (shown and hidden).
    - [x] 2.3 Update the `problem_detail` view/serializer in `backend/problems/views.py` to filter test cases before sending the response.
    - [x] 2.4 Implement the logic in the `submit_solution` view to fetch all test cases, iterate through them to judge the solution, and save the final result.
    - [x] 2.5 Run the `problems` app test suite to ensure all tests pass.

- [x] 3. **Frontend: Connect Problem Pages**
    - [x] 3.1 Write integration tests for the `Questions` and `QuestionDetail` pages to verify correct data rendering and state management.
    - [x] 3.2 Connect the `Questions.tsx` page to the `getProblems` API function to list all problems.
    - [x] 3.3 Connect the `QuestionDetail.tsx` page to the `getProblem` API function to display the description and shown test cases.
    - [x] 3.4 Ensure all related frontend tests pass.

- [x] 4. **Frontend: Implement Submission Flow**
    - [x] 4.1 Write integration tests for the code submission UI.
    - [x] 4.2 Connect the code editor and submit button in `QuestionDetail.tsx` to the `submitSolution` API function.
    - [x] 4.3 Display the submission result (e.g., "Accepted", "Wrong Answer") to the user in the UI.
    - [x] 4.4 Manually test the full problem-solving flow from listing problems to submitting a solution.