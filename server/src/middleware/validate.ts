import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Middleware factory that validates the request body against a Zod schema.
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware that validates on use
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => e.message).join(', ');
        throw new ValidationError(messages);
      }
      throw new ValidationError('Invalid request body');
    }
  };
};

/**
 * Middleware factory that validates request query params against a Zod schema.
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware that validates on use
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => e.message).join(', ');
        throw new ValidationError(messages);
      }
      throw new ValidationError('Invalid query parameters');
    }
  };
};
