/** Activity type categories */
export type ActivityType = 'transport' | 'food' | 'energy' | 'shopping';

/** Input payload for creating an activity */
export interface ActivityInput {
  type: ActivityType;
  category: string;
  amount: number;
  unit: string;
  date?: string;
}

/** Result returned from Gemini AI footprint calculation */
export interface FootprintResult {
  co2Kg: number;
  explanation: string;
}

/** Dashboard summary statistics */
export interface DashboardSummary {
  totalFootprint: number;
  dailyAverage: number;
  weeklyTotal: number;
  monthlyTotal: number;
  activityCount: number;
}

/** Per-category breakdown of carbon footprint */
export interface CategoryBreakdown {
  type: string;
  total: number;
  percentage: number;
  count: number;
}

/** Daily progress entry for charts */
export interface DailyProgress {
  date: string;
  total: number;
  activities: number;
}

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

/** JWT payload stored in access and refresh tokens */
export interface JwtPayload {
  userId: string;
  email: string;
}

/** Auth tokens returned after login/register */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/** Safe user object sent to clients (no passwordHash or refreshToken) */
export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

/** Registration input */
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

/** Login input */
export interface LoginInput {
  email: string;
  password: string;
}
