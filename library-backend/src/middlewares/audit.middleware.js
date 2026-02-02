import AuditLog from '../models/AuditLog.model.js';

/**
 * Automatically logs sensitive operations
 */

// Actions to audit
const AUDITABLE_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'ISSUE',
  'RETURN',
  'PAYMENT',
  'CANCEL',
];

// Resources to audit
const AUDITABLE_RESOURCES = [
  'user',
  'book',
  'rental',
  'payment',
  'inventory',
  'pricing',
];

/**
 * Middleware to log admin and librarian actions
 */
export const auditLog = (action, resource) => {
  return async (req, res, next) => {
    // Only audit for admin and librarian actions
    if (!req.user || !['admin', 'librarian'].includes(req.user.role)) {
      return next();
    }

    // Check if action/resource should be audited
    if (
      !AUDITABLE_ACTIONS.includes(action.toUpperCase()) ||
      !AUDITABLE_RESOURCES.includes(resource.toLowerCase())
    ) {
      return next();
    }

    // Store original res.json to capture response
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Log after response is sent
      const logData = {
        user: req.user._id,
        userRole: req.user.role,
        action: action.toUpperCase(),
        resource: resource.toLowerCase(),
        resourceId: req.params.id || req.body.id || null,
        method: req.method,
        endpoint: req.originalUrl,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure',
        metadata: {
          query: req.query,
          body: sanitizeBody(req.body),
        },
      };

      // Store changes if update/delete
      if (['UPDATE', 'DELETE'].includes(action.toUpperCase()) && req.body) {
        logData.changes = sanitizeBody(req.body);
      }

      if (res.statusCode >= 400) {
        logData.errorMessage = data.message || 'Error occurred';
        logData.status = 'error';
      }

      // Create audit log asynchronously (don't block response)
      AuditLog.create(logData).catch((err) => {
        console.error('Failed to create audit log:', err);
      });

      return originalJson(data);
    };

    next();
  };
};

// Helper to sanitize sensitive data from request body
const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
};

/**
 * Manual audit log creation helper
 */
export const createAuditLog = async (data) => {
  try {
    await AuditLog.create(data);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
