import { Router } from 'express';
import authRoutes from './authRoutes';
import activityRoutes from './activityRoutes';
import dashboardRoutes from './dashboardRoutes';
import tipsRoutes from './tipsRoutes';
import chatRoutes from './chatRoutes';
import exportRoutes from './exportRoutes';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/activities', activityRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tips', tipsRoutes);
router.use('/chat', chatRoutes);
router.use('/export', exportRoutes);

export default router;
