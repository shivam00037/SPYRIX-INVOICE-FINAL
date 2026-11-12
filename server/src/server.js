import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import searchRoutes from './routes/search.js';
import dataRoutes from './routes/data.js';
import businessRoutes from './routes/business.js';
import aiRoutes from './routes/ai.js';
import { authenticate } from './middleware/authenticate.js';

const app = express();
const port = Number(process.env.PORT || 5000);

app.disable('x-powered-by');
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(value => value.trim());
app.use(cors({ origin(origin, callback) {
  const localViteOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):51[0-9]{2}$/.test(origin || '');
  if (!origin || allowedOrigins.includes(origin) || localViteOrigin) return callback(null, true);
  return callback(new Error('Origin is not allowed by SPYRIX API CORS policy.'));
} }));
app.use(express.json({ limit: '5mb' }));
app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'spyrix-invoice-api' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', authenticate, dashboardRoutes);
app.use('/api/v1/search', authenticate, searchRoutes);
app.use('/api/v1/data', authenticate, dataRoutes);
app.use('/api/v1/business', authenticate, businessRoutes);
app.use('/api/v1/ai', authenticate, aiRoutes);

app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.code === 11000) return res.status(409).json({ message: 'A record with this value already exists.' });
  if (error?.name === 'ValidationError') return res.status(400).json({ message: 'Some submitted values are invalid.' });
  res.status(error.status || 500).json({ message: process.env.NODE_ENV === 'production' ? 'Server error. Please try again.' : (error.message || 'Server error.') });
});

connectDatabase().then(() => {
  app.listen(port, () => console.log(`SPYRIX API listening on http://localhost:${port}`));
}).catch(error => {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
});
