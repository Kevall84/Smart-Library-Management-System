import { asyncHandler } from '../middlewares/error.middleware.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/response.util.js';
import * as qrService from '../services/qr.service.js';
import Rental from '../models/Rental.model.js';

/**
 * QR retrieval for user/admin/librarian
 */

export const getQrByRental = asyncHandler(async (req, res) => {
  const { id } = req.params; // rentalId
  const { type } = req.query; // issue|return

  const rental = await Rental.findById(id).populate('user');
  if (!rental) {
    return sendErrorResponse(res, 'Rental not found', 404);
  }

  // Owner or staff only (route will enforce via middleware)
  const qr = await qrService.getQRByRental(id, type || null);
  const qrCodeImage = await qrService.generateQRCodeImage(qr.qrCode);

  return sendSuccessResponse(res, 'QR retrieved successfully', {
    qr: {
      id: qr._id,
      qrCode: qr.qrCode,
      type: qr.type,
      status: qr.status,
      expiresAt: qr.expiresAt,
    },
    qrCodeImage,
  });
});

