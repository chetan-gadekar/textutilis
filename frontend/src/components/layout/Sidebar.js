import React, { createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronFirst,
  ChevronLast,
  MoreVertical,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  UserCircle,
  Briefcase,
  Users,
  FileText,
  PlusCircle,
  ShieldCheck
} from "lucide-react";
import logo from "../../assets/profile.jpeg";
import profile from "../../assets/logo.jpeg";
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

const SidebarContext = createContext();

export default function Sidebar({ open: expanded, onToggle }) {
  const { user, isAdmin, isSuperInstructor, isInstructor, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const setExpanded = () => {
    onToggle();
  };

  const menuItems = getMenuItems(isAdmin, isSuperInstructor, isInstructor, isStudent);

  return (
    <aside className="sidebar-container">
      <nav className="sidebar-nav">
        <div className="sidebar-header">
          <img
            // src={logo}
            // className={`sidebar-logo ${expanded ? "w-32" : "w-0"}`}
            // alt="Logo"
          />
          <button
            onClick={setExpanded}
            className="sidebar-toggle-btn"
          >
            {expanded ? <ChevronFirst size={25} /> : <ChevronLast size={25} />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded, navigate, location }}>
          <ul className="sidebar-list">
            {menuItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                text={item.text}
                path={item.path}
                active={location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))}
                alert={item.alert}
              />
            ))}
          </ul>
        </SidebarContext.Provider>

        <div className="sidebar-footer">
          <img
            src={profile}
            className="sidebar-profile-img"
            alt="Profile"
          />
          <div className={`sidebar-user-info ${expanded ? "w-52 ml-3" : "w-0"}`}>
            <div className="sidebar-user-details">
              <h4 className="sidebar-user-name">{user?.name || "User"}</h4>
              <span className="sidebar-user-email">{user?.email || "user@example.com"}</span>
            </div>
            <MoreVertical size={20} color="#4b5563" />
          </div>
        </div>
      </nav>
    </aside>
  );
}

function SidebarItem({ icon, text, path, active, alert }) {
  const { expanded, navigate } = useContext(SidebarContext);

  return (
    <li
      onClick={() => navigate(path)}
      className={`sidebar-item ${active ? "active" : ""}`}
    >
      {icon}
      <span className={`sidebar-item-text ${expanded ? "w-52 ml-3" : "w-0"}`}>
        {text}
      </span>
      {alert && (
        <div className={`sidebar-item-alert ${expanded ? "" : "collapsed"}`} />
      )}

      {!expanded && (
        <div className="sidebar-tooltip">
          {text}
        </div>
      )}
    </li>
  );
}

const getMenuItems = (isAdmin, isSuperInstructor, isInstructor, isStudent) => {
  if (isStudent) {
    return [
      { text: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
      { text: 'My Courses', icon: <BookOpen size={20} />, path: '/student/courses' },
      { text: 'Assignments', icon: <FileText size={20} />, path: '/student/assignments' },
      { text: 'My Profile', icon: <UserCircle size={20} />, path: '/student/profile' },
      { text: 'Career Services', icon: <Briefcase size={20} />, path: '/career-services' },
    ];
  }
  if (isAdmin) {
    return [
      { text: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
      { text: 'Students', icon: <Users size={20} />, path: '/admin/students' },
      { text: 'Faculty', icon: <GraduationCap size={20} />, path: '/admin/faculty' },
      { text: 'Teaching Points', icon: <FileText size={20} />, path: '/admin/teaching-points' },
    ];
  }
  if (isSuperInstructor) {
    return [
      { text: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
      { text: 'My Courses', icon: <BookOpen size={20} />, path: '/super-instructor/courses' },
      { text: 'Create Assignment', icon: <PlusCircle size={20} />, path: '/super-instructor/create-assignment' },
      { text: 'Review Assignments', icon: <FileText size={20} />, path: '/instructor/assignments' },
      { text: 'Teaching Points', icon: <ShieldCheck size={20} />, path: '/instructor/teaching-points' },
    ];
  }
  if (isInstructor) {
    return [
      { text: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
      { text: 'My Courses', icon: <BookOpen size={20} />, path: '/instructor/courses' },
      { text: 'Review Assignments', icon: <FileText size={20} />, path: '/instructor/assignments' },
    ];
  }
  return [];
};
