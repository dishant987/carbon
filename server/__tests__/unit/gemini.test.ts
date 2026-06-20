import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateFootprint, generateTips, checkGeminiStatus, getClient, generateSustainabilityReport, analyzeRecipe } from '../../src/services/gemini';
import { ExternalServiceError } from '../../src/utils/errors';
import * as cache from '../../src/services/cache';

// Mock getCachedFootprint and setCachedFootprint
jest.mock('../../src/services/cache', () => ({
  getCachedFootprint: jest.fn(),
  setCachedFootprint: jest.fn(),
}));

describe('Gemini Service', () => {
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-api-key';

    // Access the mocked client methods
    const clientInstance = getClient();
    const model = clientInstance.getGenerativeModel({ model: 'gemini-2.5-flash' });
    mockGenerateContent = model.generateContent as jest.Mock;
  });

  describe('calculateFootprint', () => {
    it('returns cached footprint if available', async () => {
      const mockCached = { co2Kg: 1.25, explanation: 'Cached explanation' };
      (cache.getCachedFootprint as jest.Mock).mockResolvedValue(mockCached);

      const result = await calculateFootprint('transport', 'car', 10, 'km');

      expect(result).toEqual(mockCached);
      expect(cache.getCachedFootprint).toHaveBeenCalledWith('transport', 'car', 10, 'km');
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('calls Gemini API on cache miss and returns parsed result', async () => {
      (cache.getCachedFootprint as jest.Mock).mockResolvedValue(null);
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({ co2Kg: 5.432, explanation: 'API explanation' }),
        },
      });

      const result = await calculateFootprint('transport', 'car', 10, 'km');

      expect(result).toEqual({ co2Kg: 5.43, explanation: 'API explanation' });
      expect(cache.setCachedFootprint).toHaveBeenCalledWith(
        'transport',
        'car',
        10,
        'km',
        { co2Kg: 5.43, explanation: 'API explanation' }
      );
    });

    it('throws ExternalServiceError when JSON is missing in API response', async () => {
      (cache.getCachedFootprint as jest.Mock).mockResolvedValue(null);
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Invalid response string without json',
        },
      });

      await expect(
        calculateFootprint('transport', 'car', 10, 'km')
      ).rejects.toThrow(ExternalServiceError);
    });

    it('throws ExternalServiceError when API returns invalid JSON structure', async () => {
      (cache.getCachedFootprint as jest.Mock).mockResolvedValue(null);
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({ wrongField: 123 }),
        },
      });

      await expect(
        calculateFootprint('transport', 'car', 10, 'km')
      ).rejects.toThrow(ExternalServiceError);
    });

    it('throws ExternalServiceError when Gemini API client fails', async () => {
      (cache.getCachedFootprint as jest.Mock).mockResolvedValue(null);
      mockGenerateContent.mockRejectedValue(new Error('API Down'));

      await expect(
        calculateFootprint('transport', 'car', 10, 'km')
      ).rejects.toThrow(ExternalServiceError);
    });
  });

  describe('generateTips', () => {
    it('returns custom tips when Gemini API succeeds', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(['Tip 1', 'Tip 2']),
        },
      });

      const result = await generateTips([{ type: 'transport', category: 'car', footprint: 10 }]);

      expect(result).toEqual(['Tip 1', 'Tip 2']);
    });

    it('returns default tips when Gemini API returns invalid format', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Not a JSON array',
        },
      });

      const result = await generateTips([{ type: 'transport', category: 'car', footprint: 10 }]);

      expect(result).toContain('Consider using public transportation instead of personal vehicles.');
    });

    it('returns default tips when Gemini API call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network error'));

      const result = await generateTips([]);

      expect(result).toContain('Consider using public transportation instead of personal vehicles.');
    });
  });

  describe('checkGeminiStatus', () => {
    it('returns unconfigured status when GEMINI_API_KEY is missing', async () => {
      delete process.env.GEMINI_API_KEY;

      const result = await checkGeminiStatus();

      expect(result.success).toBe(false);
      expect(result.status).toBe('Unconfigured');
    });

    it('returns connected status when validation response is successful', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'OK',
        },
      });

      const result = await checkGeminiStatus();

      expect(result.success).toBe(true);
      expect(result.status).toBe('Connected & Operational');
    });

    it('returns degraded status when response text is empty', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => '',
        },
      });

      const result = await checkGeminiStatus();

      expect(result.success).toBe(false);
      expect(result.status).toBe('Degraded');
    });

    it('returns connection error status when validation fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Connection timed out'));

      const result = await checkGeminiStatus();

      expect(result.success).toBe(false);
      expect(result.status).toBe('Connection Error');
      expect(result.error).toBe('Connection timed out');
    });
  });

  describe('generateSustainabilityReport', () => {
    it('returns report parsed from Gemini response on success', async () => {
      const mockReportData = {
        grade: 'A-',
        score: 90,
        analysis: 'Great work minimizing travel footprint.',
        actionPlan: [
          { week: 1, challengeName: 'Carpooling', description: 'Carpool once', expectedSavingKg: 5 }
        ]
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockReportData)
        }
      });

      const result = await generateSustainabilityReport(
        [{ type: 'transport', category: 'car', amount: 10, unit: 'km', footprint: 2.5 }],
        100
      );

      expect(result).toEqual(mockReportData);
    });

    it('returns default fallback report when Gemini fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await generateSustainabilityReport([], 100);

      expect(result.grade).toBe('B');
      expect(result.score).toBe(75);
      expect(result.actionPlan).toHaveLength(4);
    });
  });

  describe('analyzeRecipe', () => {
    it('returns recipe analysis on success', async () => {
      const mockRecipeAnalysis = {
        recipeName: 'Vegan Salad',
        totalFootprintKg: 1.0,
        ingredientsAnalysis: [{ name: 'Lettuce', footprintKg: 0.2, impact: 'low' }],
        plantBasedAlternative: 'Vegan Salad',
        alternativeFootprintKg: 1.0,
        explanation: 'Low footprint recipe.'
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockRecipeAnalysis)
        }
      });

      const result = await analyzeRecipe('Lettuce salad recipe');

      expect(result).toEqual(mockRecipeAnalysis);
    });

    it('returns default fallback recipe analysis when Gemini fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await analyzeRecipe('Chicken and beef');

      expect(result.recipeName).toBe('Analyzed Recipe');
      expect(result.ingredientsAnalysis).toHaveLength(3);
      expect(result.alternativeFootprintKg).toBe(1.5);
    });
  });
});
