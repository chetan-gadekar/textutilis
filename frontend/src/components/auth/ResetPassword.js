import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { resetPassword, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import loginBanner from '../../assets/login_banner.jpg';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const { loading, error } = useSelector((state) => state.auth);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  if (!email || !otp) {
    return <Navigate to="/forgot-password" replace />;
  }

  const passwordCriteria = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Atleast One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Atleast One lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'Atleast One number', met: /\d/.test(newPassword) },
    { label: 'Atleast One special character', met: /[\W_]/.test(newPassword) }
  ];

  const isPasswordValid = passwordCriteria.every(c => c.met);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Please ensure all password requirements are met.');
      return;
    }

    const result = await dispatch(resetPassword({ email, otp, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      sessionStorage.setItem('sessionMessage', 'Password reset successfully. Please log in.');
      navigate('/login');
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
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mb-8 text-sm">Enter your new password below</p>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength="6"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent transition pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-2">Password requirements:</div>
                <ul className="grid grid-cols-1 gap-2 text-xs">
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
              disabled={loading || newPassword.length > 0 && !isPasswordValid}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-theme hover:bg-theme-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme transition disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
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

export default ResetPassword;
