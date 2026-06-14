import { Request, Response, NextFunction } from 'express';
import type { ParsedQs } from 'qs';

const BLOCKED_PATTERNS = [/\$/g];

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    let cleaned = value.trim();
    for (const pattern of BLOCKED_PATTERNS) {
      cleaned = cleaned.replace(pattern, '');
    }
    return cleaned;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }

  return value;
}

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query) as ParsedQs;
  }
  if (req.params) {
    req.params = sanitizeValue(req.params) as Record<string, string>;
  }
  next();
};
