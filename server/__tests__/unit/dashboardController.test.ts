import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const userId = 'test-user-id';

function getAuthToken(): string {
  return jwt.sign({ userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

describe('Dashboard Controller', () => {
  describe('GET /api/dashboard/goals', () => {
    it('returns goals with badges', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ weeklyGoal: 50 });
      (prisma.activity.aggregate as jest.Mock).mockResolvedValue({ _sum: { footprint: 10 } });
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/dashboard/goals')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.weeklyGoal).toBe(50);
      expect(res.body.data.badges).toHaveLength(5);
    });

    it('uses default goal when not set', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ weeklyGoal: null });
      (prisma.activity.aggregate as jest.Mock).mockResolvedValue({ _sum: { footprint: 0 } });
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/dashboard/goals')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.weeklyGoal).toBe(100);
    });
  });

  describe('PUT /api/dashboard/goals', () => {
    it('updates weekly goal', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({ weeklyGoal: 75 });

      const res = await request(app)
        .put('/api/dashboard/goals')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ weeklyGoal: 75 });

      expect(res.status).toBe(200);
      expect(res.body.data.weeklyGoal).toBe(75);
    });

    it('rejects invalid goal', async () => {
      const res = await request(app)
        .put('/api/dashboard/goals')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ weeklyGoal: -1 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/dashboard/breakdown', () => {
    it('returns category breakdown', async () => {
      (prisma.activity.groupBy as jest.Mock).mockResolvedValue([
        { type: 'transport', _sum: { footprint: 10 }, _count: 2 },
      ]);

      const res = await request(app)
        .get('/api/dashboard/breakdown')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/dashboard/summary', () => {
    it('returns summary', async () => {
      (prisma.activity.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { footprint: 20 }, _count: 4 })
        .mockResolvedValueOnce({ _sum: { footprint: 8 } })
        .mockResolvedValueOnce({ _sum: { footprint: 15 } });

      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalFootprint).toBe(20);
    });
  });
});
