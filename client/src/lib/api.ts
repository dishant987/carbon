import type {
  ApiResponse,
  Activity,
  ActivityInput,
  CategoryBreakdown,
  DailyProgress,
  PaginatedResult,
  SafeUser,
  RegisterInput,
  LoginInput,
  AuthTokens,
  Message,
  DashboardSummary,
} from '../types';

export type { DashboardSummary, Activity } from '../types';

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
export const BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

let accessToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

/**
 * Generic fetch wrapper with error handling and automatic token refresh on 401.
 * @param url - API endpoint path
 * @param options - Fetch options
 * @param isRetry - Internal flag to prevent infinite loops on token refresh
 * @returns Parsed response data
 */
async function request<T>(url: string, options?: RequestInit, isRetry = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: 'include', // Ensure HttpOnly refresh cookies are transmitted
    });
  } catch (err) {
    throw new Error('Network error. Please check your connection.');
  }

  // Handle expired or unauthorized access token
  if (
    response.status === 401 &&
    !isRetry &&
    !url.includes('/auth/refresh') &&
    !url.includes('/auth/login') &&
    !url.includes('/auth/register')
  ) {
    try {
      // Attempt to refresh the access token
      const refreshResult = await request<{ tokens: AuthTokens }>('/auth/refresh', { method: 'POST' }, true);
      const newAccessToken = refreshResult.tokens.accessToken;
      setAccessToken(newAccessToken);

      // Retry the original request with the new access token
      return request<T>(url, options, true);
    } catch (refreshError) {
      // Refresh failed or is invalid, clean up and notify
      setAccessToken(null);
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      throw refreshError;
    }
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch (err) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  if (!json.success) {
    throw new Error(json.error ?? 'An unexpected error occurred');
  }

  return json.data as T;
}

/** Registers a new user account */
export async function register(input: RegisterInput): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  return request<{ user: SafeUser; tokens: AuthTokens }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Authenticates a user */
export async function login(input: LoginInput): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  return request<{ user: SafeUser; tokens: AuthTokens }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Revokes access/refresh tokens and logs out user */
export async function logout(): Promise<void> {
  await request<null>('/auth/logout', { method: 'POST' });
  setAccessToken(null);
}

/** Retrieves currently authenticated user profile */
export async function getMe(): Promise<SafeUser> {
  return request<SafeUser>('/auth/me');
}

/** Explicitly trigger a refresh token check */
export async function refreshSession(): Promise<{ tokens: AuthTokens }> {
  return request<{ tokens: AuthTokens }>('/auth/refresh', { method: 'POST' });
}

/** Fetches activities with pagination support */
export async function fetchActivities(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<Activity>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request<PaginatedResult<Activity>>(`/activities?${params}`);
}

/** Creates a new activity and returns it with calculated footprint */
export async function createActivity(input: ActivityInput): Promise<Activity> {
  return request<Activity>('/activities', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Deletes an activity by ID */
export async function deleteActivity(id: string): Promise<void> {
  await request<void>(`/activities/${id}`, { method: 'DELETE' });
}

/** Fetches dashboard summary statistics */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>('/dashboard/summary');
}

/** Fetches footprint breakdown by category */
export async function fetchCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  return request<CategoryBreakdown[]>('/dashboard/breakdown');
}

/** Fetches daily progress data for charts */
export async function fetchDailyProgress(): Promise<DailyProgress[]> {
  return request<DailyProgress[]>('/dashboard/progress');
}

/** Fetches personalized carbon reduction tips */
export async function fetchTips(): Promise<string[]> {
  return request<string[]>('/tips');
}

export interface GeminiStatusResult {
  success: boolean;
  status: string;
  model: string;
  error?: string;
}

/** Fetches the Gemini API integration status */
export async function fetchGeminiStatus(): Promise<GeminiStatusResult> {
  return request<GeminiStatusResult>('/tips/status');
}

/** Fetches the chat message history */
export async function fetchChatHistory(): Promise<Message[]> {
  return request<Message[]>('/chat/history');
}

/** Clears the chat message history */
export async function clearChatHistory(): Promise<void> {
  return request<void>('/chat/history', { method: 'DELETE' });
}

/** Downloads carbon footprint data as CSV */
export async function downloadExport(): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const response = await fetch(`${BASE_URL}/export`, {
    headers,
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to export data');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'carbon-footprint-export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface GoalBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface GoalsResponse {
  weeklyGoal: number;
  weeklyTotal: number;
  badges: GoalBadge[];
}

export interface AiReportResponse {
  grade: string;
  score: number;
  analysis: string;
  actionPlan: Array<{
    week: number;
    challengeName: string;
    description: string;
    expectedSavingKg: number;
  }>;
}

export interface OffsetPledge {
  id: string;
  project: string;
  amount: number;
  createdAt: string;
}

export interface OffsetProject {
  id: string;
  name: string;
  description: string;
  location: string;
  costPerTonUSD: number;
  category: string;
  image: string;
}

export interface OffsetsResponse {
  projects: OffsetProject[];
  pledges: OffsetPledge[];
  totalOffset: number;
}

/** Fetches user weekly carbon goals, current week emissions, and dynamic badges */
export async function fetchGoals(): Promise<GoalsResponse> {
  return request<GoalsResponse>('/dashboard/goals');
}

/** Updates user's weekly carbon limit/goal */
export async function updateWeeklyGoal(weeklyGoal: number): Promise<{ weeklyGoal: number }> {
  return request<{ weeklyGoal: number }>('/dashboard/goals', {
    method: 'PUT',
    body: JSON.stringify({ weeklyGoal }),
  });
}

/** Triggers Gemini model to generate a monthly sustainability report card */
export async function generateAiReport(): Promise<AiReportResponse> {
  return request<AiReportResponse>('/dashboard/report', {
    method: 'POST',
  });
}

/** Fetches carbon offsetting projects, pledges history, and aggregates */
export async function fetchOffsets(): Promise<OffsetsResponse> {
  return request<OffsetsResponse>('/offsets');
}

/** Records a new carbon offset project pledge */
export async function createOffsetPledge(project: string, amount: number): Promise<OffsetPledge> {
  return request<OffsetPledge>('/offsets', {
    method: 'POST',
    body: JSON.stringify({ project, amount }),
  });
}

export interface IngredientAnalysis {
  name: string;
  footprintKg: number;
  impact: 'high' | 'medium' | 'low';
}

export interface RecipeAnalysisResponse {
  recipeName: string;
  totalFootprintKg: number;
  ingredientsAnalysis: IngredientAnalysis[];
  plantBasedAlternative: string;
  alternativeFootprintKg: number;
  explanation: string;
}

export interface LeaderboardUser {
  userId: string;
  name: string;
  totalFootprint: number;
  weeklyFootprint: number;
  activityCount: number;
  rank: number;
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  category: string;
  points: number;
}

export interface LeaderboardResponse {
  rankings: LeaderboardUser[];
  challenges: EcoChallenge[];
}

/** Sends a recipe text to Gemini for carbon analysis and substitution suggestions */
export async function analyzeRecipeCarbon(recipe: string): Promise<RecipeAnalysisResponse> {
  return request<RecipeAnalysisResponse>('/recipes/analyze', {
    method: 'POST',
    body: JSON.stringify({ recipe }),
  });
}

/** Fetches real-time community user rankings and active eco-challenges */
export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  return request<LeaderboardResponse>('/leaderboard');
}
