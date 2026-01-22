import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaStore, FaStar, FaUserAlt } from 'react-icons/fa';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="home">
      <section className="heading">
        <h1>Welcome to Shop Rating System</h1>
        <p>Rate your favorite stores and help others find the best places!</p>
      </section>

      <section className="content">
        <div className="features">
          <div className="feature">
            <FaStore size={50} />
            <h3>Discover Stores</h3>
            <p>Browse through registered stores and find new places to visit.</p>
            <Link to="/stores" className="btn btn-block">
              View Stores
            </Link>
          </div>

          <div className="feature">
            <FaStar size={50} />
            <h3>Rate & Review</h3>
            <p>Share your experience by rating stores and providing reviews.</p>
            {user ? (
              <Link to="/stores" className="btn btn-block">
                Start Rating
              </Link>
            ) : (
              <Link to="/login" className="btn btn-block">
                Login to Rate
              </Link>
            )}
          </div>

          <div className="feature">
            <FaUserAlt size={50} />
            <h3>Join Our Community</h3>
            <p>Create an account to start rating and reviewing stores.</p>
            {user ? (
              <Link to="/profile" className="btn btn-block">
                View Profile
              </Link>
            ) : (
              <Link to="/register" className="btn btn-block">
                Register Now
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 