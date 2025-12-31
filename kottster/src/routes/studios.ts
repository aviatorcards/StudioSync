import { Router } from 'express';
import { studiosController } from '../controllers/studiosController';
import { checkPermission } from '../middleware/permissions';

const router = Router();

router.get('/', checkPermission('studios', 'view'), studiosController.list);
router.get('/:id', checkPermission('studios', 'view'), studiosController.getOne);
router.post('/', checkPermission('studios', 'create'), studiosController.create);
router.put('/:id', checkPermission('studios', 'edit'), studiosController.update);
router.delete('/:id', checkPermission('studios', 'delete'), studiosController.delete);

export default router;
