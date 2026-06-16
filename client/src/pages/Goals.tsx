import { useState, useEffect } from 'react';
import { Target, Award, CheckCircle, Info, Loader2, Sparkles } from 'lucide-react';
import * as api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function Goals() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<api.GoalsResponse | null>(null);
  const [goalInput, setGoalInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadGoalsData = async () => {
    try {
      setLoading(true);
      const res = await api.fetchGoals();
      setData(res);
      setGoalInput(String(res.weeklyGoal));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goal settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoalsData();
  }, []);

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const newGoal = parseFloat(goalInput);

    if (isNaN(newGoal) || newGoal <= 0) {
      setError('Please enter a valid positive number for your goal.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.updateWeeklyGoal(newGoal);
      if (data) {
        setData({
          ...data,
          weeklyGoal: res.weeklyGoal,
        });
      }
      setSuccessMsg(`Weekly carbon target updated to ${res.weeklyGoal} kg CO2 successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground text-sm font-medium animate-pulse">Loading goals & badges...</p>
      </div>
    );
  }

  const weeklyGoal = data?.weeklyGoal ?? 100.0;
  const weeklyTotal = data?.weeklyTotal ?? 0.0;
  const badges = data?.badges ?? [];
  const percentUsed = Math.min(Math.round((weeklyTotal / weeklyGoal) * 100), 200);

  // Dynamic progress bar styling based on limit usage
  let progressColor = 'bg-gradient-to-r from-emerald-500 to-green-500';
  let progressBg = 'bg-green-500/10';
  let textColor = 'text-green-600 dark:text-green-400';
  let borderHighlight = 'border-green-500/20';

  if (percentUsed >= 100) {
    progressColor = 'bg-gradient-to-r from-rose-500 to-red-600';
    progressBg = 'bg-rose-500/10';
    textColor = 'text-rose-600 dark:text-rose-400';
    borderHighlight = 'border-rose-500/25';
  } else if (percentUsed >= 75) {
    progressColor = 'bg-gradient-to-r from-amber-500 to-orange-500';
    progressBg = 'bg-amber-500/10';
    textColor = 'text-amber-600 dark:text-amber-400';
    borderHighlight = 'border-amber-500/25';
  }

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
            Goals & Eco-Badges
          </h1>
          <p className="text-muted-foreground">
            Set your weekly carbon budget, track your real-time usage, and earn achievements for sustainable living.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Goal Management Card */}
        <div className={`lg:col-span-2 rounded-2xl border ${borderHighlight} bg-card text-card-foreground shadow-lg shadow-black/5 overflow-hidden transition-all duration-300`}>
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${progressBg}`}>
                  <Target className={`h-6 w-6 ${textColor}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Weekly Carbon Target</h2>
                  <p className="text-xs text-muted-foreground">Reset every Sunday</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black">{weeklyTotal}</span>
                <span className="text-muted-foreground text-sm font-semibold"> / {weeklyGoal} kg CO2</span>
              </div>
            </div>

            {/* Premium Progress Meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Weekly Emissions Progress</span>
                <span className={`${textColor} font-bold`}>{percentUsed}% Limit Consumed</span>
              </div>
              <div className="h-4.5 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border/30">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor}`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
              {percentUsed >= 100 ? (
                <div className="flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/10">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>You have exceeded your weekly carbon budget. Try using public transport or reducing home energy to trim down your footprint next week.</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground pl-1">
                  You have <span className="font-bold text-foreground">{(weeklyGoal - weeklyTotal).toFixed(1)} kg CO2</span> left in your budget to stay green this week.
                </p>
              )}
            </div>

            {/* Set Goal Form */}
            <form onSubmit={handleUpdateGoal} className="pt-4 border-t space-y-4">
              <div className="space-y-2">
                <label htmlFor="weeklyGoal" className="text-sm font-bold text-foreground">
                  Update Weekly Budget Limit (kg CO2)
                </label>
                <div className="flex gap-3 max-w-md">
                  <div className="relative flex-1">
                    <Input
                      id="weeklyGoal"
                      type="number"
                      step="1"
                      min="10"
                      max="10000"
                      placeholder="e.g. 100"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      className="bg-background/50 pl-4 border-border transition-colors hover:border-accent-foreground/20"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">kg CO2</span>
                  </div>
                  <Button type="submit" disabled={submitting} className="font-semibold transition-all">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Set Target
                  </Button>
                </div>
              </div>

              {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
              {successMsg && <p className="text-xs text-emerald-500 font-semibold">{successMsg}</p>}
            </form>
          </div>
        </div>

        {/* Stats and Leaderboard preview panel */}
        <div className="rounded-2xl border bg-card text-card-foreground shadow-lg shadow-black/5 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
              <h3 className="font-bold text-lg">Gamification Stats</h3>
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/35 border border-border/30">
                <span className="text-sm text-muted-foreground font-medium">Badges Earned</span>
                <span className="text-2xl font-black text-primary">{unlockedCount} <span className="text-xs text-muted-foreground">/ {badges.length}</span></span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/35 border border-border/30">
                <span className="text-sm text-muted-foreground font-medium">User Status</span>
                <span className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white px-2.5 py-1 rounded-full text-center">
                  {unlockedCount >= 4 ? 'Eco Master' : unlockedCount >= 2 ? 'Green Guardian' : 'Eco Trainee'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/35 border border-border/30">
                <span className="text-sm text-muted-foreground font-medium">Weekly Goal Status</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${percentUsed >= 100 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {percentUsed >= 100 ? 'Budget Blown' : 'On Track'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-accent/40 p-3 rounded-xl border mt-4">
            💡 <strong>Did you know?</strong> Sticking to a weekly limit of 70kg CO2 per person aligns closely with international environmental carbon reduction targets.
          </div>
        </div>
      </div>

      {/* Badges Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Award className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Eco-Achievements</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Complete green tasks to unlock achievements. As your log grows, more badges will be unlocked automatically.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`group relative rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                badge.unlocked
                  ? 'bg-card border-green-500/20 shadow-green-500/5'
                  : 'bg-card/50 border-border/60 grayscale opacity-70 hover:opacity-90 hover:grayscale-0'
              }`}
            >
              {/* Card Ribbon / Checkmark */}
              {badge.unlocked && (
                <CheckCircle className="absolute top-4 right-4 h-5 w-5 text-green-500 fill-green-500/10" />
              )}

              <div className="p-6 space-y-4">
                <div className="flex gap-4 items-center">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border transition-transform duration-300 group-hover:scale-110 ${
                      badge.unlocked
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-secondary border-border'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base leading-tight group-hover:text-primary transition-colors">
                      {badge.name}
                    </h3>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 ${
                        badge.unlocked ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {badge.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {badge.description}
                </p>

                {/* Progress bar inside card */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>Task Progress</span>
                    <span>
                      {badge.progress} / {badge.target}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        badge.unlocked ? 'bg-green-500' : 'bg-muted-foreground/45'
                      }`}
                      style={{ width: `${(badge.progress / badge.target) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
