import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StoresList from './pages/StoresList';
import StoreDetail from './pages/StoreDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import AdminStores from './pages/AdminStores';
import AdminRatings from './pages/AdminRatings';
import AddUser from './pages/AddUser';
import EditUser from './pages/EditUser';
import AddStore from './pages/AddStore';
import EditStore from './pages/EditStore';
import './App.css';

function App() {
  return (
    <>
      <Router>
        <div className="container">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/stores" element={<StoresList />} />
            <Route path="/store/:id" element={<StoreDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/stores" element={<AdminStores />} />
            <Route path="/admin/ratings" element={<AdminRatings />} />
            <Route path="/admin/add-user" element={<AddUser />} />
            <Route path="/admin/edit-user/:id" element={<EditUser />} />
            <Route path="/admin/add-store" element={<AddStore />} />
            <Route path="/admin/edit-store/:id" element={<EditStore />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
