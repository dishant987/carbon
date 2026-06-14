import { Request, Response, NextFunction } from 'express';
import { getPersonalizedTips } from '../services/tips';
import { checkGeminiStatus } from '../services/gemini';
import type { ApiResponse } from '../types';

interface GeminiStatusResult {
  success: boolean;
  status: string;
  model: string;
  error?: string;
}

export const getTips = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tips: string[] = await getPersonalizedTips(req.user!.userId);
    const response: ApiResponse<string[]> = { success: true, data: tips };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getGeminiStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const statusResult: GeminiStatusResult = await checkGeminiStatus();
    const response: ApiResponse<GeminiStatusResult> = { success: true, data: statusResult };
    res.json(response);
  } catch (error) {
    next(error);
  }
};
