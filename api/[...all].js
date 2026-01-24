// Vercel Serverless Function - Catch-all routes
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from '../apps/api/dist/routes/auth.js';
import chatRoutes from '../apps/api/dist/routes/chat.js';
import widgetRoutes from '../apps/api/dist/routes/widget.js';
import routeRoutes from '../apps/api/dist/routes/route.js';
import analyticsRoutes from '../apps/api/dist/routes/analytics.js';

const app = express();

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:') ||
        origin === 'https://hmlraizeducacao.zeev.it' ||
        origin === 'https://brunooliveiraraiz.github.io') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60000,
  max: 100,
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
app.use('/analytics', analyticsRoutes);
app.use('/', routeRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'PRODUCTION',
    authMode: 'DEV',
  });
});

// Export for Vercel
export default app;
