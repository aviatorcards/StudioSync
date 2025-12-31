import { Router } from 'express';
import { lessonsController } from '../controllers/lessonsController';
import { checkPermission } from '../middleware/permissions';

const router = Router();

router.get('/', checkPermission('lessons', 'view'), lessonsController.list);
router.get('/calendar', checkPermission('lessons', 'view'), lessonsController.calendar);
router.get('/:id', checkPermission('lessons', 'view'), lessonsController.getOne);
router.post('/', checkPermission('lessons', 'create'), lessonsController.create);
router.put('/:id', checkPermission('lessons', 'edit'), lessonsController.update);
router.patch('/:id/cancel', checkPermission('lessons', 'edit'), lessonsController.cancel);
router.delete('/:id', checkPermission('lessons', 'delete'), lessonsController.delete);

export default router;
