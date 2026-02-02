import mongoose from 'mongoose';

/**
 * Email / system notifications history
 */

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'system'],
      required: [true, 'Notification type is required'],
    },
    category: {
      type: String,
      enum: [
        'rental_created',
        'rental_issued',
        'rental_due_soon',
        'rental_overdue',
        'rental_returned',
        'payment_success',
        'payment_failed',
        'qr_generated',
        'penalty_applied',
        'account_created',
        'password_reset',
        'general',
      ],
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'delivered'],
      default: 'pending',
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    errorMessage: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user notifications
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ category: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
