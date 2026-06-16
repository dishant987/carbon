import { Router } from 'express';
import { summary, breakdown, progress, getGoals, updateGoal, generateAiReport } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/summary', summary);
router.get('/breakdown', breakdown);
router.get('/progress', progress);
router.get('/goals', getGoals);
router.put('/goals', updateGoal);
router.post('/report', generateAiReport);

export default router;
