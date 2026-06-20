import { useMemo, useCallback, useState, useEffect } from 'react';
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
import { Leaf, TrendingUp, AlertCircle, Download, Award, Clock, ArrowRight, Target } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Link } from 'react-router-dom';
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

  // Extra states for goals and recent logs
  const [goalsData, setGoalsData] = useState<api.GoalsResponse | null>(null);
  const [recentActivities, setRecentActivities] = useState<api.Activity[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(true);

  useEffect(() => {
    async function loadExtraDetails() {
      try {
        const [goalsRes, actRes] = await Promise.all([
          api.fetchGoals(),
          api.fetchActivities(1, 4),
        ]);
        setGoalsData(goalsRes);
        setRecentActivities(actRes.items);
      } catch {
        // Silent catch for production compliance
      } finally {
        setLoadingExtra(false);
      }
    }
    loadExtraDetails();
  }, []);

  const error = errorSummary;

  const weeklyGoal = goalsData?.weeklyGoal ?? 100.0;
  const weeklyTotal = goalsData?.weeklyTotal ?? 0.0;
  const percentUsed = Math.min(Math.round((weeklyTotal / weeklyGoal) * 100), 200);

  const unlockedBadges = useMemo(() => {
    return goalsData?.badges.filter((b) => b.unlocked) ?? [];
  }, [goalsData]);

  // Memoize stats cards
  const statsCards = useMemo(
    () => [
      {
        title: 'Total Footprint',
        value: summary ? formatCO2(summary.totalFootprint) : '0.00 kg',
        icon: Leaf,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-500/5 border-green-500/10',
        desc: 'All-time carbon footprint',
      },
      {
        title: 'Daily Average',
        value: summary ? formatCO2(summary.dailyAverage) : '0.00 kg',
        icon: TrendingUp,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-500/5 border-blue-500/10',
        desc: 'Average CO2 per activity',
      },
      {
        title: 'Weekly Budget',
        value: `${weeklyTotal.toFixed(1)} / ${weeklyGoal.toFixed(0)} kg`,
        icon: Target,
        color: percentUsed >= 100 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
        bg: percentUsed >= 100 ? 'bg-rose-500/5 border-rose-500/10' : 'bg-emerald-500/5 border-emerald-500/10',
        desc: `${percentUsed}% target budget used`,
        showProgress: true,
      },
      {
        title: 'Achievements',
        value: goalsData ? `${unlockedBadges.length} / ${goalsData.badges.length}` : '0 / 6',
        icon: Award,
        color: 'text-amber-500',
        bg: 'bg-amber-500/5 border-amber-500/10',
        desc: unlockedBadges.length >= 4 ? 'Eco Master level' : unlockedBadges.length >= 2 ? 'Green Guardian' : 'Eco Trainee',
      },
    ],
    [summary, goalsData, weeklyGoal, weeklyTotal, percentUsed, unlockedBadges]
  );

  const handleRefreshTips = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.tips() });
    return queryClient.getQueryData<string[]>(dashboardKeys.tips()) ?? [];
  }, [queryClient]);

  // Helper to map category/type to a beautiful emoji
  const getActivityEmoji = (type: string, category: string) => {
    const typeLower = type.toLowerCase();
    const catLower = category.toLowerCase();
    
    if (typeLower === 'transport') {
      if (catLower.includes('car')) return '🚗';
      if (catLower.includes('bus')) return '🚌';
      if (catLower.includes('train')) return '🚆';
      if (catLower.includes('bike') || catLower.includes('bicycle')) return '🚲';
      return '✈️';
    }
    if (typeLower === 'food') {
      if (catLower.includes('beef') || catLower.includes('pork') || catLower.includes('seafood')) return '🥩';
      if (catLower.includes('chicken')) return '🍗';
      if (catLower.includes('dairy') || catLower.includes('cheese')) return '🥛';
      return '🥗';
    }
    if (typeLower === 'energy') {
      if (catLower.includes('solar')) return '☀️';
      return '🔌';
    }
    if (typeLower === 'shopping') {
      if (catLower.includes('clothing')) return '👕';
      if (catLower.includes('appliance') || catLower.includes('electronics')) return '💻';
      return '🛍️';
    }
    return '🌿';
  };

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            A comprehensive look at your carbon footprint metrics, goals, and environmental impact.
          </p>
        </div>
        <button
          onClick={() => api.downloadExport()}
          className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 shadow-sm transition-all"
          aria-label="Download carbon footprint data as CSV"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards Section */}
      {loadingSummary || loadingExtra ? (
        <StatsCardSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card) => (
            <Card
              key={card.title}
              className={`relative hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden border ${card.bg}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-black">{card.value}</div>
                <p className="text-[10px] text-muted-foreground font-medium">{card.desc}</p>
                {card.showProgress && (
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-2 border border-border/30">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        percentUsed >= 100 ? 'bg-rose-500' : percentUsed >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dashboard Content Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Charts (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Breakdown Charts Section */}
          {loadingBreakdown ? (
            <ChartsSkeleton />
          ) : (
            <DashboardCharts breakdown={breakdown} />
          )}

          {/* Line Chart Section */}
          {loadingProgress ? (
            <LineChartSkeleton />
          ) : (
            <ProgressChart data={progress} />
          )}
        </div>

        {/* Right Side: Sidebar Panels (1 col on large screen) */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Weekly Carbon Goal Tracker Panel */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Weekly Budget Status
              </CardTitle>
              <Link to="/goals" className="text-xs text-primary font-bold hover:underline">
                Manage
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-muted-foreground">Emissions Target</span>
                <span className="font-mono text-foreground">{weeklyTotal.toFixed(1)} / {weeklyGoal.toFixed(0)} kg CO2</span>
              </div>
              
              <div className="space-y-1">
                <div className="h-3.5 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border/30">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      percentUsed >= 100 ? 'bg-rose-500' : percentUsed >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
                  <span>0 kg</span>
                  <span>{percentUsed}% limit used</span>
                  <span>{weeklyGoal.toFixed(0)} kg limit</span>
                </div>
              </div>

              {percentUsed >= 100 ? (
                <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  ⚠️ You have exceeded this week's budget. Log greener activities to stay carbon negative!
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  🎉 On Track! You have {(weeklyGoal - weeklyTotal).toFixed(1)} kg CO2 left to spare this week.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Log Feed */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Recent Logs
              </CardTitle>
              <Link to="/activities" className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {loadingExtra ? (
                <div className="space-y-3 py-3">
                  <div className="h-10 bg-secondary animate-pulse rounded-xl" />
                  <div className="h-10 bg-secondary animate-pulse rounded-xl" />
                </div>
              ) : recentActivities.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No activities logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="flex items-center justify-between p-3 rounded-xl border bg-secondary/20 hover:bg-secondary/40 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl" role="img" aria-hidden="true">
                          {getActivityEmoji(act.type, act.category)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-foreground">{act.category}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {act.amount} {act.unit} • {new Date(act.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-foreground shrink-0 pl-2">
                        {act.footprint.toFixed(1)} kg
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Badges Showcase */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Eco Achievements
              </CardTitle>
              <Link to="/goals" className="text-xs text-primary font-bold hover:underline">
                View Badges
              </Link>
            </CardHeader>
            <CardContent>
              {loadingExtra ? (
                <div className="h-12 bg-secondary animate-pulse rounded-xl" />
              ) : unlockedBadges.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed text-center">
                  <p className="text-xs text-muted-foreground">No badges unlocked yet.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Log activities to unlock badges automatically!</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {unlockedBadges.slice(0, 4).map((badge) => (
                    <div
                      key={badge.id}
                      title={`${badge.name}: ${badge.description}`}
                      className="group relative h-12 w-12 rounded-xl flex items-center justify-center text-2xl bg-green-500/10 border border-green-500/20 hover:scale-105 transition-all shadow-sm cursor-help"
                    >
                      {badge.icon}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Tips Section */}
      {loadingTips ? (
        <TipsSkeleton />
      ) : (
        <CarbonTips tips={tips} onRefresh={handleRefreshTips} />
      )}
    </div>
  );
}
