const User = require('../schemas/User');

// Register user
const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
};

// Helper to update student streak
const updateUserStreak = (user) => {
  if (user.role !== 'student') return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const lastActivity = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
  let lastActivityDay = null;

  if (lastActivity) {
    lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
  }

  let needsSave = false;

  if (!lastActivityDay) {
    user.currentStreak = 1;
    user.lastActivityDate = now;
    needsSave = true;
  } else {
    const diffTime = today.getTime() - lastActivityDay.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.currentStreak = (user.currentStreak || 0) + 1;
      user.lastActivityDate = now;
      needsSave = true;
    } else if (diffDays > 1) {
      user.currentStreak = 1;
      user.lastActivityDate = now;
      needsSave = true;
    } else if (diffDays === 0 && !user.currentStreak) {
      user.currentStreak = 1;
      needsSave = true;
    }
  }

  return needsSave;
};

// Login user
const loginUser = async (email, password) => {
  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new Error('Account is deactivated. Please contact admin.');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // For students: Generate new session token to invalidate previous sessions
  // This ensures only one device/browser can be logged in at a time
  if (user.role === 'student') {
    const crypto = require('crypto');
    const sessionToken = crypto.randomBytes(32).toString('hex');
    user.sessionToken = sessionToken;

    // Update streak on login
    updateUserStreak(user);

    await user.save();
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    sessionToken: user.role === 'student' ? user.sessionToken : null,
    currentStreak: user.currentStreak || 0,
  };
};

// Get current user
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }

  // Update streak logic for students
  const needsSave = updateUserStreak(user);
  if (needsSave) {
    await user.save();
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
