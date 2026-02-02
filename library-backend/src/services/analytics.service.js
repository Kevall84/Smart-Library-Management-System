import Rental from '../models/Rental.model.js';
import Book from '../models/Book.model.js';
import User from '../models/User.model.js';
import Payment from '../models/Payment.model.js';
import { ROLES } from '../constants/roles.constants.js';

/**
 * Admin dashboard statistics & reports
 */

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalLibrarians,
    totalBooks,
    availableBooks,
    totalRentals,
    activeRentals,
    overdueRentals,
    totalRevenue,
    monthlyRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: ROLES.USER, isActive: true }),
    User.countDocuments({ role: ROLES.LIBRARIAN, isActive: true }),
    Book.countDocuments({ isActive: true }),
    Book.countDocuments({ isActive: true, availableQuantity: { $gt: 0 } }),
    Rental.countDocuments(),
    Rental.countDocuments({ status: { $in: ['pending', 'issued'] } }),
    Rental.countDocuments({ status: 'overdue', dueDate: { $lt: new Date() } }),
    Payment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: {
            $gte: new Date(new Date().setDate(1)), // First day of current month
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    users: {
      total: totalUsers,
      librarians: totalLibrarians,
    },
    books: {
      total: totalBooks,
      available: availableBooks,
      rented: totalBooks - availableBooks,
    },
    rentals: {
      total: totalRentals,
      active: activeRentals,
      overdue: overdueRentals,
    },
    revenue: {
      total: totalRevenue[0]?.total || 0,
      monthly: monthlyRevenue[0]?.total || 0,
    },
  };
};

/**
 * Get rental statistics over time
 */
export const getRentalStatistics = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const rentals = await Rental.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return rentals;
};

/**
 * Get revenue statistics over time
 */
export const getRevenueStatistics = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const revenue = await Payment.aggregate([
    {
      $match: {
        paymentStatus: 'completed',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return revenue;
};

/**
 * Get popular books
 */
export const getPopularBooks = async (limit = 10) => {
  const books = await Book.find({ isActive: true })
    .sort({ totalRentals: -1 })
    .limit(limit)
    .select('title author totalRentals coverImage');

  return books;
};

/**
 * Get book categories statistics
 */
export const getCategoryStatistics = async () => {
  const categories = await Book.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalRentals: { $sum: '$totalRentals' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return categories;
};

/**
 * Get user activity statistics
 */
export const getUserActivityStats = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await Rental.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$user',
        rentalCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        userId: '$_id',
        userName: '$user.name',
        userEmail: '$user.email',
        rentalCount: 1,
      },
    },
    {
      $sort: { rentalCount: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  return stats;
};

/**
 * Get overdue rentals report
 */
export const getOverdueReport = async () => {
  const overdueRentals = await Rental.find({
    status: { $in: ['issued', 'overdue'] },
    dueDate: { $lt: new Date() },
  })
    .populate('user', 'name email phone')
    .populate('book', 'title author')
    .sort({ dueDate: 1 });

  // Calculate penalties
  const { PENALTY_PER_DAY } = await import('../constants/pricing.constants.js');

  const report = overdueRentals.map((rental) => {
    const overdueDays = Math.ceil(
      (new Date() - rental.dueDate) / (1000 * 60 * 60 * 24)
    );
    const penaltyAmount = overdueDays * PENALTY_PER_DAY;

    return {
      rental: rental.toObject(),
      overdueDays,
      penaltyAmount,
    };
  });

  return report;
};
