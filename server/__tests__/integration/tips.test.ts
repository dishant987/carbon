import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const userId = 'test-user-id';

function getAuthToken(): string {
  return jwt.sign({ userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

describe('Tips Endpoint', () => {
  describe('GET /api/tips', () => {
    it('returns tips array for authenticated user with activities', async () => {
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([
        { type: 'transport', category: 'car', footprint: 3.5 },
        { type: 'food', category: 'beef', footprint: 7.5 },
      ]);

      const res = await request(app)
        .get('/api/tips')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('returns default tips when user has no activities', async () => {
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/tips')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0]).toContain('Start tracking');
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/tips');
      expect(res.status).toBe(401);
    });
  });
});
