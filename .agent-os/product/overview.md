# JudgeFlow Product Overview

## Product Vision

JudgeFlow is an online judge platform that allows users to solve programming problems, participate in coding contests, and improve their programming skills. The platform provides a comprehensive environment for coding practice with features like real-time code execution, automated testing, and AI-powered code review.

## Target Users

- **Students**: Learning programming and preparing for technical interviews
- **Developers**: Practicing coding skills and preparing for coding interviews
- **Competitive Programmers**: Participating in coding contests and competitions
- **Educators**: Creating programming assignments and tracking student progress

## Main Idea

JudgeFlow is a full-stack web application that combines a React frontend with a Django backend to create a seamless coding practice environment. Users can browse programming problems, write and submit solutions, participate in contests, and receive AI-powered feedback on their code.

## Key Features

### Already Implemented

- User authentication (login/signup)
- Problem browsing and filtering
- Code execution environment supporting multiple languages
- Submission tracking and history
- Contest participation system
- Dashboard with user statistics
- Admin interface for managing content
- Full frontend-backend integration for all core features

### Planned Features

- AI-powered code review and suggestions (in progress)
- Social features (leaderboards, user profiles)
- Mobile-responsive design
- Advanced contest features (virtual contests, team contests)
- Problem creation tools for educators
- Integrated learning paths and tutorials

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Context API and TanStack Query
- **Testing**: Vitest with Testing Library

### Backend
- **Framework**: Django with Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production planned)
- **Authentication**: Django Session Authentication
- **API**: RESTful endpoints
- **Code Execution**: Subprocess-based execution with sandboxing
- **CORS**: django-cors-headers for cross-origin requests

### Infrastructure
- **Development Server**: Django development server
- **Frontend Server**: Vite development server
- **Deployment**: Manual deployment process (Docker planned)