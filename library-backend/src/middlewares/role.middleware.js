import { ROLES } from '../constants/roles.constants.js';
import { sendErrorResponse } from '../utils/response.util.js';
import Rental from '../models/Rental.model.js';

/**
 * Role-based access (user/librarian/admin)
 */

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendErrorResponse(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendErrorResponse(
        res,
        'Access denied. Insufficient permissions',
        403
      );
    }

    next();
  };
};

// Specific role middlewares
export const requireUser = authorize(ROLES.USER);
export const requireLibrarian = authorize(ROLES.LIBRARIAN);
export const requireAdmin = authorize(ROLES.ADMIN);
export const requireLibrarianOrAdmin = authorize(ROLES.LIBRARIAN, ROLES.ADMIN);

// Check if user can access their own resource or is admin/librarian
// For rental-based routes, checks if user owns the rental or is staff
export const authorizeOwnerOrStaff = async (req, res, next) => {
  if (!req.user) {
    return sendErrorResponse(res, 'Authentication required', 401);
  }

  const isStaff = [ROLES.ADMIN, ROLES.LIBRARIAN].includes(req.user.role);

  // If staff, allow access
  if (isStaff) {
    return next();
  }

  // For rental routes, check if user owns the rental
  if (req.params.id) {
    try {
      const rental = await Rental.findById(req.params.id);
      if (!rental) {
        return sendErrorResponse(res, 'Rental not found', 404);
      }

      const isOwner = rental.user.toString() === req.userId.toString();
      if (!isOwner) {
        return sendErrorResponse(res, 'Access denied', 403);
      }

      return next();
    } catch (error) {
      return sendErrorResponse(res, 'Error checking rental ownership', 500);
    }
  }

  // For other routes with userId param, check direct ownership
  const isOwner = req.userId.toString() === req.params.userId?.toString();
  if (!isOwner) {
    return sendErrorResponse(res, 'Access denied', 403);
  }

  next();
};
