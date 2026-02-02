import express from 'express';
import * as contactController from '../controllers/contact.controller.js';

const router = express.Router();

// Public endpoint for landing "Contact Us" form
router.post('/', contactController.submitContactMessage);

export default router;

