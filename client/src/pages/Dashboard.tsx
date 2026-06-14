import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDashboardSummary,
  useCategoryBreakdown,
  useDailyProgress,
  useCarbonTips,
  dashboardKeys,
} from '../hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DashboardCharts } from '../components/DashboardCharts';
import { ProgressChart } from '../components/ProgressChart';
import { CarbonTips } from '../components/CarbonTips';
import { formatCO2 } from '../lib/utils';
import * as api from '../lib/api';
import { Leaf, TrendingUp, Calendar, Activity, AlertCircle, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  StatsCardSkeleton,
  ChartsSkeleton,
  LineChartSkeleton,
  TipsSkeleton,
} from '../components/SkeletonLoaders';

export function Dashboard() {
  const queryClient = useQueryClient();

  const { data: summary, isLoading: loadingSummary, isError: errorSummary } = useDashboardSummary();
  const { data: breakdown = [], isLoading: loadingBreakdown } = useCategoryBreakdown();
  const { data: progress = [], isLoading: loadingProgress } = useDailyProgress();
  const { data: tips = [], isLoading: loadingTips } = useCarbonTips();

  const error = errorSummary;

  // Memoize stat card config so it only recomputes when summary data changes
  const statsCards = useMemo(
    () => [
      {
        title: 'Total Footprint',
        value: summary ? formatCO2(summary.totalFootprint) : '0 kg',
        icon: Leaf,
        color: 'text-green-600 dark:text-green-400',
      },
      {
        title: 'Daily Average',
        value: summary ? formatCO2(summary.dailyAverage) : '0 kg',
        icon: TrendingUp,
        color: 'text-blue-600 dark:text-blue-400',
      },
      {
        title: 'This Week',
        value: summary ? formatCO2(summary.weeklyTotal) : '0 kg',
        icon: Calendar,
        color: 'text-yellow-600 dark:text-yellow-400',
      },
      {
        title: 'Total Activities',
        value: summary ? String(summary.activityCount) : '0',
        icon: Activity,
        color: 'text-purple-600 dark:text-purple-400',
      },
    ],
    [summary]
  );

  const handleRefreshTips = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.tips() });
    return queryClient.getQueryData<string[]>(dashboardKeys.tips()) ?? [];
  }, [queryClient]);

  if (error) {
    return (
      <div className="py-10 max-w-lg mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            Could not fetch carbon tracking data. Please make sure the server database is active or refresh
            the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            A comprehensive look at your carbon footprint metrics and environmental impact.
          </p>
        </div>
        <button
          onClick={() => api.downloadExport()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 shadow-sm transition-all"
          aria-label="Download carbon footprint data as CSV"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards Section */}
      {loadingSummary ? (
        <StatsCardSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card) => (
            <Card
              key={card.title}
              className="hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Breakdown Charts Section */}
      {loadingBreakdown ? <ChartsSkeleton /> : <DashboardCharts breakdown={breakdown} />}

      {/* Line Chart Section */}
      {loadingProgress ? <LineChartSkeleton /> : <ProgressChart data={progress} />}

      {/* Tips Section */}
      {loadingTips ? <TipsSkeleton /> : <CarbonTips tips={tips} onRefresh={handleRefreshTips} />}
    </div>
  );
}
