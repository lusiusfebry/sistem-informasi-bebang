import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Semua route user memerlukan autentikasi
router.use(authMiddleware);

// Route khusus manajemen user
router.get('/', userController.getAll);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);
router.post('/:id/sync', userController.sync);

export default router;
