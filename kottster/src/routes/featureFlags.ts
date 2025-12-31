import { Router } from 'express';
import { featureFlagsController } from '../controllers/featureFlagsController';
import { checkPermission } from '../middleware/permissions';

const router = Router();

// All feature flag routes require admin permission
const adminOnly = checkPermission('feature_flags', 'view');

// List all feature flags
router.get('/', adminOnly, featureFlagsController.list);

// Get single feature flag
router.get('/:id', adminOnly, featureFlagsController.getOne);

// Create new feature flag
router.post('/', checkPermission('feature_flags', 'create'), featureFlagsController.create);

// Update feature flag
router.put('/:id', checkPermission('feature_flags', 'edit'), featureFlagsController.update);

// Delete feature flag
router.delete('/:id', checkPermission('feature_flags', 'delete'), featureFlagsController.delete);

export default router;
