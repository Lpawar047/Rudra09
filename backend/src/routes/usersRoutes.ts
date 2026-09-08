import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, updateUserStatus, deleteUser } from '../controllers/usersController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['ADMIN', 'MANAGER']), getUsers);
router.get('/:id', requireRole(['ADMIN', 'MANAGER']), getUserById);
router.post('/', requireRole(['ADMIN']), createUser);
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), updateUser);
router.put('/:id/status', requireRole(['ADMIN']), updateUserStatus);
router.delete('/:id', requireRole(['ADMIN']), deleteUser);

export default router;
