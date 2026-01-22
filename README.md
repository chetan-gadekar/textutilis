# LMS - Learning Management System

A comprehensive Learning Management System with role-based access control.

## Features

### Roles
- **Admin**: Full system control, manage students and faculty
- **Super Instructor**: Create and manage courses, content, and assignments
- **Instructor**: Update teaching points and review assignments
- **Student**: View courses, track progress, submit assignments

### Backend Architecture

```
backend/
├── config/           # Database configuration
├── controllers/      # Request/response handlers
├── middlewares/      # Authentication, authorization, validation
├── routes/          # API routing
├── schemas/         # MongoDB schemas/models
├── services/        # Business logic layer
└── server.js        # Main server file
```

### Frontend Architecture

```
frontend/src/
├── components/      # React components
│   ├── auth/       # Authentication components
│   └── layout/     # Layout components
├── hooks/          # Custom React hooks
├── services/       # API service layer
├── store/          # Redux store and slices
└── utils/          # Utility functions
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
   - MongoDB URI
   - JWT Secret
   - Cloudflare Stream credentials

5. Start MongoDB server (if running locally)

6. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Create `.env` file (optional, for custom API URL):
```env
REACT_APP_API_URL=http://localhost:5002/api
```

4. Start the frontend development server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Admin Routes (`/api/admin/*`)
- `GET /api/admin/students` - Get all students
- `PATCH /api/admin/students/:id/toggle-status` - Activate/deactivate student
- `GET /api/admin/faculty` - Get all faculty
- `POST /api/admin/faculty` - Create faculty user
- `PUT /api/admin/faculty/:id` - Update faculty user
- `DELETE /api/admin/faculty/:id` - Delete faculty user
- `GET /api/admin/teaching-points` - Get all teaching points

### Super Instructor Routes (`/api/super-instructor/*`)
- `POST /api/super-instructor/courses` - Create course
- `GET /api/super-instructor/courses` - Get all courses
- `PUT /api/super-instructor/courses/:id` - Update course
- `DELETE /api/super-instructor/courses/:id` - Delete course
- `POST /api/super-instructor/courses/:courseId/content` - Create content
- `GET /api/super-instructor/courses/:courseId/content` - Get course content
- `PUT /api/super-instructor/content/:id` - Update content
- `DELETE /api/super-instructor/content/:id` - Delete content
- `POST /api/super-instructor/courses/:courseId/assignments` - Create assignment
- `GET /api/super-instructor/courses/:courseId/assignments` - Get assignments
- `PUT /api/super-instructor/assignments/:id` - Update assignment
- `DELETE /api/super-instructor/assignments/:id` - Delete assignment

### Instructor Routes (`/api/instructor/*`)
- `PUT /api/instructor/teaching-points/today` - Update today's teaching points
- `GET /api/instructor/teaching-points/today` - Get today's teaching points
- `GET /api/instructor/assignments/:assignmentId/submissions` - Get submissions

### Student Routes (`/api/student/*`)
- `GET /api/student/courses` - Get enrolled courses
- `GET /api/student/courses/:courseId/content` - Get course content
- `GET /api/student/courses/:courseId/progress` - Get course progress
- `POST /api/student/content/progress` - Save video progress
- `GET /api/student/assignments` - Get assignments
- `POST /api/student/assignments/:assignmentId/submit` - Submit assignment
- `GET /api/student/profile` - Get student profile with performance

### Video Routes (`/api/videos/*`)
- `POST /api/videos/upload` - Upload video to Cloudflare Stream
- `GET /api/videos/:videoId` - Get video details
- `GET /api/videos` - List all videos

## Development Guidelines

### Backend
- Controllers handle request/response
- Services contain business logic
- Schemas define database models
- Middlewares handle auth, validation, and errors

### Frontend
- Components are kept under 200-300 lines
- Services handle API calls
- Redux manages global state
- Protected routes enforce role-based access

## Security
- JWT authentication
- Role-based authorization
- Input validation and sanitization
- Password hashing with bcrypt

## Next Steps
- Implement detailed dashboard components for each role
- Add course enrollment functionality for admin
- Complete video progress tracking
- Add performance rating system
- Implement assignment submission and review UI
