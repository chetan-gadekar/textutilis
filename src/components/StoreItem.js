import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaStar } from 'react-icons/fa';
import { getUserStoreRating, createRating, updateRating } from '../redux/slices/ratingSlice';
import { toast } from 'react-toastify';

const StoreItem = ({ store }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [storeUserRating, setStoreUserRating] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch if user is logged in and is a normal user
    if (user && user.role === 'user') {
      setLoading(true);
      dispatch(getUserStoreRating({ userId: user._id, storeId: store._id }))
        .then((response) => {
          if (response.payload && !response.error) {
            setStoreUserRating(response.payload);
            setRatingValue(response.payload.value || 0);
            setComment(response.payload.comment || '');
          }
          setLoading(false);
        })
        .catch(() => {
          // Silently handle errors - just don't show user rating
          setLoading(false);
        });
    }
  }, [dispatch, user, store._id]);

  // Function to render star ratings (display only)
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

  // Interactive star rating component
  const StarRating = () => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((star, index) => {
          const ratingVal = index + 1;
          return (
            <label key={index}>
              <input
                type="radio"
                name="rating"
                value={ratingVal}
                onClick={() => setRatingValue(ratingVal)}
                style={{ display: 'none' }}
              />
              <FaStar
                className="star"
                color={ratingVal <= (hover || ratingValue) ? "#f8ce0b" : "#e4e5e9"}
                size={24}
                onMouseEnter={() => setHover(ratingVal)}
                onMouseLeave={() => setHover(0)}
              />
            </label>
          );
        })}
      </div>
    );
  };

  const handleSubmitRating = (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a rating');
      navigate('/login');
      return;
    }

    if (user.role !== 'user') {
      toast.error('Only regular users can submit ratings');
      return;
    }

    if (ratingValue === 0) {
      toast.error('Please select a rating');
      return;
    }

    const ratingData = {
      storeId: store._id,
      value: ratingValue,
      comment,
    };

    if (storeUserRating) {
      dispatch(updateRating({ id: storeUserRating._id, ratingData }))
        .then(() => {
          toast.success('Rating updated successfully');
          setShowRatingForm(false);
        })
        .catch((error) => {
          toast.error('Failed to update rating');
        });
    } else {
      dispatch(createRating(ratingData))
        .then((response) => {
          if (!response.error) {
            toast.success('Rating submitted successfully');
            setStoreUserRating(response.payload);
            setShowRatingForm(false);
          }
        })
        .catch((error) => {
          toast.error('Failed to submit rating');
        });
    }
  };

  const toggleRatingForm = () => {
    if (!user) {
      toast.error('Please login to submit a rating');
      navigate('/login');
      return;
    }

    if (user.role !== 'user') {
      toast.error('Only regular users can submit ratings');
      return;
    }
    
    setShowRatingForm(!showRatingForm);
  };

  return (
    <div className="store">
      <div>
        <h3>{store.name}</h3>
        <div className="store-rating">
          {renderStars(store.overallRating)}
          <span className="rating-text">({store.overallRating})</span>
        </div>
        <p className="store-address">
          <strong>Address:</strong> {store.address}
        </p>
        <p className="store-email">
          <strong>Email:</strong> {store.email}
        </p>
        
        {user && user.role === 'user' && (
          <div className="user-rating-section">
            {loading ? (
              <p>Loading your rating...</p>
            ) : storeUserRating ? (
              <div className="user-rating">
                <p><strong>Your Rating:</strong></p>
                <div className="rating-display">
                  {renderStars(storeUserRating.value)}
                  <span className="rating-text">({storeUserRating.value})</span>
                </div>
                <button 
                  className="btn btn-small" 
                  onClick={toggleRatingForm}
                >
                  {showRatingForm ? 'Cancel' : 'Modify Rating'}
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-small" 
                onClick={toggleRatingForm}
              >
                Rate This Store
              </button>
            )}
          </div>
        )}

        {showRatingForm && (
          <div className="quick-rating-form">
            <form onSubmit={handleSubmitRating}>
              <div className="form-group">
                <label>Your Rating:</label>
                <StarRating />
              </div>
              <div className="form-group">
                <textarea
                  name="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment (optional)"
                  rows="2"
                  maxLength="300"
                ></textarea>
              </div>
              <div className="form-group-buttons">
                <button type="submit" className="btn btn-small">
                  {storeUserRating ? 'Update' : 'Submit'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-small btn-secondary"
                  onClick={() => setShowRatingForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <div>
        <Link to={`/store/${store._id}`} className="btn btn-view">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default StoreItem; 