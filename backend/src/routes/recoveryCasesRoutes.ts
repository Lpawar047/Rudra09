import { Router } from 'express';
import { getRecoveryCases, getRecoveryCaseById, createRecoveryCase, updateRecoveryCase, deleteRecoveryCase } from '../controllers/recoveryCasesController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getRecoveryCases);
router.get('/:id', getRecoveryCaseById);
router.post('/', requireRole(['ADMIN', 'MANAGER']), createRecoveryCase);
router.put('/:id', updateRecoveryCase);
router.delete('/:id', requireRole(['ADMIN']), deleteRecoveryCase);

export default router;
