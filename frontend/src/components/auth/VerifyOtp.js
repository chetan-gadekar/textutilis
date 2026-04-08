import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { verifyOtp, forgotPassword, clearError } from '../../store/slices/authSlice';
import loginBanner from '../../assets/login_banner.jpg';
import { CheckCircle } from 'lucide-react';
import notify from '../../utils/notify';
import LoadingButton from '../common/LoadingButton';

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
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (error) {
      notify.error(error);
      dispatch(clearError());
    }

    return () => {
      dispatch(clearError());
    };
  }, [error, dispatch]);

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
      notify.success('OTP Verified Successfully!');
      setTimeout(() => {
        navigate('/reset-password', { state: { email, otp } });
      }, 1000);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setResendMessage('');
    const result = await dispatch(forgotPassword(email));
    setIsResending(false);
    if (forgotPassword.fulfilled.match(result)) {
      notify.success('OTP resent successfully!');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-poppins relative">

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

            <LoadingButton
              type="submit"
              loading={loading && !isResending}
              loadingText="Verifying..."
              disabled={otpValues.join('').length < 6}
              fullWidth
              sx={{
                bgcolor: '#6A4E9E',
                '&:hover': { bgcolor: '#5A3E8E' },
                mt: 4
              }}
            >
              Verify OTP
            </LoadingButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Didn't receive OTP?{' '}
              <LoadingButton
                variant="text"
                loading={isResending}
                loadingText="Resending..."
                onClick={handleResendOtp}
                disabled={loading}
                sx={{
                  color: '#6A4E9E',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' },
                  minWidth: 'auto',
                  p: 0,
                  ml: 1
                }}
              >
              </LoadingButton>
            </p>
          </div>
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

