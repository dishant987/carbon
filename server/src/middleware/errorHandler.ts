import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import type { ApiResponse } from '../types';
import logger from '../utils/logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    const response: ApiResponse<null> = {
      success: false,
      error: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  logger.error({ err }, 'Unhandled error');

  const response: ApiResponse<null> = {
    success: false,
    error: 'Internal server error',
  };
  res.status(500).json(response);
};
