import mongoose from 'mongoose';

/**
 * Payment records & transaction IDs
 */

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'cash', 'other'],
      required: [true, 'Payment method is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    providerOrderId: {
      type: String, // Razorpay order_id or Stripe payment_intent_id
      index: true,
    },
    providerPaymentId: {
      type: String, // Razorpay payment_id or Stripe charge_id
    },
    receipt: {
      type: String, // URL or path to receipt
    },
    description: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    failureReason: {
      type: String,
      trim: true,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative'],
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user payments
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ paymentStatus: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
