const authService = require('../services/authService');
const { generateToken } = require('../middlewares/auth');
const otpGenerator = require('otp-generator');
const { sendEmail } = require('../utils/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const userData = req.body;
    const user = await authService.registerUser(userData);
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    // Include sessionToken in JWT for students
    const token = generateToken(user.id, user.sessionToken || null);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        currentStreak: user.currentStreak,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (clear session token for students)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const User = require('../schemas/User');
    const user = await User.findById(req.user.id);
    
    if (user && user.role === 'student') {
      // Clear session token for students
      user.sessionToken = null;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const User = require('../schemas/User');
    const user = await User.findOne({ email });

    if (!user) {
      // Return success even if user not found to prevent user enumeration
      return res.json({ success: true, message: 'If that email is registered, an OTP has been sent.' });
    }

    // Generate 6 digit numeric OTP
    const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

    // Save OTP to user, set expiration to 10 minutes from now
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email
    const emailText = `Your password reset OTP is: ${otp}\nThis OTP will expire in 10 minutes.`;
    const emailHtml = `<h3>Password Reset</h3><p>Your password reset OTP is: <strong>${otp}</strong></p><p>This OTP will expire in 10 minutes.</p>`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset OTP - AIGenius LMS',
      text: emailText,
      html: emailHtml,
    });

    res.json({
      success: true,
      message: 'If that email is registered, an OTP has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const User = require('../schemas/User');

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ 
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const User = require('../schemas/User');

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    const user = await User.findOne({ 
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Update password
    user.password = newPassword; 
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
