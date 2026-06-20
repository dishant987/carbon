import Redis from 'ioredis';
import type { FootprintResult } from '../types';
import logger from '../utils/logger';

const FOOTPRINT_CACHE_TTL = 60 * 60;
const DASHBOARD_CACHE_TTL = 5 * 60;

let redisClient: Redis | null = null;
let redisInitialized = false;

export function resetCacheForTest(): void {
  redisClient = null;
  redisInitialized = false;
}

function getClient(): Redis | null {
  if (!redisInitialized) {
    redisInitialized = true;
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    try {
      redisClient = new Redis({ host, port, lazyConnect: true, maxRetriesPerRequest: 0 });

      redisClient.on('error', (err) => {
        logger.warn({ err }, 'Redis connection error — caching disabled');
      });
    } catch (err: unknown) {
      logger.warn({ err }, 'Failed to initialize Redis client');
      redisClient = null;
    }
  }
  return redisClient;
}

function buildCacheKey(type: string, category: string, amount: number, unit: string): string {
  return `footprint:${type}:${category.toLowerCase()}:${amount}:${unit.toLowerCase()}`;
}

export async function getCachedFootprint(
  type: string,
  category: string,
  amount: number,
  unit: string
): Promise<FootprintResult | null> {
  try {
    const client = getClient();
    if (!client) return null;

    const key = buildCacheKey(type, category, amount, unit);
    const cached = await client.get(key);
    return cached ? (JSON.parse(cached) as FootprintResult) : null;
  } catch {
    return null;
  }
}

export async function setCachedFootprint(
  type: string,
  category: string,
  amount: number,
  unit: string,
  value: FootprintResult
): Promise<void> {
  try {
    const client = getClient();
    if (!client) return;

    const key = buildCacheKey(type, category, amount, unit);
    await client.setex(key, FOOTPRINT_CACHE_TTL, JSON.stringify(value));
  } catch {
    logger.warn('Failed to set cached footprint');
  }
}

function dashboardKey(prefix: string, userId: string): string {
  return `dashboard:${prefix}:${userId}`;
}

export async function getCachedDashboard<T>(prefix: string, userId: string): Promise<T | null> {
  try {
    const client = getClient();
    if (!client) return null;

    const cached = await client.get(dashboardKey(prefix, userId));
    return cached ? (JSON.parse(cached) as T) : null;
  } catch {
    return null;
  }
}

export async function setCachedDashboard<T>(prefix: string, userId: string, value: T): Promise<void> {
  try {
    const client = getClient();
    if (!client) return;

    await client.setex(dashboardKey(prefix, userId), DASHBOARD_CACHE_TTL, JSON.stringify(value));
  } catch {
    logger.warn('Failed to set cached dashboard data');
  }
}

export async function invalidateDashboardCache(userId: string): Promise<void> {
  try {
    const client = getClient();
    if (!client) return;

    const prefixes = ['summary', 'breakdown', 'progress'];
    const keys = prefixes.map((p) => dashboardKey(p, userId));
    await client.del(...keys);
  } catch {
    logger.warn('Failed to invalidate dashboard cache');
  }
}
