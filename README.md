# JudgeFlow - Online Judge Platform

## Project Structure
- `judge-flow-main/` - React frontend (Vite + TypeScript)
- `backend/` - Django backend with REST API

## Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Activate the virtual environment:
   ```
   venv\Scripts\activate
   ```

3. Run the development server:
   ```
   python manage.py runserver
   ```

The backend will be available at http://localhost:8000

## Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd judge-flow-main
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

The frontend will be available at http://localhost:8080

## Connecting Frontend to Backend

The frontend is configured to proxy API requests to the backend. Make sure both servers are running:
- Frontend: http://localhost:8080
- Backend: http://localhost:8000

## API Endpoints

All API endpoints are prefixed with `/api/`:
- Authentication: `/api/accounts/`
- Problems: `/api/problems/`
- Contests: `/api/contests/`
- Compiler: `/api/compiler/`

## Development Workflow

1. Start the backend server
2. Start the frontend development server
3. Access the application at http://localhost:8080
4. API calls will automatically be proxied to the backend

## Admin Interface

Access the Django admin interface at http://localhost:8000/admin/
- Username: admin
- Password: admin

## Database

The project uses SQLite for development. The database file is located at `backend/db.sqlite3`.