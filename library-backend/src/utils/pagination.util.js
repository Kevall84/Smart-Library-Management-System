/**
 * Pagination logic
 */

/**
 * Get pagination parameters from request query
 */
export const getPaginationParams = (req, defaultLimit = 10, maxLimit = 100) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  let limit = parseInt(req.query.limit) || defaultLimit;

  // Enforce maximum limit
  if (limit > maxLimit) {
    limit = maxLimit;
  }

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

/**
 * Create pagination metadata
 */
export const createPaginationMeta = (total, page, limit) => {
  const pages = Math.ceil(total / limit);
  const hasNextPage = page < pages;
  const hasPrevPage = page > 1;

  return {
    total,
    page,
    limit,
    pages,
    hasNextPage,
    hasPrevPage,
  };
};

/**
 * Apply pagination to Mongoose query
 */
export const paginateQuery = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  return query.skip(skip).limit(limit);
};
