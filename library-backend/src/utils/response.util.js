/**
 * Standard API response format
 */

/**
 * Send success response
 */
export const sendSuccessResponse = (
  res,
  message = 'Success',
  data = null,
  statusCode = 200
) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendErrorResponse = (
  res,
  message = 'Error',
  statusCode = 400,
  errors = null
) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = (
  res,
  message = 'Success',
  data = [],
  pagination = {},
  statusCode = 200
) => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      pages: pagination.pages || 1,
      ...(pagination.hasNextPage !== undefined && {
        hasNextPage: pagination.hasNextPage,
      }),
      ...(pagination.hasPrevPage !== undefined && {
        hasPrevPage: pagination.hasPrevPage,
      }),
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};
