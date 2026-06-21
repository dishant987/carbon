import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const userId = 'test-user-id';

function getAuthToken(): string {
  return jwt.sign({ userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

describe('Dashboard Endpoints', () => {
  describe('GET /api/dashboard/summary', () => {
    it('returns summary stats for authenticated user', async () => {
      (prisma.activity.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { footprint: 15 }, _count: 2 })
        .mockResolvedValueOnce({ _sum: { footprint: 5 } })
        .mockResolvedValueOnce({ _sum: { footprint: 12 } });

      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalFootprint).toBe(15);
      expect(res.body.data.activityCount).toBe(2);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/dashboard/summary');
      expect(res.status).toBe(401);
    });

    it('returns zero values when no activities', async () => {
      (prisma.activity.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { footprint: null }, _count: 0 })
        .mockResolvedValueOnce({ _sum: { footprint: null } })
        .mockResolvedValueOnce({ _sum: { footprint: null } });

      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.body.data.totalFootprint).toBe(0);
      expect(res.body.data.activityCount).toBe(0);
    });
  });

  describe('GET /api/dashboard/breakdown', () => {
    it('returns category breakdown for authenticated user', async () => {
      (prisma.activity.groupBy as jest.Mock).mockResolvedValue([
        { type: 'transport', _sum: { footprint: 10 }, _count: 1 },
        { type: 'food', _sum: { footprint: 5 }, _count: 1 },
      ]);

      const res = await request(app)
        .get('/api/dashboard/breakdown')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('GET /api/dashboard/progress', () => {
    it('returns daily progress data', async () => {
      // Use startDate matching getDailyProgress logic to avoid timezone mismatches
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      const today = new Date(startDate);
      today.setDate(today.getDate() + 30);
      const todayIso = today.toISOString().split('T')[0];

      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { date: today, total: 5, activities: 1 },
      ]);

      const res = await request(app)
        .get('/api/dashboard/progress')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const todayEntry = res.body.data.find((d: { date: string }) => d.date === todayIso);
      expect(todayEntry).toBeDefined();
      expect(todayEntry.total).toBe(5);
    });
  });
});
