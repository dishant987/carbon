import { useState, useEffect } from 'react';
import { Sparkles, Globe, ShieldCheck, History, Loader2 } from 'lucide-react';
import * as api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function Offsets() {
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [pledging, setPledging] = useState(false);
  
  const [data, setData] = useState<api.OffsetsResponse | null>(null);
  const [report, setReport] = useState<api.AiReportResponse | null>(null);
  
  const [offsetAmount, setOffsetAmount] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [dashboardSummary, setDashboardSummary] = useState<api.DashboardSummary | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [pledgeSuccess, setPledgeSuccess] = useState<string | null>(null);

  const loadOffsetsData = async () => {
    try {
      setLoading(true);
      const [offsetRes, summaryRes] = await Promise.all([
        api.fetchOffsets(),
        api.fetchDashboardSummary(),
      ]);
      setData(offsetRes);
      setDashboardSummary(summaryRes);
      if (offsetRes.projects.length > 0) {
        setSelectedProject(offsetRes.projects[0].id);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch offset projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOffsetsData();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      setError(null);
      const res = await api.generateAiReport();
      setReport(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate sustainability plan');
    } finally {
      setReportLoading(false);
    }
  };

  const handleCreatePledge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPledgeSuccess(null);
    const amountVal = parseFloat(offsetAmount);

    if (!selectedProject) {
      setError('Please select a carbon offset project.');
      return;
    }

    if (isNaN(amountVal) || amountVal <= 0) {
      setError('Please enter a valid positive number of CO2 kg to offset.');
      return;
    }

    try {
      setPledging(true);
      const res = await api.createOffsetPledge(selectedProject, amountVal);
      setPledgeSuccess(`Successfully pledged to offset ${res.amount} kg CO2!`);
      setOffsetAmount('');
      
      // Reload offset stats and history
      const offsetRes = await api.fetchOffsets();
      setData(offsetRes);
      setTimeout(() => setPledgeSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register carbon offset pledge');
    } finally {
      setPledging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground text-sm font-medium animate-pulse">Loading simulator & projects...</p>
      </div>
    );
  }

  const projects = data?.projects ?? [];
  const pledges = data?.pledges ?? [];
  const totalOffset = data?.totalOffset ?? 0.0;
  const currentFootprint = dashboardSummary?.totalFootprint ?? 0.0;

  // Nature equivalence calculations:
  // An average mature tree absorbs roughly 22 kg of CO2 per year.
  // Let's compute tree-years or saplings needed
  const treesEquivalent = Math.round((totalOffset / 22) * 10) / 10;
  const pendingOffset = Math.max(0, currentFootprint - totalOffset);

  // Map project image IDs to placeholder-free UI styling (emojis, borders)
  const getProjectIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'forestry':
        return '🌲';
      case 'renewables':
        return '⚡';
      case 'community':
        return '🏠';
      default:
        return '🌱';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
          AI Reports & Carbon Offsets
        </h1>
        <p className="text-muted-foreground">
          Audit your lifestyle using Gemini AI and neutralize your footprint by investing virtual credits in environmental projects.
        </p>
      </div>

      {/* Grid of Simulator and Report */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: AI SUSTAINABILITY PLAN */}
        <div className="rounded-2xl border bg-card text-card-foreground shadow-lg shadow-black/5 overflow-hidden flex flex-col justify-between">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Sustainability Auditor</h2>
                  <p className="text-xs text-muted-foreground">Powered by Google Gemini 2.5</p>
                </div>
              </div>
            </div>

            {!report ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed rounded-xl space-y-4 bg-secondary/15">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                  📝
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="font-bold text-sm">No Active Audit Plan</h3>
                  <p className="text-xs text-muted-foreground">
                    Analyze your activity log from the past 30 days to receive an environmental grade and a personalized 4-week reduction challenge.
                  </p>
                </div>
                <Button 
                  type="button"
                  onClick={handleGenerateReport} 
                  disabled={reportLoading} 
                  className="font-bold transition-all relative overflow-hidden"
                >
                  {reportLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Logs...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 text-amber-300" />
                      Generate AI Report Card
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">
                {/* Eco Grade and Score Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                      {report.grade}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Eco-Grade</p>
                      <h4 className="text-lg font-bold">Carbon Rating</h4>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-teal-500/20 bg-teal-500/5 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
                      {report.score}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Eco-Score</p>
                      <h4 className="text-base font-bold">Out of 100 points</h4>
                    </div>
                  </div>
                </div>

                {/* Analysis Box */}
                <div className="p-4 rounded-xl bg-secondary/40 border border-border/60">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Auditor Analysis</h4>
                  <p className="text-sm text-foreground leading-relaxed">{report.analysis}</p>
                </div>

                {/* 4-Week Challenge Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Personalized 30-Day reduction plan</h4>
                  <div className="space-y-3">
                    {report.actionPlan.map((challenge) => (
                      <div key={challenge.week} className="flex gap-3 items-start p-3 rounded-xl border bg-card hover:bg-secondary/20 transition-colors">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          W{challenge.week}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h5 className="font-bold text-sm truncate">{challenge.challengeName}</h5>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              -{challenge.expectedSavingKg} kg CO2
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={handleGenerateReport} disabled={reportLoading} className="text-xs font-semibold">
                    {reportLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : 'Re-run AI Analysis'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: OFF-SETTING SIMULATOR */}
        <div className="rounded-2xl border bg-card text-card-foreground shadow-lg shadow-black/5 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Offset Simulator</h2>
                <p className="text-xs text-muted-foreground">Neutralize emissions by pledging carbon credits</p>
              </div>
            </div>

            {/* Offset Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                <p className="text-xs text-muted-foreground font-semibold">Lifetime Pledged Offsets</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalOffset} kg</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                <p className="text-xs text-muted-foreground font-semibold">Net Carbon Status</p>
                <p className="text-lg font-bold mt-1 text-foreground">
                  {pendingOffset <= 0 ? '🎉 Carbon Neutral' : `${pendingOffset.toFixed(1)} kg left`}
                </p>
              </div>
            </div>

            {/* Trees planted equivalence card */}
            {totalOffset > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
                  🌳
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Nature Equivalence</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    Your pledged offsets are equivalent to growing <span className="font-bold text-emerald-600 dark:text-emerald-400">{treesEquivalent} mature trees</span> for an entire year!
                  </p>
                </div>
              </div>
            )}

            {/* Pledging Form */}
            <form onSubmit={handleCreatePledge} className="space-y-4 pt-2 border-t">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">1. Select Offsetting Project</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProject(proj.id)}
                      className={`cursor-pointer p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-200 hover:border-emerald-500/60 ${
                        selectedProject === proj.id
                          ? 'border-emerald-500 bg-emerald-500/5 shadow-sm ring-1 ring-emerald-500'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{getProjectIcon(proj.category)}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{proj.category}</span>
                        </div>
                        <h4 className="font-bold text-sm mt-2 leading-tight">{proj.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{proj.location}</p>
                      </div>
                      <div className="mt-3 flex justify-between items-center text-xs font-semibold pt-2 border-t border-border/40">
                        <span className="text-muted-foreground">Simulated cost</span>
                        <span className="text-emerald-600 dark:text-emerald-400">₹{Math.round(proj.costPerTonUSD * 83).toLocaleString('en-IN')}/ton CO2</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offset Amount */}
              <div className="space-y-2">
                <label htmlFor="offsetAmount" className="text-sm font-bold text-foreground">
                  2. Pledge CO2 Amount to Offset (kg CO2)
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      id="offsetAmount"
                      type="number"
                      step="1"
                      min="1"
                      placeholder="e.g. 50"
                      value={offsetAmount}
                      onChange={(e) => setOffsetAmount(e.target.value)}
                      className="bg-background/50 pl-4 transition-all"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">kg CO2</span>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setOffsetAmount(String(Math.ceil(pendingOffset || 25)))} className="text-xs shrink-0">
                    Max ({Math.ceil(pendingOffset || 25)} kg)
                  </Button>
                </div>
              </div>

              {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
              {pledgeSuccess && <p className="text-xs text-emerald-500 font-semibold">{pledgeSuccess}</p>}

              <Button type="submit" disabled={pledging} className="w-full font-bold shadow-md shadow-emerald-500/10 transition-all">
                {pledging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pledge Virtual Offset
              </Button>
            </form>
          </div>
        </div>

      </div>

      {/* Offset History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Offsetting Pledges History</h2>
        </div>

        {pledges.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-xl bg-card text-muted-foreground text-sm">
            No carbon offsets pledged yet. Use the simulator above to neutralize your emissions.
          </div>
        ) : (
          <div className="border rounded-2xl bg-card overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                <tr>
                  <th className="p-4">Project</th>
                  <th className="p-4">Amount Pledged</th>
                  <th className="p-4">Pledging Date</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pledges.map((pledge) => (
                  <tr key={pledge.id} className="hover:bg-secondary/15 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      {projects.find((p) => p.id === pledge.project || p.name === pledge.project)?.name || pledge.project}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {pledge.amount} kg CO2
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(pledge.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="h-3 w-3" /> Pledged
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
