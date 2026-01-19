import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './utils/errors.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import widgetRoutes from './routes/widget.js';
import routeRoutes from './routes/route.js';

const app = express();

// CORS
const corsOrigins = env.CORS_ORIGINS === '*'
  ? '*'
  : env.CORS_ORIGINS.split(',').map((origin) => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Em desenvolvimento, permite qualquer localhost
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else if (corsOrigins === '*') {
      callback(null, true);
    } else if (Array.isArray(corsOrigins) && corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests, please try again later.',
});

app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/widget', widgetRoutes);
app.use('/', routeRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: env.MOCK_MODE ? 'MOCK' : 'PRODUCTION',
    authMode: env.AUTH_MODE,
  });
});

// Error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const handled = errorHandler(err);
  res.status(handled.statusCode).json({
    error: handled.message,
    code: handled.code,
  });
});

// Start server
const port = env.PORT;

app.listen(port, () => {
  logger.info(`🚀 Server running on port ${port}`);
  logger.info(`📋 Mode: ${env.MOCK_MODE ? 'MOCK' : 'PRODUCTION'}`);
  logger.info(`🔐 Auth Mode: ${env.AUTH_MODE}`);
});
