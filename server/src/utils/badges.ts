export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface ActivityItem {
  type: string;
  category: string;
  footprint: number;
  date: Date;
}

/**
 * Computes badges dynamically based on user's activities.
 */
export function calculateBadges(activities: ActivityItem[]): Badge[] {
  const firstStepProgress = activities.length;
  const firstStepUnlocked = firstStepProgress >= 1;

  // 1. Eco-Commuter: Log 5 transport activities using bus, train, bicycle, or walking
  const ecoCommuterActivities = activities.filter(
    (a) => a.type === 'transport' && ['bus', 'train', 'bicycle', 'walking'].includes(a.category.toLowerCase())
  );
  const ecoCommuterProgress = ecoCommuterActivities.length;
  const ecoCommuterUnlocked = ecoCommuterProgress >= 5;

  // 2. Plant-Based Hero: Log 5 food items using vegetables, fruits, or grains
  const plantBasedActivities = activities.filter(
    (a) => a.type === 'food' && ['vegetables', 'fruits', 'grains'].includes(a.category.toLowerCase())
  );
  const plantBasedProgress = plantBasedActivities.length;
  const plantBasedUnlocked = plantBasedProgress >= 5;

  // 3. Energy Saver: Log 3 energy activities that are clean (solar) or low footprint (< 15kg CO2)
  const energySaverActivities = activities.filter(
    (a) => a.type === 'energy' && (a.category.toLowerCase() === 'solar' || a.footprint < 15.0)
  );
  const energySaverProgress = energySaverActivities.length;
  const energySaverUnlocked = energySaverProgress >= 3;

  // 4. Consistent Tracker: Log activities on 3+ distinct days in the last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const recentActivities = activities.filter((a) => new Date(a.date) >= sevenDaysAgo);
  const distinctDays = new Set(
    recentActivities.map((a) => {
      const d = new Date(a.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  const consistentTrackerProgress = distinctDays.size;
  const consistentTrackerUnlocked = consistentTrackerProgress >= 3;

  return [
    {
      id: 'first-step',
      name: 'First Step',
      description: 'Logged your very first carbon activity.',
      icon: '🌱',
      unlocked: firstStepUnlocked,
      progress: Math.min(firstStepProgress, 1),
      target: 1,
    },
    {
      id: 'eco-commuter',
      name: 'Eco-Commuter',
      description: 'Logged 5+ low-carbon transport activities (bus, train, bike, walking).',
      icon: '🚲',
      unlocked: ecoCommuterUnlocked,
      progress: Math.min(ecoCommuterProgress, 5),
      target: 5,
    },
    {
      id: 'plant-based-hero',
      name: 'Plant-Based Hero',
      description: 'Logged 5+ eco-friendly meals (vegetables, fruits, or grains).',
      icon: '🥗',
      unlocked: plantBasedUnlocked,
      progress: Math.min(plantBasedProgress, 5),
      target: 5,
    },
    {
      id: 'energy-saver',
      name: 'Energy Saver',
      description: 'Logged 3+ clean solar or low-emissions energy activities.',
      icon: '💡',
      unlocked: energySaverUnlocked,
      progress: Math.min(energySaverProgress, 3),
      target: 3,
    },
    {
      id: 'consistent-tracker',
      name: 'Consistent Tracker',
      description: 'Logged carbon activities on 3 or more distinct days in the past week.',
      icon: '📅',
      unlocked: consistentTrackerUnlocked,
      progress: Math.min(consistentTrackerProgress, 3),
      target: 3,
    },
  ];
}
