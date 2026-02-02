import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse } from '../utils/response.util.js';
import * as rentalService from '../services/rental.service.js';
import * as paymentService from '../services/payment.service.js';
import * as qrService from '../services/qr.service.js';
import User from '../models/User.model.js';
import Rental from '../models/Rental.model.js';
import Book from '../models/Book.model.js';
import Payment from '../models/Payment.model.js';
import { sendRentalConfirmationEmail } from '../services/email.service.js';

/**
 * Rentals: user creates rental (after initiating payment),
 * librarian issues/returns via QR validation.
 */

export const validateCreateRental = [
  body('bookId').isMongoId().withMessage('Valid bookId is required'),
  body('rentalDays').isInt({ min: 1 }).withMessage('rentalDays must be >= 1'),
];

/**
 * POST /api/rentals
 * Body: { bookId, rentalDays }
 * Flow: create payment -> create rental -> generate QR(issue) -> email receipt+qr after payment completion via webhook/verify
 */
export const createRental = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { bookId, rentalDays } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    return sendErrorResponse(res, 'Book not found', 404);
  }

  const amount = Number(book.rentPerDay) * Number(rentalDays);

  // Create payment record + provider order/intent
  const paymentInit = await paymentService.initiatePayment(
    req.userId,
    amount,
    null,
    { bookId: String(bookId), rentalDays: String(rentalDays) }
  );

  const rental = await rentalService.createRental(req.userId, bookId, rentalDays, paymentInit.payment._id);

  const qrPack = await qrService.generateQRCode(rental._id, req.userId, 'issue');
  const qr = qrPack.qr;

  if (qr) {
    rental.qrCode = qr._id;
    await rental.save();
  }

  paymentInit.payment.rental = rental._id;
  await paymentInit.payment.save();

  return sendSuccessResponse(
    res,
    'Rental created. Complete payment to receive QR code.',
    {
      rental,
      payment: paymentInit.payment,
      provider: {
        paymentProvider: paymentInit.payment.paymentMethod,
        providerOrderId: paymentInit.providerOrderId,
        clientSecret: paymentInit.clientSecret,
      },
      qr: {
        id: qr._id,
        type: qr.type,
        status: qr.status,
      },
    },
    201
  );
});

export const myRentals = asyncHandler(async (req, res) => {
  const result = await rentalService.getUserRentals(req.userId, req);
  return sendPaginatedResponse(res, 'Rentals retrieved successfully', result.rentals, result.pagination);
});

/**
 * GET /api/rentals/stats/me
 * Get user dashboard statistics
 */
export const myStats = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const now = new Date();
  const weekFromNow = new Date(now);
  weekFromNow.setDate(now.getDate() + 7);

  // Active rentals (issued or pending)
  const activeRentals = await Rental.countDocuments({
    user: userId,
    status: { $in: ['pending', 'issued'] },
  });

  // Due soon (within 7 days, status issued)
  const dueSoon = await Rental.countDocuments({
    user: userId,
    status: 'issued',
    dueDate: { $gte: now, $lte: weekFromNow },
  });

  // Total payments (lifetime)
  const totalPaymentsResult = await Payment.aggregate([
    {
      $match: {
        user: userId,
        paymentStatus: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const totalPayments = totalPaymentsResult[0]?.total || 0;

  return sendSuccessResponse(res, 'User stats retrieved successfully', {
    stats: {
      activeRentals,
      dueSoon,
      totalPayments,
    },
  });
});

/**
 * GET /api/rentals/stats/staff
 * Get librarian/admin dashboard statistics
 */
export const staffStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Books issued today
  const booksIssuedToday = await Rental.countDocuments({
    status: 'issued',
    issuedAt: { $gte: todayStart, $lte: todayEnd },
  });

  // Books returned today
  const booksReturnedToday = await Rental.countDocuments({
    status: 'returned',
    returnDate: { $gte: todayStart, $lte: todayEnd },
  });

  // Overdue books
  const overdueBooks = await Rental.countDocuments({
    status: { $in: ['issued', 'overdue'] },
    dueDate: { $lt: now },
  });

  return sendSuccessResponse(res, 'Staff stats retrieved successfully', {
    stats: {
      booksIssuedToday,
      booksReturnedToday,
      overdueBooks,
    },
  });
});

export const getRental = asyncHandler(async (req, res) => {
  // Staff (librarian/admin) can access any rental, users can only access their own
  const isStaff = req.user?.role === 'librarian' || req.user?.role === 'admin';
  const userId = isStaff ? null : (req.userId || req.user?._id);
  
  const rental = await rentalService.getRentalById(req.params.id, userId);
  return sendSuccessResponse(res, 'Rental retrieved successfully', { rental });
});

export const penalty = asyncHandler(async (req, res) => {
  const result = await rentalService.calculatePenalty(req.params.id);
  return sendSuccessResponse(res, 'Penalty calculated successfully', result);
});

/**
 * GET /api/rentals (staff)
 */
export const staffRentals = asyncHandler(async (req, res) => {
  const result = await rentalService.getStaffRentals(req);
  return sendPaginatedResponse(res, 'Rentals retrieved successfully', result.rentals, result.pagination);
});

/**
 * GET /api/rentals/overdue (staff)
 */
export const overdueRentals = asyncHandler(async (req, res) => {
  const result = await rentalService.getOverdueRentals(req);
  return sendPaginatedResponse(res, 'Overdue rentals retrieved successfully', result.rentals, result.pagination);
});

/**
 * POST /api/rentals/scan
 * Body: { qrCode }
 * Librarian: validate QR, mark used, issue/return depending on QR.type
 */
export const scanQrAndProcess = asyncHandler(async (req, res) => {
  const { qrCode } = req.body;
  if (!qrCode) {
    return sendErrorResponse(res, 'qrCode is required', 400);
  }

  const qr = await qrService.validateQRCode(qrCode);
  const rentalId = qr.rental?._id || qr.rental;

  if (!rentalId) {
    return sendErrorResponse(res, 'QR is not linked to a rental', 400);
  }

  // Mark QR as used first (prevents replay)
  await qrService.markQRAsUsed(qr._id, req.userId);

  let rental;
  if (qr.type === 'issue') {
    rental = await rentalService.issueBook(rentalId, req.userId);
  } else if (qr.type === 'return') {
    rental = await rentalService.returnBook(rentalId, req.userId);
  } else {
    return sendErrorResponse(res, 'Invalid QR type', 400);
  }

  return sendSuccessResponse(res, 'QR processed successfully', { rental, qrType: qr.type });
});

/**
 * POST /api/rentals/:id/generate-return-qr
 * Librarian/Admin can generate a return QR for an issued rental
 */
export const generateReturnQr = asyncHandler(async (req, res) => {
  const rental = await Rental.findById(req.params.id).populate('user').populate('book');
  if (!rental) {
    return sendErrorResponse(res, 'Rental not found', 404);
  }
  if (rental.status !== 'issued' && rental.status !== 'overdue') {
    return sendErrorResponse(res, 'Return QR can only be generated for issued/overdue rentals', 400);
  }

  const qrPack = await qrService.generateQRCode(rental._id, rental.user._id, 'return');
  const qr = qrPack.qr;

  if (!qr) {
    return sendErrorResponse(res, 'Failed to generate QR code', 500);
  }

  // Email return QR to user
  await sendRentalConfirmationEmail(rental.user, rental, qr.qrCode);

  return sendSuccessResponse(res, 'Return QR generated successfully', {
    qr: {
      id: qr._id,
      qrCode: qr.qrCode,
      type: qr.type,
      expiresAt: qr.expiresAt,
    },
    qrCodeImage: qrPack.qrCodeImage,
  });
});

/**
 * POST /api/rentals/:id/return
 * Direct return endpoint for librarians (without QR scan)
 */
export const directReturn = asyncHandler(async (req, res) => {
  const rental = await Rental.findById(req.params.id).populate('book').populate('user');
  if (!rental) {
    return sendErrorResponse(res, 'Rental not found', 404);
  }
  
  if (rental.status !== 'issued' && rental.status !== 'overdue') {
    return sendErrorResponse(res, 'Book must be issued to be returned', 400);
  }

  // Calculate penalty
  const penaltyResult = await rentalService.calculatePenalty(rental._id);
  
  // Process return
  const returnedRental = await rentalService.returnBook(rental._id, req.userId);

  return sendSuccessResponse(res, 'Book returned successfully', {
    rental: returnedRental,
    penalty: {
      amount: penaltyResult.penaltyAmount || 0,
      isOverdue: penaltyResult.isOverdue || false,
    },
  });
});