import { asyncHandler } from '../middlewares/error.middleware.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response.util.js';
import { sendEmail } from '../services/email.service.js';
import config from '../config/env.js';

/**
 * Public "Contact Us" handler.
 * Sends an email to the library support address with the submitted message.
 */
export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message, targetEmail } = req.body || {};

  if (!name || !email || !message) {
    return sendErrorResponse(res, 'Name, email and message are required', 400);
  }

  // Prefer explicit target from frontend (admin settings), then fallback to env.
  const to =
    (typeof targetEmail === 'string' && targetEmail.trim()) ||
    process.env.CONTACT_EMAIL ||
    config.EMAIL_FROM;

  const subject = `New contact message from ${name}`;

  const safeMessage = String(message).slice(0, 5000);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; background: #f9fafb; }
          .container { max-width: 640px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; }
          .header { margin-bottom: 16px; }
          .meta { font-size: 14px; color: #6b7280; }
          .message { margin-top: 16px; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📩 New Contact Message</h2>
            <p class="meta">
              From: <strong>${name}</strong> &lt;${email}&gt;<br/>
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
          <hr />
          <div class="message">
            ${safeMessage.replace(/\n/g, '<br/>')}
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(to, subject, html, safeMessage);

  return sendSuccessResponse(res, 'Message sent successfully');
});

