import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/footprint';
import { invalidateDashboardCache } from '../services/cache';
import { calculateFootprint } from '../services/gemini';
import { activitySchema } from '../utils/validation';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import type { ApiResponse } from '../types';

/** Fields returned in activity list queries (avoid selecting unnecessary columns) */
const LIST_SELECT = {
  id: true,
  type: true,
  category: true,
  amount: true,
  unit: true,
  footprint: true,
  date: true,
  createdAt: true,
} as const;

/**
 * POST /api/activities
 * Creates a new activity and calculates its carbon footprint via Gemini AI.
 */
export const createActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = activitySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const { type, category, amount, unit, date } = parsed.data;

    // Deduplicate: check if an identical activity was created in the last 5 seconds
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const existing = await prisma.activity.findFirst({
      where: {
        userId: req.user!.userId,
        type,
        category,
        createdAt: { gte: fiveSecondsAgo },
      },
    });

    if (existing) {
      const response: ApiResponse<typeof existing> = {
        success: true,
        data: existing,
      };
      res.status(201).json(response);
      return;
    }

    const { co2Kg } = await calculateFootprint(type, category, amount, unit);

    const activity = await prisma.activity.create({
      data: {
        userId: req.user!.userId,
        type,
        category,
        amount,
        unit,
        footprint: co2Kg,
        date: date ? new Date(date) : new Date(),
      },
    });

    await invalidateDashboardCache(req.user!.userId);

    const response: ApiResponse<typeof activity> = {
      success: true,
      data: activity,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/activities
 * Retrieves the authenticated user's activities with cursor-based pagination.
 * Supports optional date range filtering.
 *
 * Query params:
 *   - page    : page number (default: 1)
 *   - limit   : items per page, max 50 (default: 20)
 *   - start   : ISO date string for range start
 *   - end     : ISO date string for range end
 */
interface ActivityWhereInput {
  userId: string;
  date?: { gte: Date; lte: Date };
}

export const getActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { start, end, cursor } = req.query;

    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    const where: ActivityWhereInput = { userId: req.user!.userId };

    if (typeof start === 'string' && typeof end === 'string') {
      where.date = { gte: new Date(start), lte: new Date(end) };
    }

    const activities = await prisma.activity.findMany({
      where,
      select: LIST_SELECT,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(typeof cursor === 'string' ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = activities.length > limit;
    const items = hasMore ? activities.slice(0, limit) : activities;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const response: ApiResponse<{
      items: typeof items;
      pagination: { limit: number; nextCursor: string | null; hasMore: boolean };
    }> = {
      success: true,
      data: {
        items,
        pagination: {
          limit,
          nextCursor,
          hasMore,
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/activities/:id
 * Deletes a single activity by ID. Only the owner can delete.
 */
export const deleteActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!activity) {
      throw new NotFoundError('Activity not found');
    }

    if (activity.userId !== req.user!.userId) {
      throw new ForbiddenError('You can only delete your own activities');
    }

    await prisma.activity.delete({ where: { id: id as string } });

    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    next(error);
  }
};
