# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-15-user-authentication-e2e/spec.md

This spec defines the contract for the API endpoints in the `accounts` app that are required for user authentication.

## Endpoints

### `POST /api/accounts/signup/`

*   **Purpose**: To register a new user.
*   **Request Body (JSON)**:
    ```json
    {
      "username": "string",
      "email": "string",
      "password": "string"
    }
    ```
*   **Response (Success - 201 Created)**:
    ```json
    {
      "id": "integer",
      "username": "string",
      "email": "string"
    }
    ```
*   **Response (Error - 400 Bad Request)**:
    ```json
    {
      "error": "Username already exists."
    }
    // or other validation errors
    ```
*   **Notes**: Upon successful creation, the user should be logged in, and a session cookie should be set in the response headers.

### `POST /api/accounts/login/`

*   **Purpose**: To authenticate an existing user and start a session.
*   **Request Body (JSON)**:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
*   **Response (Success - 200 OK)**:
    ```json
    {
      "id": "integer",
      "username": "string",
      "email": "string"
      // other user profile data can be included
    }
    ```
*   **Response (Error - 401 Unauthorized)**:
    ```json
    {
      "error": "Invalid credentials"
    }
    ```
*   **Notes**: A successful response will include a `Set-Cookie` header for the session.

### `POST /api/accounts/logout/`

*   **Purpose**: To terminate the current user's session.
*   **Request Body**: Empty
*   **Response (Success - 200 OK)**:
    ```json
    {
      "message": "Logout successful."
    }
    ```
*   **Notes**: This request must be sent with the session cookie. The response will include headers to clear the cookie.

### `GET /api/accounts/profile/`

*   **Purpose**: To get the profile information of the currently authenticated user.
*   **Request Body**: None
*   **Response (Success - 200 OK)**:
    ```json
    {
      "id": "integer",
      "username": "string",
      "email": "string",
      "bio": "string",
      "avatar": "string_url"
    }
    ```
*   **Response (Error - 401 Unauthorized)**:
    ```json
    {
      "error": "Not authenticated"
    }
    ```
*   **Notes**: This endpoint will be used to verify if a user is already logged in when the application loads.
