# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-15-compiler-integration/spec.md

## Endpoints

### POST /api/compiler/run-code/

**Purpose:** Execute user code with provided input and return the output
**Request Body (JSON)**:
```json
{
  "code": "string",           // The code to execute
  "language": "string",       // Programming language (python, javascript, cpp)
  "input": "string"           // Optional input data for the program
}
```

**Response (Success - 200 OK)**:
```json
{
  "output": "string",         // Standard output from the program
  "error": "boolean"          // Whether the execution resulted in an error
}
```

**Response (Error - 400 Bad Request)**:
```json
{
  "error": "Invalid language or other validation error."
}
```

**Notes:** 
- The endpoint supports Python, JavaScript, and C++ code execution
- Execution is time-limited (10 seconds for execution, 30 seconds for compilation)
- The input field is optional and can be empty
- Error field is true if the program exited with a non-zero status or timed out

## Controllers

### run_code Controller

**Action:** Process code execution requests
**Business Logic:**
1. Parse the request body for code, language, and input
2. Validate the language is supported
3. Route to appropriate language execution function
4. Execute the code with provided input
5. Capture stdout/stderr and return results
6. Handle timeouts and execution errors gracefully

**Error Handling:**
- Language not supported: Return 400 with error message
- Execution timeout: Return result with timeout message and error=true
- Compilation failure: Return compilation errors with error=true
- Runtime errors: Return stderr output with error=true