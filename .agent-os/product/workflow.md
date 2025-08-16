# Development Workflow

## Project Structure

The JudgeFlow project is organized as a monorepo with separate frontend and backend components:

```
judge-flow-main/
├── backend/                  # Django backend application
│   ├── accounts/            # User authentication and profile management
│   ├── problems/            # Problem management and submission handling
│   ├── contests/            # Contest management and participation
│   ├── compiler/            # Code execution and compilation services
│   ├── ai_review/           # AI code review (empty, pending implementation)
│   ├── judgeflow/           # Main Django project configuration
│   ├── manage.py            # Django management script
│   ├── requirements.txt     # Python dependencies
│   └── db.sqlite3           # Development database
├── judge-flow-main/         # React frontend application
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utility functions and API client
│   │   ├── contexts/        # React context providers
│   │   ├── data/            # Mock data (mostly replaced with API calls)
│   │   ├── types/           # TypeScript type definitions
│   │   └── hooks/           # Custom React hooks
│   ├── public/              # Static assets
│   ├── package.json         # Node.js dependencies
│   └── vite.config.ts       # Vite configuration
├── README.md                # Project overview and setup instructions
└── task.md                  # Task tracking and integration checklist
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment:
   ```bash
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run database migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```bash
   python manage.py runserver
   ```

The backend will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd judge-flow-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:8080

## Development Process

### 1. Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch for ongoing development
- Feature branches: Created from `develop` for specific features
- Hotfix branches: Created from `main` for urgent fixes

### 2. Code Review Process

1. Create a feature branch from `develop`
2. Implement the feature with appropriate tests
3. Ensure code follows established patterns and conventions
4. Create a pull request to merge into `develop`
5. Request review from team members
6. Address feedback and make necessary changes
7. Merge after approval

### 3. Testing

#### Backend Testing
- Unit tests for model methods and utility functions
- Integration tests for API endpoints
- Run tests with: `python manage.py test`

#### Frontend Testing
- Unit tests for components and utility functions
- Integration tests for user flows
- Run tests with: `npm run test`

### 4. API Integration

Most frontend pages are already connected to the backend API:

- Dashboard page ✅
- Questions page ✅
- Question detail page ✅
- Playground page ✅
- Submissions page ✅
- Contests page ✅
- Contest detail page ✅
- Login/Signup pages ✅
- AI Review page ❌ (pending backend implementation)

### 5. Deployment

#### Development
- Run both frontend and backend servers simultaneously
- Frontend proxies API requests to backend
- Database is SQLite for simplicity

#### Production (Planned)
- Docker containers for frontend and backend
- PostgreSQL database
- Nginx reverse proxy
- SSL termination
- Monitoring and logging

## Coding Standards

### Backend (Python/Django)

- Follow PEP 8 style guide
- Use type hints where appropriate
- Write docstrings for public functions and classes
- Keep functions focused and small
- Use Django's ORM instead of raw SQL
- Handle exceptions appropriately

### Frontend (TypeScript/React)

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent component structure
- Use meaningful variable and function names
- Keep components focused and small
- Use TypeScript interfaces for props and state

## Database Management

### Migrations

- Create migrations after model changes:
  ```bash
  python manage.py makemigrations
  ```

- Apply migrations:
  ```bash
  python manage.py migrate
  ```

### Seeding

- Use Django management commands for data seeding
- Create sample problems and contests for development
- Ensure consistent test data across environments

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure `localhost:8080` is in `CORS_ALLOWED_ORIGINS`
2. **CSRF verification failed**: Check that CSRF tokens are properly included in requests
3. **Database locked**: Ensure only one Django development server is running
4. **Module not found**: Verify virtual environment is activated and dependencies are installed

### Debugging Tips

1. Use Django's debug toolbar for backend debugging
2. Use browser developer tools for frontend debugging
3. Check browser network tab for API request/response details
4. Use console.log statements in frontend code
5. Use print statements or debugger in backend code