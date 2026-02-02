import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';
import { auditLog } from '../middlewares/audit.middleware.js';
import * as analyticsController from '../controllers/analytics.controller.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

// Users & staff
router.get('/users', auditLog('READ', 'user'), adminController.listUsers);
router.post('/staff', auditLog('CREATE', 'user'), adminController.validateCreateStaff, adminController.createStaffUser);
router.patch('/users/:id/active', auditLog('UPDATE', 'user'), adminController.setUserActive);

// Pricing (read-only constants)
router.get('/pricing', auditLog('READ', 'pricing'), adminController.getPricing);

// Analytics
router.get('/analytics/dashboard', auditLog('READ', 'analytics'), analyticsController.dashboard);
router.get('/analytics/rentals', auditLog('READ', 'analytics'), analyticsController.rentalsOverTime);
router.get('/analytics/revenue', auditLog('READ', 'analytics'), analyticsController.revenueOverTime);
router.get('/analytics/popular-books', auditLog('READ', 'analytics'), analyticsController.popularBooks);
router.get('/analytics/categories', auditLog('READ', 'analytics'), analyticsController.categories);
router.get('/analytics/users', auditLog('READ', 'analytics'), analyticsController.userActivity);
router.get('/analytics/overdue-report', auditLog('READ', 'analytics'), analyticsController.overdueReport);

// Audit logs
router.get('/audit-logs', auditLog('READ', 'audit-logs'), adminController.getAuditLogs);

export default router;

