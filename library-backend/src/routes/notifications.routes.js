import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireUser } from '../middlewares/role.middleware.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/me', authenticate, requireUser, notificationController.myNotifications);
router.patch('/:id/read', authenticate, requireUser, notificationController.markRead);

export default router;

