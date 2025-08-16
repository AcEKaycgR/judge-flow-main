# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-16-ai-review-feature/spec.md

## Endpoints

### POST /api/ai-review/comprehensive-ai-review/

**Purpose:** Get a comprehensive AI review of the user's coding progress and performance
**Parameters:** None (authenticated user context)
**Response:** 
```json
{
  "feedback": "string",
  "overall_score": "number",
  "category_scores": "object",
  "trends": "object"
}
```
**Errors:** 
- 401: Unauthorized if user not authenticated

### POST /api/ai-review/problems/{problem_id}/ai-review/

**Purpose:** Get AI review for a specific problem submission
**Parameters:** 
- problem_id (path parameter)
- code (in request body)
**Response:** 
```json
{
  "feedback": "string",
  "overall_score": "number",
  "suggestions": "array",
  "issues": "array"
}
```
**Errors:** 
- 401: Unauthorized if user not authenticated
- 404: Problem not found

### GET /api/ai-review/user-progress/

**Purpose:** Get user progress data for visualization
**Parameters:** None (authenticated user context)
**Response:** 
```json
{
  "progress_data": "array",
  "category_breakdown": "object",
  "trends": "object"
}
```
**Errors:** 
- 401: Unauthorized if user not authenticated

## Controllers

- **AIReviewController** - Handle comprehensive AI review requests
- **ProblemAIReviewController** - Handle problem-specific AI review requests
- **ProgressTrackingController** - Handle user progress tracking requests

## Purpose

These endpoints will provide the backend functionality for the AI Review feature, allowing users to get feedback on their code submissions and track their progress over time. The endpoints will integrate with the existing authentication system and will only be accessible to authenticated users.