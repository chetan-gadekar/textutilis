import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';
import { getStore, reset as resetStore } from '../redux/slices/storeSlice';
import { 
  getStoreRatings, 
  getUserStoreRating, 
  createRating, 
  updateRating, 
  deleteRating, 
  reset as resetRating 
} from '../redux/slices/ratingSlice';
import Spinner from '../components/Spinner';

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);

  const { user } = useSelector((state) => state.auth);
  const { store, isLoading: storeLoading } = useSelector((state) => state.stores);
  const { 
    ratings, 
    userRating, 
    isLoading: ratingLoading, 
    isSuccess, 
    isError, 
    message 
  } = useSelector((state) => state.ratings);

  useEffect(() => {
    dispatch(getStore(id));
    dispatch(getStoreRatings(id));

    if (user) {
      dispatch(getUserStoreRating({ userId: user._id, storeId: id }));
    }

    return () => {
      dispatch(resetStore());
      dispatch(resetRating());
    };
  }, [dispatch, id, user]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (userRating) {
      setRatingValue(userRating.value);
      setComment(userRating.comment || '');
    }
  }, [isError, message, userRating]);

  const handleSubmitRating = (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a rating');
      navigate('/login');
      return;
    }

    if (ratingValue === 0) {
      toast.error('Please select a rating');
      return;
    }

    const ratingData = {
      storeId: id,
      value: ratingValue,
      comment,
    };

    if (userRating) {
      dispatch(updateRating({ id: userRating._id, ratingData }));
      toast.success('Rating updated successfully');
    } else {
      dispatch(createRating(ratingData));
      toast.success('Rating submitted successfully');
    }
  };

  const handleDeleteRating = () => {
    if (window.confirm('Are you sure you want to delete your rating?')) {
      dispatch(deleteRating(userRating._id));
      setRatingValue(0);
      setComment('');
      toast.success('Rating deleted successfully');
    }
  };

  // Calculate average rating from ratings array
  const calculateAverage = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + rating.value, 0);
    return (sum / ratings.length).toFixed(1);
  };

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          color={i <= rating ? '#f8ce0b' : '#e4e5e9'} 
          size={24} 
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
          const ratingValue = index + 1;
          return (
            <label key={index}>
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => setRatingValue(ratingValue)}
                style={{ display: 'none' }}
              />
              <FaStar
                className="star"
                color={ratingValue <= (hover || ratingValue) ? "#f8ce0b" : "#e4e5e9"}
                size={30}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
              />
            </label>
          );
        })}
      </div>
    );
  };

  if (storeLoading || ratingLoading) {
    return <Spinner />;
  }

  return (
    <>
      {store ? (
        <div className="store-detail">
          <section className="heading">
            <h1>{store.name}</h1>
            <div className="store-rating">
              {renderStars(store.overallRating)}
              <span className="rating-text">
                ({store.overallRating}) - {ratings.length} Reviews
              </span>
            </div>
          </section>

          <section className="content">
            <div className="store-info">
              <p><strong>Address:</strong> {store.address}</p>
              <p><strong>Email:</strong> {store.email}</p>
            </div>

            <div className="rating-section">
              <h2>Submit Your Rating</h2>
              <form onSubmit={handleSubmitRating}>
                <div className="form-group">
                  <StarRating />
                </div>
                <div className="form-group">
                  <textarea
                    name="comment"
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment (optional)"
                    maxLength="300"
                  ></textarea>
                </div>
                <div className="form-group-buttons">
                  <button type="submit" className="btn btn-submit">
                    {userRating ? 'Update Rating' : 'Submit Rating'}
                  </button>
                  {userRating && (
                    <button 
                      type="button" 
                      className="btn btn-delete"
                      onClick={handleDeleteRating}
                    >
                      Delete Rating
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="reviews-section">
              <h2>Customer Reviews</h2>
              {ratings.length === 0 ? (
                <p>No reviews yet. Be the first to review!</p>
              ) : (
                <div className="reviews">
                  {ratings.map((rating) => (
                    <div key={rating._id} className="review">
                      <div className="review-header">
                        <div className="star-display">
                          {renderStars(rating.value)}
                        </div>
                        <span className="review-author">
                          {rating.user.name}
                        </span>
                        <span className="review-date">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="review-comment">{rating.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="not-found">
          <h1>Store not found</h1>
        </div>
      )}
    </>
  );
};

export default StoreDetail; 