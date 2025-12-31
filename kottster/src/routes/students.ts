import { Router } from 'express';
import { studentsController } from '../controllers/studentsController';
import { checkPermission } from '../middleware/permissions';

const router = Router();

router.get('/', checkPermission('students', 'view'), studentsController.list);
router.get('/:id', checkPermission('students', 'view'), studentsController.getOne);
router.post('/', checkPermission('students', 'create'), studentsController.create);
router.put('/:id', checkPermission('students', 'edit'), studentsController.update);
router.delete('/:id', checkPermission('students', 'delete'), studentsController.delete);

export default router;
