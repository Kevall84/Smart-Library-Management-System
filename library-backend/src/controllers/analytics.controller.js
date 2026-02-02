import { asyncHandler } from '../middlewares/error.middleware.js';
import { sendSuccessResponse } from '../utils/response.util.js';
import * as analyticsService from '../services/analytics.service.js';

/**
 * Admin analytics endpoints
 */

export const dashboard = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDashboardStats();
  return sendSuccessResponse(res, 'Dashboard stats retrieved successfully', { stats });
});

export const rentalsOverTime = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days || '30');
  const data = await analyticsService.getRentalStatistics(days);
  return sendSuccessResponse(res, 'Rental statistics retrieved successfully', { days, data });
});

export const revenueOverTime = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days || '30');
  const data = await analyticsService.getRevenueStatistics(days);
  return sendSuccessResponse(res, 'Revenue statistics retrieved successfully', { days, data });
});

export const popularBooks = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '10');
  const books = await analyticsService.getPopularBooks(limit);
  return sendSuccessResponse(res, 'Popular books retrieved successfully', { books });
});

export const categories = asyncHandler(async (req, res) => {
  const categories = await analyticsService.getCategoryStatistics();
  return sendSuccessResponse(res, 'Category statistics retrieved successfully', { categories });
});

export const userActivity = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days || '30');
  const users = await analyticsService.getUserActivityStats(days);
  return sendSuccessResponse(res, 'User activity stats retrieved successfully', { days, users });
});

export const overdueReport = asyncHandler(async (req, res) => {
  const report = await analyticsService.getOverdueReport();
  return sendSuccessResponse(res, 'Overdue report retrieved successfully', { report });
});

