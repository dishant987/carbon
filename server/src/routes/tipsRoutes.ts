import { Router } from 'express';
import { getTips, getGeminiStatus } from '../controllers/tipsController';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router: Router = Router();

// All tips routes require authentication
router.use(authenticate);

router.get('/status', aiLimiter, getGeminiStatus);
router.get('/', aiLimiter, getTips);

export default router;
