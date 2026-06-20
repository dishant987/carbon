import { PrismaClient } from '@prisma/client';
import { DashboardSummary, CategoryBreakdown, DailyProgress } from '../types';
import { getCachedDashboard, setCachedDashboard } from './cache';

/** Singleton Prisma client */
const prisma = new PrismaClient();

/**
 * Retrieves the dashboard summary statistics for a specific user with Redis caching.
 * All four aggregation queries use Prisma's aggregate/groupBy for server-side computation.
 *
 * @param userId - The authenticated user's ID
 * @returns Summary with total, daily average, weekly/monthly totals, and count
 */
export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const cached = await getCachedDashboard<DashboardSummary>('summary', userId);
  if (cached) return cached;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const baseWhere = { userId };

  const [allAgg, weekAgg, monthAgg] = await Promise.all([
    prisma.activity.aggregate({ where: baseWhere, _sum: { footprint: true }, _count: true }),
    prisma.activity.aggregate({
      where: { ...baseWhere, date: { gte: startOfWeek } },
      _sum: { footprint: true },
    }),
    prisma.activity.aggregate({
      where: { ...baseWhere, date: { gte: startOfMonth } },
      _sum: { footprint: true },
    }),
  ]);

  const totalFootprint = allAgg._sum.footprint ?? 0;
  const activityCount = allAgg._count;

  const result: DashboardSummary = {
    totalFootprint: Math.round(totalFootprint * 100) / 100,
    dailyAverage: activityCount > 0 ? Math.round((totalFootprint / activityCount) * 100) / 100 : 0,
    weeklyTotal: Math.round((weekAgg._sum.footprint ?? 0) * 100) / 100,
    monthlyTotal: Math.round((monthAgg._sum.footprint ?? 0) * 100) / 100,
    activityCount,
  };

  await setCachedDashboard('summary', userId, result);
  return result;
}

/**
 * Groups a user's activities by type and computes breakdown percentages.
 * Uses Prisma groupBy for server-side aggregation.
 *
 * @param userId - The authenticated user's ID
 * @returns Array of category breakdowns sorted by total descending
 */
export async function getCategoryBreakdown(userId: string): Promise<CategoryBreakdown[]> {
  const cached = await getCachedDashboard<CategoryBreakdown[]>('breakdown', userId);
  if (cached) return cached;

  const grouped = await prisma.activity.groupBy({
    by: ['type'],
    where: { userId },
    _sum: { footprint: true },
    _count: true,
  });

  const grandTotal = grouped.reduce((sum, g) => sum + (g._sum.footprint ?? 0), 0);

  const result: CategoryBreakdown[] = grouped
    .map((g) => ({
      type: g.type,
      total: Math.round((g._sum.footprint ?? 0) * 100) / 100,
      percentage: grandTotal > 0 ? Math.round(((g._sum.footprint ?? 0) / grandTotal) * 10000) / 100 : 0,
      count: g._count,
    }))
    .sort((a, b) => b.total - a.total);

  await setCachedDashboard('breakdown', userId, result);
  return result;
}

/**
 * Computes daily footprint totals for a specific user for charting.
 * Uses a cumulative raw SQL query with GROUP BY for server-side aggregation.
 *
 * @param userId - The authenticated user's ID
 * @param days - Number of days of history to include (default 30)
 * @returns Array of daily progress entries
 */
export async function getDailyProgress(userId: string, days: number = 30): Promise<DailyProgress[]> {
  const cached = await getCachedDashboard<DailyProgress[]>('progress', userId);
  if (cached) return cached;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const rows: Array<{ date: Date; total: number | null; activities: bigint | number }> =
    await prisma.$queryRaw`
    SELECT
      DATE("date")::date AS date,
      COALESCE(SUM("footprint"), 0)::float AS total,
      COUNT(*) AS activities
    FROM "Activity"
    WHERE "userId" = ${userId} AND "date" >= ${startDate}
    GROUP BY DATE("date")
    ORDER BY DATE("date") ASC
  `;

  const dailyMap = new Map<string, DailyProgress>();
  for (const row of rows) {
    const dateStr =
      row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date).split('T')[0];
    dailyMap.set(dateStr, {
      date: dateStr,
      total: Math.round((row.total ?? 0) * 100) / 100,
      activities: Number(row.activities),
    });
  }

  const result: DailyProgress[] = [];
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().split('T')[0];
    result.push(dailyMap.get(key) ?? { date: key, total: 0, activities: 0 });
  }

  await setCachedDashboard('progress', userId, result);
  return result;
}

export { prisma };
