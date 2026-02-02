import mongoose from 'mongoose';

/**
 * Book rental details, due date, penalty status
 */

const rentalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book is required'],
      index: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Payment is required'],
    },
    qrCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QR',
      default: null,
    },
    rentalDays: {
      type: Number,
      required: [true, 'Rental days is required'],
      min: [1, 'Rental days must be at least 1'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'issued', 'returned', 'overdue', 'cancelled'],
      default: 'pending',
      index: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Librarian who issued the book
      default: null,
    },
    issuedAt: {
      type: Date,
      default: null,
    },
    returnedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Librarian who received the return
      default: null,
    },
    penaltyAmount: {
      type: Number,
      default: 0,
      min: [0, 'Penalty cannot be negative'],
    },
    penaltyPaid: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if rental is overdue
rentalSchema.methods.isOverdue = function () {
  if (this.status === 'returned' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.dueDate && this.status !== 'returned';
};

// Method to calculate penalty
rentalSchema.methods.calculatePenalty = async function () {
  if (this.status === 'returned' || this.status === 'cancelled') {
    return 0;
  }
  const now = new Date();
  if (now <= this.dueDate) {
    return 0;
  }
  const overdueDays = Math.ceil((now - this.dueDate) / (1000 * 60 * 60 * 24));
  // Penalty calculation logic (can be customized)
  const { PENALTY_PER_DAY } = await import('../constants/pricing.constants.js');
  return overdueDays * PENALTY_PER_DAY;
};

// Index for active rentals
rentalSchema.index({ user: 1, status: 1 });
rentalSchema.index({ book: 1, status: 1 });
rentalSchema.index({ dueDate: 1, status: 1 });

const Rental = mongoose.model('Rental', rentalSchema);

export default Rental;
