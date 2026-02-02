import nodemailer from 'nodemailer';
import config from './env.js';

/**
 * Nodemailer SMTP configuration for emails
 */

let transporter = null;

if (config.SMTP_USER && config.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email configuration error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
} else {
  console.warn('Email configuration missing. Email features will be disabled.');
}

export default transporter;
