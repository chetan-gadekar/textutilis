import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import loginBanner from '../../assets/login_banner.jpg';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

  useEffect(() => {
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

  const passwordCriteria = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Atleast One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'Atleast One lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'Atleast One number', met: /\d/.test(formData.password) },
    { label: 'Atleast One special character', met: /[\W_]/.test(formData.password) }
  ];

  const isPasswordValid = passwordCriteria.every(c => c.met);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Please ensure all password requirements are met.');
      return;
    }

    const { confirmPassword, ...userData } = formData;
    try {
      await dispatch(register(userData)).unwrap();
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      // Error handled by Redux state
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-poppins">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center py-12 px-8 relative overflow-y-auto">
        {/* Logo Area */}
        <div className="absolute top-8 left-8 flex items-center space-x-2">
          {/* Simple CSS logo mimicking TheCubeFactory */}
          <div className="flex gap-[2px]">
            <div className="w-4 h-4 bg-theme-dark"></div>
            <div className="w-4 h-4 bg-theme"></div>
          </div>
          <div className="flex gap-[2px] mt-[2px] absolute top-4 left-0">
            <div className="w-4 h-4 bg-theme"></div>
            <div className="w-4 h-4 bg-theme-dark"></div>
          </div>
        </div>

        <div className="w-full max-w-md mt-10">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Create account</h1>
          <p className="text-gray-500 mb-8 text-sm">Please register to continue</p>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent transition"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent transition"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent transition appearance-none"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="super_instructor">Super Instructor</option>
              </select>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    autoComplete="new-password"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent transition pr-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 mt-2">
                <div className="text-sm text-gray-600 mb-2">Password requirements:</div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {passwordCriteria.map((c, i) => (
                    <li key={i} className={`flex items-center ${c.met ? 'text-green-600' : 'text-gray-400'}`}>
                      {c.met ? <CheckCircle className="w-4 h-4 mr-2" /> : <div className="w-4 h-4 rounded-full border border-gray-300 mr-2" />}
                      {c.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || formData.password.length > 0 && !isPasswordValid}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-theme hover:bg-theme-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme transition disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-theme hover:text-theme-dark underline decoration-theme/30 hover:decoration-theme">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Illustration */}
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

export default Register;
