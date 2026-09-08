import { Router } from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer } from '../controllers/customersController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', requireRole(['ADMIN', 'MANAGER']), createCustomer);
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'EMPLOYEE']), updateCustomer);

export default router;
