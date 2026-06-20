import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const userId = 'test-user-id';

function getAuthToken(): string {
  return jwt.sign({ userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

describe('Export Endpoints', () => {
  describe('GET /api/export', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/export');
      expect(res.status).toBe(401);
    });

    it('returns CSV data with correct format and headers', async () => {
      const mockActivities = [
        {
          id: 'act-1',
          userId,
          type: 'transport',
          category: 'car',
          amount: 10,
          unit: 'km',
          footprint: 2.5,
          date: new Date('2024-01-15T00:00:00.000Z'),
          createdAt: new Date(),
        },
      ];
      (prisma.activity.findMany as jest.Mock).mockResolvedValue(mockActivities);

      const res = await request(app)
        .get('/api/export')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('attachment; filename="carbon-footprint-export.csv"');
      
      // Clean string of BOM and quotes for easy assertion
      const cleanText = res.text.replace('\uFEFF', '');
      expect(cleanText).toContain('"date","type","category","amount","unit","footprint_kg_co2"');
      expect(cleanText).toContain('"2024-01-15","transport","car","10","km","2.5"');
    });
  });
});
