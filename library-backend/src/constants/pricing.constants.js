/**
 * Rent price (₹30/day), penalty (₹50/day), max days
 */

export const RENT_PER_DAY = 30; // ₹30 per day
export const PENALTY_PER_DAY = 50; // ₹50 per day for overdue
export const MAX_RENTAL_DAYS = 30; // Maximum days a book can be rented
export const MIN_RENTAL_DAYS = 1; // Minimum days a book can be rented

// Default rental period (can be configured by admin)
export const DEFAULT_RENTAL_DAYS = 7;

export default {
  RENT_PER_DAY,
  PENALTY_PER_DAY,
  MAX_RENTAL_DAYS,
  MIN_RENTAL_DAYS,
  DEFAULT_RENTAL_DAYS,
};
