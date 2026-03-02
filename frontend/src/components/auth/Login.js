import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';
import loginBanner from '../../assets/login_banner.jpg';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [sessionMessage, setSessionMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Check for session invalidation message
    const message = sessionStorage.getItem('sessionMessage');
    if (message) {
      setSessionMessage(message);
      sessionStorage.removeItem('sessionMessage');
    }

    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen flex bg-white font-poppins">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8 relative">
        {/* Logo Area */}
        <div className="absolute top-8 left-8 flex items-center space-x-2">
          {/* Simple CSS logo mimicking TheCubeFactory */}
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
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mb-8 text-sm">Please enter your details</p>

          {sessionMessage && (
            <div className="mb-4 p-4 text-sm text-yellow-800 rounded-lg bg-yellow-50" role="alert">
              {sessionMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
              {error}
            </div>
          )}

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
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent transition pr-10"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-theme focus:ring-theme border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember for 30 days
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-theme hover:text-theme-dark underline decoration-theme/30 hover:decoration-theme">
                  Forgot password
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-theme hover:bg-theme-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme transition disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <button
              type="button"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme transition mt-4"
            >
              <FcGoogle className="h-5 w-5 mr-2" />
              Sign in with Google
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-theme hover:text-theme-dark underline decoration-theme/30 hover:decoration-theme">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Illustration */}
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

export default Login;
