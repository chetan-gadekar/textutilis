import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { verifyOtp, clearError } from '../../store/slices/authSlice';
import loginBanner from '../../assets/login_banner.jpg';
import { CheckCircle } from 'lucide-react';

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const { loading, error } = useSelector((state) => state.auth);
  
  // Array of 6 empty strings for 6 inputs
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    // Use only the last typed character
    const singleChar = value.slice(-1);
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = singleChar;
    setOtpValues(newOtpValues);

    // Flow to next empty box
    if (singleChar !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otpValues[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
        // Clear the previous input as well for better UX
      } else {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(isNaN)) return;
    
    const newOtpValues = [...otpValues];
    pastedData.forEach((char, index) => {
      if (index < 6) newOtpValues[index] = char;
    });
    setOtpValues(newOtpValues);
    
    // Focus next empty or the last one
    const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = otpValues.join('');
    
    if (otp.length !== 6) {
      return;
    }

    const result = await dispatch(verifyOtp({ email, otp }));
    if (verifyOtp.fulfilled.match(result)) {
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/reset-password', { state: { email, otp } });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-poppins relative">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 transform transition-all">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">OTP Verified</h2>
            <p className="text-gray-500 text-center text-sm">
              Your identity has been confirmed. Redirecting to reset password...
            </p>
          </div>
        </div>
      )}

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
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Verify OTP</h1>
          <p className="text-gray-500 mb-8 text-sm">Enter the 6-digit OTP sent to {email}</p>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 mt-6">
            <div className="flex justify-between items-center space-x-1 sm:space-x-2">
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="2"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold bg-white border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-theme focus:border-transparent transition shadow-sm"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otpValues.join('').length < 6}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-theme hover:bg-theme-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
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

export default VerifyOtp;
