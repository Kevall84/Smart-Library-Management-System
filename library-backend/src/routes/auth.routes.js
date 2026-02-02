import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { auditLog } from '../middlewares/audit.middleware.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', auditLog('CREATE', 'user'), authController.validateRegister, authController.register);
router.post('/login', authController.validateLogin, authController.login);

router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, auditLog('UPDATE', 'user'), authController.updateProfile);
router.put('/change-password', authenticate, auditLog('UPDATE', 'user'), authController.changePassword);
router.post('/logout', authenticate, authController.logout);

export default router;
