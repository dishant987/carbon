import type {
  ApiResponse,
  Activity,
  ActivityInput,
  DashboardSummary,
  CategoryBreakdown,
  DailyProgress,
  PaginatedResult,
  SafeUser,
  RegisterInput,
  LoginInput,
  AuthTokens,
  Message,
} from '../types';

export const BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
