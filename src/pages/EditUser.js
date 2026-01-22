import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import Spinner from '../components/Spinner';

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'normal',
  });
  const [isLoading, setIsLoading] = useState(true);

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

    // Fetch user data
    const fetchUser = async () => {
      try {
        const token = user.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(
          `http://localhost:5000/api/users/${id}`,
          config
        );

        const userData = response.data;
        
        setFormData({
          name: userData.name,
          email: userData.email,
          password: '',
          address: userData.address || '',
          role: userData.role,
        });
        
        setIsLoading(false);
      } catch (error) {
        toast.error('Error fetching user data');
        navigate('/admin/users');
      }
    };

    fetchUser();
  }, [user, navigate, id]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!name || !email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password && password.length < 6) {
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

      // Only include password if it was changed
      const userData = {
        name,
        email,
        address,
        role,
      };

      if (password) {
        userData.password = password;
      }

      await axios.put(
        `http://localhost:5000/api/users/${id}`,
        userData,
        config
      );

      toast.success('User updated successfully');
      navigate('/admin/users');
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Error updating user';
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
        <h1>Edit User</h1>
        <p>Update user information</p>
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
            <label htmlFor="password">Password (Leave blank to keep current)</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              placeholder="Enter new password or leave blank"
              onChange={onChange}
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
              Update User
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default EditUser; 