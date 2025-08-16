# API Documentation

## Overview

The JudgeFlow API is a RESTful API that provides endpoints for user authentication, problem management, contest participation, and code execution. All endpoints are prefixed with `/api/` and return JSON responses.

## Authentication

Most endpoints require authentication. Authentication is handled through Django sessions. After successful login, a session cookie is set that must be included in subsequent requests.

### Login

**POST** `/api/accounts/login/`

Authenticate a user with username/email and password.

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string"
  }
}
```

### Signup

**POST** `/api/accounts/signup/`

Create a new user account.

**Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string"
  }
}
```

### Logout

**POST** `/api/accounts/logout/`

Log out the current user.

**Response**:
```json
{
  "success": true
}
```

### User Profile

**GET** `/api/accounts/profile/`

Get the current user's profile information.

**Response**:
```json
{
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string"
  }
}
```

### Dashboard Data

**GET** `/api/accounts/dashboard/`

Get dashboard data including user statistics and upcoming contests.

**Response**:
```json
{
  "stats": {
    "total_submissions": "integer",
    "accepted_submissions": "integer",
    "accuracy": "number",
    "total_problems": "integer",
    "solved_problems": "integer"
  },
  "upcoming_contests": [
    {
      "id": "integer",
      "name": "string",
      "start_time": "ISO datetime string"
    }
  ]
}
```

## Problems

### List Problems

**GET** `/api/problems/`

Get a list of problems with optional filtering.

**Query Parameters**:
- `search` (string): Search term to filter problems
- `tags` (string): Comma-separated list of tags
- `difficulty` (string): Filter by difficulty (easy, medium, hard)

**Response**:
```json
{
  "problems": [
    {
      "id": "integer",
      "title": "string",
      "difficulty": "string",
      "tags": ["string"]
    }
  ]
}
```

### Get Problem Detail

**GET** `/api/problems/{id}/`

Get detailed information about a specific problem.

**Response**:
```json
{
  "problem": {
    "id": "integer",
    "title": "string",
    "description": "string",
    "difficulty": "string",
    "constraints": "string",
    "tags": ["string"],
    "test_cases": [
      {
        "input_data": "string",
        "expected_output": "string"
      }
    ]
  }
}
```

### User Submissions

**GET** `/api/problems/submissions/`

Get all submissions for the current user.

**Response**:
```json
{
  "submissions": [
    {
      "id": "integer",
      "problem_id": "integer",
      "problem_title": "string",
      "status": "string",
      "language": "string",
      "runtime": "number",
      "submitted_at": "ISO datetime string"
    }
  ]
}
```

### Submission Detail

**GET** `/api/problems/submissions/{id}/`

Get detailed information about a specific submission.

**Response**:
```json
{
  "submission": {
    "id": "integer",
    "problem_id": "integer",
    "problem_title": "string",
    "code": "string",
    "language": "string",
    "status": "string",
    "runtime": "number",
    "memory": "number",
    "test_case_results": "object",
    "submitted_at": "ISO datetime string"
  }
}
```

## Compiler

### Run Code

**POST** `/api/compiler/run-code/`

Execute code in the playground environment.

**Request Body**:
```json
{
  "code": "string",
  "language": "string",
  "input": "string"
}
```

**Response**:
```json
{
  "output": "string",
  "error": "boolean"
}
```

### Submit Solution

**POST** `/api/compiler/submit-solution/`

Submit a solution to a problem for evaluation.

**Request Body**:
```json
{
  "problem_id": "integer",
  "code": "string",
  "language": "string"
}
```

**Response**:
```json
{
  "submission_id": "integer",
  "status": "string",
  "runtime": "number",
  "memory": "number",
  "test_results": "array"
}
```

## Contests

### List Contests

**GET** `/api/contests/`

Get a list of all contests.

**Response**:
```json
{
  "contests": [
    {
      "id": "integer",
      "name": "string",
      "start_time": "ISO datetime string",
      "end_time": "ISO datetime string",
      "problem_count": "integer",
      "is_active": "boolean"
    }
  ]
}
```

### Get Contest Detail

**GET** `/api/contests/{id}/`

Get detailed information about a specific contest.

**Response**:
```json
{
  "contest": {
    "id": "integer",
    "name": "string",
    "start_time": "ISO datetime string",
    "end_time": "ISO datetime string",
    "problems": [
      {
        "id": "integer",
        "title": "string",
        "difficulty": "string"
      }
    ],
    "is_active": "boolean"
  }
}
```

### Contest Submissions

**GET** `/api/contests/{id}/submissions/`

Get all submissions for the current user in a specific contest.

**Response**:
```json
{
  "submissions": [
    {
      "id": "integer",
      "problem_id": "integer",
      "problem_title": "string",
      "status": "string",
      "language": "string",
      "runtime": "number",
      "memory": "number",
      "submitted_at": "ISO datetime string"
    }
  ]
}
```

### Create Contest

**POST** `/api/contests/create/`

Create a new contest (requires authentication).

**Request Body**:
```json
{
  "name": "string",
  "start_time": "ISO datetime string",
  "end_time": "ISO datetime string",
  "problem_ids": ["integer"]
}
```

**Response**:
```json
{
  "id": "integer",
  "name": "string",
  "start_time": "ISO datetime string",
  "end_time": "ISO datetime string",
  "problem_count": "integer"
}
```

### Submit Contest Solution

**POST** `/api/contests/submit/`

Submit a solution to a contest problem for evaluation.

**Request Body**:
```json
{
  "contest_id": "integer",
  "problem_id": "integer",
  "code": "string",
  "language": "string"
}
```

**Response**:
```json
{
  "submission_id": "integer",
  "status": "string",
  "runtime": "number",
  "memory": "number",
  "test_results": "array"
}
```