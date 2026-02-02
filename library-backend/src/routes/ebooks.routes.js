import express from 'express';
import * as ebookController from '../controllers/ebook.controller.js';

const router = express.Router();

router.get('/search', ebookController.search);
router.get('/:externalId', ebookController.details);

export default router;

