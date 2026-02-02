import mongoose from 'mongoose';

/**
 * Offline library books (quantity, bestseller, category)
 */

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      index: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      index: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative'],
      default: 0,
    },
    rentPerDay: {
      type: Number,
      required: [true, 'Rent per day is required'],
      min: [0, 'Rent per day cannot be negative'],
    },
    coverImage: {
      type: String, // URL or path to cover image
      default: null,
    },
    isBestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedYear: {
      type: Number,
      min: [1000, 'Invalid year'],
      max: [new Date().getFullYear(), 'Year cannot be in future'],
    },
    publisher: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    totalRentals: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

// Method to check if book is available
bookSchema.methods.isAvailable = function () {
  return this.availableQuantity > 0 && this.isActive;
};

// Update available quantity when book is issued/returned
bookSchema.methods.decrementAvailable = function () {
  if (this.availableQuantity > 0) {
    this.availableQuantity -= 1;
  }
};

bookSchema.methods.incrementAvailable = function () {
  if (this.availableQuantity < this.quantity) {
    this.availableQuantity += 1;
  }
};

const Book = mongoose.model('Book', bookSchema);

export default Book;
