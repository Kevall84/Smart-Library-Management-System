import Razorpay from 'razorpay';
import Stripe from 'stripe';
import config from './env.js';

/**
 * Razorpay / Stripe keys & setup
 */

// Razorpay Configuration
let razorpayInstance = null;
if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
  });
}

// Stripe Configuration
let stripeInstance = null;
if (config.STRIPE_SECRET_KEY) {
  stripeInstance = new Stripe(config.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });
}

export const razorpay = razorpayInstance;
export const stripe = stripeInstance;

// Payment provider selection (default: razorpay)
export const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'razorpay';

export default {
  razorpay,
  stripe,
  PAYMENT_PROVIDER,
};
