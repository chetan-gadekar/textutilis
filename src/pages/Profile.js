import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updateProfile, reset } from '../redux/slices/authSlice';
import Spinner from '../components/Spinner';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const { name, email, address, password, confirmPassword } = formData;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success('Profile updated successfully');
    }

    dispatch(reset());
  }, [isError, isSuccess, message, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else if (name.length < 2 || name.length > 60) {
      toast.error('Name must be between 2 and 60 characters');
    } else if (address.length > 400) {
      toast.error('Address cannot exceed 400 characters');
    } else if (
      password &&
      (password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[!@#$%^&*]/.test(password))
    ) {
      toast.error(
        'Password must be at least 8 characters with one uppercase letter and one special character'
      );
    } else {
      const userData = {
        name,
        email,
        address,
      };

      if (password) {
        userData.password = password;
      }

      dispatch(updateProfile(userData));
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <section className="heading">
        <h1>User Profile</h1>
        <p>Update your information</p>
      </section>

      <section className="profile-details">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
              minLength="2"
              maxLength="60"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              className="form-control"
              id="address"
              name="address"
              value={address}
              onChange={onChange}
              required
              maxLength="400"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password (leave empty to keep current)</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              minLength="8"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              minLength="8"
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-block">
              Update Profile
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Profile; 