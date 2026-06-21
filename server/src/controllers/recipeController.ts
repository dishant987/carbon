import { Request, Response, NextFunction } from 'express';
import { analyzeRecipe } from '../services/gemini';

/**
 * POST /api/recipes/analyze
 * Body: { recipe: string }
 */
export const analyzeRecipeController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { recipe } = req.body;
    if (!recipe || typeof recipe !== 'string' || recipe.trim() === '') {
      res.status(400).json({ success: false, error: 'Recipe text is required' });
      return;
    }

    const analysis = await analyzeRecipe(recipe);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};
