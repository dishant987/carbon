/** Activity type matching server enum */
export type ActivityType = 'transport' | 'food' | 'energy' | 'shopping';

/** Activity record as returned by the API */
export interface Activity {
  id: string;
  type: ActivityType;
  category: string;
  amount: number;
  unit: string;
  footprint: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

/** Input payload for creating a new activity */
export interface ActivityInput {
  type: ActivityType;
  category: string;
  amount: number;
  unit: string;
  date?: string;
}

/** Dashboard summary statistics */
export interface DashboardSummary {
  totalFootprint: number;
  dailyAverage: number;
  weeklyTotal: number;
  monthlyTotal: number;
  activityCount: number;
}

/** Per-category breakdown entry */
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

/** Generic API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Paginated response from the API */
export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Form values for the activity input form */
export interface ActivityFormValues {
  type: ActivityType;
  category: string;
  amount: string;
  unit: string;
  date: string;
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

/** Auth tokens returned after login/register */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Chat message interface */
export interface Message {
  id?: string;
  role: 'user' | 'bot';
  content: string;
  createdAt?: string;
}
