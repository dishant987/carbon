import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/footprint';

function escapeCsvCell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

export const exportData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    const header = ['date', 'type', 'category', 'amount', 'unit', 'footprint_kg_co2']
      .map(escapeCsvCell)
      .join(',');
    const rows = activities.map((a) =>
      [a.date.toISOString().split('T')[0], a.type, a.category, a.amount, a.unit, a.footprint]
        .map(escapeCsvCell)
        .join(',')
    );

    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="carbon-footprint-export.csv"');
    res.send(`\uFEFF${csv}`);
  } catch (error) {
    next(error);
  }
};
