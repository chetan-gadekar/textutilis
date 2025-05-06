import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import Spinner from '../components/Spinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      toast.error('Not authorized to access admin dashboard');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = user.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch dashboard data
        const dashboardResponse = await axios.get(
          'http://localhost:5000/api/users/dashboard',
          config
        );

        setDashboardData(dashboardResponse.data);
        setIsLoading(false);
      } catch (error) {
        toast.error('Error fetching dashboard data');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="dashboard">
      <section className="heading">
        <h1>Admin Dashboard</h1>
        <p>System Overview</p>
      </section>

      {dashboardData && (
        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{dashboardData.users.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{dashboardData.users.admin}</div>
            <div className="stat-label">Admin Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{dashboardData.users.normal}</div>
            <div className="stat-label">Normal Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{dashboardData.users.storeOwners}</div>
            <div className="stat-label">Store Owners</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{dashboardData.stores}</div>
            <div className="stat-label">Total Stores</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{dashboardData.ratings}</div>
            <div className="stat-label">Total Ratings</div>
          </div>
        </section>
      )}

      <section className="dashboard-actions">
        <button className="btn" onClick={() => navigate('/admin/stores')}>
          Manage Stores
        </button>
        <button className="btn" style={{ marginLeft: '10px' }} onClick={() => navigate('/admin/users')}>
          Manage Users
        </button>
      </section>
    </div>
  );
};

export default AdminDashboard; 