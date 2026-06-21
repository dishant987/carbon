import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Goals } from '../pages/Goals';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  fetchGoals: vi.fn(),
  updateWeeklyGoal: vi.fn(),
}));

describe('Goals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMockData = (weeklyTotal = 45.0, weeklyGoal = 100.0) => {
    const goalsRes = {
      weeklyGoal,
      weeklyTotal,
      badges: [
        {
          id: '1',
          name: 'Eco Starter',
          description: 'Log first activity',
          icon: '🌱',
          unlocked: true,
          progress: 1,
          target: 1,
        },
        {
          id: '2',
          name: 'Green Warrior',
          description: 'Log 5 activities',
          icon: '🛡️',
          unlocked: false,
          progress: 2,
          target: 5,
        },
      ],
    };
    vi.mocked(api.fetchGoals).mockResolvedValue(goalsRes);
    return goalsRes;
  };

  it('renders loader while fetching data', () => {
    vi.mocked(api.fetchGoals).mockReturnValue(new Promise(() => {}));
    render(<Goals />);

    expect(screen.getByText(/loading goals & badges/i)).toBeInTheDocument();
  });

  it('renders goals, progress limit, and achievements correctly', async () => {
    setupMockData();
    render(<Goals />);

    await waitFor(() => {
      expect(screen.getByText('Goals & Eco-Badges')).toBeInTheDocument();
    });

    expect(screen.getByText((_, element) => element?.textContent?.trim() === '45 / 100 kg CO2')).toBeInTheDocument();
    expect(screen.getByText('Eco Starter')).toBeInTheDocument();
    expect(screen.getByText('Green Warrior')).toBeInTheDocument();
    expect(screen.getByText('Unlocked')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  it('validates goal input and updates weekly budget successfully', async () => {
    setupMockData();
    vi.mocked(api.updateWeeklyGoal).mockResolvedValue({ weeklyGoal: 150 });
    render(<Goals />);

    await waitFor(() => {
      expect(screen.getByLabelText('Update Weekly Budget Limit (kg CO2)')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Update Weekly Budget Limit (kg CO2)');
    fireEvent.change(input, { target: { value: '150' } });

    const submitBtn = screen.getByRole('button', { name: /set target/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Weekly carbon target updated to 150 kg CO2 successfully!/i)
      ).toBeInTheDocument();
    });
    expect(api.updateWeeklyGoal).toHaveBeenCalledWith(150);
  });

  it('shows error if goal input is invalid or negative', async () => {
    setupMockData();
    render(<Goals />);

    await waitFor(() => {
      expect(screen.getByLabelText('Update Weekly Budget Limit (kg CO2)')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Update Weekly Budget Limit (kg CO2)') as HTMLInputElement;
    const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeValueSetter?.call(input, '-5');
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const submitBtn = screen.getByRole('button', { name: /set target/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid positive number for your goal.')).toBeInTheDocument();
    });
  });

  it('shows warning advice when budget usage is high or exceeded', async () => {
    setupMockData(120.0, 100.0); // 120% consumed
    render(<Goals />);

    await waitFor(() => {
      expect(screen.getByText('120% Limit Consumed')).toBeInTheDocument();
    });

    expect(screen.getByText(/You have exceeded your weekly carbon budget/i)).toBeInTheDocument();
  });
});
