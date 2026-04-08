import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, clearError } from '../../store/slices/authSlice';
import LoadingButton from '../common/LoadingButton';
import notify from '../../utils/notify';
import loginBanner from '../../assets/login_banner.jpg';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (error) {
      notify.error(error);
      dispatch(clearError());
    }

    return () => {
      dispatch(clearError());
    };
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(forgotPassword(email));
    if (forgotPassword.fulfilled.match(result)) {
      notify.success('OTP sent successfully!');
      navigate('/verify-otp', { state: { email } });
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-poppins">
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8 relative">
        <div className="absolute top-8 left-8 flex items-center space-x-2">
          <div className="flex gap-[2px]">
            <div className="w-4 h-4 bg-[#6A4E9E]"></div>
            <div className="w-4 h-4 bg-[#8E7CC3]"></div>
          </div>
          <div className="flex gap-[2px] mt-[2px] absolute top-4 left-0">
            <div className="w-4 h-4 bg-[#8E7CC3]"></div>
            <div className="w-4 h-4 bg-[#6A4E9E]"></div>
          </div>
        </div>

        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Forgot Password</h1>
          <p className="text-gray-500 mb-8 text-sm">Enter your email to receive an OTP</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Sending..."
              fullWidth
              className="mt-6 py-2.5 px-4 bg-theme hover:bg-theme-dark text-white rounded-md shadow-sm transition"
              sx={{
                bgcolor: '#6A4E9E',
                '&:hover': { bgcolor: '#5A3E8E' }
              }}
            >
              Send OTP
            </LoadingButton>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-theme hover:text-theme-dark underline decoration-theme/30 hover:decoration-theme">
              Back to login
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-theme-dark overflow-hidden">
        <img
          src={loginBanner}
          alt="Login Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;
