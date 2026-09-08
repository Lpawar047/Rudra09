import { Router } from 'express';
import { createFollowup, getFollowups } from '../controllers/followupsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createFollowup);
router.get('/', getFollowups);

export default router;
