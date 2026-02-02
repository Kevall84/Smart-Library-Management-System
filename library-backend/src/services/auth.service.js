import User from '../models/User.model.js';
import { generateToken } from '../utils/jwt.util.js';
import { ROLES } from '../constants/roles.constants.js';

/**
 * Auth service: register, login, profile, password changes
 */

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  const { name, email, password, role, phone, address } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || ROLES.USER,
    phone,
    address,
  });

  const token = generateToken({ id: user._id, role: user.role });

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated. Please contact admin');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken({ id: user._id, role: user.role });

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user.toJSON();
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updateData) => {
  const allowedFields = ['name', 'phone', 'address', 'profilePhoto'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.toJSON();
};

/**
 * Change password (authenticated user)
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};

