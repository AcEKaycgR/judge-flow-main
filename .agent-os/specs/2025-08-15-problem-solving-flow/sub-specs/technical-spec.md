# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-15-problem-solving-flow/spec.md

## Technical Requirements

### Backend

1.  **Model Modification**: Add `is_hidden = models.BooleanField(default=False)` to the `TestCase` model in `problems/models.py`.
2.  **Database Migration**: Generate and run a migration for the `problems` app to apply the model change.
3.  **Problem Detail View (`problem_detail`)**: This view must be updated to serialize and return only the test cases where `is_hidden` is `False`.
4.  **Submission View (`submit_solution`)**: This view is the core of the logic. It must:
    *   Receive the user's code and language.
    *   Retrieve *all* test cases for the associated problem (both hidden and shown).
    *   For each test case, it will invoke the code execution service (which is out of scope to build, but this view will be its client).
    *   Compare the output of the user's code with the `output` of the `TestCase`.
    *   Keep track of the results. If any test case fails, the process stops, and the appropriate verdict (e.g., "Wrong Answer") is determined.
    *   If all test cases pass, the verdict is "Accepted".
    *   Create a `Submission` record with the final verdict.
    *   Return the final verdict to the frontend.

### Frontend

1.  **Problems List Page (`Questions.tsx`)**:
    *   Use `useQuery` from `@tanstack/react-query` to fetch data from the `getProblems` function in `src/lib/api.ts`.
    *   Display a loading state while fetching.
    *   Render the list of problems, with links to the detail page for each.
2.  **Problem Detail Page (`QuestionDetail.tsx`)**:
    *   Use `useQuery` to fetch data from the `getProblem(id)` function.
    *   The page will display the problem's description, constraints, and the *shown* test cases returned by the API.
    *   It will contain a code editor component (e.g., using Monaco or CodeMirror if available, otherwise a simple `<textarea>`).
    *   A "Submit" button will trigger the `submitSolution` API call.
3.  **API Functions (`src/lib/api.ts`)**:
    *   The `getProblems` and `getProblem` functions already exist and can be used as-is.
    *   The `submitSolution` function also exists and will be used to send the problem ID, code, and language to the backend.
4.  **Type Definitions**: Create TypeScript types for the `Problem` and `TestCase` objects to ensure type safety.

## External Dependencies

No new external dependencies are anticipated.
