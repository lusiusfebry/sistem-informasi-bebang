import { Router } from 'express';
import * as messController from '../controllers/messController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// MESS
router.get('/', messController.getAllMess);
router.post('/', messController.createMess);
router.put('/:id', messController.updateMess);
router.delete('/:id', messController.deleteMess);

// ROOMS
router.get('/:messId/rooms', messController.getRoomsByMess);
router.post('/:messId/rooms', messController.createRoom);
router.put('/rooms/:id', messController.updateRoom);
router.delete('/rooms/:id', messController.deleteRoom);

// ASSIGNMENT
router.post('/assign', messController.assignKaryawan);
router.post('/unassign', messController.unassignKaryawan);

export default router;
