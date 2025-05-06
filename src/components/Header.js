import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../redux/slices/authSlice';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Shop Rating System</Link>
      </div>
      <ul>
        {user ? (
          <>
          {user.role=== "user" &&(
            <li>
              <Link to="/stores">Stores</Link>
            </li>
          )}
            {user.role === 'admin' && (
              <>
                <li>
                  <Link to="/admin/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/admin/users">Users</Link>
                </li>
                <li>
                  <Link to="/admin/stores">Stores</Link>
                </li>
                <li>
                  <Link to="/admin/ratings">Ratings</Link>
                </li>
              </>
            )}
            {user.role === 'storeOwner' && (
              <li>
                <Link to="/owner/dashboard">My Stores</Link>
              </li>
            )}
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <button className="btn" onClick={onLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </header>
  );
};

export default Header; 