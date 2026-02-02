import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeOwnerOrStaff } from '../middlewares/role.middleware.js';
import * as qrController from '../controllers/qr.controller.js';

const router = express.Router();

// Owner or staff can fetch QR by rental
router.get('/rental/:id', authenticate, authorizeOwnerOrStaff, qrController.getQrByRental);

export default router;

