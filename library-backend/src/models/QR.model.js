import mongoose from 'mongoose';
import crypto from 'crypto';
import config from '../config/env.js';

/**
 * QR code data for issue & return verification
 */

const qrSchema = new mongoose.Schema(
  {
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: [true, 'Rental is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['issue', 'return'],
      required: [true, 'QR type is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'used', 'expired'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Librarian who scanned the QR
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique QR code before saving
qrSchema.pre('save', async function (next) {
  if (!this.qrCode) {
    // Generate unique QR code string
    const data = `${this.rental}-${this.user}-${Date.now()}`;
    this.qrCode = crypto.createHash('sha256').update(data).digest('hex');
  }
  
  // Set expiry date if not set
  if (!this.expiresAt) {
    const expiryHours = config.QR_CODE_EXPIRY_HOURS || 24;
    this.expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
  }
  
  next();
});

// Method to check if QR is valid
qrSchema.methods.isValid = function () {
  return this.status === 'pending' && new Date() < this.expiresAt;
};

// Method to mark as used
qrSchema.methods.markAsUsed = function (librarianId) {
  this.status = 'used';
  this.usedAt = new Date();
  this.usedBy = librarianId;
};

// Index for active QR codes
qrSchema.index({ status: 1, expiresAt: 1 });
// Ensure one QR per rental per type (issue/return)
qrSchema.index({ rental: 1, type: 1 }, { unique: true });

const QR = mongoose.model('QR', qrSchema);

export default QR;
