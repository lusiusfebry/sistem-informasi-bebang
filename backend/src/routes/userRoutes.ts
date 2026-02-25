import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/checkPermission';

const router = Router();

// Semua route user memerlukan autentikasi
router.use(authMiddleware);

// Route khusus manajemen user
router.get('/', checkPermission('System', 'Manage', 'User'), userController.getAll);
router.post('/', checkPermission('System', 'Manage', 'User'), userController.create);
router.put('/:id', checkPermission('System', 'Manage', 'User'), userController.update);
router.delete('/:id', checkPermission('System', 'Manage', 'User'), userController.remove);
router.post('/:id/sync', checkPermission('System', 'Manage', 'User'), userController.sync);

export default router;
