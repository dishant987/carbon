import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EcoTools } from '../pages/EcoTools';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  analyzeRecipeCarbon: vi.fn(),
}));

describe('EcoTools Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and defaults to the Green Route Planner tab', () => {
    render(<EcoTools />);

    expect(screen.getByText('Green Route Planner')).toBeInTheDocument();
    expect(screen.getByText('Route Settings')).toBeInTheDocument();
    expect(screen.getByText('Transit Footprint Comparison')).toBeInTheDocument();
  });

  it('calculates carbon transit footprints based on route settings', () => {
    render(<EcoTools />);

    const distanceInput = screen.getByLabelText(/One-Way Distance/i);
    const tripsInput = screen.getByLabelText(/Trips Per Week/i);

    fireEvent.change(distanceInput, { target: { value: '20' } });
    fireEvent.change(tripsInput, { target: { value: '5' } });

    // Petrol Car should show 34.0 kg CO2 (20 * 5 * 2 * 0.17 = 34)
    expect(screen.getByText('34.0 kg CO2')).toBeInTheDocument();
  });

  it('runs Gemini Recipe Auditor when pasting a recipe', async () => {
    render(<EcoTools />);

    // Click recipe auditor tab
    const recipeTab = screen.getByRole('button', { name: /Gemini Recipe Auditor/i });
    fireEvent.click(recipeTab);

    expect(screen.getByText('AI Meal Footprint Auditor')).toBeInTheDocument();

    const mockAnalysis = {
      recipeName: 'Cheeseburger',
      totalFootprintKg: 8.5,
      ingredientsAnalysis: [{ name: 'Ground Beef', footprintKg: 7.2, impact: 'high' as const }],
      plantBasedAlternative: 'Beyond Burger',
      alternativeFootprintKg: 1.2,
      explanation: 'Replacing beef reduces carbon.',
    };

    (api.analyzeRecipeCarbon as any).mockResolvedValue(mockAnalysis);

    const recipeInput = screen.getByLabelText(/Paste Recipe or Ingredients List/i);
    fireEvent.change(recipeInput, { target: { value: '1 beef burger patty' } });

    const submitBtn = screen.getByRole('button', { name: /Analyze Carbon Footprint/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Cheeseburger')).toBeInTheDocument();
      expect(screen.getByText('Beyond Burger')).toBeInTheDocument();
    });
  });

  it('calculates efficiency savings when updating sliders', () => {
    render(<EcoTools />);

    // Click home savings calculator tab
    const homeTab = screen.getByRole('button', { name: /Home Savings Calculator/i });
    fireEvent.click(homeTab);

    expect(screen.getByText('Your Home Savings Potential')).toBeInTheDocument();

    // Default values: ledBulbs = 5, thermostatOffset = 2, smartStrips = 1
    // Carbon saved: (5 * 35) + (2 * 150) + (1 * 40) = 175 + 300 + 40 = 515
    expect(screen.getByText('515')).toBeInTheDocument(); // 515 kg CO2
  });
});
