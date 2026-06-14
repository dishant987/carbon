import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
dotenv.config(); // Fallback if .env is in the current working directory or environment variables are pre-loaded

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';
import { sanitizeInput } from './middleware/sanitize';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security HTTP headers
app.use(helmet());

// Gzip response compression — reduces payload size by ~70%
app.use(compression());

// CORS with whitelist only
app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging via Pino
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip }, 'request');
  next();
});

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Input sanitization (defense-in-depth)
app.use(sanitizeInput);

// Global rate limiting
app.use(globalLimiter);

// API routes
app.use('/api', routes);

// Health check (no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler (must be last)
app.use(errorHandler);

// Only start listening when not in test mode (supertest manages its own server)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server started');
  });
}

export default app;
