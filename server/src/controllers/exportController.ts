import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/footprint';

export const exportData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    const header = 'date,type,category,amount,unit,footprint_kg_co2';
    const rows = activities.map((a) =>
      [a.date.toISOString().split('T')[0], a.type, `"${a.category}"`, a.amount, a.unit, a.footprint].join(',')
    );

    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="carbon-footprint-export.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
