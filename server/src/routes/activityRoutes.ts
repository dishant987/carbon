import { Router } from 'express';
import { createActivity, getActivities, deleteActivity } from '../controllers/activityController';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router: Router = Router();

// All activity routes require authentication
router.use(authenticate);

router.post('/', aiLimiter, createActivity);
router.get('/', getActivities);
router.delete('/:id', deleteActivity);

export default router;
