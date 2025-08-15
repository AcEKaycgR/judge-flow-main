# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-15-problem-solving-flow/spec.md

This spec defines the contract for the API endpoints in the `problems` app.

## Endpoints

### `GET /api/problems/`

*   **Purpose**: To get a list of all available problems.
*   **Request Body**: None.
*   **Response (Success - 200 OK)**:
    ```json
    [
      {
        "id": "integer",
        "title": "string",
        "difficulty": "string",
        "tags": ["string"]
      }
    ]
    ```

### `GET /api/problems/<int:problem_id>/`

*   **Purpose**: To get the detailed information for a single problem.
*   **Request Body**: None.
*   **Response (Success - 200 OK)**: **(MODIFIED)** The `test_cases` array will ONLY include test cases where `is_hidden` is `False`.
    ```json
    {
      "id": "integer",
      "title": "string",
      "description": "string",
      "difficulty": "string",
      "tags": ["string"],
      "test_cases": [
        {
          "input": "string",
          "output": "string"
        }
      ]
    }
    ```

### `POST /api/problems/submit/`

*   **Purpose**: To submit a user's code for a specific problem to be judged.
*   **Request Body (JSON)**:
    ```json
    {
      "problem_id": "integer",
      "code": "string",
      "language": "string" // e.g., "python", "javascript", "cpp"
    }
    ```
*   **Response (Success - 200 OK)**:
    ```json
    {
      "submission_id": "integer",
      "status": "string" // e.g., "Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error"
    }
    ```
*   **Response (Error - 400 Bad Request)**:
    ```json
    {
      "error": "Invalid problem_id or other validation error."
    }
    ```
*   **Notes**: The backend will run the code against all test cases (shown and hidden) associated with the `problem_id` before returning the final status.
