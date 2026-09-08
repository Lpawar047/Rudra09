import { Router } from 'express';
import { getLoans, getLoanById, createLoan, updateLoan } from '../controllers/loansController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getLoans);
router.get('/:id', getLoanById);
router.post('/', requireRole(['ADMIN', 'MANAGER']), createLoan);
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), updateLoan);

export default router;
