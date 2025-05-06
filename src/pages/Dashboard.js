import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If user is logged in, redirect to appropriate dashboard
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'storeOwner') {
        navigate('/owner/dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <div className="dashboard">
      <section className="heading">
        <h1>Shop Rating System</h1>
        <p>Find and rate your favorite stores</p>
      </section>

      <section className="content">
        <div className="dashboard-welcome">
          <h2>Welcome to the Shop Rating System</h2>
          <p>
            This platform allows you to discover and rate stores in your area.
            Join our community today to share your experiences and help others
            find the best places to shop.
          </p>
          {!user && (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-block">
                Login
              </Link>
              <Link to="/register" className="btn btn-block">
                Register
              </Link>
            </div>
          )}
          <div className="action-buttons">
            <Link to="/stores" className="btn btn-block">
              Browse All Stores
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 