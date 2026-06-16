import { Router } from 'express';
import authRoutes from './authRoutes';
import activityRoutes from './activityRoutes';
import dashboardRoutes from './dashboardRoutes';
import tipsRoutes from './tipsRoutes';
import chatRoutes from './chatRoutes';
import exportRoutes from './exportRoutes';
import offsetRoutes from './offsetRoutes';
import recipeRoutes from './recipeRoutes';
import leaderboardRoutes from './leaderboardRoutes';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/activities', activityRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tips', tipsRoutes);
router.use('/chat', chatRoutes);
router.use('/export', exportRoutes);
router.use('/offsets', offsetRoutes);
router.use('/recipes', recipeRoutes);
router.use('/leaderboard', leaderboardRoutes);

export default router;
