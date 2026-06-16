import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/footprint';

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Fetch all users with their activities
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        activities: {
          select: {
            footprint: true,
            createdAt: true
          }
        }
      }
    });

    // Map users to compute stats
    const rankings = users.map(user => {
      const totalFootprint = user.activities.reduce((sum, act) => sum + act.footprint, 0);
      
      // Weekly footprint (past 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyFootprint = user.activities
        .filter(act => new Date(act.createdAt) >= oneWeekAgo)
        .reduce((sum, act) => sum + act.footprint, 0);

      return {
        userId: user.id,
        name: user.name || user.email.split('@')[0],
        totalFootprint: Math.round(totalFootprint * 100) / 100,
        weeklyFootprint: Math.round(weeklyFootprint * 100) / 100,
        activityCount: user.activities.length,
      };
    });

    // Sort by lower weekly footprint (lower emissions are better).
    // Users with 0 activities are pushed to the end.
    const sortedRankings = rankings
      .sort((a, b) => {
        if (a.activityCount === 0 && b.activityCount > 0) return 1;
        if (b.activityCount === 0 && a.activityCount > 0) return -1;
        return a.weeklyFootprint - b.weeklyFootprint;
      })
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));

    // Interactive Community challenges
    const challenges = [
      {
        id: 'challenge-carpool',
        title: 'Carpooling Crusade',
        description: 'Log 3 carpooling or public transport activities this week.',
        target: 3,
        category: 'transport',
        points: 150
      },
      {
        id: 'challenge-meatless',
        title: 'Veggie Warrior',
        description: 'Log 5 plant-based meals in the past 7 days.',
        target: 5,
        category: 'food',
        points: 200
      },
      {
        id: 'challenge-unplugged',
        title: 'Unplugged Master',
        description: 'Reduce weekly home energy emissions below 15 kg CO2.',
        target: 15,
        category: 'energy',
        points: 250
      }
    ];

    res.json({
      success: true,
      data: {
        rankings: sortedRankings,
        challenges
      }
    });
  } catch (error) {
    next(error);
  }
};
