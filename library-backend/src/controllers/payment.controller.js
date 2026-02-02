import { asyncHandler } from '../middlewares/error.middleware.js';
import { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse } from '../utils/response.util.js';
import * as paymentService from '../services/payment.service.js';
import * as qrService from '../services/qr.service.js';
import Payment from '../models/Payment.model.js';
import Rental from '../models/Rental.model.js';
import User from '../models/User.model.js';
import { sendPaymentReceiptEmail, sendRentalConfirmationEmail } from '../services/email.service.js';
import { razorpay, stripe, PAYMENT_PROVIDER } from '../config/payment.config.js';
import config from '../config/env.js';
import crypto from 'crypto';

/**
 * Payments: list, verify (Razorpay), webhook (Stripe)
 */

/**
 * GET /api/payments/config
 * Get payment configuration (Razorpay public key)
 */
export const getPaymentConfig = asyncHandler(async (req, res) => {
  return sendSuccessResponse(res, 'Payment config retrieved successfully', {
    razorpayKeyId: config.RAZORPAY_KEY_ID || null,
    paymentProvider: PAYMENT_PROVIDER,
  });
});

export const myPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.getUserPayments(req.userId, req);
  return sendPaginatedResponse(res, 'Payments retrieved successfully', result.payments, result.pagination);
});

export const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id, req.userId);
  return sendSuccessResponse(res, 'Payment retrieved successfully', { payment });
});

/**
 * POST /api/payments/verify/razorpay
 * Body: { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyRazorpay = asyncHandler(async (req, res) => {
  const { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!paymentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return sendErrorResponse(res, 'Missing required fields', 400);
  }

  // Verify signature
  paymentService.verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  // Mark payment completed
  const payment = await paymentService.updatePaymentStatus(paymentId, 'completed', {
    providerPaymentId: razorpay_payment_id,
    transactionId: razorpay_payment_id,
    providerOrderId: razorpay_order_id,
  });

  // Post-payment: generate QR(issue) + email receipt + QR
  const rental = await Rental.findById(payment.rental).populate('book', 'title author coverImage').populate('user', 'name email');
  if (rental && rental.book) {
    const qrPack = await qrService.generateQRCode(rental._id, rental.user._id, 'issue');
    const qr = qrPack.qr;
    if (qr) {
      rental.qrCode = qr._id;
      await rental.save();

      await sendPaymentReceiptEmail(rental.user, payment, rental);
      await sendRentalConfirmationEmail(rental.user, rental, qr.qrCode);
    }

    return sendSuccessResponse(res, 'Payment verified and QR generated', {
      payment,
      rental,
      qr: { qrCode: qr.qrCode, type: qr.type, expiresAt: qr.expiresAt },
      qrCodeImage: qrPack.qrCodeImage,
    });
  }

  return sendSuccessResponse(res, 'Payment verified', { payment });
});

/**
 * POST /api/payments/webhook/stripe
 * Stripe sends raw body; route must use express.raw in router.
 */
export const stripeWebhook = asyncHandler(async (req, res) => {
  if (!stripe) {
    return sendErrorResponse(res, 'Stripe not configured', 400);
  }

  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return sendErrorResponse(res, 'Missing Stripe webhook configuration', 400);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const providerOrderId = intent.id;

    const payment = await Payment.findOne({ providerOrderId });
    if (payment) {
      const updated = await paymentService.updatePaymentStatus(payment._id, 'completed', {
        transactionId: intent.latest_charge || intent.id,
        providerPaymentId: intent.latest_charge || intent.id,
      });

      const rental = await Rental.findById(updated.rental).populate('book', 'title author coverImage').populate('user', 'name email');
      if (rental && rental.book) {
        const qrPack = await qrService.generateQRCode(rental._id, rental.user._id, 'issue');
        const qr = qrPack.qr;
        if (qr) {
          rental.qrCode = qr._id;
          await rental.save();

          await sendPaymentReceiptEmail(rental.user, updated, rental);
          await sendRentalConfirmationEmail(rental.user, rental, qr.qrCode);
        }
      }
    }
  }

  return res.json({ received: true });
});

/**
 * POST /api/payments/webhook/razorpay
 * Razorpay webhook handler for payment events
 * Note: Razorpay webhook needs raw body; route must use express.raw in router.
 */
export const razorpayWebhook = asyncHandler(async (req, res) => {
  if (!razorpay) {
    return sendErrorResponse(res, 'Razorpay not configured', 400);
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return sendErrorResponse(res, 'Missing Razorpay webhook secret', 400);
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return sendErrorResponse(res, 'Missing Razorpay signature', 400);
  }

  // Parse the raw body (it comes as Buffer)
  const bodyString = req.body.toString('utf8');
  let eventData;
  try {
    eventData = JSON.parse(bodyString);
  } catch (e) {
    return sendErrorResponse(res, 'Invalid JSON in webhook body', 400);
  }

  // Verify webhook signature using the raw body string
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(bodyString)
    .digest('hex');

  if (expectedSignature !== signature) {
    return sendErrorResponse(res, 'Invalid webhook signature', 400);
  }

  const event = eventData.event;
  const paymentData = eventData.payload?.payment?.entity || eventData.payload?.payment;

  if (event === 'payment.captured' || event === 'payment.authorized') {
    const providerPaymentId = paymentData.id;
    const providerOrderId = paymentData.order_id;

    // Find payment by providerOrderId
    const payment = await Payment.findOne({ providerOrderId });
    if (payment && payment.paymentStatus !== 'completed') {
      // Update payment status
      const updated = await paymentService.updatePaymentStatus(payment._id, 'completed', {
        providerPaymentId,
        transactionId: providerPaymentId,
        providerOrderId,
      });

      // Generate QR code and send emails if rental exists
      const rental = await Rental.findById(updated.rental).populate('book', 'title author coverImage').populate('user', 'name email');
      if (rental && rental.book) {
        const qrPack = await qrService.generateQRCode(rental._id, rental.user._id, 'issue');
        const qr = qrPack.qr;
        if (qr) {
          rental.qrCode = qr._id;
          await rental.save();

          await sendPaymentReceiptEmail(rental.user, updated, rental);
          await sendRentalConfirmationEmail(rental.user, rental, qr.qrCode);
        }
      }
    }
  } else if (event === 'payment.failed') {
    const providerOrderId = paymentData.order_id;
    const payment = await Payment.findOne({ providerOrderId });
    if (payment) {
      await paymentService.updatePaymentStatus(payment._id, 'failed', {
        failureReason: paymentData.error_description || 'Payment failed',
      });
    }
  }

  return res.json({ received: true });
});
