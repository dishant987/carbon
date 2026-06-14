import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ActivityInput } from '../types';
import * as api from '../lib/api';

/** Query key factory for cache invalidation */
export const activityKeys = {
  all: ['activities'] as const,
  list: (page?: number, limit?: number) => [...activityKeys.all, 'list', { page, limit }] as const,
};

/**
 * React Query hook for paginated activity data.
 * Automatically caches responses, dedupes requests, and refetches on stale.
 *
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 */
export function useActivities(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: activityKeys.list(page, limit),
    queryFn: () => api.fetchActivities(page, limit),
    staleTime: 30_000, // Consider data fresh for 30s
    gcTime: 5 * 60_000, // Keep in cache for 5 min
    placeholderData: (prev) => prev, // Keep previous data while fetching next page
  });
}

/**
 * Mutation hook for creating a new activity.
 * Invalidates the activity list cache on success.
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ActivityInput) => api.createActivity(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}

/**
 * Mutation hook for deleting an activity.
 * Invalidates the activity list cache on success.
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}
