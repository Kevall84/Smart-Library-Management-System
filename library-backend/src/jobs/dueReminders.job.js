import cron from 'node-cron';
import Rental from '../models/Rental.model.js';
import { sendDueDateReminderEmail, sendOverduePenaltyEmail } from '../services/email.service.js';
import * as rentalService from '../services/rental.service.js';

/**
 * Cron job: due reminders + overdue penalty alerts
 * - Due soon: rentals due in 1 day, status issued
 * - Overdue: calculate penalty and notify
 */

export const startDueRemindersJob = () => {
  // Every day at 09:00
  cron.schedule('0 9 * * *', async () => {
    try {
      const now = new Date();
      const tomorrowStart = new Date(now);
      tomorrowStart.setDate(now.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Due in 1 day
      const dueSoon = await Rental.find({
        status: 'issued',
        dueDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
      })
        .populate('user')
        .populate('book');

      for (const rental of dueSoon) {
        await sendDueDateReminderEmail(rental.user, rental);
      }

      // Overdue (issued/overdue, dueDate < now)
      const overdue = await Rental.find({
        status: { $in: ['issued', 'overdue'] },
        dueDate: { $lt: now },
      })
        .populate('user')
        .populate('book');

      for (const rental of overdue) {
        const penalty = await rentalService.calculatePenalty(rental._id);
        if (penalty?.isOverdue && penalty.penaltyAmount > 0) {
          await sendOverduePenaltyEmail(rental.user, rental, penalty.penaltyAmount);
        }
      }
    } catch (err) {
      console.error('Due reminders job failed:', err);
    }
  });
};

