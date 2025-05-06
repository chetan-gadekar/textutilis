import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import Spinner from '../components/Spinner';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      toast.error('Not authorized to access admin users page');
      return;
    }

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const token = user.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch users
        const response = await axios.get(
          'http://localhost:5000/api/users',
          config
        );

        setUsers(response.data);
        setIsLoading(false);
      } catch (error) {
        toast.error('Error fetching users data');
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  const handleDeleteUser = async (userId) => {
    try {
      if (window.confirm('Are you sure you want to delete this user?')) {
        const token = user.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(
          `http://localhost:5000/api/users/${userId}`,
          config
        );

        // Update users list after deletion
        setUsers(users.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      }
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container">
      <section className="heading">
        <h1>Manage Users</h1>
        <p>View, create, edit, and delete users</p>
      </section>

      <section className="actions">
        <button 
          className="btn btn-block" 
          style={{ maxWidth: '200px', marginBottom: '20px' }}
          onClick={() => navigate('/admin/add-user')}
        >
          Create New User
        </button>
      </section>

      <section className="content">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userData) => (
                <tr key={userData._id}>
                  <td>{userData.name}</td>
                  <td>{userData.email}</td>
                  <td>{userData.address ? userData.address.substring(0, 30) + '...' : 'No address'}</td>
                  <td>{userData.role}</td>
                  <td>
                    <button
                      className="btn"
                      style={{ padding: '5px 10px', marginRight: '5px' }}
                      onClick={() => navigate(`/admin/edit-user/${userData._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-delete"
                      style={{ padding: '5px 10px' }}
                      onClick={() => handleDeleteUser(userData._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminUsers; 