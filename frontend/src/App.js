import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
// Navbar is now integrated into MainLayout
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/layout/Dashboard';
import ProtectedRoute from './utils/ProtectedRoute';
import './App.css';

// Admin components
import StudentManagement from './components/admin/StudentManagement';
import FacultyManagement from './components/admin/FacultyManagement';
import TeachingPointsView from './components/admin/TeachingPointsView';

// Super Instructor components
import CourseManagement from './components/superInstructor/CourseManagement';
import CourseStructureManager from './components/superInstructor/CourseStructureManager';
import CreateAssignment from './components/superInstructor/CreateAssignment';

// Instructor components
import TeachingPointsUpdate from './components/instructor/TeachingPointsUpdate';
import AssignmentReview from './components/instructor/AssignmentReview';
import InstructorCourses from './components/instructor/InstructorCourses';

// Student components
import CourseView from './components/student/CourseView';
import CourseDashboard from './components/student/CourseDashboard';
import CourseDetail from './components/student/CourseDetail';
import AssignmentView from './components/student/AssignmentView';
import StudentProfile from './components/student/StudentProfile';

const App = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getMe());
    }
  }, [token, isAuthenticated, dispatch]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faculty"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FacultyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teaching-points"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TeachingPointsView />
              </ProtectedRoute>
            }
          />
          {/* Super Instructor Routes */}
          <Route
            path="/super-instructor/courses"
            element={
              <ProtectedRoute allowedRoles={['super_instructor']}>
                <CourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-instructor/courses/:courseId/structure"
            element={
              <ProtectedRoute allowedRoles={['super_instructor']}>
                <CourseStructureManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-instructor/create-assignment"
            element={
              <ProtectedRoute allowedRoles={['super_instructor']}>
                <CreateAssignment />
              </ProtectedRoute>
            }
          />
          {/* Instructor Routes */}
          <Route
            path="/instructor/teaching-points"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'super_instructor']}>
                <TeachingPointsUpdate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/assignments"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'super_instructor']}>
                <AssignmentReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'super_instructor']}>
                <InstructorCourses />
              </ProtectedRoute>
            }
          />
          {/* Student Routes */}
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CourseView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses/:courseId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CourseDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses/:courseId/old"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AssignmentView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
