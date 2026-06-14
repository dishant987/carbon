import { Router } from 'express';
import { summary, breakdown, progress } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/summary', summary);
router.get('/breakdown', breakdown);
router.get('/progress', progress);

export default router;
