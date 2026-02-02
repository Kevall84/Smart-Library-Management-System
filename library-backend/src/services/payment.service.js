import Payment from '../models/Payment.model.js';
import { razorpay, stripe, PAYMENT_PROVIDER } from '../config/payment.config.js';
import { getPaginationParams, createPaginationMeta } from '../utils/pagination.util.js';
import crypto from 'crypto';

/**
 * Payment creation & verification
 */

/**
 * Create payment order (Razorpay)
 */
export const createRazorpayOrder = async (amount, currency = 'INR', metadata = {}) => {
  if (!razorpay) {
    throw new Error('Razorpay not configured');
  }

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    receipt: `receipt_${Date.now()}`,
    notes: metadata,
  };

  const order = await razorpay.orders.create(options);

  return {
    orderId: order.id,
    amount: order.amount / 100,
    currency: order.currency,
    receipt: order.receipt,
  };
};

/**
 * Verify Razorpay payment
 */
export const verifyRazorpayPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  if (!razorpay) {
    throw new Error('Razorpay not configured');
  }

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    throw new Error('Invalid payment signature');
  }

  return true;
};

/**
 * Create payment intent (Stripe)
 */
export const createStripePaymentIntent = async (amount, currency = 'INR', metadata = {}) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Stripe expects amount in smallest currency unit
    currency: currency.toLowerCase(),
    metadata,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  };
};

/**
 * Create payment record
 */
export const createPayment = async (paymentData) => {
  const payment = await Payment.create(paymentData);
  return payment;
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (paymentId, status, providerData = {}) => {
  const updateData = {
    paymentStatus: status,
    ...providerData,
  };

  if (status === 'completed') {
    updateData.transactionId = providerData.transactionId || `TXN_${Date.now()}`;
  }

  const payment = await Payment.findByIdAndUpdate(paymentId, updateData, {
    new: true,
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  return payment;
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (paymentId, userId = null) => {
  const query = { _id: paymentId };
  if (userId) {
    query.user = userId;
  }

  const payment = await Payment.findOne(query).populate('rental').populate('user', 'name email');

  if (!payment) {
    throw new Error('Payment not found');
  }

  return payment;
};

/**
 * Get user payments
 */
export const getUserPayments = async (userId, req) => {
  const { page, limit, skip } = getPaginationParams(req, 10, 50);

  const query = { user: userId };

  // Filter by status if provided
  if (req.query.status) {
    query.paymentStatus = req.query.status;
  }

  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate('rental', 'rentalDays dueDate status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = createPaginationMeta(total, page, limit);

  return {
    payments,
    pagination,
  };
};

/**
 * Initiate payment (creates order/intent and payment record)
 */
export const initiatePayment = async (userId, amount, rentalId, metadata = {}) => {
  let providerData = {};

  if (PAYMENT_PROVIDER === 'razorpay') {
    const order = await createRazorpayOrder(amount, 'INR', metadata);
    providerData = {
      providerOrderId: order.orderId,
    };
  } else if (PAYMENT_PROVIDER === 'stripe') {
    const intent = await createStripePaymentIntent(amount, 'INR', metadata);
    providerData = {
      providerOrderId: intent.paymentIntentId,
      clientSecret: intent.clientSecret,
    };
  }

  // Create payment record
  const payment = await createPayment({
    user: userId,
    rental: rentalId || null,
    amount,
    currency: 'INR',
    paymentMethod: PAYMENT_PROVIDER,
    paymentStatus: 'pending',
    ...providerData,
    metadata,
  });

  return {
    payment,
    ...providerData,
  };
};
