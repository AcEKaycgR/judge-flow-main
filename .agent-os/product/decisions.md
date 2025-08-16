# Technical Decisions

## Architecture Decisions

### 1. Separation of Frontend and Backend

**Decision**: Separate the frontend (React) and backend (Django) into distinct applications that communicate via REST API.

**Rationale**: 
- Enables independent development and scaling of frontend and backend teams
- Allows for different technology choices for frontend and backend
- Provides flexibility in deployment options
- Follows modern web development best practices

### 2. Monolithic Backend Architecture

**Decision**: Use Django monolithic architecture with separate apps for different domains.

**Rationale**:
- Django's app structure naturally separates concerns (accounts, problems, contests, compiler)
- Simpler deployment and development compared to microservices
- Leverages Django's built-in features (ORM, admin interface, authentication)
- Appropriate for the current scale and team size

### 3. REST API Design

**Decision**: Design a RESTful API with resource-based endpoints.

**Rationale**:
- REST is a well-understood architectural style
- Consistent with Django REST Framework best practices
- Enables easy integration with frontend and potential third-party clients
- Provides clear resource relationships and operations

### 4. Client-Side State Management

**Decision**: Use React Context API for global state and TanStack Query for server state.

**Rationale**:
- React Context API is sufficient for global application state (user auth, theme)
- TanStack Query provides excellent caching, synchronization, and error handling for server state
- Reduces boilerplate code for API interactions
- Improves performance with automatic caching and background updates

## Technology Choices

### 1. Frontend Framework

**Choice**: React with TypeScript

**Rationale**:
- Strong type safety with TypeScript
- Large ecosystem and community support
- Component-based architecture for UI development
- Good developer experience with Vite build tool

### 2. UI Component Library

**Choice**: shadcn/ui with Tailwind CSS

**Rationale**:
- Highly customizable components
- Consistent design system
- Tailwind CSS for utility-first styling
- Good accessibility support

### 3. Backend Framework

**Choice**: Django with Django REST Framework

**Rationale**:
- Rapid development with built-in admin interface
- Mature ecosystem with extensive documentation
- Strong security features
- Built-in user authentication and authorization

### 4. Database

**Choice**: SQLite for development, PostgreSQL planned for production

**Rationale**:
- SQLite requires no setup for development
- PostgreSQL is a robust, production-ready relational database
- Smooth migration path from SQLite to PostgreSQL
- Django ORM abstracts database differences

## Implementation Decisions

### 1. Code Execution Approach

**Decision**: Execute user code using subprocess calls with timeout limits

**Rationale**:
- Simple to implement and understand
- Supports multiple programming languages
- Provides basic isolation with timeouts
- Appropriate for development environment

**Future Considerations**: Container-based sandboxing for production

### 2. Authentication Method

**Decision**: Session-based authentication with CSRF protection

**Rationale**:
- Built into Django with strong security practices
- Simple to implement with Django REST Framework
- Appropriate for web application architecture
- Good browser support

### 3. Frontend Routing

**Decision**: Client-side routing with React Router

**Rationale**:
- Smooth user experience with single-page application
- Familiar pattern for React developers
- Good integration with React component lifecycle
- Supports nested routes and route parameters

### 4. AI Review Implementation

**Decision**: Placeholder AI Review app with future integration planned

**Rationale**:
- Feature identified as valuable but not critical for MVP
- Allows for future extensibility
- Backend app created but implementation deferred
- Frontend page created to demonstrate UI/UX vision

## Historical Context

The project was initially developed with a frontend that used mock data to simulate API responses. As the backend API was developed, the frontend was gradually connected to use real data. Most pages are now fully integrated with the backend, with the exception of the AI Review feature which is planned for future implementation.

The project follows an agile development approach with iterative improvements and continuous integration of frontend and backend components.