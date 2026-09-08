import { Router } from 'express';
import { assignCase, getAssignments } from '../controllers/assignmentsController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', requireRole(['ADMIN', 'MANAGER']), assignCase);
router.get('/', requireRole(['ADMIN', 'MANAGER']), getAssignments);

export default router;
