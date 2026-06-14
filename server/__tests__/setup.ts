import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables before any imports
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Shared mocked methods so all PrismaClient instances share the same mock
const mockActivity = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
};

const mockUser = {
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockChatMessage = {
  findMany: jest.fn(),
  create: jest.fn(),
};

const mockQueryRaw = jest.fn();

// Shared Redis mock for cache service testing
const mockRedisGet = jest.fn().mockResolvedValue(null);
const mockRedisSetex = jest.fn().mockResolvedValue('OK');
const mockRedisDel = jest.fn().mockResolvedValue(1);

// Mock Prisma client globally
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      activity: mockActivity,
      user: mockUser,
      chatMessage: mockChatMessage,
      $queryRaw: mockQueryRaw,
      $disconnect: jest.fn(),
      $on: jest.fn(),
    })),
  };
});

// Mock ioredis to avoid connection attempts during tests
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: mockRedisGet,
    setex: mockRedisSetex,
    del: mockRedisDel,
    on: jest.fn(),
  }));
});

// Mock Gemini AI to avoid real API calls
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue(
              JSON.stringify({ co2Kg: 2.5, explanation: 'Test calculation' })
            ),
          },
        }),
      }),
    })),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});
