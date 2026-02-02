import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.model.js';
import { sendErrorResponse } from '../utils/response.util.js';

/**
 * JWT verification middleware
 */

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendErrorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return sendErrorResponse(res, 'No token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendErrorResponse(res, 'User not found', 401);
    }

    if (!user.isActive) {
      return sendErrorResponse(res, 'User account is deactivated', 401);
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendErrorResponse(res, 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, 'Token expired', 401);
    }
    return sendErrorResponse(res, 'Authentication failed', 401);
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
