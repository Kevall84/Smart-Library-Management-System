import Rental from '../models/Rental.model.js';
import Book from '../models/Book.model.js';
import Payment from '../models/Payment.model.js';
import { PENALTY_PER_DAY, MAX_RENTAL_DAYS } from '../constants/pricing.constants.js';
import { getPaginationParams, createPaginationMeta } from '../utils/pagination.util.js';

/**
 * Rent, return, due date, penalty calculation
 */

/**
 * Create rental request
 */
export const createRental = async (userId, bookId, rentalDays, paymentId) => {
  // Validate rental days
  if (rentalDays < 1 || rentalDays > MAX_RENTAL_DAYS) {
    throw new Error(`Rental days must be between 1 and ${MAX_RENTAL_DAYS}`);
  }

  // Get book
  const book = await Book.findById(bookId);
  if (!book) {
    throw new Error('Book not found');
  }

  // Check availability
  if (book.availableQuantity <= 0) {
    throw new Error('Book is not available');
  }

  // Check if user already has active rental for this book
  const existingRental = await Rental.findOne({
    user: userId,
    book: bookId,
    status: { $in: ['pending', 'issued'] },
  });

  if (existingRental) {
    throw new Error('You already have an active rental for this book');
  }

  // Calculate due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + rentalDays);

  // Create rental
  const rental = await Rental.create({
    user: userId,
    book: bookId,
    payment: paymentId,
    rentalDays,
    dueDate,
    status: 'pending',
  });

  return rental;
};

/**
 * Issue book (librarian action)
 */
export const issueBook = async (rentalId, librarianId) => {
  const rental = await Rental.findById(rentalId)
    .populate('book')
    .populate('user');

  if (!rental) {
    throw new Error('Rental not found');
  }

  if (rental.status !== 'pending') {
    throw new Error('Rental cannot be issued. Invalid status');
  }

  // Check book availability
  if (rental.book.availableQuantity <= 0) {
    throw new Error('Book is not available');
  }

  // Update rental
  rental.status = 'issued';
  rental.issuedBy = librarianId;
  rental.issuedAt = new Date();
  await rental.save();

  // Update book quantity
  rental.book.decrementAvailable();
  rental.book.totalRentals += 1;
  await rental.book.save();

  return rental;
};

/**
 * Return book
 */
export const returnBook = async (rentalId, librarianId) => {
  const rental = await Rental.findById(rentalId)
    .populate('book')
    .populate('user');

  if (!rental) {
    throw new Error('Rental not found');
  }

  if (rental.status !== 'issued') {
    throw new Error('Book is not currently issued');
  }

  // Calculate penalty if overdue
  let penaltyAmount = 0;
  if (new Date() > rental.dueDate) {
    const overdueDays = Math.ceil(
      (new Date() - rental.dueDate) / (1000 * 60 * 60 * 24)
    );
    penaltyAmount = overdueDays * PENALTY_PER_DAY;
  }

  // Update rental - always set to 'returned' when book is returned
  rental.status = 'returned';
  rental.returnDate = new Date();
  rental.returnedTo = librarianId;
  rental.penaltyAmount = penaltyAmount;
  await rental.save();

  // Update book quantity
  rental.book.incrementAvailable();
  await rental.book.save();

  return rental;
};

/**
 * Get user rentals
 */
export const getUserRentals = async (userId, req) => {
  const { page, limit, skip } = getPaginationParams(req, 10, 50);

  const query = { user: userId };

  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await Rental.countDocuments(query);
  const rentals = await Rental.find(query)
    .populate('book', 'title author coverImage rentPerDay')
    .populate('payment', 'amount paymentStatus')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = createPaginationMeta(total, page, limit);

  return {
    rentals,
    pagination,
  };
};

/**
 * Staff (librarian/admin) rentals list with filters
 */
export const getStaffRentals = async (req) => {
  const { page, limit, skip } = getPaginationParams(req, 20, 100);

  const query = {};

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.userId) {
    query.user = req.query.userId;
  }

  if (req.query.bookId) {
    query.book = req.query.bookId;
  }

  const total = await Rental.countDocuments(query);
  const rentals = await Rental.find(query)
    .populate('user', 'name email phone')
    .populate('book', 'title author coverImage')
    .populate('payment', 'amount paymentStatus')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = createPaginationMeta(total, page, limit);

  return { rentals, pagination };
};

/**
 * Get rental by ID
 * If userId is provided, only returns rental if user owns it
 * If userId is null, returns rental without ownership check (for staff)
 */
export const getRentalById = async (rentalId, userId = null) => {
  const query = { _id: rentalId };
  
  // Only filter by user if userId is provided (for regular users)
  // Staff (librarian/admin) can pass null to access any rental
  if (userId) {
    query.user = userId;
  }

  const rental = await Rental.findOne(query)
    .populate('book', 'title author coverImage rentPerDay')
    .populate('user', 'name email')
    .populate('payment', 'amount paymentStatus transactionId providerOrderId')
    .populate('issuedBy', 'name email')
    .populate('returnedTo', 'name email');

  if (!rental) {
    throw new Error('Rental not found');
  }

  return rental;
};

/**
 * Calculate penalty for rental
 */
export const calculatePenalty = async (rentalId) => {
  const rental = await Rental.findById(rentalId);

  if (!rental) {
    throw new Error('Rental not found');
  }

  if (rental.status === 'returned' || rental.status === 'cancelled') {
    return { penaltyAmount: rental.penaltyAmount || 0, isOverdue: false };
  }

  const now = new Date();
  if (now <= rental.dueDate) {
    return { penaltyAmount: 0, isOverdue: false };
  }

  const overdueDays = Math.ceil((now - rental.dueDate) / (1000 * 60 * 60 * 24));
  const penaltyAmount = overdueDays * PENALTY_PER_DAY;

  // Update rental if penalty changed
  if (rental.penaltyAmount !== penaltyAmount) {
    rental.penaltyAmount = penaltyAmount;
    rental.status = 'overdue';
    await rental.save();
  }

  return {
    penaltyAmount,
    isOverdue: true,
    overdueDays,
  };
};

/**
 * Get overdue rentals
 */
export const getOverdueRentals = async (req) => {
  const { page, limit, skip } = getPaginationParams(req, 20, 100);

  const query = {
    status: { $in: ['issued', 'overdue'] },
    dueDate: { $lt: new Date() },
  };

  const total = await Rental.countDocuments(query);
  const rentals = await Rental.find(query)
    .populate('user', 'name email phone')
    .populate('book', 'title author coverImage')
    .sort({ dueDate: 1 })
    .skip(skip)
    .limit(limit);

  // Calculate penalties
  const rentalsWithPenalties = await Promise.all(
    rentals.map(async (rental) => {
      const penalty = await calculatePenalty(rental._id);
      return {
        ...rental.toObject(),
        ...penalty,
      };
    })
  );

  const pagination = createPaginationMeta(total, page, limit);

  return {
    rentals: rentalsWithPenalties,
    pagination,
  };
};
