import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import Spinner from '../components/Spinner';

const AdminStores = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      toast.error('Not authorized to access admin stores page');
      return;
    }

    const fetchStores = async () => {
      try {
        setIsLoading(true);
        const token = user.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch stores
        const response = await axios.get(
          'http://localhost:5000/api/stores',
          config
        );

        setStores(response.data);
        setIsLoading(false);
      } catch (error) {
        toast.error('Error fetching stores data');
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [user, navigate]);

  const handleDeleteStore = async (storeId) => {
    try {
      if (window.confirm('Are you sure you want to delete this store?')) {
        const token = user.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(
          `http://localhost:5000/api/stores/${storeId}`,
          config
        );

        // Update stores list after deletion
        setStores(stores.filter(store => store._id !== storeId));
        toast.success('Store deleted successfully');
      }
    } catch (error) {
      toast.error('Error deleting store');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container">
      <section className="heading">
        <h1>Manage Stores</h1>
        <p>View, create, edit, and delete stores</p>
      </section>

      <section className="actions">
        <button 
          className="btn btn-block" 
          style={{ maxWidth: '200px', marginBottom: '20px' }}
          onClick={() => navigate('/admin/add-store')}
        >
          Create New Store
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
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store._id}>
                  <td>{store.name}</td>
                  <td>{store.email}</td>
                  <td>{store.address ? store.address.substring(0, 30) + '...' : 'No address'}</td>
                  <td>{store.overallRating}</td>
                  <td>
                    <button
                      className="btn"
                      style={{ padding: '5px 10px', marginRight: '5px' }}
                      onClick={() => navigate(`/store/${store._id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn"
                      style={{ padding: '5px 10px', marginRight: '5px' }}
                      onClick={() => navigate(`/admin/edit-store/${store._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-delete"
                      style={{ padding: '5px 10px' }}
                      onClick={() => handleDeleteStore(store._id)}
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

export default AdminStores; 