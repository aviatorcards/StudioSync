import { Router } from 'express';
import { usersController } from '../controllers/usersController';
import { checkPermission } from '../middleware/permissions';

const router = Router();

router.get('/', checkPermission('users', 'view'), usersController.list);
router.get('/:id', checkPermission('users', 'view'), usersController.getOne);
router.post('/', checkPermission('users', 'create'), usersController.create);
router.put('/:id', checkPermission('users', 'edit'), usersController.update);
router.delete('/:id', checkPermission('users', 'delete'), usersController.delete);

export default router;
