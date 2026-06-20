import request from 'supertest';
import app from '../../src/index';
import jwt from 'jsonwebtoken';
import { analyzeRecipe } from '../../src/services/gemini';

const userId = 'test-user-id';

function getAuthToken(): string {
  return jwt.sign({ userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

jest.mock('../../src/services/gemini', () => {
  return {
    analyzeRecipe: jest.fn(),
  };
});

describe('Recipe Endpoints', () => {
  describe('POST /api/recipes/analyze', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/recipes/analyze').send({ recipe: 'Chicken Salad' });
      expect(res.status).toBe(401);
    });

    it('returns 400 when recipe is empty', async () => {
      const res = await request(app)
        .post('/api/recipes/analyze')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ recipe: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns recipe analysis when input is valid', async () => {
      const mockResult = {
        recipeName: 'Beef Burger',
        totalFootprintKg: 10.5,
        ingredientsAnalysis: [{ name: 'Beef Pattie', footprintKg: 9.0, impact: 'high' }],
        plantBasedAlternative: 'Vegan Burger',
        alternativeFootprintKg: 1.5,
        explanation: 'Swapping beef reduces carbon emissions.',
      };
      (analyzeRecipe as jest.Mock).mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/recipes/analyze')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ recipe: '1 beef burger patty' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockResult);
      expect(analyzeRecipe).toHaveBeenCalledWith('1 beef burger patty');
    });
  });
});
