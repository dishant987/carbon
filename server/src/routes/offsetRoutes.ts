import { Router } from 'express';
import { getOffsets, createPledge } from '../controllers/offsetController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// All offset routes require authentication
router.use(authenticate);

router.get('/', getOffsets);
router.post('/', createPledge);

export default router;
