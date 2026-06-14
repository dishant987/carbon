import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { ForbiddenError } from '../utils/errors';

/**
 * Middleware that authenticates requests via JWT Bearer token.
 * Extracts token from the Authorization header, verifies it,
 * and attaches the decoded user payload to `req.user`.
 *
 * Protected routes should use this middleware.
 *
 * @throws UnauthorizedError if no token or invalid token
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError('No authorization header provided');
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedError('Authorization header must use Bearer scheme');
  }

  const token = parts[1];

  if (!token) {
    throw new UnauthorizedError('No access token provided');
  }

  const payload = verifyAccessToken(token);
  req.user = payload;

  next();
};

/**
 * Middleware that optionally attaches user info if a valid token exists.
 * Does NOT throw if no token is present - allows unauthenticated access
 * while still providing user context when available.
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(parts[1]);
    req.user = payload;
  } catch {
    // Silently ignore invalid tokens for optional auth
  }

  next();
};

/** Protects cookie-authenticated routes from cross-site requests. */
export const requireTrustedOrigin = (req: Request, _res: Response, next: NextFunction): void => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const origin = req.get('origin');

  if (origin && origin !== clientUrl) {
    throw new ForbiddenError('Request origin is not allowed');
  }

  next();
};
