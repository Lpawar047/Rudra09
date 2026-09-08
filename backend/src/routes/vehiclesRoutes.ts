import { Router } from 'express';
import { getVehicles, getVehicleById, createVehicle, updateVehicle } from '../controllers/vehiclesController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.post('/', requireRole(['ADMIN', 'MANAGER']), createVehicle);
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'EMPLOYEE']), updateVehicle);

export default router;
