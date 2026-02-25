import { Router } from 'express';
import * as roleController from '../controllers/roleController';
import * as permissionController from '../controllers/permissionController';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/checkPermission';

const router = Router();

router.use(authMiddleware);

// Roles Management
router.get('/roles', checkPermission('System', 'Manage', 'Role'), roleController.getAll);
router.post('/roles', checkPermission('System', 'Manage', 'Role'), roleController.create);
router.put('/roles/:id', checkPermission('System', 'Manage', 'Role'), roleController.update);
router.delete('/roles/:id', checkPermission('System', 'Manage', 'Role'), roleController.remove);

// Permissions Discovery (for UI)
router.get('/permissions', checkPermission('System', 'Manage', 'Role'), permissionController.getAll);
router.get('/permission-groups', checkPermission('System', 'Manage', 'Role'), permissionController.getGroups);

export default router;
