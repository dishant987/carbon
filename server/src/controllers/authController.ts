import { Request, Response, NextFunction, CookieOptions } from 'express';
import { prisma } from '../services/footprint';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema } from '../utils/validation';
import { ValidationError, UnauthorizedError, ConflictError } from '../utils/errors';
import type { ApiResponse, AuthTokens, SafeUser, JwtPayload } from '../types';
import { createHash } from 'crypto';

/** Cookie configuration for HTTP-only refresh token */
const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Strips sensitive fields from a user object before sending to client.
 *
 * @param user - User object from Prisma
 * @returns Safe user object without passwordHash or refreshToken
 */
function toSafeUser(user: { id: string; email: string; name: string | null; createdAt: Date }): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * POST /api/auth/register
 * Creates a new user account, returns tokens and safe user data.
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const jwtPayload: JwtPayload = { userId: user.id, email: user.email };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashRefreshToken(refreshToken) },
    });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    const tokens: AuthTokens = { accessToken };

    const response: ApiResponse<{ user: SafeUser; tokens: AuthTokens }> = {
      success: true,
      data: { user: toSafeUser(user), tokens },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns tokens with safe user data.
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const jwtPayload: JwtPayload = { userId: user.id, email: user.email };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashRefreshToken(refreshToken) },
    });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    const tokens: AuthTokens = { accessToken };

    const response: ApiResponse<{ user: SafeUser; tokens: AuthTokens }> = {
      success: true,
      data: { user: toSafeUser(user), tokens },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Uses the HTTP-only refresh token cookie to issue a new access token.
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new UnauthorizedError('No refresh token provided');
    }

    const payload = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== hashRefreshToken(token)) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    const jwtPayload: JwtPayload = { userId: user.id, email: user.email };

    const newAccessToken = generateAccessToken(jwtPayload);
    const newRefreshToken = generateRefreshToken(jwtPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashRefreshToken(newRefreshToken) },
    });

    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

    const tokens: AuthTokens = { accessToken: newAccessToken };

    const response: ApiResponse<{ tokens: AuthTokens }> = {
      success: true,
      data: { tokens },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Clears the refresh token cookie and removes the stored token from DB.
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      const user = await prisma.user.findFirst({ where: { refreshToken: hashRefreshToken(token) } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
      }
    }

    res.clearCookie('refreshToken', {
      path: '/api/auth',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const response: ApiResponse<SafeUser> = {
      success: true,
      data: toSafeUser(user),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 * Updates user profile (name and/or email).
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const { email, name } = parsed.data;
    const userId = req.user!.userId;

    if (email) {
      const existing = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });
      if (existing) {
        throw new ConflictError('An account with this email already exists');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email !== undefined ? { email } : {}),
        ...(name !== undefined ? { name } : {}),
      },
    });

    // Generate new tokens with updated email
    const jwtPayload: JwtPayload = { userId: updatedUser.id, email: updatedUser.email };
    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    await prisma.user.update({
      where: { id: updatedUser.id },
      data: { refreshToken: hashRefreshToken(refreshToken) },
    });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    const response: ApiResponse<{ user: SafeUser; tokens: AuthTokens }> = {
      success: true,
      data: {
        user: toSafeUser(updatedUser),
        tokens: { accessToken },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/password
 * Updates the user's password.
 */
export const updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = updatePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const { currentPassword, newPassword } = parsed.data;
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Password updated successfully' },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
