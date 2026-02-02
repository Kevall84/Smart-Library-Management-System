import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/response.util.js';
import * as authService from '../services/auth.service.js';
import { ROLES } from '../constants/roles.constants.js';

/**
 * Auth controllers (login/register/logout)
 */

// Validation rules
export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role'),
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { name, email, password, role, phone, address } = req.body;

  const result = await authService.registerUser({
    name,
    email,
    password,
    role,
    phone,
    address,
  });

  sendSuccessResponse(res, 'User registered successfully', result, 201);
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { email, password } = req.body;

  const result = await authService.loginUser(email, password);

  sendSuccessResponse(res, 'Login successful', result);
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.userId);
  sendSuccessResponse(res, 'Profile retrieved successfully', { user });
});

/**
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.userId, req.body);
  sendSuccessResponse(res, 'Profile updated successfully', { user });
});

/**
 * PUT /api/auth/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendErrorResponse(res, 'Current password and new password are required', 400);
  }

  if (newPassword.length < 6) {
    return sendErrorResponse(res, 'New password must be at least 6 characters', 400);
  }

  await authService.changePassword(req.userId, currentPassword, newPassword);

  sendSuccessResponse(res, 'Password changed successfully');
});

/**
 * POST /api/auth/logout
 * (JWT logout is client-side; this is mostly informational)
 */
export const logout = asyncHandler(async (req, res) => {
  sendSuccessResponse(res, 'Logged out successfully');
});

