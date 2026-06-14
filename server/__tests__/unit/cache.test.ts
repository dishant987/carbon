import {
  getCachedFootprint,
  setCachedFootprint,
  getCachedDashboard,
  setCachedDashboard,
  invalidateDashboardCache,
  resetCacheForTest,
} from '../../src/services/cache';

jest.mock('ioredis', () => {
  const mockGet = jest.fn();
  const mockSetex = jest.fn();
  const mockDel = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      get: mockGet,
      setex: mockSetex,
      del: mockDel,
      on: jest.fn(),
    })),
    getMockGet: () => mockGet,
    getMockSetex: () => mockSetex,
    getMockDel: () => mockDel,
  };
});

const mockGet = jest.requireMock('ioredis').getMockGet();
const mockSetex = jest.requireMock('ioredis').getMockSetex();
const mockDel = jest.requireMock('ioredis').getMockDel();

describe('Cache Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCacheForTest();
  });

  describe('getCachedFootprint', () => {
    it('returns parsed FootprintResult if cached entry exists', async () => {
      const mockResult = { co2Kg: 2.5, explanation: 'Test explanation' };
      mockGet.mockResolvedValue(JSON.stringify(mockResult));

      const result = await getCachedFootprint('transport', 'car', 10, 'km');

      expect(result).toEqual(mockResult);
      expect(mockGet).toHaveBeenCalledWith('footprint:transport:car:10:km');
    });

    it('returns null on cache miss', async () => {
      mockGet.mockResolvedValue(null);

      const result = await getCachedFootprint('transport', 'car', 10, 'km');

      expect(result).toBeNull();
    });

    it('returns null if Redis query throws an error', async () => {
      mockGet.mockRejectedValue(new Error('Redis connection failed'));

      const result = await getCachedFootprint('transport', 'car', 10, 'km');

      expect(result).toBeNull();
    });
  });

  describe('setCachedFootprint', () => {
    it('saves FootprintResult in Redis with TTL', async () => {
      const mockValue = { co2Kg: 4.2, explanation: 'Calculation detail' };
      mockSetex.mockResolvedValue('OK');

      await setCachedFootprint('transport', 'car', 20, 'km', mockValue);

      expect(mockSetex).toHaveBeenCalledWith(
        'footprint:transport:car:20:km',
        3600,
        JSON.stringify(mockValue)
      );
    });

    it('does not throw an error if Redis set fails', async () => {
      mockSetex.mockRejectedValue(new Error('Redis readonly'));

      await expect(
        setCachedFootprint('transport', 'car', 20, 'km', { co2Kg: 4.2, explanation: 'Detail' })
      ).resolves.not.toThrow();
    });
  });

  describe('getCachedDashboard', () => {
    it('returns cached dashboard data if exists', async () => {
      const mockData = { totalFootprint: 100, activityCount: 5, dailyAverage: 10, weeklyTotal: 50, monthlyTotal: 80 };
      mockGet.mockResolvedValue(JSON.stringify(mockData));

      const result = await getCachedDashboard<typeof mockData>('summary', 'user-1');

      expect(result).toEqual(mockData);
      expect(mockGet).toHaveBeenCalledWith('dashboard:summary:user-1');
    });

    it('returns null on miss', async () => {
      mockGet.mockResolvedValue(null);

      const result = await getCachedDashboard('summary', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('setCachedDashboard', () => {
    it('saves data with 5-minute TTL', async () => {
      const data = { totalFootprint: 50, activityCount: 3, dailyAverage: 5, weeklyTotal: 30, monthlyTotal: 40 };
      mockSetex.mockResolvedValue('OK');

      await setCachedDashboard('summary', 'user-1', data);

      expect(mockSetex).toHaveBeenCalledWith(
        'dashboard:summary:user-1',
        300,
        JSON.stringify(data)
      );
    });
  });

  describe('invalidateDashboardCache', () => {
    it('deletes all three dashboard cache keys', async () => {
      mockDel.mockResolvedValue(3);

      await invalidateDashboardCache('user-1');

      expect(mockDel).toHaveBeenCalledWith(
        'dashboard:summary:user-1',
        'dashboard:breakdown:user-1',
        'dashboard:progress:user-1'
      );
    });

    it('does not throw when Redis fails', async () => {
      mockDel.mockRejectedValue(new Error('Connection lost'));

      await expect(invalidateDashboardCache('user-1')).resolves.not.toThrow();
    });
  });
});