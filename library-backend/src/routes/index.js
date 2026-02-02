import express from 'express';

import authRoutes from './auth.routes.js';
import bookRoutes from './books.routes.js';
import ebookRoutes from './ebooks.routes.js';
import rentalRoutes from './rentals.routes.js';
import paymentRoutes from './payments.routes.js';
import qrRoutes from './qr.routes.js';
import notificationRoutes from './notifications.routes.js';
import adminRoutes from './admin.routes.js';
import contactRoutes from './contact.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/ebooks', ebookRoutes);
router.use('/rentals', rentalRoutes);
router.use('/payments', paymentRoutes);
router.use('/qr', qrRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);

export default router;

