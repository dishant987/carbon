import { Router } from 'express';
import { analyzeRecipeController } from '../controllers/recipeController';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router: Router = Router();

// All recipe routes require authentication
router.use(authenticate);

router.post('/analyze', aiLimiter, analyzeRecipeController);

export default router;
