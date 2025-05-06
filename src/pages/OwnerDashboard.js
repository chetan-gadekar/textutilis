import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
import Spinner from '../components/Spinner';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [ownerStores, setOwnerStores] = useState([]);
  const [storeRatings, setStoreRatings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'storeOwner') {
      navigate('/');
      toast.error('Not authorized as a store owner');
      return;
    }

    const fetchOwnerData = async () => {
      try {
        setIsLoading(true);
        const token = user.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch owner's stores
        const storesResponse = await axios.get(
          `http://localhost:5000/api/stores/owner/${user._id}`,
          config
        );

        setOwnerStores(storesResponse.data);

        // Fetch ratings for each store
        const ratingsPromises = storesResponse.data.map(async (store) => {
          const ratingsResponse = await axios.get(
            `http://localhost:5000/api/ratings/store/${store._id}`
          );
          return { storeId: store._id, ratings: ratingsResponse.data };
        });

        const ratingsResults = await Promise.all(ratingsPromises);
        const ratingsMap = {};
        
        ratingsResults.forEach((result) => {
          ratingsMap[result.storeId] = result.ratings;
        });

        setStoreRatings(ratingsMap);
        setIsLoading(false);
      } catch (error) {
        toast.error('Error fetching store owner data');
        setIsLoading(false);
      }
    };

    fetchOwnerData();
  }, [user, navigate]);

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          color={i <= rating ? '#f8ce0b' : '#e4e5e9'} 
          size={18} 
        />
      );
    }
    return stars;
  };

  // Function to get all unique users who rated a store
  const getRatingUsers = (ratings) => {
    if (!ratings || ratings.length === 0) return [];
    
    // Create a Map to store unique users by ID
    const uniqueUsers = new Map();
    
    ratings.forEach(rating => {
      if (rating.user && !uniqueUsers.has(rating.user._id)) {
        uniqueUsers.set(rating.user._id, rating.user);
      }
    });
    
    return Array.from(uniqueUsers.values());
  };

  // Calculate rating statistics
  const getRatingStats = (ratings) => {
    if (!ratings || ratings.length === 0) {
      return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
    }
    
    const count = ratings.length;
    const sum = ratings.reduce((total, rating) => total + rating.value, 0);
    const average = (sum / count).toFixed(1);
    
    // Calculate rating distribution (how many 1-star, 2-star, etc.)
    const distribution = [0, 0, 0, 0, 0];
    ratings.forEach(rating => {
      if (rating.value >= 1 && rating.value <= 5) {
        distribution[rating.value - 1]++;
      }
    });
    
    return { average, count, distribution };
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="dashboard">
      <section className="heading">
        <h1>Store Owner Dashboard</h1>
        <p>Manage your stores and view customer ratings</p>
      </section>

      {ownerStores.length === 0 ? (
        <div className="no-stores">
          <p>You don't have any stores yet. Please contact an admin to add a store for you.</p>
        </div>
      ) : (
        <section className="owner-stores">
          {ownerStores.map((store) => {
            const storeRatingData = storeRatings[store._id] || [];
            const ratingStats = getRatingStats(storeRatingData);
            const ratingUsers = getRatingUsers(storeRatingData);
            
            return (
              <div key={store._id} className="store-card">
                <div className="store-header">
                  <h2>{store.name}</h2>
                </div>

                <div className="store-details">
                  <p><strong>Email:</strong> {store.email}</p>
                  <p><strong>Address:</strong> {store.address}</p>
                </div>

                <div className="store-rating-summary">
                  <div className="rating-average">
                    <h3>Average Rating</h3>
                    <div className="rating-value-large">{ratingStats.average}</div>
                    <div className="rating-stars-large">{renderStars(store.overallRating)}</div>
                    <div className="rating-count">{ratingStats.count} Reviews</div>
                  </div>
                  
                  <div className="rating-distribution">
                    <h3>Rating Distribution</h3>
                    {ratingStats.distribution.map((count, index) => (
                      <div key={index} className="distribution-row">
                        <div className="star-label">{index + 1} Star</div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: ratingStats.count ? `${(count / ratingStats.count) * 100}%` : '0%',
                              backgroundColor: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60'][index]
                            }}
                          ></div>
                        </div>
                        <div className="count-label">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rating-users-section">
                  <h3>Users Who Rated This Store</h3>
                  {ratingUsers.length > 0 ? (
                    <div className="users-grid">
                      {ratingUsers.map(user => (
                        <div key={user._id} className="user-item">
                          <div className="user-name">{user.name}</div>
                          {storeRatingData.find(r => r.user._id === user._id) && (
                            <div className="user-rating">
                              {renderStars(storeRatingData.find(r => r.user._id === user._id).value)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No ratings yet.</p>
                  )}
                </div>

                <div className="store-ratings">
                  <h3>Recent Ratings</h3>
                  {storeRatingData.length > 0 ? (
                    <div className="ratings-list">
                      {storeRatingData.slice(0, 5).map((rating) => (
                        <div key={rating._id} className="rating-item">
                          <div className="rating-header">
                            <div className="star-display">
                              {renderStars(rating.value)}
                            </div>
                            <span className="review-author">{rating.user.name}</span>
                            <span className="review-date">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {rating.comment && (
                            <p className="rating-comment">{rating.comment}</p>
                          )}
                        </div>
                      ))}
                      {storeRatingData.length > 5 && (
                        <Link to={`/store/${store._id}`} className="view-all-link">
                          View all ratings
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p>No ratings yet.</p>
                  )}
                </div>

                <div className="store-actions">
                  <Link to={`/store/${store._id}`} className="btn btn-view">
                    View Store
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default OwnerDashboard; 