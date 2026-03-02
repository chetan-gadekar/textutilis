import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import MainLayout from './MainLayout';
import StudentDashboard from '../dashboard/StudentDashboard';

const DashboardCard = ({ title, description, buttonText, onClick }) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-t-4 border-theme flex flex-col h-full font-poppins">
    <div className="p-6 flex-grow">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
    <div className="p-6 pt-0 mt-auto">
      <button
        onClick={onClick}
        className="w-full bg-theme hover:bg-theme-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
      >
        {buttonText}
      </button>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperInstructor, isInstructor, isStudent } = useAuth();

  // If student, show student dashboard
  if (isStudent) {
    return <StudentDashboard />;
  }

  const getRoleDashboard = () => {
    if (isAdmin) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Student Management"
            description="Manage student accounts, activate or deactivate students in the system."
            buttonText="Manage Students"
            onClick={() => navigate('/admin/students')}
          />
          <DashboardCard
            title="Faculty Management"
            description="Create, edit, and delete faculty users to maintain the organizational structure."
            buttonText="Manage Faculty"
            onClick={() => navigate('/admin/faculty')}
          />
          <DashboardCard
            title="Teaching Points"
            description="View and monitor teaching points from all instructors across different courses."
            buttonText="View Teaching Points"
            onClick={() => navigate('/admin/teaching-points')}
          />
        </div>
      );
    }

    if (isSuperInstructor) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Course Management"
            description="Create, edit, and delete courses. Organize curriculum structure effectively."
            buttonText="Manage Courses"
            onClick={() => navigate('/super-instructor/courses')}
          />
          <DashboardCard
            title="Course Content"
            description="Upload and manage course materials including videos, presentations, and text documents."
            buttonText="Manage Content"
            onClick={() => navigate('/super-instructor/courses')}
          />
          <DashboardCard
            title="Assignments"
            description="Create, publish, and manage assignments for students across your courses."
            buttonText="Manage Assignments"
            onClick={() => navigate('/super-instructor/courses')}
          />
        </div>
      );
    }

    if (isInstructor) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:max-w-4xl">
          <DashboardCard
            title="Today's Teaching Points"
            description="Update and record your daily teaching points and class progress."
            buttonText="Update Teaching Points"
            onClick={() => navigate('/instructor/teaching-points')}
          />
          <DashboardCard
            title="Review Assignments"
            description="Review and grade assignments submitted by students."
            buttonText="Review Assignments"
            onClick={() => navigate('/instructor/assignments')}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <MainLayout>
      <div className="font-poppins h-full">
        <div className="mb-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium text-gray-800 mb-2">
              Welcome, <span className="text-theme font-medium">{user?.name}</span>!
            </h1>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              Your Role:
              <span className="bg-theme/10 text-theme-dark px-3 py-1 rounded-md text-sm font-medium tracking-wide">
                {user?.role?.replace('_', ' ').toUpperCase()}
              </span>
            </p>
          </div>
          <div className="hidden md:block">
            <div className="h-16 w-16 bg-theme/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-theme" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {getRoleDashboard()}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
