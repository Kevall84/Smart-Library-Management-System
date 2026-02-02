import express from 'express';
import multer from 'multer';
import config from '../config/env.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireLibrarianOrAdmin, requireAdmin } from '../middlewares/role.middleware.js';
import { auditLog } from '../middlewares/audit.middleware.js';
import * as bookController from '../controllers/book.controller.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.MAX_FILE_SIZE || 5 * 1024 * 1024 },
});

// Public/User
router.get('/', bookController.getBooks);
router.get('/available', bookController.getAvailableBooks);
router.get('/:id', bookController.getBook);

// Librarian/Admin
router.post(
  '/',
  authenticate,
  requireLibrarianOrAdmin,
  auditLog('CREATE', 'book'),
  bookController.validateCreateBook,
  bookController.createBook
);
router.put(
  '/:id',
  authenticate,
  requireLibrarianOrAdmin,
  auditLog('UPDATE', 'book'),
  bookController.updateBook
);
router.delete(
  '/:id',
  authenticate,
  requireLibrarianOrAdmin,
  auditLog('DELETE', 'book'),
  bookController.deleteBook
);

// CSV import (admin/librarian)
router.post(
  '/import/csv',
  authenticate,
  requireLibrarianOrAdmin,
  auditLog('CREATE', 'inventory'),
  upload.single('file'),
  bookController.importBooksFromCsv
);

export default router;

