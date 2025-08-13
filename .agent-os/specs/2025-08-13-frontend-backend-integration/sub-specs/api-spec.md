# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-13-frontend-backend-integration/spec.md

## Endpoints

### POST /api/accounts/login/

**Purpose:** Authenticate a user and create a session
**Parameters:** 
- username (string, required)
- password (string, required)
**Response:** 
- success (boolean)
- user (object with id, username, email)
**Errors:** 
- 400 Bad Request - Invalid credentials

### POST /api/accounts/signup/

**Purpose:** Create a new user account
**Parameters:** 
- username (string, required)
- email (string, required)
- password (string, required)
**Response:** 
- success (boolean)
- user (object with id, username, email)
**Errors:** 
- 400 Bad Request - Username or email already exists

### POST /api/accounts/logout/

**Purpose:** Log out the current user
**Parameters:** None
**Response:** 
- success (boolean)
**Errors:** 
- 401 Unauthorized - User not authenticated

### GET /api/accounts/profile/

**Purpose:** Get the current user's profile information
**Parameters:** None
**Response:** 
- user (object with id, username, email)
**Errors:** 
- 401 Unauthorized - User not authenticated

### GET /api/accounts/dashboard/

**Purpose:** Get dashboard data including user stats and upcoming contests
**Parameters:** None
**Response:** 
- stats (object with total_submissions, accepted_submissions, accuracy, total_problems, solved_problems)
- upcoming_contests (array of contest objects)
**Errors:** 
- 401 Unauthorized - User not authenticated

### GET /api/problems/

**Purpose:** List problems with optional filtering
**Parameters:** 
- search (string, optional)
- tags (string, optional)
- difficulty (string, optional)
**Response:** 
- problems (array of problem objects)
**Errors:** None

### GET /api/problems/{id}/

**Purpose:** Get details for a specific problem
**Parameters:** None
**Response:** 
- problem (object with id, title, description, difficulty, constraints, sample_input, sample_output, tags)
**Errors:** 
- 404 Not Found - Problem not found

### POST /api/problems/submit/

**Purpose:** Submit a solution for a problem
**Parameters:** 
- problem_id (integer, required)
- code (string, required)
- language (string, required)
**Response:** 
- submission_id (integer)
- status (string)
- runtime (float)
- memory (float)
**Errors:** 
- 400 Bad Request - Invalid parameters
- 401 Unauthorized - User not authenticated

### GET /api/problems/submissions/

**Purpose:** Get user's submission history
**Parameters:** None
**Response:** 
- submissions (array of submission objects)
**Errors:** 
- 401 Unauthorized - User not authenticated

### GET /api/contests/

**Purpose:** List all contests
**Parameters:** None
**Response:** 
- contests (array of contest objects)
**Errors:** None

### GET /api/contests/{id}/

**Purpose:** Get details for a specific contest
**Parameters:** None
**Response:** 
- contest (object with id, name, start_time, end_time, problems, is_active)
**Errors:** 
- 404 Not Found - Contest not found

### POST /api/contests/submit/

**Purpose:** Submit a solution for a contest problem
**Parameters:** 
- contest_id (integer, required)
- problem_id (integer, required)
- code (string, required)
- language (string, required)
**Response:** 
- submission_id (integer)
- status (string)
- runtime (float)
- memory (float)
**Errors:** 
- 400 Bad Request - Invalid parameters
- 401 Unauthorized - User not authenticated

### POST /api/compiler/run-code/

**Purpose:** Execute code in the playground
**Parameters:** 
- code (string, required)
- language (string, required)
- input (string, optional)
**Response:** 
- output (string)
- error (boolean)
**Errors:** 
- 400 Bad Request - Invalid parameters

### POST /api/compiler/ai-review/

**Purpose:** Get AI review for code
**Parameters:** 
- submission_id (integer, optional)
- code (string, optional)
- problem_text (string, optional)
**Response:** 
- feedback (string)
**Errors:** 
- 400 Bad Request - Invalid parameters