import { Request, Response, NextFunction } from 'express';
import { getDashboardSummary, getCategoryBreakdown, getDailyProgress, prisma } from '../services/footprint';
import { calculateBadges } from '../utils/badges';
import { generateSustainabilityReport } from '../services/gemini';
import type { ApiResponse, DashboardSummary, CategoryBreakdown, DailyProgress } from '../types';

/**
 * GET /api/dashboard/summary
 * Returns aggregate footprint summary statistics for the authenticated user.
 */
export const summary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data: DashboardSummary = await getDashboardSummary(req.user!.userId);
    const response: ApiResponse<DashboardSummary> = { success: true, data };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/breakdown
 * Returns footprint breakdown by activity type for the authenticated user.
 */
export const breakdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data: CategoryBreakdown[] = await getCategoryBreakdown(req.user!.userId);
    const response: ApiResponse<CategoryBreakdown[]> = { success: true, data };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/progress
 * Returns daily footprint progress for charting for the authenticated user.
 */
export const progress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data: DailyProgress[] = await getDailyProgress(req.user!.userId);
    const response: ApiResponse<DailyProgress[]> = { success: true, data };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/goals
 * Returns the weekly goal, current weekly emissions, and badges.
 */
export const getGoals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Fetch user weeklyGoal
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { weeklyGoal: true },
    });

    const weeklyGoal = user?.weeklyGoal ?? 100.0;

    // Calculate current week's emissions
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekAgg = await prisma.activity.aggregate({
      where: { userId, date: { gte: startOfWeek } },
      _sum: { footprint: true },
    });
    const weeklyTotal = Math.round((weekAgg._sum.footprint ?? 0) * 100) / 100;

    // Calculate dynamic badges
    const activities = await prisma.activity.findMany({
      where: { userId },
      select: { type: true, category: true, footprint: true, date: true },
    });

    const badges = calculateBadges(activities);

    res.json({
      success: true,
      data: {
        weeklyGoal,
        weeklyTotal,
        badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/dashboard/goals
 * Updates the user's weekly carbon limit goal.
 */
export const updateGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { weeklyGoal } = req.body;

    if (typeof weeklyGoal !== 'number' || weeklyGoal <= 0) {
      res.status(400).json({ success: false, error: 'Goal must be a positive number' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { weeklyGoal },
      select: { weeklyGoal: true },
    });

    res.json({
      success: true,
      data: {
        weeklyGoal: updatedUser.weeklyGoal,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/dashboard/report
 * Returns AI carbon sustainability report based on past 30 days activities.
 */
export const generateAiReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { weeklyGoal: true },
    });
    const weeklyGoal = user?.weeklyGoal ?? 100.0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const activities = await prisma.activity.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      select: { type: true, category: true, footprint: true, amount: true, unit: true },
    });

    const report = await generateSustainabilityReport(activities, weeklyGoal);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
