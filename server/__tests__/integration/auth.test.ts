import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('registers a new user and returns tokens', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'new@example.com',
        passwordHash: 'hashed',
        name: 'New User',
        refreshToken: 'rt',
        createdAt: new Date(),
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@example.com', password: 'StrongPass1', name: 'New User' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('new@example.com');
      // Should NOT expose passwordHash or refreshToken in response
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('rejects duplicate email with 409', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'dup@example.com', password: 'StrongPass1' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects weak password with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'weak@example.com', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(() => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: '$2a$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5y0q5y0q5y0q5y0q5y0q5y0q',
        name: 'Test',
        refreshToken: null,
        createdAt: new Date(),
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});
    });

    it('logs in with valid credentials and returns tokens', async () => {
      // Mock bcrypt compare to return true
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'StrongPass1' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('rejects invalid password with 401', async () => {
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'WrongPass1' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects non-existent email with 401', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noone@example.com', password: 'StrongPass1' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns 401 when no cookie is sent', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without auth header', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
