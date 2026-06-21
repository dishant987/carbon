import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const userId = 'test-user-id';

function getAuthToken(): string {
  return jwt.sign({ userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

function getExpiredToken(): string {
  return jwt.sign({ userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '0s' });
}

describe('Auth Controller (additional coverage)', () => {
  describe('PUT /api/auth/profile', () => {
    it('updates user profile', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId, email: 'old@example.com', name: 'Old',
        passwordHash: 'hash', refreshToken: 'rt', createdAt: new Date(),
      });
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: userId, email: 'new@example.com', name: 'New',
        passwordHash: 'hash', refreshToken: 'rt', createdAt: new Date(),
      });

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ email: 'new@example.com', name: 'New' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/auth/password', () => {
    it('rejects invalid current password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId, passwordHash: '$2a$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5y0q5y0q5y0q5y0q5y0q5y0q',
      });

      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ currentPassword: 'wrong', newPassword: 'NewStrongPass1' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('logs out successfully', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: userId, refreshToken: 'some-hash',
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns user profile', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId, email: 'test@example.com', name: 'Test User',
        createdAt: new Date(),
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('returns 401 when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns 401 with invalid token cookie', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('Token validation', () => {
    it('returns 401 with expired token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${getExpiredToken()}`);

      expect(res.status).toBe(401);
    });
  });
});
