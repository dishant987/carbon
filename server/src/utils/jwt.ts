import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types';
import { UnauthorizedError } from './errors';

/** Ensure JWT secrets are configured */
function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return secret;
}

/** Ensure JWT refresh secret is configured */
function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not configured');
  }
  return secret;
}

/**
 * Generates a short-lived access token (15 minutes).
 *
 * @param payload - User payload to encode in the token
 * @returns Signed JWT access token string
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '15m' });
}

/**
 * Generates a long-lived refresh token (7 days).
 *
 * @param payload - User payload to encode in the token
 * @returns Signed JWT refresh token string
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: '7d' });
}

/**
 * Verifies an access token and returns its payload.
 *
 * @param token - JWT access token string
 * @returns Decoded JWT payload
 * @throws UnauthorizedError if token is invalid or expired
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, getSecret()) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired');
    }
    throw new UnauthorizedError('Invalid access token');
  }
}

/**
 * Verifies a refresh token and returns its payload.
 *
 * @param token - JWT refresh token string
 * @returns Decoded JWT payload
 * @throws UnauthorizedError if token is invalid or expired
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, getRefreshSecret()) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired, please login again');
    }
    throw new UnauthorizedError('Invalid refresh token');
  }
}
