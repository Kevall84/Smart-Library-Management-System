import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireUser } from '../middlewares/role.middleware.js';
import { auditLog } from '../middlewares/audit.middleware.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = express.Router();

// Webhooks need raw body for signature verification
// Note: Razorpay webhook signature verification needs the raw body as string
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);
router.post('/webhook/razorpay', express.raw({ type: 'application/json' }), paymentController.razorpayWebhook);

// Public endpoint to get payment config (Razorpay public key)
router.get('/config', paymentController.getPaymentConfig);

router.get('/me', authenticate, requireUser, paymentController.myPayments);
router.get('/:id', authenticate, requireUser, paymentController.getPayment);

router.post(
  '/verify/razorpay',
  authenticate,
  requireUser,
  auditLog('PAYMENT', 'payment'),
  paymentController.verifyRazorpay
);

export default router;

