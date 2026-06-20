import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const userId = 'test-user-id';

function getAuthToken(): string {
  return jwt.sign({ userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

describe('Offset Endpoints', () => {
  describe('GET /api/offsets', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/offsets');
      expect(res.status).toBe(401);
    });

    it('returns offset projects, pledges, and total offset for user', async () => {
      const mockPledges = [
        { id: '1', userId, project: 'india-wind', amount: 5, createdAt: new Date() },
        { id: '2', userId, project: 'amazon-reforestation', amount: 10, createdAt: new Date() },
      ];
      // In setup.ts we registered mockOffsetPledge
      const mockOffsetPledge = (prisma as any).offsetPledge;
      mockOffsetPledge.findMany.mockResolvedValue(mockPledges);

      const res = await request(app)
        .get('/api/offsets')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.projects).toBeDefined();
      expect(res.body.data.pledges).toHaveLength(2);
      expect(res.body.data.totalOffset).toBe(15);
    });
  });

  describe('POST /api/offsets', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/offsets').send({ project: 'india-wind', amount: 10 });
      expect(res.status).toBe(401);
    });

    it('returns 400 when project is missing', async () => {
      const res = await request(app)
        .post('/api/offsets')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ amount: 10 });

      expect(res.status).toBe(400);
    });

    it('returns 400 when amount is invalid', async () => {
      const res = await request(app)
        .post('/api/offsets')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ project: 'india-wind', amount: -5 });

      expect(res.status).toBe(400);
    });

    it('returns 400 when project name is invalid', async () => {
      const res = await request(app)
        .post('/api/offsets')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ project: 'invalid-project-id', amount: 10 });

      expect(res.status).toBe(400);
    });

    it('creates offset pledge successfully', async () => {
      const mockPledge = { id: 'pledge-123', userId, project: 'india-wind', amount: 10, createdAt: new Date() };
      const mockOffsetPledge = (prisma as any).offsetPledge;
      mockOffsetPledge.create.mockResolvedValue(mockPledge);

      const res = await request(app)
        .post('/api/offsets')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ project: 'india-wind', amount: 10 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project).toBe('india-wind');
      expect(res.body.data.amount).toBe(10);
    });
  });
});
