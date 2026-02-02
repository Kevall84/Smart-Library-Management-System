import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireUser, requireLibrarianOrAdmin } from '../middlewares/role.middleware.js';
import { auditLog } from '../middlewares/audit.middleware.js';
import * as rentalController from '../controllers/rental.controller.js';

const router = express.Router();

// Staff lists (must be before "/:id")
router.get('/', authenticate, requireLibrarianOrAdmin, rentalController.staffRentals);
router.get('/overdue', authenticate, requireLibrarianOrAdmin, rentalController.overdueRentals);
router.get('/stats/staff', authenticate, requireLibrarianOrAdmin, rentalController.staffStats);

// User
router.post(
  '/',
  authenticate,
  requireUser,
  auditLog('CREATE', 'rental'),
  rentalController.validateCreateRental,
  rentalController.createRental
);
router.get('/me', authenticate, requireUser, rentalController.myRentals);
router.get('/stats/me', authenticate, requireUser, rentalController.myStats);

// Librarian/Admin - QR scan issue/return (must be before /:id routes)
router.post(
  '/scan',
  authenticate,
  requireLibrarianOrAdmin,
  auditLog('UPDATE', 'rental'),
  rentalController.scanQrAndProcess
);

// Direct return endpoint for librarians (must be before /:id routes)
router.post(
  '/:id/return',
  authenticate,
  requireLibrarianOrAdmin,
  auditLog('UPDATE', 'rental'),
  rentalController.directReturn
);

router.post(
  '/:id/generate-return-qr',
  authenticate,
  requireLibrarianOrAdmin,
  auditLog('CREATE', 'rental'),
  rentalController.generateReturnQr
);

// User rental routes (must be after specific routes)
router.get('/:id', authenticate, rentalController.getRental);
router.get('/:id/penalty', authenticate, rentalController.penalty);

export default router;

