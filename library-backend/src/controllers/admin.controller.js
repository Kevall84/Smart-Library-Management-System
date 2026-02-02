import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse } from '../utils/response.util.js';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { ROLES } from '../constants/roles.constants.js';
import { getPaginationParams, createPaginationMeta } from '../utils/pagination.util.js';
import pricing from '../constants/pricing.constants.js';

/**
 * Admin management endpoints: users/librarians, audit logs, pricing (read-only)
 */

export const validateCreateStaff = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn([ROLES.LIBRARIAN, ROLES.ADMIN]).withMessage('Role must be librarian or admin'),
];

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req, 20, 100);
  const query = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = createPaginationMeta(total, page, limit);
  return sendPaginatedResponse(res, 'Users retrieved successfully', users, pagination);
});

export const createStaffUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { name, email, password, role, phone, address } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return sendErrorResponse(res, 'User already exists with this email', 400);
  }

  const user = await User.create({ name, email, password, role, phone, address, isActive: true });
  return sendSuccessResponse(res, 'Staff user created successfully', { user: user.toJSON() }, 201);
});

export const setUserActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: Boolean(isActive) },
    { new: true }
  );
  if (!user) {
    return sendErrorResponse(res, 'User not found', 404);
  }
  return sendSuccessResponse(res, 'User updated successfully', { user: user.toJSON() });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req, 20, 100);
  const query = {};
  if (req.query.resource) query.resource = req.query.resource;
  if (req.query.action) query.action = req.query.action;
  if (req.query.userId) query.user = req.query.userId;

  const total = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = createPaginationMeta(total, page, limit);
  return sendPaginatedResponse(res, 'Audit logs retrieved successfully', logs, pagination);
});

export const getPricing = asyncHandler(async (req, res) => {
  // NOTE: This is read-only because pricing is currently constants-based.
  // To support admin "manage pricing", we need a PricingSettings model/table.
  return sendSuccessResponse(res, 'Pricing retrieved successfully', { pricing });
});

