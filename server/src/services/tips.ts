import { prisma } from './footprint';
import { generateTips as geminiGenerateTips } from './gemini';

/**
 * Generates personalized carbon reduction tips for a specific user.
 * Uses Gemini AI when activities exist, falls back to defaults otherwise.
 *
 * @param userId - The authenticated user's ID
 * @returns Array of carbon reduction tip strings
 */
export async function getPersonalizedTips(userId: string): Promise<string[]> {
  const activities = await prisma.activity.findMany({
    where: { userId },
    select: { type: true, category: true, footprint: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  if (activities.length === 0) {
    return [
      'Start tracking your activities to get personalized tips!',
      'Consider using public transportation instead of personal vehicles.',
      'Reduce meat and dairy consumption to lower food carbon footprint.',
      'Switch to energy-efficient appliances and LED bulbs.',
      'Buy local and seasonal products to reduce shopping emissions.',
    ];
  }

  const activitySummaries = activities.map((a) => ({
    type: a.type,
    category: a.category,
    footprint: a.footprint,
  }));

  return geminiGenerateTips(activitySummaries);
}
