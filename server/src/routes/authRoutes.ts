import { Router } from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/authController';
import { authenticate, requireTrustedOrigin } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router: Router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', requireTrustedOrigin, refresh);
router.post('/logout', requireTrustedOrigin, logout);
router.get('/me', authenticate, getMe);

export default router;
