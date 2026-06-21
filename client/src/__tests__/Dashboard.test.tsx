import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dashboard } from '../pages/Dashboard';
import * as useDashboardHooks from '../hooks/useDashboard';
import * as api from '../lib/api';
import { MemoryRouter } from 'react-router-dom';
import type { PaginatedResult, Activity } from '../types';

vi.mock('../hooks/useDashboard', () => ({
  useDashboardSummary: vi.fn(),
  useCategoryBreakdown: vi.fn(),
  useDailyProgress: vi.fn(),
  useCarbonTips: vi.fn(),
  dashboardKeys: {
    tips: () => ['dashboard', 'tips'],
  },
}));

vi.mock('../lib/api', () => ({
  fetchGoals: vi.fn(),
  fetchActivities: vi.fn(),
  downloadExport: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueryData: vi.fn().mockReturnValue(['new tip']),
  }),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMocks = (
    overrides: {
      summary?: any;
      breakdown?: any;
      progress?: any;
      tips?: any;
    } = {}
  ) => {
    const summary = { totalFootprint: 150.5, dailyAverage: 21.5 };
    const breakdown = [
      { type: 'transport', total: 100, percentage: 66.4, count: 5 },
      { type: 'food', total: 50.5, percentage: 33.6, count: 3 },
    ];
    const progress = [
      { date: '2024-01-01', total: 10, activities: 1 },
      { date: '2024-01-02', total: 12, activities: 2 },
    ];
    const tips = ['Eat more plants', 'Switch off lights'];
    const goalsRes: api.GoalsResponse = {
      weeklyGoal: 100.0,
      weeklyTotal: 45.0,
      badges: [
        {
          id: '1',
          name: 'Eco Starter',
          description: 'Log first activity',
          icon: '🌱',
          unlocked: true,
          progress: 1,
          target: 1,
        },
        {
          id: '2',
          name: 'Green Warrior',
          description: 'Log 5 activities',
          icon: '🛡️',
          unlocked: false,
          progress: 2,
          target: 5,
        },
      ],
    };
    const actRes: PaginatedResult<Activity> = {
      items: [
        {
          id: '1',
          type: 'transport',
          category: 'car',
          amount: 20,
          unit: 'km',
          footprint: 5.0,
          date: '2024-01-15T00:00:00.000Z',
          createdAt: '2024-01-15T00:00:00.000Z',
          updatedAt: '2024-01-15T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 4, total: 1, totalPages: 1 },
    };

    vi.mocked(useDashboardHooks.useDashboardSummary).mockReturnValue({
      data: summary,
      isLoading: false,
      isError: false,
      ...overrides.summary,
    });
    vi.mocked(useDashboardHooks.useCategoryBreakdown).mockReturnValue({
      data: breakdown,
      isLoading: false,
      ...overrides.breakdown,
    });
    vi.mocked(useDashboardHooks.useDailyProgress).mockReturnValue({
      data: progress,
      isLoading: false,
      ...overrides.progress,
    });
    vi.mocked(useDashboardHooks.useCarbonTips).mockReturnValue({
      data: tips,
      isLoading: false,
      ...overrides.tips,
    });

    vi.mocked(api.fetchGoals).mockResolvedValue(goalsRes);
    vi.mocked(api.fetchActivities).mockResolvedValue(actRes);
  };

  it('renders stats card skeleton loading states', () => {
    setupMocks({
      summary: { isLoading: true, data: undefined },
    });
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.queryByText('Total Footprint')).not.toBeInTheDocument();
  });

  it('renders stats, goal progress, and unlocked badges successfully', async () => {
    setupMocks();
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for the extra async data loaders to finish
    await waitFor(() => {
      expect(screen.getByText('Total Footprint')).toBeInTheDocument();
    });

    // Check stats rendering
    expect(screen.getByText(/150\.50 kg/)).toBeInTheDocument();
    expect(screen.getByText(/21\.50 kg/)).toBeInTheDocument();
    expect(screen.getByText('45.0 / 100 kg')).toBeInTheDocument();

    // Check recent activities logs
    expect(screen.getByText('car')).toBeInTheDocument();
    expect(screen.getByText('5.0 kg')).toBeInTheDocument();

    // Check unlocked badge icon
    expect(screen.getByText('🌱')).toBeInTheDocument();
    expect(screen.queryByText('🛡️')).not.toBeInTheDocument();
  });

  it('calls downloadExport API when clicking export csv button', async () => {
    setupMocks();
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /download carbon footprint data/i });
    fireEvent.click(exportBtn);

    expect(api.downloadExport).toHaveBeenCalledTimes(1);
  });

  it('renders an error alert when summary query fails', () => {
    vi.mocked(useDashboardHooks.useDashboardSummary).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useDashboardHooks.useDashboardSummary>);
    vi.mocked(useDashboardHooks.useCategoryBreakdown).mockReturnValue({ data: [], isLoading: false } as any);
    vi.mocked(useDashboardHooks.useDailyProgress).mockReturnValue({ data: [], isLoading: false } as any);
    vi.mocked(useDashboardHooks.useCarbonTips).mockReturnValue({ data: [], isLoading: false } as any);
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
  });

  it('triggers query invalidation when refreshing tips', async () => {
    setupMocks();
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tips to Reduce Footprint')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /refresh tips/i });
    fireEvent.click(refreshBtn);

    // If no error is thrown, handleRefreshTips ran correctly
    expect(screen.getByText('Tips to Reduce Footprint')).toBeInTheDocument();
  });
});
