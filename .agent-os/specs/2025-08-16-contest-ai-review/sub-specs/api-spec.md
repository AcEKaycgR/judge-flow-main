# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-16-contest-ai-review/spec.md

## Endpoints

### GET /api/contests/

**Purpose:** Fetch list of all contests
**Parameters:** None
**Response:** 
```json
{
  "contests": [
    {
      "id": 1,
      "name": "Weekly Contest 387",
      "start_time": "2024-01-20T14:00:00Z",
      "end_time": "2024-01-20T15:30:00Z",
      "problem_count": 3,
      "is_active": false
    }
  ]
}
```
**Errors:** 500 Internal Server Error

### GET /api/contests/{contest_id}/

**Purpose:** Fetch details of a specific contest
**Parameters:** contest_id (path parameter)
**Response:**
```json
{
  "contest": {
    "id": 1,
    "name": "Weekly Contest 387",
    "start_time": "2024-01-20T14:00:00Z",
    "end_time": "2024-01-20T15:30:00Z",
    "problems": [
      {
        "id": 1,
        "title": "Two Sum",
        "difficulty": "easy"
      }
    ],
    "is_active": false
  }
}
```
**Errors:** 404 Not Found, 500 Internal Server Error

### POST /api/contests/submit/

**Purpose:** Submit a solution to a contest problem
**Parameters:** 
- contest_id (integer)
- problem_id (integer)
- code (string)
- language (string)
**Response:**
```json
{
  "submission_id": 1,
  "status": "accepted",
  "runtime": 0.01,
  "memory": 10.5
}
```
**Errors:** 400 Bad Request, 404 Not Found, 500 Internal Server Error

### POST /api/ai-review/

**Purpose:** Get AI review for a submission
**Parameters:**
- submission_id (integer, optional)
- code (string, optional)
- question_text (string, optional)
**Response:**
```json
{
  "feedback": "## Code Review\n\n### Strengths\n- Good use of HashMap for O(1) lookup time!\n\n### Areas for Improvement\n- Consider adding input validation for edge cases.\n- You could optimize memory usage by checking if the array length is less than 2.\n\n### Suggestions\n- Add comments explaining the algorithm approach\n- Consider handling edge cases explicitly\n- Great time complexity optimization!"
}
```
**Errors:** 400 Bad Request, 404 Not Found, 500 Internal Server Error

### GET /api/ai-review/{submission_id}/

**Purpose:** Get AI review for a specific submission
**Parameters:** submission_id (path parameter)
**Response:**
```json
{
  "feedback": "## Code Review\n\n### Strengths\n- Good use of HashMap for O(1) lookup time!\n\n### Areas for Improvement\n- Consider adding input validation for edge cases.\n- You could optimize memory usage by checking if the array length is less than 2.\n\n### Suggestions\n- Add comments explaining the algorithm approach\n- Consider handling edge cases explicitly\n- Great time complexity optimization!"
}
```
**Errors:** 404 Not Found, 500 Internal Server Error