# Task List: Connect Frontend to Backend

## Current Status
- Backend is implemented with Django and separated into multiple apps (accounts, problems, contests, compiler)
- Frontend is implemented with React and currently uses mock data
- Both frontend and backend exist in the same repository but are not connected

## Tasks to Complete

### 1. Backend Implementation
- [x] Create Django project structure
- [x] Create separate apps (accounts, problems, contests, compiler)
- [x] Implement models for each app
- [x] Create API endpoints for all functionality
- [x] Implement authentication endpoints
- [x] Implement problems CRUD endpoints
- [x] Implement contests endpoints
- [x] Implement code execution endpoints
- [x] Implement AI review endpoints
- [x] Create admin interface
- [x] Run database migrations
- [x] Create superuser

### 2. Frontend API Integration
- [ ] Create API client service
- [ ] Replace mock data with real API calls in:
  - [ ] Dashboard page
  - [ ] Questions page
  - [ ] Question detail page
  - [ ] Playground page
  - [ ] Submissions page
  - [ ] AI Review page
  - [ ] Contests page
  - [ ] Login/Signup pages
- [ ] Implement authentication flow
- [ ] Handle loading states and error messages
- [ ] Add proper type definitions for API responses

### 3. Data Structure Alignment
- [ ] Ensure frontend types match backend models
- [ ] Update frontend components to handle real data
- [ ] Implement proper error handling for API calls
- [ ] Add loading indicators for async operations

### 4. Authentication Integration
- [ ] Implement login page with real API call
- [ ] Implement signup page with real API call
- [ ] Add authentication state management
- [ ] Protect routes that require authentication
- [ ] Implement logout functionality
- [ ] Add user profile page

### 5. Code Execution Integration
- [ ] Connect playground page to backend compiler
- [ ] Connect question detail page to backend compiler
- [ ] Implement real-time output display
- [ ] Handle execution errors and timeouts

### 6. Database Seeding
- [ ] Create sample problems in database
- [ ] Create sample contests in database
- [ ] Create sample tags in database
- [ ] Add proper test data for development

### 7. Testing
- [ ] Test all API endpoints
- [ ] Test frontend integration with backend
- [ ] Test authentication flow
- [ ] Test code execution functionality
- [ ] Test error handling

## API Endpoint Mapping

### Authentication
- POST /api/accounts/login/ - User login
- POST /api/accounts/signup/ - User signup
- POST /api/accounts/logout/ - User logout
- GET /api/accounts/profile/ - Get user profile
- GET /api/accounts/dashboard/ - Get dashboard data

### Problems
- GET /api/problems/ - List problems with filtering
- GET /api/problems/{id}/ - Get problem details
- POST /api/problems/submit/ - Submit solution
- GET /api/problems/submissions/ - Get user submissions

### Contests
- GET /api/contests/ - List contests
- GET /api/contests/{id}/ - Get contest details
- POST /api/contests/submit/ - Submit contest solution

### Compiler
- POST /api/compiler/run-code/ - Run code in playground
- POST /api/compiler/ai-review/ - Get AI review for code

## Frontend Pages to Update

1. Dashboard - Fetch real user stats and upcoming contests
2. Questions - Fetch real problems from backend
3. Question Detail - Fetch real problem details and submit solutions
4. Playground - Connect to backend compiler
5. Submissions - Fetch real submission history
6. AI Review - Connect to backend AI review
7. Contests - Fetch real contests and details
8. Login - Connect to backend authentication
9. Signup - Connect to backend authentication

## Additional Considerations

1. CORS configuration for development
2. Proper error handling and user feedback
3. Loading states for all async operations
4. Session management and token handling
5. Environment variables for API base URL
6. Proper form validation
7. Responsive design preservation
8. Performance optimization for large datasets