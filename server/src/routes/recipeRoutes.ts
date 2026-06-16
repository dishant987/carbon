import { Router } from 'express';
import { analyzeRecipeController } from '../controllers/recipeController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// All recipe routes require authentication
router.use(authenticate);

router.post('/analyze', analyzeRecipeController);

export default router;
