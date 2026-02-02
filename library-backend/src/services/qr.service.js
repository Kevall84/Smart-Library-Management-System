import QR from '../models/QR.model.js';
import qrcode from 'qrcode';
import config from '../config/env.js';
import crypto from 'crypto';

/**
 * QR code generation & validation
 */

/**
 * Generate QR code for rental
 */
export const generateQRCode = async (rentalId, userId, type = 'issue') => {
  // Check if QR already exists
  let qr = await QR.findOne({ rental: rentalId, type });

  if (qr && qr.isValid()) {
    // Return existing valid QR
    return {
      qr,
      qrCodeImage: await generateQRCodeImage(qr.qrCode),
    };
  }

  // Calculate expiry date
  const expiryHours = config.QR_CODE_EXPIRY_HOURS || 24;
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  // Generate unique QR code string
  const data = `${rentalId}-${userId}-${Date.now()}-${type}`;
  const qrCodeString = crypto.createHash('sha256').update(data).digest('hex');

  // Create new QR with explicit fields
  qr = await QR.create({
    rental: rentalId,
    user: userId,
    type,
    status: 'pending',
    qrCode: qrCodeString,
    expiresAt: expiresAt,
  });

  // Generate QR code image
  const qrCodeImage = await qrcode.toDataURL(qr.qrCode, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 1,
  });

  return {
    qr,
    qrCodeImage,
  };
};

/**
 * Validate QR code
 */
export const validateQRCode = async (qrCodeString) => {
  const qr = await QR.findOne({ qrCode: qrCodeString }).populate('rental').populate('user');

  if (!qr) {
    throw new Error('Invalid QR code');
  }

  if (!qr.isValid()) {
    throw new Error('QR code has expired or has already been used');
  }

  return qr;
};

/**
 * Mark QR as used
 */
export const markQRAsUsed = async (qrId, librarianId) => {
  const qr = await QR.findById(qrId);

  if (!qr) {
    throw new Error('QR code not found');
  }

  if (!qr.isValid()) {
    throw new Error('QR code is not valid');
  }

  qr.markAsUsed(librarianId);
  await qr.save();

  return qr;
};

/**
 * Get QR code by rental ID
 */
export const getQRByRental = async (rentalId, type = null) => {
  const query = { rental: rentalId };
  if (type) {
    query.type = type;
  }

  const qr = await QR.findOne(query).populate('rental').populate('user');

  if (!qr) {
    throw new Error('QR code not found');
  }

  return qr;
};

/**
 * Generate QR code image data URL
 */
export const generateQRCodeImage = async (qrCodeString) => {
  try {
    const qrCodeImage = await qrcode.toDataURL(qrCodeString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 1,
    });

    return qrCodeImage;
  } catch (error) {
    throw new Error('Failed to generate QR code image');
  }
};
