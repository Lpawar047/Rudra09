import { Router } from 'express';
import { createPayment, getPayments } from '../controllers/paymentsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createPayment);
router.get('/', getPayments);

export default router;
