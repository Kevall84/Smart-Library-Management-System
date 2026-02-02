import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * JWT helpers
 */

/**
 * Generate JWT token
 */
export const generateToken = (payload, expiresIn = null) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: expiresIn || config.JWT_EXPIRE,
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRE,
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};

/**
 * Decode token without verification (for reading payload)
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
