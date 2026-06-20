import { useState, useEffect, useCallback } from 'react';
import { fetchTips } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Lightbulb,
  RefreshCw,
  Leaf,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Trash2,
  ShoppingBag,
  Droplet,
  Compass,
  CheckCircle,
} from 'lucide-react';

import { TipsSkeleton } from '../components/SkeletonLoaders';

interface TipDetail {
  title: string;
  category: string;
  description: string;
  actions: string[];
}

function getTipDetails(tip: string): TipDetail {
  const text = tip.toLowerCase();

  // 1. Transport
  if (
    text.includes('transport') ||
    text.includes('vehicle') ||
    text.includes('car') ||
    text.includes('bus') ||
    text.includes('train') ||
    text.includes('transit') ||
    text.includes('drive') ||
    text.includes('walk') ||
    text.includes('bike') ||
    text.includes('commute')
  ) {
    return {
      title: 'Sustainable Transportation',
      category: 'Transport',
      description:
        'Personal vehicles account for a large percentage of transportation emissions. Transitioning to active transit (walking or cycling) or public options reduces your personal emissions by up to 50-80% per trip.',
      actions: [
        'Choose public transit or carpooling for your daily commute.',
        'Consider biking or walking for trips under 2 km.',
        'Keep your vehicle tires properly inflated to improve fuel efficiency.',
      ],
    };
  }

  // 2. Diet & Agriculture
  if (
    text.includes('meat') ||
    text.includes('dairy') ||
    text.includes('diet') ||
    text.includes('food') ||
    text.includes('veget') ||
    text.includes('vegan') ||
    text.includes('eat') ||
    text.includes('beef')
  ) {
    return {
      title: 'Plant-Forward Nutrition',
      category: 'Diet & Agriculture',
      description:
        'Raising livestock for meat and dairy requires massive resource inputs and produces high levels of methane, a potent greenhouse gas. Adopting a plant-forward diet reduces land and water usage while significantly dropping emissions.',
      actions: [
        'Try incorporating "Meatless Mondays" into your weekly schedule.',
        'Explore dairy-free milk alternatives such as oat, almond, or soy milk.',
        'Incorporate more organic whole foods, legumes, and grains into meals.',
      ],
    };
  }

  // 3. Energy & Electricity
  if (
    text.includes('energy') ||
    text.includes('appliance') ||
    text.includes('led') ||
    text.includes('bulb') ||
    text.includes('electricity') ||
    text.includes('power') ||
    text.includes('unplug') ||
    text.includes('plug') ||
    text.includes('standby') ||
    text.includes('heat') ||
    text.includes('ac') ||
    text.includes('thermostat')
  ) {
    return {
      title: 'Energy Conservation & Efficiency',
      category: 'Household Energy',
      description:
        'Household heating, cooling, and electricity use represent a major portion of domestic footprints. Switching to energy-saving equipment and managing idle devices lowers resource consumption and utility bills.',
      actions: [
        'Replace outdated incandescent bulbs with high-efficiency LEDs.',
        'Use smart power strips or unplug chargers and electronics when not in use.',
        'Adjust your thermostat by 1-2 degrees to save heating/cooling power.',
      ],
    };
  }

  // 4. Waste & Composting
  if (
    text.includes('compost') ||
    text.includes('waste') ||
    text.includes('recycle') ||
    text.includes('trash') ||
    text.includes('landfill') ||
    text.includes('reuse') ||
    text.includes('plastic')
  ) {
    return {
      title: 'Waste Reduction & Composting',
      category: 'Waste Management',
      description:
        'Organic waste buried in landfills decomposes anaerobically, emitting methane. Composting converts organic material into healthy soil aerobically, preventing greenhouse gas release and returning nutrients back to the earth.',
      actions: [
        'Separate organic scraps (fruit skins, coffee grounds) in a compost bin.',
        'Decline single-use plastics and choose reusable bags and bottles.',
        'Double-check your local guidelines to ensure proper recycling habits.',
      ],
    };
  }

  // 5. Shopping & Consumerism
  if (
    text.includes('buy') ||
    text.includes('shop') ||
    text.includes('local') ||
    text.includes('product') ||
    text.includes('purchase') ||
    text.includes('seasonal')
  ) {
    return {
      title: 'Sustainable Shopping & Local Sourcing',
      category: 'Shopping & Consumerism',
      description:
        'Items manufactured and shipped globally accumulate a heavy carbon toll. Sourcing goods locally and buying products made from sustainable, recycled, or circular resources reduces transit emissions and resource strain.',
      actions: [
        "Support local farmers' markets and buy seasonal produce.",
        'Purchase second-hand items or borrow tools before buying new.',
        'Consolidate online shipments to minimize packaging and transit routes.',
      ],
    };
  }

  // 6. Water & Heating
  if (
    text.includes('water') ||
    text.includes('shower') ||
    text.includes('leak') ||
    text.includes('faucet') ||
    text.includes('drip')
  ) {
    return {
      title: 'Water Conservation',
      category: 'Water & Heating',
      description:
        'Treating and heating water is an energy-intensive process. Shortening showers and addressing piping leaks conserves water resources while saving the energy required to heat household water.',
      actions: [
        'Limit your showers to 5-7 minutes.',
        'Install low-flow showerheads and aerators on faucets.',
        'Inspect sinks, toilets, and garden hose connections for leaks.',
      ],
    };
  }

  // Default Fallback
  return {
    title: 'Eco-Friendly Lifestyle Action',
    category: 'General Sustainability',
    description:
      'Taking small steps in your daily routine builds cumulative changes. Tracking your habits and setting goals helps maintain a sustainable lifestyle that benefits both the environment and your wellness.',
    actions: [
      'Log your daily transport, meals, and energy usage in the tracker.',
      'Share your carbon reduction achievements with friends or family.',
      'Review your dashboard metrics regularly to monitor your progress.',
    ],
  };
}

export function Tips() {
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded index for details accordion
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const loadTips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTips();
      setTips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTips();
  }, [loadTips]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Transport':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-850/50';
      case 'Diet & Agriculture':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-850/50';
      case 'Household Energy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-850/50';
      case 'Waste Management':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-850/50';
      case 'Shopping & Consumerism':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-850/50';
      case 'Water & Heating':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-850/50';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-850/50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Transport':
        return <Compass className="h-4 w-4" />;
      case 'Diet & Agriculture':
        return <Leaf className="h-4 w-4" />;
      case 'Household Energy':
        return <Zap className="h-4 w-4" />;
      case 'Waste Management':
        return <Trash2 className="h-4 w-4" />;
      case 'Shopping & Consumerism':
        return <ShoppingBag className="h-4 w-4" />;
      case 'Water & Heating':
        return <Droplet className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Carbon Reduction Recommendations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Explore detailed actionable tasks to lower your personal carbon footprint.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadTips} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Tips
          </Button>
        </div>
      </div>

      {loading ? (
        <TipsSkeleton />
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-8 text-center text-destructive">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 text-destructive/80" />
            <p className="font-semibold">Failed to Generate Tips</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <Button size="sm" className="mt-4" onClick={loadTips}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      ) : tips.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Leaf className="h-12 w-12 mx-auto mb-3 opacity-40 text-green-500" />
            <p className="font-medium text-foreground">No recommendations generated yet</p>
            <p className="text-sm mt-1">Please log activities in the tracker to feed context to the AI.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {tips.map((tip, index) => {
              const details = getTipDetails(tip);
              const isExpanded = expandedIndex === index;

              return (
                <Card
                  key={index}
                  className={`transition-all duration-300 border overflow-hidden ${
                    isExpanded
                      ? 'border-primary/45 shadow-md shadow-primary/5 bg-accent/15'
                      : 'border-border hover:border-border-hover bg-card hover:bg-accent/10'
                  }`}
                >
                  {/* Header Clickable Row */}
                  <button
                    onClick={() => toggleExpand(index)}
                    className="w-full text-left p-4 md:p-5 flex items-start justify-between gap-4"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Number Badge */}
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm md:text-base font-semibold text-foreground leading-tight">
                          {tip}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span
                            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryStyles(
                              details.category
                            )}`}
                          >
                            {getCategoryIcon(details.category)}
                            {details.category}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{details.title}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-1 rounded-md hover:bg-accent shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-dashed animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="space-y-4">
                        {/* Explanation Paragraph */}
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Why this matters
                          </h4>
                          <p className="text-sm text-foreground/80 leading-relaxed">{details.description}</p>
                        </div>

                        {/* Action Items list */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Actionable Tasks
                          </h4>
                          <ul className="space-y-2">
                            {details.actions.map((action, actIndex) => (
                              <li key={actIndex} className="flex gap-2 text-sm text-foreground/90">
                                <CheckCircle className="h-4.5 w-4.5 text-green-500 shrink-0 mt-0.5" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Quick tips explanation card */}
          <Card className="border-border/60 bg-secondary/10 mt-6">
            <CardContent className="p-4.5 flex gap-3 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm">How AI Tips Work</p>
                <p className="mt-1 leading-normal text-muted-foreground/90">
                  Our system tracks your 20 most recent carbon logs. The Gemini API analyzes your footprint
                  spikes (like heavy driving or high electricity usage) and returns tailored tips.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
