import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const userId = 'test-user-id';

function getAuthToken(): string {
  return jwt.sign({ userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

describe('Leaderboard Endpoints', () => {
  describe('GET /api/leaderboard', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/leaderboard');
      expect(res.status).toBe(401);
    });

    it('returns community rankings and active challenges', async () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const mockUsers = [
        {
          id: 'u1',
          name: 'User One',
          email: 'user1@example.com',
          activities: [
            { footprint: 10, createdAt: oneDayAgo },
            { footprint: 5, createdAt: oneDayAgo }
          ]
        },
        {
          id: 'u2',
          name: 'User Two',
          email: 'user2@example.com',
          activities: [
            { footprint: 2, createdAt: oneDayAgo }
          ]
        },
        {
          id: 'u3',
          name: null,
          email: 'user3@example.com',
          activities: []
        }
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const res = await request(app)
        .get('/api/leaderboard')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rankings).toHaveLength(3);
      
      // User Two should be rank 1 because weekly footprint is 2 (lower than User One's 15)
      // User Three has no activities, so should be pushed to the end (rank 3)
      const rankings = res.body.data.rankings;
      expect(rankings[0].userId).toBe('u2');
      expect(rankings[0].rank).toBe(1);
      
      expect(rankings[1].userId).toBe('u1');
      expect(rankings[1].rank).toBe(2);

      expect(rankings[2].userId).toBe('u3');
      expect(rankings[2].rank).toBe(3);
      expect(rankings[2].name).toBe('user3'); // Fallback to email prefix

      expect(res.body.data.challenges).toBeDefined();
      expect(res.body.data.challenges.length).toBeGreaterThan(0);
    });
  });
});
