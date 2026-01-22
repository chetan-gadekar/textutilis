import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import Spinner from '../components/Spinner';

const EditStore = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = user.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch store data
        const storeResponse = await axios.get(
          `http://localhost:5000/api/stores/${id}`,
          config
        );

        // Fetch users with storeOwner role
        const ownersResponse = await axios.get(
          'http://localhost:5000/api/users?role=storeOwner',
          config
        );

        const storeData = storeResponse.data;
        
        setFormData({
          name: storeData.name,
          email: storeData.email,
          description: storeData.description || '',
          address: storeData.address || '',
          phoneNumber: storeData.phoneNumber || '',
          ownerId: storeData.owner._id,
        });
        
        setOwners(ownersResponse.data);
        setIsLoading(false);
      } catch (error) {
        toast.error('Error fetching store data');
        navigate('/admin/stores');
      }
    };

    fetchData();
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
    if (!name || !email || !address) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!ownerId) {
      toast.error('Please select a store owner');
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

      await axios.put(
        `http://localhost:5000/api/stores/${id}`,
        storeData,
        config
      );

      toast.success('Store updated successfully');
      navigate('/admin/stores');
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Error updating store';
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
        <h1>Edit Store</h1>
        <p>Update store information</p>
      </section>

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
            <button type="submit" className="btn btn-block">
              Update Store
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default EditStore; 