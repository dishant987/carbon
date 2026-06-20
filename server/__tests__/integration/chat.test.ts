import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getClient } from '../../src/services/gemini';

const prisma = new PrismaClient();
const userId = 'test-user-id';

function getAuthToken(): string {
  return jwt.sign({ userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

jest.mock('../../src/services/gemini', () => {
  const original = jest.requireActual('../../src/services/gemini');
  return {
    ...original,
    getClient: jest.fn(),
  };
});

describe('Chat Endpoints', () => {
  let mockGenerateContentStream: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGenerateContentStream = jest.fn().mockResolvedValue({
      stream: {
        async *[Symbol.asyncIterator]() {
          yield { text: () => 'Hello! How can I help you?' };
          yield { text: () => ' <activities>[{"type":"transport","desc":"Drove 25km","co2_kg":4.1}]</activities>' };
        },
      },
    });

    (getClient as jest.Mock).mockReturnValue({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContentStream: mockGenerateContentStream,
      }),
    });
  });

  describe('GET /api/chat/history', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/chat/history');
      expect(res.status).toBe(401);
    });

    it('returns history for authorized user', async () => {
      const mockHistory = [
        { id: '1', role: 'user', content: 'hello', createdAt: new Date() },
        { id: '2', role: 'bot', content: 'hi', createdAt: new Date() },
      ];
      (prisma.chatMessage.findMany as jest.Mock).mockResolvedValue(mockHistory);

      const res = await request(app)
        .get('/api/chat/history')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].content).toBe('hi'); // Chronological order (reversed from 'desc')
    });
  });

  describe('POST /api/chat/message', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/chat/message').send({ message: 'Hello' });
      expect(res.status).toBe(401);
    });

    it('returns 400 for invalid message input', async () => {
      const res = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ message: '' });

      expect(res.status).toBe(400);
    });

    it('streams response chunks and finishes with [DONE]', async () => {
      (prisma.chatMessage.create as jest.Mock).mockResolvedValue({ id: 'msg-id' });
      (prisma.activity.create as jest.Mock).mockResolvedValue({ id: 'act-id' });

      const res = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ message: 'I drove a car for 25km today', history: [] });

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/event-stream');
      expect(res.text).toContain('Hello! How can I help you?');
      expect(res.text).toContain('[DONE]');
    });
  });

  describe('DELETE /api/chat/history', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).delete('/api/chat/history');
      expect(res.status).toBe(401);
    });

    it('deletes history for authorized user', async () => {
      (prisma.chatMessage.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      const res = await request(app)
        .delete('/api/chat/history')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();
    });
  });
});
