import transporter from '../config/mail.config.js';
import config from '../config/env.js';
import Notification from '../models/Notification.model.js';
import { generateQRCodeImage } from './qr.service.js';

/**
 * Sends receipt & QR code via email
 */

/**
 * Send email
 */
export const sendEmail = async (to, subject, html, text = null) => {
  if (!transporter) {
    console.warn('Email transporter not configured');
    throw new Error('Email transporter not configured');
  }

  try {
    const mailOptions = {
      from: config.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || subject,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send rental confirmation email with QR code
 */
export const sendRentalConfirmationEmail = async (user, rental, qrCodeString) => {
  try {
    // Ensure rental.book is populated
    if (!rental.book || typeof rental.book === 'string') {
      const Rental = (await import('../models/Rental.model.js')).default;
      const populatedRental = await Rental.findById(rental._id || rental).populate('book', 'title author');
      if (populatedRental && populatedRental.book) {
        rental = populatedRental;
      } else {
        throw new Error('Rental book information not available');
      }
    }

    // Generate QR code image
    const qrCodeImage = await generateQRCodeImage(qrCodeString);

    const bookTitle = rental.book?.title || 'Unknown Book';
    const bookAuthor = rental.book?.author || 'Unknown Author';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .qr-code { text-align: center; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 Library Rental Confirmation</h1>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <p>Your rental request has been confirmed!</p>
            <h3>Rental Details:</h3>
            <ul>
              <li><strong>Book:</strong> ${bookTitle}</li>
              <li><strong>Author:</strong> ${bookAuthor}</li>
              <li><strong>Rental Days:</strong> ${rental.rentalDays}</li>
              <li><strong>Due Date:</strong> ${new Date(rental.dueDate).toLocaleDateString()}</li>
            </ul>
            <div class="qr-code">
              <h3>Your QR Code for Library Visit:</h3>
              <img src="${qrCodeImage}" alt="QR Code" style="max-width: 300px;" />
              <p>Please show this QR code at the library to collect your book.</p>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for using our library service!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const subject = 'Library Rental Confirmation - QR Code';
    await sendEmail(user.email, subject, html);

    // Save notification
    await Notification.create({
      user: user._id,
      type: 'email',
      category: 'qr_generated',
      subject,
      message: `Your rental QR code has been generated for ${bookTitle}`,
      status: 'sent',
      sentAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error('Error sending rental confirmation email:', error);
    throw error;
  }
};

/**
 * Send payment receipt email
 */
export const sendPaymentReceiptEmail = async (user, payment, rental) => {
  try {
    // Ensure rental.book is populated if rental exists
    let bookTitle = 'N/A';
    if (rental) {
      if (!rental.book || typeof rental.book === 'string') {
        const Rental = (await import('../models/Rental.model.js')).default;
        const populatedRental = await Rental.findById(rental._id || rental).populate('book', 'title');
        if (populatedRental && populatedRental.book) {
          bookTitle = populatedRental.book.title;
        }
      } else {
        bookTitle = rental.book?.title || 'N/A';
      }
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .receipt { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Receipt</h1>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <p>Your payment has been processed successfully!</p>
            <div class="receipt">
              <h3>Payment Details:</h3>
              <p><strong>Transaction ID:</strong> ${payment.transactionId || payment.providerOrderId}</p>
              <p><strong>Amount:</strong> ₹${payment.amount}</p>
              <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
              <p><strong>Status:</strong> ${payment.paymentStatus}</p>
              <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
              ${rental ? `<p><strong>Book:</strong> ${bookTitle}</p>` : ''}
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your payment!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const subject = 'Payment Receipt - Library Rental';
    await sendEmail(user.email, subject, html);

    // Save notification
    await Notification.create({
      user: user._id,
      type: 'email',
      category: 'payment_success',
      subject,
      message: `Payment of ₹${payment.amount} processed successfully`,
      status: 'sent',
      sentAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
    throw error;
  }
};

/**
 * Send due date reminder email
 */
export const sendDueDateReminderEmail = async (user, rental) => {
  try {
    // Ensure rental.book is populated
    if (!rental.book || typeof rental.book === 'string') {
      const Rental = (await import('../models/Rental.model.js')).default;
      const populatedRental = await Rental.findById(rental._id || rental).populate('book', 'title');
      if (populatedRental && populatedRental.book) {
        rental = populatedRental;
      }
    }

    const daysUntilDue = Math.ceil(
      (rental.dueDate - new Date()) / (1000 * 60 * 60 * 24)
    );

    const bookTitle = rental.book?.title || 'N/A';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Book Return Reminder</h1>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <div class="warning">
              <h3>Your book is due soon!</h3>
              <p><strong>Book:</strong> ${bookTitle}</p>
              <p><strong>Due Date:</strong> ${new Date(rental.dueDate).toLocaleDateString()}</p>
              <p><strong>Days Remaining:</strong> ${daysUntilDue} day(s)</p>
            </div>
            <p>Please return the book on or before the due date to avoid penalties.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const subject = `Reminder: Return "${bookTitle}" by ${new Date(rental.dueDate).toLocaleDateString()}`;
    await sendEmail(user.email, subject, html);

    // Save notification
    await Notification.create({
      user: user._id,
      type: 'email',
      category: 'rental_due_soon',
      subject,
      message: `Your book "${bookTitle}" is due in ${daysUntilDue} day(s)`,
      status: 'sent',
      sentAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error('Error sending due date reminder email:', error);
    throw error;
  }
};

/**
 * Send overdue penalty email
 */
export const sendOverduePenaltyEmail = async (user, rental, penaltyAmount) => {
  try {
    // Ensure rental.book is populated
    if (!rental.book || typeof rental.book === 'string') {
      const Rental = (await import('../models/Rental.model.js')).default;
      const populatedRental = await Rental.findById(rental._id || rental).populate('book', 'title');
      if (populatedRental && populatedRental.book) {
        rental = populatedRental;
      }
    }

    const bookTitle = rental.book?.title || 'N/A';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .alert { background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Overdue Book - Penalty Applied</h1>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <div class="alert">
              <h3>Your book is overdue!</h3>
              <p><strong>Book:</strong> ${bookTitle}</p>
              <p><strong>Due Date:</strong> ${new Date(rental.dueDate).toLocaleDateString()}</p>
              <p><strong>Penalty Amount:</strong> ₹${penaltyAmount}</p>
            </div>
            <p>Please return the book immediately to avoid additional penalties.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const subject = `Overdue: Return "${bookTitle}" - Penalty ₹${penaltyAmount}`;
    await sendEmail(user.email, subject, html);

    // Save notification
    await Notification.create({
      user: user._id,
      type: 'email',
      category: 'penalty_applied',
      subject,
      message: `Penalty of ₹${penaltyAmount} applied for overdue book "${bookTitle}"`,
      status: 'sent',
      sentAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error('Error sending overdue penalty email:', error);
    throw error;
  }
};
