import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Footprint Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardSummary', () => {
    it('returns summary with correct totals', async () => {
      (prisma.activity.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { footprint: 18 }, _count: 3 })
        .mockResolvedValueOnce({ _sum: { footprint: 5 } })
        .mockResolvedValueOnce({ _sum: { footprint: 12 } });

      const { getDashboardSummary } = await import('../../src/services/footprint');
      const result = await getDashboardSummary('user-1');

      expect(result.totalFootprint).toBe(18);
      expect(result.activityCount).toBe(3);
      expect(result.dailyAverage).toBe(6);
    });

    it('returns zero values when no activities exist', async () => {
      (prisma.activity.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { footprint: null }, _count: 0 })
        .mockResolvedValueOnce({ _sum: { footprint: null } })
        .mockResolvedValueOnce({ _sum: { footprint: null } });

      const { getDashboardSummary } = await import('../../src/services/footprint');
      const result = await getDashboardSummary('user-1');

      expect(result.totalFootprint).toBe(0);
      expect(result.activityCount).toBe(0);
      expect(result.dailyAverage).toBe(0);
      expect(result.weeklyTotal).toBe(0);
      expect(result.monthlyTotal).toBe(0);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('groups activities by type correctly', async () => {
      (prisma.activity.groupBy as jest.Mock).mockResolvedValue([
        { type: 'transport', _sum: { footprint: 13 }, _count: 2 },
        { type: 'food', _sum: { footprint: 5 }, _count: 1 },
      ]);

      const { getCategoryBreakdown } = await import('../../src/services/footprint');
      const result = await getCategoryBreakdown('user-1');

      expect(result).toHaveLength(2);
      const transport = result.find((r) => r.type === 'transport');
      const food = result.find((r) => r.type === 'food');

      expect(transport?.total).toBe(13);
      expect(transport?.count).toBe(2);
      expect(food?.total).toBe(5);
      expect(food?.count).toBe(1);
    });

    it('returns empty array when no activities', async () => {
      (prisma.activity.groupBy as jest.Mock).mockResolvedValue([]);

      const { getCategoryBreakdown } = await import('../../src/services/footprint');
      const result = await getCategoryBreakdown('user-1');

      expect(result).toEqual([]);
    });

    it('sorts breakdown by total descending', async () => {
      (prisma.activity.groupBy as jest.Mock).mockResolvedValue([
        { type: 'shopping', _sum: { footprint: 1 }, _count: 1 },
        { type: 'transport', _sum: { footprint: 10 }, _count: 1 },
        { type: 'food', _sum: { footprint: 5 }, _count: 1 },
      ]);

      const { getCategoryBreakdown } = await import('../../src/services/footprint');
      const result = await getCategoryBreakdown('user-1');

      expect(result[0].type).toBe('transport');
      expect(result[1].type).toBe('food');
      expect(result[2].type).toBe('shopping');
    });
  });

  describe('getDailyProgress', () => {
    it('returns 31 days by default', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const { getDailyProgress } = await import('../../src/services/footprint');
      const result = await getDailyProgress('user-1');

      expect(result).toHaveLength(31);
    });

    it('accumulates footprint per day', async () => {
      // Create a date matching getDailyProgress logic to avoid timezone mismatches
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      const testDate = new Date(startDate);
      testDate.setDate(testDate.getDate() + 1);
      const testDateIso = testDate.toISOString().split('T')[0];

      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { date: testDate, total: 8, activities: 2 },
      ]);

      const { getDailyProgress } = await import('../../src/services/footprint');
      const result = await getDailyProgress('user-1', 1);

      const entry = result.find((r) => r.date === testDateIso);

      expect(entry?.total).toBe(8);
      expect(entry?.activities).toBe(2);
    });
  });
});