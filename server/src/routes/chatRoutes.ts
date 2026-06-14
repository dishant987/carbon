import { Router } from 'express';
import { sendMessage, getChatHistory } from '../controllers/chatController';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router: Router = Router();

// All chat routes require authentication
router.use(authenticate);

router.post('/message', aiLimiter, sendMessage);
router.get('/history', getChatHistory);

export default router;
