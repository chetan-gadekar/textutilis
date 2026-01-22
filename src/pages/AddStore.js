import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import Spinner from '../components/Spinner';

const AddStore = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    address: '',
    phoneNumber: '',
    ownerId: '',
  });
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { name, email, description, address, phoneNumber, ownerId } = formData;

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

    const fetchStoreOwners = async () => {
      try {
        setIsLoading(true);
        const token = user.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch users with storeOwner role
        const response = await axios.get(
          'http://localhost:5000/api/users?role=storeOwner',
          config
        );

        if (response.data.length === 0) {
          toast.warning('No store owners found. Please create a store owner first.');
        }

        setOwners(response.data);
        setIsLoading(false);
      } catch (error) {
        toast.error('Error fetching store owners');
        setIsLoading(false);
      }
    };

    fetchStoreOwners();
  }, [user, navigate]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const validateOwner = async (ownerId) => {
    try {
      const token = user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Verify owner exists and is a storeOwner
      const response = await axios.get(
        `http://localhost:5000/api/users/${ownerId}`,
        config
      );

      if (response.data.role !== 'storeOwner') {
        toast.error('Selected user is not a store owner');
        return false;
      }

      return true;
    } catch (error) {
      toast.error('Cannot verify store owner. Please try again.');
      return false;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Form validation
    if (!name || !email || !address) {
      toast.error('Please fill in all required fields');
      setFormSubmitted(false);
      return;
    }

    if (!ownerId) {
      toast.error('Please select a store owner');
      setFormSubmitted(false);
      return;
    }

    // Validate that the owner exists and is a storeOwner
    const isValidOwner = await validateOwner(ownerId);
    if (!isValidOwner) {
      setFormSubmitted(false);
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

      const storeData = {
        name,
        email,
        description,
        address,
        phoneNumber,
        owner: ownerId,
      };

      await axios.post('http://localhost:5000/api/stores', storeData, config);

      toast.success('Store created successfully');
      navigate('/admin/stores');
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Error creating store';
      toast.error(message);
      setIsLoading(false);
      setFormSubmitted(false);
    }
  };

  if (isLoading && !formSubmitted) {
    return <Spinner />;
  }

  return (
    <div className="container">
      <section className="heading">
        <h1>Create New Store</h1>
        <p>Add a new store to the system</p>
      </section>

      {owners.length === 0 ? (
        <div className="alert">
          <p>No store owners available. You need to create a store owner first.</p>
          <button 
            className="btn" 
            style={{ marginTop: '15px' }}
            onClick={() => navigate('/admin/add-user')}
          >
            Create Store Owner
          </button>
        </div>
      ) : (
        <section className="form">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="name">Store Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={name}
                placeholder="Enter store name"
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
              <label htmlFor="description">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={description}
                placeholder="Enter store description"
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
                placeholder="Enter store address"
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="text"
                className="form-control"
                id="phoneNumber"
                name="phoneNumber"
                value={phoneNumber}
                placeholder="Enter phone number"
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="ownerId">Store Owner</label>
              <select
                className="form-control"
                id="ownerId"
                name="ownerId"
                value={ownerId}
                onChange={onChange}
                required
              >
                <option value="">Select store owner</option>
                {owners.map((owner) => (
                  <option key={owner._id} value={owner._id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-block" disabled={formSubmitted}>
                {formSubmitted ? 'Creating Store...' : 'Create Store'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default AddStore; 