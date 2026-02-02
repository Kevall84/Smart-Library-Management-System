import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import config from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

/**
 * Express app bootstrap
 */

const app = express();

// Security & perf
app.use(helmet());
app.use(compression());

// CORS
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);

// Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsers (Stripe webhook route uses express.raw inside its router)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health
app.get('/health', (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

// API
app.use('/api', apiRoutes);

// Not found + error handler
app.use(notFound);
app.use(errorHandler);

export default app;

