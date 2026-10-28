import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import usersRoutes from './routes/usersRoutes';
import customersRoutes from './routes/customersRoutes';
import vehiclesRoutes from './routes/vehiclesRoutes';
import loansRoutes from './routes/loansRoutes';
import recoveryCasesRoutes from './routes/recoveryCasesRoutes';
import assignmentsRoutes from './routes/assignmentsRoutes';
import followupsRoutes from './routes/followupsRoutes';
import paymentsRoutes from './routes/paymentsRoutes';
import excelRoutes from './routes/excelRoutes';
import reportsRoutes from './routes/reportsRoutes';

import path from 'path';
import fs from 'fs';

dotenv.config();

const app: Application = express();

const rawCors = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawCors.split(',').map((s) => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (rawCors === '*' || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Rudra Services Backend API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/recovery-cases', recoveryCasesRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/followups', followupsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/reports', reportsRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An internal server error occurred.',
  });
});

// Production Static Frontend Serving (when frontend/dist exists)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

export default app;
