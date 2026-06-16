import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboardController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// All leaderboard routes require authentication
router.use(authenticate);

router.get('/', getLeaderboard);

export default router;
