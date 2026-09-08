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

dotenv.config();

const app: Application = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

export default app;
