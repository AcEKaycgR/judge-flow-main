# JudgeFlow
[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![Django](https://img.shields.io/badge/django-5.2.5-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://reactjs.org/)

Welcome to **JudgeFlow** - where coding meets competition! 🚀

JudgeFlow is a comprehensive, full-stack competitive programming platform designed to help developers sharpen their skills, compete in coding challenges, and receive intelligent feedback on their solutions. Whether you're preparing for technical interviews, participating in coding contests, or just passionate about problem-solving, JudgeFlow provides the ultimate environment to elevate your coding game.

## 🌟 Key Features

### 💻 Code Execution Engine
- **Multi-language Support**: Execute code in Python, JavaScript, and more (easily extensible)
- **Secure Sandboxing**: Safe code execution using isolated environments
- **Real-time Results**: Instant feedback on code output and performance

### 🏆 Competitive Programming
- **Problem Repository**: Extensive collection of coding challenges categorized by difficulty
- **Contest Mode**: Host and participate in timed coding competitions
- **Leaderboards**: Real-time ranking systems for contests and overall performance

### 🤖 AI-Powered Code Review
- **Intelligent Feedback**: Get detailed analysis of your code quality and efficiency
- **Performance Insights**: Understand time and space complexity of your solutions
- **Learning Recommendations**: Personalized suggestions for improvement based on your progress

### 📊 Progress Tracking
- **Comprehensive Analytics**: Visualize your coding journey with detailed statistics
- **Skill Assessment**: Track improvement across different programming concepts
- **Achievement System**: Earn badges and milestones as you progress

### 🔐 Robust Authentication
- **Secure Login/Signup**: Industry-standard authentication with session management
- **Profile Management**: Personalized user dashboards and settings

## 🛠️ Tech Stack

### Backend
- **Django 5.2.5**: Robust Python web framework for API development
- **Django REST Framework**: Powerful toolkit for building Web APIs
- **SQLite**: Lightweight database for development (easily replaceable with PostgreSQL)
- **Docker**: Containerization for consistent deployment

### Frontend
- **React 18.3.1**: Modern JavaScript library for building user interfaces
- **TypeScript**: Strongly typed programming language that builds on JavaScript
- **Vite**: Next generation frontend tooling
- **Shadcn UI**: Beautifully designed components built with Radix UI and Tailwind CSS
- **React Router**: Declarative routing for React applications

### Code Execution
- **Node.js**: JavaScript runtime for executing user-submitted code
- **Sandboxing**: Secure execution environment for user code

### AI Integration
- **Google Gemini**: Advanced AI model for code review and analysis

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional, for containerization)
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/judgeflow.git
   cd judgeflow
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**:
   ```bash
   cd ../judge-flow-main
   npm install
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8000/api/

## 📁 Project Structure

```
judgeflow/
├── backend/                 # Django backend
│   ├── accounts/           # User authentication and profiles
│   ├── problems/           # Coding problems and test cases
│   ├── contests/           # Contest management
│   ├── compiler/           # Code execution engine
│   ├── ai_review/          # AI-powered code analysis
│   └── judgeflow/          # Main Django project settings
├── judge-flow-main/        # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React context providers
│   │   ├── lib/            # Utility functions and API clients
│   │   └── hooks/          # Custom React hooks
│   └── public/             # Static assets
```

## 🔧 Deployment

### Docker Deployment
```bash
# Build and run backend
cd backend
docker build -t judgeflow-backend .
docker run -d -p 8000:8000 judgeflow-backend

# Build and run frontend (Vercel recommended for production)
cd ../judge-flow-main
npm run build
```

### Environment Variables

Create `.env` files in both frontend and backend directories:
- Frontend: `VITE_API_BASE_URL` for backend API URL
- Backend: Database settings, secret keys, etc.


**Happy Coding!** 💻✨

*JudgeFlow - Level up your programming skills, one challenge at a time.*
