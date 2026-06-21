import { useState, useEffect } from 'react';
import { Users, Sparkles, Loader2, Medal, TrendingUp, Trophy } from 'lucide-react';
import * as api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function Challenges() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<api.LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      const res = await api.fetchLeaderboard();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLeaderboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground text-sm font-medium animate-pulse">
          Loading community stats...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] text-center space-y-4">
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 max-w-md mx-auto">
          <p className="text-destructive font-semibold">Error loading leaderboard</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
        <button
          type="button"
          onClick={loadLeaderboardData}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold transition-all text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const rankings = data?.rankings ?? [];
  const challenges = data?.challenges ?? [];

  // Top 3 Podium spots
  const top1 = rankings.find((r) => r.rank === 1);
  const top2 = rankings.find((r) => r.rank === 2);
  const top3 = rankings.find((r) => r.rank === 3);

  // User status in rankings
  const myRank = rankings.find((r) => r.userId === currentUser?.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Eco-Challenges & Rankings
          </h1>
          <p className="text-muted-foreground">
            Log activities to reduce your footprint, climb the community rankings, and conquer active group
            challenges.
          </p>
        </div>
      </div>

      {/* Podium and challenges layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* COL 1 & 2: COMMUNITY PODIUM */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Community Podium
            </h3>
            <p className="text-xs text-muted-foreground -mt-4">
              Based on weekly carbon footprints (lower weekly emissions = higher rank)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-4 max-w-2xl mx-auto">
              {/* SECOND PLACE */}
              <div className="flex flex-col items-center space-y-3 bg-secondary/15 p-5 border rounded-2xl sm:h-44 justify-end">
                <Medal className="h-8 w-8 text-slate-400" />
                <div className="text-center min-w-0 w-full">
                  <h4 className="font-bold text-sm truncate">{top2 ? top2.name : 'Eco Guard'}</h4>
                  <p className="text-xs text-emerald-600 font-bold">
                    {top2 ? `${top2.weeklyFootprint} kg` : '0 kg'}
                  </p>
                </div>
                <div className="w-full bg-slate-400/20 text-[10px] font-extrabold uppercase py-1 text-slate-500 dark:text-slate-400 rounded-lg text-center mt-2 border">
                  2nd Place
                </div>
              </div>

              {/* FIRST PLACE */}
              <div className="flex flex-col items-center space-y-3 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent p-6 border border-amber-500/30 rounded-2xl sm:h-52 justify-end shadow-md shadow-amber-500/5 relative -translate-y-1 sm:-translate-y-2">
                <Trophy className="h-10 w-10 text-amber-500 fill-amber-500/10 animate-bounce" />
                <div className="text-center min-w-0 w-full">
                  <h4 className="font-extrabold text-base truncate">{top1 ? top1.name : 'Eco Leader'}</h4>
                  <p className="text-xs text-emerald-600 font-extrabold">
                    {top1 ? `${top1.weeklyFootprint} kg` : '0 kg'}
                  </p>
                </div>
                <div className="w-full bg-amber-500 text-white text-[10px] font-extrabold uppercase py-1.5 rounded-lg text-center mt-2 shadow-sm">
                  1st Place
                </div>
              </div>

              {/* THIRD PLACE */}
              <div className="flex flex-col items-center space-y-3 bg-secondary/15 p-5 border rounded-2xl sm:h-38 justify-end">
                <Medal className="h-8 w-8 text-amber-700" />
                <div className="text-center min-w-0 w-full">
                  <h4 className="font-bold text-sm truncate">{top3 ? top3.name : 'Green Trail'}</h4>
                  <p className="text-xs text-emerald-600 font-bold">
                    {top3 ? `${top3.weeklyFootprint} kg` : '0 kg'}
                  </p>
                </div>
                <div className="w-full bg-amber-700/20 text-[10px] font-extrabold uppercase py-1 text-amber-800 dark:text-amber-600 rounded-lg text-center mt-2 border">
                  3rd Place
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COL 3: STATS OVERVIEW */}
        <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Your Status
            </h3>

            {myRank ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Your Position
                  </span>
                  <p className="text-4xl font-black text-primary">Rank #{myRank.rank}</p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    out of {rankings.length} community members
                  </p>
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between p-2.5 rounded-lg bg-secondary/35">
                    <span className="text-muted-foreground">Your Weekly Footprint</span>
                    <span className="text-foreground">{myRank.weeklyFootprint} kg CO2</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-secondary/35">
                    <span className="text-muted-foreground">Activities Logged</span>
                    <span className="text-foreground">{myRank.activityCount} logs</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-xl text-center text-xs text-muted-foreground">
                Log some activities in the tracker to calculate your rank.
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-accent/40 p-3 rounded-xl border mt-4">
            🏆 <strong>Weekly Resets:</strong> Rankings refresh every Sunday. Keep logging to stay at the top
            of the board!
          </div>
        </div>
      </div>

      {/* Challenges & Leaderboard Table Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ACTIVE CHALLENGES */}
        <div className="xl:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold text-lg">Active Challenges</h3>
          </div>
          <ul className="space-y-4">
            {challenges.map((challenge) => (
              <li key={challenge.id} className="p-5 border rounded-2xl bg-card shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-foreground leading-snug">{challenge.title}</h4>
                    <span className="inline-block text-[9px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1.5">
                      {challenge.category}
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg shrink-0">
                    +{challenge.points} pts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{challenge.description}</p>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>Community Goal</span>
                    <span>Target: {challenge.target}</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* FULL LEADERBOARD TABLE */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold text-lg">Community Rankings</h3>
          </div>

          <div className="border rounded-2xl bg-card overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                <tr>
                  <th className="p-4 w-16 text-center">Rank</th>
                  <th className="p-4">Name</th>
                  <th className="p-4 text-right">Weekly Footprint</th>
                  <th className="p-4 text-right">Lifetime Footprint</th>
                  <th className="p-4 w-28 text-center">Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rankings.map((user) => {
                  const isMe = user.userId === currentUser?.id;
                  return (
                    <tr
                      key={user.userId}
                      className={`hover:bg-secondary/15 transition-colors ${
                        isMe ? 'bg-primary/5 hover:bg-primary/10' : ''
                      }`}
                    >
                      <td className="p-4 text-center font-bold">
                        {user.rank <= 3 ? (
                          <span
                            className={`inline-flex items-center justify-center h-6 w-6 rounded-full font-black text-xs ${
                              user.rank === 1
                                ? 'bg-amber-500 text-white'
                                : user.rank === 2
                                  ? 'bg-slate-400 text-white'
                                  : 'bg-amber-700 text-white'
                            }`}
                          >
                            {user.rank}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{user.rank}</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-foreground">
                        <span className="flex items-center gap-2">
                          <span>{user.name}</span>
                          {isMe && (
                            <span className="text-[9px] uppercase font-bold bg-primary text-white px-2 py-0.5 rounded-full shrink-0">
                              You
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {user.weeklyFootprint} kg
                      </td>
                      <td className="p-4 text-right font-mono text-muted-foreground">
                        {user.totalFootprint} kg
                      </td>
                      <td className="p-4 text-center text-muted-foreground font-mono">
                        {user.activityCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
