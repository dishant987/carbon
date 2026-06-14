import { Request, Response, NextFunction } from 'express';
import { getDashboardSummary, getCategoryBreakdown, getDailyProgress } from '../services/footprint';
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
