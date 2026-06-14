import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const userId = 'test-user-id';

/** Generate a valid access token for the test user */
function getAuthToken(): string {
  return jwt.sign({ userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

describe('Activity Endpoints', () => {
  describe('POST /api/activities', () => {
    it('creates an activity when authenticated', async () => {
      (prisma.activity.create as jest.Mock).mockResolvedValue({
        id: 'act-1',
        userId,
        type: 'transport',
        category: 'car',
        amount: 10,
        unit: 'km',
        footprint: 2.5,
        date: new Date(),
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ type: 'transport', category: 'car', amount: 10, unit: 'km' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.footprint).toBe(2.5);
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({ type: 'transport', category: 'car', amount: 10, unit: 'km' });

      expect(res.status).toBe(401);
    });

    it('returns 400 with invalid input', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ type: 'invalid', amount: 10 });

      expect(res.status).toBe(400);
    });

    it('returns 400 with negative amount', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ type: 'food', category: 'beef', amount: -1, unit: 'kg' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/activities', () => {
    it('returns paginated activities', async () => {
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([
        { id: 'a1', userId, type: 'transport', category: 'car', amount: 10, unit: 'km', footprint: 2.5, date: new Date(), createdAt: new Date() },
        { id: 'a2', userId, type: 'food', category: 'beef', amount: 0.5, unit: 'kg', footprint: 7.5, date: new Date(), createdAt: new Date() },
      ]);

      const res = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(2);
      expect(typeof res.body.data.pagination.hasMore).toBe('boolean');
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/activities');
      expect(res.status).toBe(401);
    });

    it('respects limit parameter', async () => {
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/activities?limit=10')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.limit).toBe(10);
    });

    it('respects cursor parameter', async () => {
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([
        { id: 'a3', userId, type: 'energy', category: 'electricity', amount: 100, unit: 'kWh', footprint: 3.0, date: new Date(), createdAt: new Date() },
      ]);

      const res = await request(app)
        .get('/api/activities?cursor=a2&limit=5')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(prisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: 'a2' },
          skip: 1,
          take: 6,
        })
      );
    });
  });

  describe('DELETE /api/activities/:id', () => {
    it('deletes own activity', async () => {
      (prisma.activity.findUnique as jest.Mock).mockResolvedValue({
        id: 'act-1',
        userId,
      });
      (prisma.activity.delete as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .delete('/api/activities/act-1')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent activity', async () => {
      (prisma.activity.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/activities/nonexistent')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(404);
    });

    it('returns 403 when deleting another user activity', async () => {
      (prisma.activity.findUnique as jest.Mock).mockResolvedValue({
        id: 'act-other',
        userId: 'other-user',
      });

      const res = await request(app)
        .delete('/api/activities/act-other')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(403);
    });
  });
});
