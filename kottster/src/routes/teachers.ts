import { Router } from 'express';
import { teachersController } from '../controllers/teachersController';
import { checkPermission } from '../middleware/permissions';

const router = Router();

router.get('/', checkPermission('teachers', 'view'), teachersController.list);
router.get('/:id', checkPermission('teachers', 'view'), teachersController.getOne);
router.post('/', checkPermission('teachers', 'create'), teachersController.create);
router.put('/:id', checkPermission('teachers', 'edit'), teachersController.update);
router.delete('/:id', checkPermission('teachers', 'delete'), teachersController.delete);

export default router;
