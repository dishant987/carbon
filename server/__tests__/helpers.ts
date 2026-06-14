import request from 'supertest';
import app from '../src/index';

/**
 * Creates a test user and returns valid auth tokens.
 * Uses the mocked Prisma user.create internally.
 */
export async function createTestUser(): Promise<{
  accessToken: string;
  refreshToken: string;
  userId: string;
}> {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', password: 'Password123', name: 'Test User' });

  return {
    accessToken: res.body.data.tokens.accessToken,
    refreshToken: res.body.data.tokens.refreshToken,
    userId: res.body.data.user.id,
  };
}

/**
 * Extracts the Set-Cookie header from a response as a plain object.
 */
export function parseCookies(res: request.Response): Record<string, string> {
  const cookies: Record<string, string> = {};
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) return cookies;

  const cookieArr = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const c of cookieArr) {
    const [pair] = c.split(';');
    const [key, ...val] = pair.split('=');
    cookies[key.trim()] = val.join('=');
  }
  return cookies;
}
