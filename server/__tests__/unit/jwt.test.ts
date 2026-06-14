import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../src/utils/jwt';
import type { JwtPayload } from '../../src/types';
import { UnauthorizedError } from '../../src/utils/errors';

const testPayload: JwtPayload = { userId: 'test-user-123', email: 'test@example.com' };

describe('JWT Utilities', () => {
  describe('generateAccessToken', () => {
    it('returns a string token', () => {
      const token = generateAccessToken(testPayload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('produces unique tokens for different payloads', () => {
      const t1 = generateAccessToken(testPayload);
      const t2 = generateAccessToken({ userId: 'other', email: 'o@e.com' });
      expect(t1).not.toBe(t2);
    });
  });

  describe('generateRefreshToken', () => {
    it('returns a string token', () => {
      const token = generateRefreshToken(testPayload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('returns the original payload for a valid token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('throws UnauthorizedError for an invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError for a token signed with the wrong secret', () => {
      // Use a token signed with a different secret
      const tampered = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ0ZXN0In0.invalid';
      expect(() => verifyAccessToken(tampered)).toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError for an expired token', () => {
      // Create an expired token by manipulating the iat
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        testPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '0s' }
      );
      // Wait a tick for expiry
      expect(() => verifyAccessToken(expiredToken)).toThrow(UnauthorizedError);
    });
  });

  describe('verifyRefreshToken', () => {
    it('returns the original payload for a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(testPayload.userId);
    });

    it('throws UnauthorizedError for an invalid refresh token', () => {
      expect(() => verifyRefreshToken('bad.token')).toThrow(UnauthorizedError);
    });
  });

  describe('token round-trip', () => {
    it('generates and verifies both token types successfully', () => {
      const accessToken = generateAccessToken(testPayload);
      const refreshToken = generateRefreshToken(testPayload);

      expect(verifyAccessToken(accessToken).userId).toBe(testPayload.userId);
      expect(verifyRefreshToken(refreshToken).userId).toBe(testPayload.userId);
    });
  });
});
