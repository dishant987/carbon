import { useQuery } from '@tanstack/react-query';
import * as api from '../lib/api';

/** Query key factory for dashboard cache */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  breakdown: () => [...dashboardKeys.all, 'breakdown'] as const,
  progress: () => [...dashboardKeys.all, 'progress'] as const,
  tips: () => [...dashboardKeys.all, 'tips'] as const,
};

/**
 * Fetches dashboard summary with 2 min staletime.
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: api.fetchDashboardSummary,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });
}

/**
 * Fetches footprint category breakdown with 2 min staletime.
 */
export function useCategoryBreakdown() {
  return useQuery({
    queryKey: dashboardKeys.breakdown(),
    queryFn: api.fetchCategoryBreakdown,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });
}

/**
 * Fetches daily progress for charts with 2 min staletime.
 */
export function useDailyProgress() {
  return useQuery({
    queryKey: dashboardKeys.progress(),
    queryFn: api.fetchDailyProgress,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });
}

/**
 * Fetches personalized carbon tips with 5 min staletime.
 */
export function useCarbonTips() {
  return useQuery({
    queryKey: dashboardKeys.tips(),
    queryFn: api.fetchTips,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}
