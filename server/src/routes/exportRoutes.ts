import { Router } from 'express';
import { exportData } from '../controllers/exportController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', exportData);

export default router;
