import { Router } from 'express';
import { login, register, logout, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);

export default router;
