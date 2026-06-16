import { useState } from 'react';
import { Sparkles, Sliders, Map, Leaf, Utensils, Home, Loader2, Info, Compass } from 'lucide-react';
import * as api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

type ActiveTab = 'route' | 'recipe' | 'home';

export function EcoTools() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('route');

  // --- GREEN ROUTE PLANNER STATE ---
  const [distance, setDistance] = useState('10');
  const [tripCount, setTripCount] = useState('5'); // trips per week

  // --- RECIPE AUDITOR STATE ---
  const [recipeInput, setRecipeInput] = useState('');
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<api.RecipeAnalysisResponse | null>(null);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  // --- HOME AUDITOR STATE (Sliders) ---
  const [ledBulbs, setLedBulbs] = useState(5); // bulbs converted
  const [thermostatOffset, setThermostatOffset] = useState(2); // degrees F adjusted
  const [smartStrips, setSmartStrips] = useState(1); // smart strips added

  // ================= ROUTE PLANNER CALCULATIONS =================
  const distVal = Math.max(0, parseFloat(distance) || 0);
  const tripsVal = Math.max(0, parseInt(tripCount) || 0);
  const weeklyDist = distVal * tripsVal * 2; // round trip

  // CO2 factors (kg CO2 per km)
  const factors = {
    petrolCar: 0.17,
    electricCar: 0.05,
    bus: 0.08,
    train: 0.04,
    electricBike: 0.005,
    walking: 0.0,
  };

  const routeFootprints = {
    petrolCar: weeklyDist * factors.petrolCar,
    electricCar: weeklyDist * factors.electricCar,
    bus: weeklyDist * factors.bus,
    train: weeklyDist * factors.train,
    electricBike: weeklyDist * factors.electricBike,
    walking: weeklyDist * factors.walking,
  };

  // ================= HOME AUDITOR CALCULATIONS =================
  // LED: 1 bulb replacement saves ~35 kg CO2 and $10/year
  // Thermostat: 1 degree adjustment saves ~150 kg CO2 and $40/year
  // Smart power strips: 1 strip saves ~40 kg CO2 and $12/year
  const homeSavingsCo2 = (ledBulbs * 35) + (thermostatOffset * 150) + (smartStrips * 40);
  const homeSavingsMoneyUSD = (ledBulbs * 10) + (thermostatOffset * 40) + (smartStrips * 12);
  const homeSavingsMoneyINR = homeSavingsMoneyUSD * 83;

  // ================= RECIPE AUDITOR HANDLER =================
  const handleRecipeAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeInput.trim()) return;

    try {
      setRecipeLoading(true);
      setRecipeError(null);
      const res = await api.analyzeRecipeCarbon(recipeInput);
      setRecipeResult(res);
    } catch (err) {
      setRecipeError(err instanceof Error ? err.message : 'Failed to analyze recipe.');
    } finally {
      setRecipeLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
          Interactive Eco Tools
        </h1>
        <p className="text-muted-foreground">
          Simulate carbon-conscious routes, analyze food recipes with Gemini AI, and estimate household energy efficiency upgrades.
        </p>
      </div>

      {/* Premium Navigation Tabs */}
      <div className="flex border-b border-border/60">
        <button
          onClick={() => setActiveTab('route')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all ${
            activeTab === 'route'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Map className="h-4.5 w-4.5" />
          Green Route Planner
        </button>
        <button
          onClick={() => setActiveTab('recipe')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all ${
            activeTab === 'recipe'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Utensils className="h-4.5 w-4.5" />
          Gemini Recipe Auditor
        </button>
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all ${
            activeTab === 'home'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="h-4.5 w-4.5" />
          Home Savings Calculator
        </button>
      </div>

      {/* ======================= TAB 1: ROUTE PLANNER ======================= */}
      {activeTab === 'route' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Controls */}
          <div className="lg:col-span-1 rounded-2xl border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" /> Route Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">One-Way Distance</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="pl-4 pr-12 bg-background/50"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-muted-foreground font-bold">km</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Trips Per Week</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={tripCount}
                    onChange={(e) => setTripCount(e.target.value)}
                    className="pl-4 pr-12 bg-background/50"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-muted-foreground font-bold">trips</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/35 border border-border/30 text-xs text-muted-foreground leading-relaxed">
              💡 <strong>Formula:</strong> Footprint calculates round trips (One-way $\times$ trips $\times$ 2) multiplied by international transit carbon factors.
            </div>
          </div>

          {/* Results Comparison Chart */}
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <div>
              <h3 className="font-extrabold text-lg">Transit Footprint Comparison</h3>
              <p className="text-xs text-muted-foreground">Estimated weekly carbon emissions based on your route ({weeklyDist} km total)</p>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Petrol Car', val: routeFootprints.petrolCar, color: 'bg-rose-500', icon: '🚗' },
                { label: 'Electric Vehicle (EV)', val: routeFootprints.electricCar, color: 'bg-amber-500', icon: '🔌' },
                { label: 'Public Bus', val: routeFootprints.bus, color: 'bg-teal-500', icon: '🚌' },
                { label: 'Commuter Train', val: routeFootprints.train, color: 'bg-cyan-500', icon: '🚆' },
                { label: 'Electric Bicycle', val: routeFootprints.electricBike, color: 'bg-emerald-500', icon: '🚲' },
                { label: 'Walking / Bike', val: routeFootprints.walking, color: 'bg-green-500', icon: '🚶' },
              ].map((item) => {
                const maxVal = Math.max(...Object.values(routeFootprints)) || 1;
                const widthPercent = (item.val / maxVal) * 100;
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className="font-mono">{item.val.toFixed(1)} kg CO2</span>
                    </div>
                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border/30">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                        style={{ width: `${Math.max(widthPercent, 1.5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommendation Box */}
            <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 flex gap-3.5 items-start">
              <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                🌿
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Greenest Commuter Choice</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Swapping your petrol car commute for a Commuter Train saves about{' '}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {(routeFootprints.petrolCar - routeFootprints.train).toFixed(1)} kg CO2
                  </span>{' '}
                  weekly! Over a year, this offsets approximately{' '}
                  <span className="font-extrabold text-foreground">
                    {Math.round((routeFootprints.petrolCar - routeFootprints.train) * 52)} kg CO2
                  </span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: RECIPE AUDITOR ======================= */}
      {activeTab === 'recipe' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg">AI Meal Footprint Auditor</h3>
                <p className="text-xs text-muted-foreground">Scan your food recipes and get low-carbon substitutions from Gemini AI.</p>
              </div>
            </div>

            <form onSubmit={handleRecipeAudit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="recipe" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Paste Recipe or Ingredients List
                </label>
                <Textarea
                  id="recipe"
                  rows={4}
                  placeholder="e.g. 200g ribeye steak, 50g mozzarella cheese, 100g butter, garlic, rosemary..."
                  value={recipeInput}
                  onChange={(e) => setRecipeInput(e.target.value)}
                  className="bg-background/50 pl-4 border-border focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-[11px] text-muted-foreground">
                  💡 High footprint ingredients like red beef and dairy will be identified automatically.
                </p>
                <Button type="submit" disabled={recipeLoading || !recipeInput.trim()} className="font-bold">
                  {recipeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Ingredients...
                    </>
                  ) : (
                    'Analyze Carbon Footprint'
                  )}
                </Button>
              </div>
            </form>

            {recipeError && <p className="text-xs text-rose-500 font-semibold">{recipeError}</p>}
          </div>

          {recipeResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-300">
              {/* Ingredient Breakdown */}
              <div className="lg:col-span-1 rounded-2xl border bg-card p-6 md:p-8 space-y-6 shadow-sm">
                <div>
                  <h4 className="font-extrabold text-base">Ingredient Impact</h4>
                  <p className="text-xs text-muted-foreground">Carbon score breakdown per ingredient</p>
                </div>
                <div className="space-y-3">
                  {recipeResult.ingredientsAnalysis.map((item) => (
                    <div key={item.name} className="flex justify-between items-center p-3 rounded-xl border bg-secondary/20">
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{item.name}</p>
                        <span
                          className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                            item.impact === 'high'
                              ? 'bg-rose-500/10 text-rose-600'
                              : item.impact === 'medium'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}
                        >
                          {item.impact} Impact
                        </span>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-foreground shrink-0 pl-2">
                        {item.footprintKg} kg CO2
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Comparison & Explanation */}
              <div className="lg:col-span-2 rounded-2xl border bg-card p-6 md:p-8 space-y-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Title & Recipe Swapping */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b">
                    <div>
                      <h4 className="font-black text-lg text-primary">{recipeResult.recipeName}</h4>
                      <p className="text-xs text-muted-foreground">Original Recipe Footprint</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-3xl font-black text-rose-500">{recipeResult.totalFootprintKg}</span>
                      <span className="text-muted-foreground text-xs font-bold"> kg CO2</span>
                    </div>
                  </div>

                  {/* Plant Based Swap */}
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h5 className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <Leaf className="h-4.5 w-4.5" /> Eco-Alternative: {recipeResult.plantBasedAlternative}
                      </h5>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Vegetable/Plant-based recipe equivalent</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {recipeResult.alternativeFootprintKg}
                      </span>
                      <span className="text-muted-foreground text-xs font-semibold"> kg CO2</span>
                      <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        -{Math.round(((recipeResult.totalFootprintKg - recipeResult.alternativeFootprintKg) / recipeResult.totalFootprintKg) * 100)}% savings!
                      </span>
                    </div>
                  </div>

                  {/* Explanation text */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Recommendation</h5>
                    <p className="text-sm leading-relaxed text-muted-foreground">{recipeResult.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: HOME CALCULATOR ======================= */}
      {activeTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Sliders Control Panel */}
          <div className="lg:col-span-1 rounded-2xl border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" /> Efficiency Settings
            </h3>

            {/* Slider 1 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-foreground">LED Bulb Swaps</span>
                <span className="text-primary font-mono">{ledBulbs} bulbs</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={ledBulbs}
                onChange={(e) => setLedBulbs(parseInt(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-[10px] text-muted-foreground">Swapping incandescent bulbs to modern low-energy LEDs.</p>
            </div>

            {/* Slider 2 */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-foreground">Thermostat Adjustment</span>
                <span className="text-primary font-mono">+{thermostatOffset}°F</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={thermostatOffset}
                onChange={(e) => setThermostatOffset(parseInt(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-[10px] text-muted-foreground">Adjusting summer AC up (or winter heating down) to save grid draw.</p>
            </div>

            {/* Slider 3 */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-foreground">Smart Power Strips</span>
                <span className="text-primary font-mono">{smartStrips} units</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={smartStrips}
                onChange={(e) => setSmartStrips(parseInt(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-[10px] text-muted-foreground">Cuts phantom power draw when electronics are off.</p>
            </div>
          </div>

          {/* Savings Outcome Panel */}
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6 md:p-8 space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-extrabold text-lg">Your Home Savings Potential</h3>
              <p className="text-xs text-muted-foreground">Estimated yearly reductions in carbon and utility bills based on your slider updates.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Carbon Savings box */}
                <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                  <div className="text-emerald-500 text-2xl">🌲</div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Annual Carbon Prevented</h4>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {homeSavingsCo2} <span className="text-xs text-muted-foreground font-semibold">kg CO2</span>
                  </p>
                </div>

                {/* Financial Savings box */}
                <div className="p-5 rounded-xl border border-teal-500/20 bg-teal-500/5 space-y-2">
                  <div className="text-teal-500 text-2xl">💵</div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Annual Utility Bill Savings</h4>
                  <p className="text-3xl font-black text-teal-600 dark:text-teal-400">
                    ₹{homeSavingsMoneyINR.toLocaleString('en-IN')} <span className="text-xs text-muted-foreground font-semibold">INR</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/35 border border-border/30 text-xs text-muted-foreground flex gap-2 items-center">
              <Info className="h-4 w-4 shrink-0 text-primary" />
              <span>
                These estimations are based on EPA average household draws. Upgrading to ENERGY STAR appliances increases savings further.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
