import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Zap,
  Car,
  Utensils,
  Trash2,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  Award,
  Shield,
  Activity,
  Calendar,
  Flame,
  Check,
  Smile,
  Compass,
} from 'lucide-react';

export function Landing() {
  // Mini Interactive Calculator State
  const [step, setStep] = useState(1);
  const [commute, setCommute] = useState('');
  const [diet, setDiet] = useState('');
  const [energy, setEnergy] = useState('');
  const [calculatedResult, setCalculatedResult] = useState<number | null>(null);

  // Live Habit Planner State
  const [checkedHabits, setCheckedHabits] = useState<string[]>([]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCalculate = () => {
    let base = 2000; // base footprint in kg CO2 per year

    // Commute points
    if (commute === 'car-gas') base += 3500;
    else if (commute === 'car-ev') base += 1200;
    else if (commute === 'public') base += 800;
    else if (commute === 'bike-walk') base += 50;

    // Diet points
    if (diet === 'heavy-meat') base += 2500;
    else if (diet === 'balanced') base += 1700;
    else if (diet === 'vegetarian') base += 1000;
    else if (diet === 'vegan') base += 600;

    // Energy points
    if (energy === 'high') base += 4000;
    else if (energy === 'medium') base += 2200;
    else if (energy === 'low') base += 900;

    setCalculatedResult(base);
    setStep(4);
  };

  const resetQuiz = () => {
    setStep(1);
    setCommute('');
    setDiet('');
    setEnergy('');
    setCalculatedResult(null);
  };

  // Habits list for live impact planner
  const habits = [
    {
      id: 'carpool',
      name: 'Commute via bike/transit twice a week',
      co2: 620,
      desc: 'Replaces short single-occupancy drives',
      category: 'transport',
    },
    {
      id: 'diet',
      name: 'Adopt a meat-free diet 3 days a week',
      co2: 480,
      desc: 'Reduces heavy livestock supply chain impact',
      category: 'food',
    },
    {
      id: 'led',
      name: 'Switch all home bulbs to smart LEDs',
      co2: 240,
      desc: 'Cuts household electricity demand instantly',
      category: 'energy',
    },
    {
      id: 'thermostat',
      name: 'Adjust thermostat by 2°C seasonally',
      co2: 380,
      desc: 'Optimizes heating & cooling grid draw',
      category: 'energy',
    },
    {
      id: 'recycle',
      name: 'Compost organic waste & eliminate plastic',
      co2: 180,
      desc: 'Prevents landfill methane emissions',
      category: 'waste',
    },
  ];

  const toggleHabit = (id: string) => {
    if (checkedHabits.includes(id)) {
      setCheckedHabits(checkedHabits.filter((h) => h !== id));
    } else {
      setCheckedHabits([...checkedHabits, id]);
    }
  };

  const totalSaved = habits
    .filter((h) => checkedHabits.includes(h.id))
    .reduce((acc, curr) => acc + curr.co2, 0);

  // Dynamic recommendations based on quiz input
  const getQuizRecommendations = () => {
    const recs = [];
    if (commute === 'car-gas') {
      recs.push({
        title: 'Electrify or Transit',
        text: 'Switching to public transit or an EV can reduce travel emissions by up to 65%.',
        impact: 'Save ~2.3 Tonnes CO₂/yr',
      });
    }
    if (diet === 'heavy-meat' || diet === 'balanced') {
      recs.push({
        title: 'Plant-Forward Diet',
        text: 'Replacing beef and pork with poultry or plant proteins cuts food footprint significantly.',
        impact: 'Save ~0.9 Tonnes CO₂/yr',
      });
    }
    if (energy === 'high' || energy === 'medium') {
      recs.push({
        title: 'Home Efficiency Upgrades',
        text: 'Seal air drafts, upgrade insulation, and install a smart thermostat to lower grid load.',
        impact: 'Save ~1.5 Tonnes CO₂/yr',
      });
    }
    // Default fallback if everything is low/eco
    if (recs.length === 0) {
      recs.push({
        title: 'Join Community Offsets',
        text: 'You are already doing great! Share your tips and support local reforestation projects.',
        impact: 'Amplified Global Impact',
      });
    }
    return recs;
  };

  // FAQ Data
  const faqs = [
    {
      q: 'How does the AI customize my carbon reduction recommendations?',
      a: 'CarbonTracker integrates Google Gemini models. When you log your travel, food, and home energy, our system analyzes patterns and prompts the model with your historical metrics. It returns personalized, realistic habit modifications specific to your lifestyle instead of generic advice.',
    },
    {
      q: 'Are the carbon footprint calculations accurate?',
      a: 'Yes, our calculations are powered by standard EPA (Environmental Protection Agency) and DEFRA greenhouse gas conversion factors. We convert distance traveled, food types, and kilowatt-hours directly into precise carbon dioxide equivalents (CO₂e).',
    },
    {
      q: 'Can I track my progress over time?',
      a: 'Absolutely! By creating a free account, all your daily activities are saved. You get access to weekly/monthly trends, target completion rates, streaks, and continuous feedback reports from our chatbot, EcoBot.',
    },
    {
      q: 'Is my personal data secure?',
      a: 'We prioritize privacy. All logged activities and chat histories are securely stored and encrypted. We do not sell your data or share your personal information with external advertisers.',
    },
  ];

  return (
    <div className="relative flex flex-col gap-24 py-4 md:py-8 overflow-hidden">
      {/* Decorative Floating Glowing Background Blobs */}
      <div className="absolute top-12 left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-green-500/10 dark:bg-green-500/5 blur-[80px] sm:blur-[120px] pointer-events-none animate-float-slow z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[80px] sm:blur-[120px] pointer-events-none animate-float-medium z-0" />
      <div className="absolute bottom-[10%] left-[5%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-[80px] sm:blur-[120px] pointer-events-none animate-float-slow z-0" />

      {/* Hero Section */}
      <section className="relative flex flex-col lg:flex-row items-center gap-12 lg:gap-16 justify-between z-10">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 animate-pulse-subtle">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Sustainability Coach</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-foreground">
            Empower Your Path to a{' '}
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent drop-shadow-sm">
              Greener Planet
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Track daily activities, instantly calculate your carbon output, and receive personalized,
            Gemini-driven recommendations to make small changes with massive global impacts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-primary/30 neon-glow-primary hover:bg-primary/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Start Free Tracking
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-border bg-card/50 backdrop-blur-md font-semibold px-8 py-4 rounded-xl hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] transition-all duration-300"
            >
              Sign In
            </Link>
          </div>

          {/* Small Feature Perks list */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-muted-foreground pt-4">
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              <span>Real-time EPA Metrics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              <span>Gemini Pro Coaching</span>
            </div>
          </div>
        </div>

        {/* Hero Right: Interactive Calculator Card */}
        <div className="flex-1 w-full max-w-md mx-auto lg:max-w-lg">
          <div className="glass-panel p-1 rounded-2xl shadow-2xl relative group">
            {/* Soft decorative light strip at the top */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500 rounded-t-2xl opacity-80" />

            <div className="bg-card/90 dark:bg-card/70 backdrop-blur-lg rounded-xl p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-extrabold text-xl tracking-tight text-foreground flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Instant Eco Estimator
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Calculate your annual footprint in 3 steps
                  </p>
                </div>
                <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                  {step < 4 ? `Step ${step} of 3` : 'Your Result'}
                </span>
              </div>

              {/* Progress Bar */}
              {step < 4 && (
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              )}

              {/* Step 1: Commute */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right duration-250">
                  <p className="text-sm font-bold text-foreground">
                    1. How do you usually commute to work or school?
                  </p>
                  <div className="grid gap-2.5">
                    {[
                      {
                        id: 'car-gas',
                        label: 'Gas/Diesel Vehicle',
                        desc: 'Standard single occupancy vehicle',
                        icon: Car,
                      },
                      {
                        id: 'car-ev',
                        label: 'Electric Vehicle (EV)',
                        desc: 'Charged by public/home grid',
                        icon: Zap,
                      },
                      {
                        id: 'public',
                        label: 'Public Transit',
                        desc: 'Buses, trains, subway networks',
                        icon: Compass,
                      },
                      {
                        id: 'bike-walk',
                        label: 'Walk / Bike / Remote',
                        desc: 'Zero emissions, human-powered',
                        icon: Leaf,
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCommute(opt.id)}
                        aria-pressed={commute === opt.id}
                        className={`flex items-start text-left p-3.5 rounded-xl border text-sm transition-all duration-200 ${
                          commute === opt.id
                            ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-sm shadow-primary/10'
                            : 'border-border/60 hover:border-primary/40 hover:bg-accent/40 bg-background/50'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg mr-3.5 ${commute === opt.id ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}
                        >
                          <opt.icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold block text-foreground">{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.desc}</span>
                        </div>
                        {commute === opt.id && (
                          <div className="bg-primary text-primary-foreground p-0.5 rounded-full">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={!commute}
                    onClick={() => setStep(2)}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-primary/95 transition shadow-lg shadow-primary/15"
                  >
                    Next Question
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}

              {/* Step 2: Diet */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right duration-250">
                  <p className="text-sm font-bold text-foreground">2. Describe your typical daily diet:</p>
                  <div className="grid gap-2.5">
                    {[
                      {
                        id: 'heavy-meat',
                        label: 'Frequent Meat Eater',
                        desc: 'Beef, pork, poultry or dairy daily',
                        intensity: 'High',
                      },
                      {
                        id: 'balanced',
                        label: 'Balanced Diet',
                        desc: 'Moderate meat, poultry, seafood & greens',
                        intensity: 'Medium',
                      },
                      {
                        id: 'vegetarian',
                        label: 'Vegetarian',
                        desc: 'No meat, includes milk, eggs, cheese',
                        intensity: 'Low',
                      },
                      {
                        id: 'vegan',
                        label: 'Fully Vegan',
                        desc: 'Exclusively plant-based grains & veggies',
                        intensity: 'Minimal',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDiet(opt.id)}
                        aria-pressed={diet === opt.id}
                        className={`flex items-start text-left p-3.5 rounded-xl border text-sm transition-all duration-200 ${
                          diet === opt.id
                            ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-sm shadow-primary/10'
                            : 'border-border/60 hover:border-primary/40 hover:bg-accent/40 bg-background/50'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg mr-3.5 ${diet === opt.id ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}
                        >
                          <Utensils className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{opt.label}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                opt.intensity === 'High'
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                  : opt.intensity === 'Medium'
                                    ? 'bg-yellow-500/10 text-yellow-600'
                                    : 'bg-green-500/10 text-green-600 dark:text-green-400'
                              }`}
                            >
                              {opt.intensity} Impact
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground mt-0.5 block">{opt.desc}</span>
                        </div>
                        {diet === opt.id && (
                          <div className="bg-primary text-primary-foreground p-0.5 rounded-full">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 border border-border py-3 rounded-xl text-sm font-semibold hover:bg-accent transition"
                    >
                      Back
                    </button>
                    <button
                      disabled={!diet}
                      onClick={() => setStep(3)}
                      className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-primary/95 transition shadow-lg shadow-primary/15"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Energy */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right duration-250">
                  <p className="text-sm font-bold text-foreground">
                    3. What is your household electricity & gas consumption?
                  </p>
                  <div className="grid gap-2.5">
                    {[
                      {
                        id: 'high',
                        label: 'High Usage',
                        desc: 'Large space, continuous AC/heating, standard bulbs',
                      },
                      {
                        id: 'medium',
                        label: 'Average Usage',
                        desc: 'Standard home or apartment, typical utility draw',
                      },
                      {
                        id: 'low',
                        label: 'Eco-conscious / Solar',
                        desc: 'Heat pump, solar panels, smart power grids',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEnergy(opt.id)}
                        aria-pressed={energy === opt.id}
                        className={`flex items-start text-left p-3.5 rounded-xl border text-sm transition-all duration-200 ${
                          energy === opt.id
                            ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-sm shadow-primary/10'
                            : 'border-border/60 hover:border-primary/40 hover:bg-accent/40 bg-background/50'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg mr-3.5 ${energy === opt.id ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}
                        >
                          <Zap className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold block text-foreground">{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.desc}</span>
                        </div>
                        {energy === opt.id && (
                          <div className="bg-primary text-primary-foreground p-0.5 rounded-full">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 border border-border py-3 rounded-xl text-sm font-semibold hover:bg-accent transition"
                    >
                      Back
                    </button>
                    <button
                      disabled={!energy}
                      onClick={handleCalculate}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:opacity-95 transition shadow-lg shadow-emerald-500/20"
                    >
                      Calculate Estimate
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Results & Custom Advice */}
              {step === 4 && calculatedResult !== null && (
                <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 p-4 text-emerald-600 dark:text-emerald-400 animate-bounce">
                      <TrendingDown className="h-10 w-10" />
                    </div>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-extrabold block">
                      Estimated Carbon Footprint
                    </span>
                    <h2 className="text-4xl font-extrabold text-foreground mt-1 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                      {(calculatedResult / 1000).toFixed(2)} Tonnes CO₂e
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center justify-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      Equivalent to charging ~350,000 smartphones
                    </p>
                  </div>

                  {/* Footprint Comparison Meter */}
                  <div className="space-y-2 pt-2 text-left">
                    <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                      <span>Eco Target: 2.0t</span>
                      <span>Avg: 8.5t</span>
                      <span>High: 12t+</span>
                    </div>
                    {/* The bar scale */}
                    <div className="w-full bg-muted h-3.5 rounded-full overflow-hidden relative flex border border-border/40">
                      {/* Green segment (0 to 3) */}
                      <div className="w-[25%] bg-green-500" />
                      {/* Yellow segment (3 to 8) */}
                      <div className="w-[45%] bg-yellow-500" />
                      {/* Red segment (8 to 12+) */}
                      <div className="w-[30%] bg-red-500" />

                      {/* Slider Pin Indicator */}
                      <div
                        className="absolute w-2 h-5 bg-foreground border border-background shadow top-1/2 -translate-y-1/2 rounded"
                        style={{
                          left: `${Math.min(Math.max((calculatedResult / 1000 / 12) * 100, 2), 98)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Your marker shows where you rank against sustainable targets.
                    </p>
                  </div>

                  {/* Custom AI generated advice */}
                  <div className="p-4 bg-muted/60 border border-border/50 rounded-xl text-left space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                      <span>Gemini Coach Pre-Analysis:</span>
                    </div>
                    <ul className="space-y-2.5 text-xs">
                      {getQuizRecommendations().map((rec, i) => (
                        <li key={i} className="flex gap-2 items-start leading-relaxed text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-foreground mr-1">{rec.title}:</span>
                            {rec.text}
                            <span className="block font-bold text-primary text-[10px] mt-0.5">
                              {rec.impact}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <Link
                      to="/register"
                      className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
                    >
                      Save Result & Start Offsetting
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={resetQuiz}
                      className="text-xs text-muted-foreground hover:text-foreground font-semibold underline underline-offset-4 transition"
                    >
                      Recalculate Estimate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 bg-card/60 backdrop-blur-md border border-border/60 rounded-3xl p-8 shadow-xl">
        <div className="text-center space-y-1">
          <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            12.5k<span className="text-primary font-bold">+</span>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-widest">
            CO₂ Tonnes Logged
          </div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            45,000<span className="text-primary font-bold">+</span>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-widest">
            Activities Tracked
          </div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            92<span className="text-primary font-bold">%</span>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-widest">
            Goal Completion Rate
          </div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            100<span className="text-primary font-bold">%</span>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-widest">
            Gemini Advice Accuracy
          </div>
        </div>
      </section>

      {/* High-Fidelity UI Dashboard Mockup Section */}
      <section className="relative z-10 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Platform Interface
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            A Clean Dashboard to Command Your Footprint
          </h2>
          <p className="text-muted-foreground">
            Visualize your carbon records in gorgeous charts, follow weekly checklists, and message your
            personal AI agent in real-time.
          </p>
        </div>

        {/* Dashboard Mockup Widget */}
        <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel">
          {/* Mock Browser Header */}
          <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            </div>
            <div className="bg-slate-900 border border-slate-800 text-[10px] text-muted-foreground px-12 py-1 rounded-md text-center flex-1 max-w-md truncate">
              https://app.carbontracker.org/dashboard
            </div>
            <div className="w-16 h-3 bg-slate-800 rounded shrink-0" />
          </div>

          {/* Mock Main Panel Layout */}
          <div className="flex flex-col md:flex-row h-[420px] bg-slate-950/40 text-slate-200">
            {/* Sidebar Mock */}
            <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-slate-800 p-4 space-y-6 shrink-0 hidden md:block bg-slate-950/70">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 p-1 rounded">
                  <Leaf className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-xs tracking-wider uppercase text-slate-100">
                  CarbonTracker
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                  Overview
                </span>
                <div className="bg-primary/10 border-l-2 border-primary text-primary px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5" />
                  Dashboard
                </div>
                <div className="text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition cursor-pointer">
                  <Calendar className="h-3.5 w-3.5" />
                  Activities
                </div>
                <div className="text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition cursor-pointer">
                  <Sparkles className="h-3.5 w-3.5" />
                  Eco Coach
                </div>
              </div>
            </div>

            {/* Dashboard Content Mock */}
            <div className="flex-1 p-5 space-y-5 overflow-hidden flex flex-col justify-between">
              {/* Row 1: Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[10px] text-slate-500 font-bold block">TODAY'S FOOTPRINT</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-bold text-slate-100">4.20 kg</span>
                    <span className="text-[10px] text-green-500 font-bold">-18% vs avg</span>
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[10px] text-slate-500 font-bold block">WEEKLY PROGRESS</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-bold text-slate-100">28.4 kg</span>
                    <span className="text-[10px] text-emerald-400 font-bold">On track</span>
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[10px] text-slate-500 font-bold block">ECO STREAK</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-bold text-slate-100">12 Days</span>
                    <span className="text-[10px] text-yellow-500 font-bold">🔥 Warm</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Charts and AI Bubble */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 items-stretch">
                {/* Visual Chart */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-bold text-slate-300">Weekly CO₂ Emissions Trend</span>
                    <span className="text-[9px] text-slate-500">kg CO₂ / day</span>
                  </div>
                  <div className="flex items-end justify-between h-28 pt-4 px-2">
                    {[
                      { day: 'M', val: 80, active: false },
                      { day: 'T', val: 45, active: false },
                      { day: 'W', val: 95, active: false },
                      { day: 'T', val: 30, active: true },
                      { day: 'F', val: 55, active: false },
                      { day: 'S', val: 20, active: false },
                      { day: 'S', val: 15, active: false },
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="w-5 bg-slate-800 rounded-t h-20 relative overflow-hidden flex items-end">
                          <div
                            className={`w-full rounded-t transition-all duration-500 ${
                              bar.active
                                ? 'bg-gradient-to-t from-green-600 to-emerald-400'
                                : 'bg-slate-700 hover:bg-slate-600'
                            }`}
                            style={{ height: `${bar.val}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Chat Snippet */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 text-[10px] font-bold text-slate-300">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    EcoBot Assistant
                  </div>
                  <div className="space-y-2.5 py-3 flex-1 overflow-y-auto max-h-[110px] text-[10px]">
                    <div className="flex gap-2">
                      <div className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[8px] text-primary">
                        AI
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg text-slate-300 max-w-[85%] border border-slate-800/60 leading-normal">
                        I noticed your commute emissions dropped this week! Cycling instead of driving saved
                        you <span className="text-emerald-400 font-bold">14.2 kg of CO₂</span>. Want to set a
                        target for tomorrow?
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Ask EcoBot for habit advice...</span>
                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Habits Live Planner Section */}
      <section className="relative z-10 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
            Interactive Calculator
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Design Your Custom Eco Plan</h2>
          <p className="text-muted-foreground">
            Check off daily/weekly habits below to calculate your cumulative potential carbon offset in
            real-time.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Habits Selector List */}
          <div className="md:col-span-7 space-y-3">
            {habits.map((habit) => {
              const isChecked = checkedHabits.includes(habit.id);
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                    isChecked
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                      : 'border-border/60 hover:border-primary/30 hover:bg-accent/40 bg-card/40'
                  }`}
                >
                  <div className="flex gap-4 items-center mr-3">
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                        isChecked
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/40'
                      }`}
                    >
                      {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-foreground block">{habit.name}</span>
                      <span className="text-xs text-muted-foreground mt-0.5 block">{habit.desc}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-primary px-2.5 py-1 bg-primary/10 rounded-full border border-primary/20">
                    -{habit.co2} kg / yr
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results Summary Box */}
          <div className="md:col-span-5 bg-card border border-border/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
            <div className="space-y-4">
              <h4 className="font-extrabold text-lg tracking-tight">Your Cumulative Savings</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Combined habits create compounding rewards. Watch your calculated offset scale up.
              </p>

              <div className="py-6 border-y border-dashed">
                <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                  Total Annual Reduction
                </div>
                <div className="text-4xl font-extrabold text-foreground mt-1 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  {totalSaved.toLocaleString()} kg CO₂
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Equivalent to planting{' '}
                  <span className="font-bold text-primary">{Math.round(totalSaved / 20)}</span> mature
                  hardwood trees
                </div>
              </div>

              {/* Fun Milestone message */}
              <div className="p-3 bg-secondary/60 rounded-xl text-xs space-y-1 border text-muted-foreground">
                {totalSaved === 0 && (
                  <p className="text-center">Select one or more habits above to model your impact.</p>
                )}
                {totalSaved > 0 && totalSaved < 1000 && (
                  <p className="flex items-start gap-2">
                    <Smile className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Nice start! Every small adjustment directly eases grid and fuel dependency.</span>
                  </p>
                )}
                {totalSaved >= 1000 && totalSaved < 1800 && (
                  <p className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>
                      <strong>Eco-Guardian!</strong> You are offsetting more than the average individual
                      commute. Keep going!
                    </span>
                  </p>
                )}
                {totalSaved >= 1800 && (
                  <p className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      <strong>Climate Champion!</strong> That reduction equals taking half a standard
                      passenger vehicle completely off the roads.
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/95 transition shadow-lg shadow-primary/10"
              >
                Log Habits In My Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Feature Details */}
      <section className="relative z-10 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Features Suite
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Everything You Need to Track and Reduce
          </h2>
          <p className="text-muted-foreground">
            A robust collection of tools designed to build sustainable awareness and suggest real-world carbon
            offsetting practices.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Travel Logging (2 cols) */}
          <div className="md:col-span-2 bg-card hover:bg-accent/10 border border-border/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="h-12 w-12 rounded-xl bg-green-500/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Car className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-xl mb-3 text-foreground">
                Advanced Transport & Travel Logging
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Log transport emissions across flights, passenger cars, subways, and trains. Our engine
                converts distances and vehicle categories directly to kilograms of carbon dioxide equivalents
                using validated EPA coefficients.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-dashed flex items-center justify-between text-xs text-muted-foreground">
              <span>Automatic vehicle class adjustments</span>
              <span className="font-bold text-primary flex items-center gap-1">
                Explore Logs <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Card 2: Household (1 col) */}
          <div className="bg-card hover:bg-accent/10 border border-border/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-xl mb-3 text-foreground">Household Utility Draw</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Record household utility usage, electricity consumption, and home heating styles. Set targets
                to lower heating grids and track monthly goals.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-dashed text-xs text-muted-foreground">
              <span>Supports solar panel offsets</span>
            </div>
          </div>

          {/* Card 3: AI Coaching (1 col) */}
          <div className="bg-card hover:bg-accent/10 border border-border/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-xl mb-3 text-foreground">Gemini AI Recommendations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get real-time feedback. Our integrated model reviews your recent carbon habits and generates
                customized targets, complete with estimated savings.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-dashed text-xs text-muted-foreground">
              <span>Context-aware suggestions</span>
            </div>
          </div>

          {/* Card 4: Diet Tracker (2 cols) */}
          <div className="md:col-span-2 bg-card hover:bg-accent/10 border border-border/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="h-12 w-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Utensils className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-xl mb-3 text-foreground">Dietary Emissions Analyzer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Food production accounts for a quarter of global greenhouse gases. Break down your meals
                between heavy meat, vegetarian, or fully vegan configurations to visualize and minimize carbon
                outputs.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-dashed flex items-center justify-between text-xs text-muted-foreground">
              <span>USDA food chain factors</span>
              <span className="font-bold text-primary flex items-center gap-1">
                Log Food Footprint <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
            Roadmap
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How CarbonTracker Works</h2>
          <p className="text-muted-foreground">Transition to a low-carbon lifestyle in three simple steps.</p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-3 gap-8 relative max-w-4xl mx-auto pt-6">
          {/* Connecting Line for desktop view */}
          <div className="absolute top-[38px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500 hidden sm:block opacity-30 z-0" />

          {/* Step 1 */}
          <div className="text-center space-y-4 relative z-10 group">
            <div className="w-14 h-14 rounded-full bg-card hover:bg-primary hover:text-primary-foreground border-2 border-primary/40 flex items-center justify-center font-extrabold text-lg mx-auto shadow-md transition-all duration-300 group-hover:scale-110">
              1
            </div>
            <h4 className="font-extrabold text-lg text-foreground">Create a Free Profile</h4>
            <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
              Register securely in seconds. We protect your privacy while persisting your records and
              calculating trends.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center space-y-4 relative z-10 group">
            <div className="w-14 h-14 rounded-full bg-card hover:bg-primary hover:text-primary-foreground border-2 border-primary/40 flex items-center justify-center font-extrabold text-lg mx-auto shadow-md transition-all duration-300 group-hover:scale-110">
              2
            </div>
            <h4 className="font-extrabold text-lg text-foreground">Record Daily Activities</h4>
            <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
              Log transport, eating habits, energy usage, and recycling metrics. See instantly updated CO₂
              metrics.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center space-y-4 relative z-10 group">
            <div className="w-14 h-14 rounded-full bg-card hover:bg-primary hover:text-primary-foreground border-2 border-primary/40 flex items-center justify-center font-extrabold text-lg mx-auto shadow-md transition-all duration-300 group-hover:scale-110">
              3
            </div>
            <h4 className="font-extrabold text-lg text-foreground">Optimize and Offset</h4>
            <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
              Browse interactive progress charts, follow custom Gemini recommendations, and reduce emissions
              step-by-step.
            </p>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="relative z-10 space-y-10 max-w-4xl mx-auto">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            FAQ
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Everything you need to know about CarbonTracker and how to get started.
          </p>
        </div>

        <div className="border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/60 bg-card/40 backdrop-blur-md">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="transition-all duration-200">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-foreground hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm sm:text-base pr-4">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[250px] opacity-100 border-t border-border/40' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="p-5 text-xs sm:text-sm text-muted-foreground leading-relaxed bg-muted/20">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative z-10 overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white p-8 md:p-14 shadow-2xl">
        <div className="absolute top-[-30%] right-[-10%] w-[320px] h-[320px] bg-white/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-5%] w-[280px] h-[280px] bg-emerald-400/20 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative space-y-6 max-w-2xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
            Start Today
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Ready to Take Climate Action?
          </h2>
          <p className="text-sm sm:text-base text-green-50/90 leading-relaxed max-w-xl">
            Join thousands of active users tracking, optimizing, and offsetting their carbon footprint daily.
            Start building green habits that matter.
          </p>
          <div className="flex flex-wrap gap-4 pt-3">
            <Link
              to="/register"
              className="bg-white text-green-700 font-extrabold px-8 py-4 rounded-xl hover:bg-green-50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-lg"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="bg-green-800/40 text-white border border-white/20 font-bold px-8 py-4 rounded-xl hover:bg-green-800/60 hover:scale-[1.03] transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
