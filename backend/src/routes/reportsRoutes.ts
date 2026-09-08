import { Router } from 'express';
import { getDashboardMetrics, getRecoveryReports, getEmployeeReports, exportReportsExcel } from '../controllers/reportsController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', getDashboardMetrics);
router.get('/recovery', requireRole(['ADMIN', 'MANAGER']), getRecoveryReports);
router.get('/employees', requireRole(['ADMIN', 'MANAGER']), getEmployeeReports);
router.get('/export-excel', requireRole(['ADMIN', 'MANAGER']), exportReportsExcel);

export default router;
