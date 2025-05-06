import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import Spinner from '../components/Spinner';

const AddUser = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'normal', // Default role
  });
  const [isLoading, setIsLoading] = useState(false);

  const { name, email, password, address, role } = formData;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      toast.error('Not authorized to access admin page');
      return;
    }
  }, [user, navigate]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      const token = user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const userData = {
        name,
        email,
        password,
        address,
        role,
      };

      await axios.post('http://localhost:5000/api/users', userData, config);

      toast.success('User created successfully');
      navigate('/admin/users');
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Error creating user';
      toast.error(message);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container">
      <section className="heading">
        <h1>Create New User</h1>
        <p>Add a new user to the system</p>
      </section>

      <section className="form">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={name}
              placeholder="Enter name"
              onChange={onChange}
              required
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
              placeholder="Enter email"
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              placeholder="Enter password"
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              className="form-control"
              id="address"
              name="address"
              value={address}
              placeholder="Enter address"
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              className="form-control"
              id="role"
              name="role"
              value={role}
              onChange={onChange}
            >
              <option value="normal">Normal User</option>
              <option value="storeOwner">Store Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-block">
              Create User
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AddUser; 