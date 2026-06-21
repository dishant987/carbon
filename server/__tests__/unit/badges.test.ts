import { calculateBadges } from '../../src/utils/badges';

describe('Badges Utils', () => {
  it('returns all 5 badges', () => {
    const result = calculateBadges([]);
    expect(result).toHaveLength(5);
  });

  it('unlocks first step badge with one activity', () => {
    const activities = [{ type: 'transport', category: 'car', footprint: 5, date: new Date() }];
    const result = calculateBadges(activities);
    expect(result.find((b) => b.id === 'first-step')?.unlocked).toBe(true);
  });

  it('unlocks eco-commuter badge with 5+ transport activities', () => {
    const activities = Array.from({ length: 5 }, (_, i) => ({
      type: 'transport' as const,
      category: 'bus',
      footprint: 2,
      date: new Date(),
    }));
    const result = calculateBadges(activities);
    expect(result.find((b) => b.id === 'eco-commuter')?.unlocked).toBe(true);
  });

  it('unlocks plant-based hero badge with 5+ food activities', () => {
    const activities = Array.from({ length: 5 }, (_, i) => ({
      type: 'food' as const,
      category: 'vegetables',
      footprint: 0.5,
      date: new Date(),
    }));
    const result = calculateBadges(activities);
    expect(result.find((b) => b.id === 'plant-based-hero')?.unlocked).toBe(true);
  });

  it('unlocks energy saver badge with 3+ energy activities', () => {
    const activities = Array.from({ length: 3 }, (_, i) => ({
      type: 'energy' as const,
      category: 'solar',
      footprint: 5,
      date: new Date(),
    }));
    const result = calculateBadges(activities);
    expect(result.find((b) => b.id === 'energy-saver')?.unlocked).toBe(true);
  });

  it('tracks progress correctly', () => {
    const activities = [{ type: 'transport', category: 'car', footprint: 5, date: new Date() }];
    const result = calculateBadges(activities);
    expect(result.find((b) => b.id === 'first-step')?.progress).toBe(1);
    expect(result.find((b) => b.id === 'first-step')?.target).toBe(1);
  });
});
