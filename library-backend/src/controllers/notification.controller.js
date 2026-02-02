import { asyncHandler } from '../middlewares/error.middleware.js';
import { sendPaginatedResponse, sendSuccessResponse } from '../utils/response.util.js';
import Notification from '../models/Notification.model.js';
import { getPaginationParams, createPaginationMeta } from '../utils/pagination.util.js';

/**
 * User notifications (email/system history)
 */

export const myNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req, 10, 50);

  const query = { user: req.userId };
  if (req.query.category) query.category = req.query.category;
  if (req.query.status) query.status = req.query.status;

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = createPaginationMeta(total, page, limit);
  return sendPaginatedResponse(res, 'Notifications retrieved successfully', notifications, pagination);
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { readAt: new Date() },
    { new: true }
  );
  return sendSuccessResponse(res, 'Notification marked as read', { notification });
});

