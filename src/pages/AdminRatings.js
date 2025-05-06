import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import Spinner from '../components/Spinner';

const AdminRatings = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      toast.error('Not authorized to access admin ratings page');
      return;
    }

    const fetchRatings = async () => {
      try {
        setIsLoading(true);
        const token = user.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch all ratings
        const response = await axios.get(
          'http://localhost:5000/api/ratings',
          config
        );

        setRatings(response.data);
        setIsLoading(false);
      } catch (error) {
        toast.error('Error fetching ratings data');
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [user, navigate]);

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={i <= rating ? 'star filled' : 'star'}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container">
      <section className="heading">
        <h1>All Ratings</h1>
        <p>View and manage all store ratings</p>
      </section>

      {ratings.length === 0 ? (
        <div className="alert">
          <p>No ratings have been submitted yet.</p>
        </div>
      ) : (
        <section className="ratings-container">
          {ratings.map((rating) => (
            <div key={rating._id} className="rating-card">
              <div className="rating-header">
                <h3>{rating.store?.name || 'Unknown Store'}</h3>
                <div className="rating-stars">{renderStars(rating.value)}</div>
                <span className="rating-value">{rating.value}/5</span>
              </div>
              <div className="rating-body">
                <p className="rating-comment">{rating.comment}</p>
                <div className="rating-details">
                  <span className="rating-user">By: {rating.user?.name || 'Anonymous'}</span>
                  <span className="rating-date">Date: {formatDate(rating.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default AdminRatings; 