import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Tips } from '../pages/Tips';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  fetchTips: vi.fn(),
}));

describe('Tips', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows tips skeleton when loading', () => {
    (api.fetchTips as any).mockReturnValue(new Promise(() => {}));
    render(<Tips />);

    expect(screen.queryByText('Carbon Reduction Recommendations')).toBeInTheDocument();
  });

  it('renders error alert when API fails', async () => {
    (api.fetchTips as any).mockRejectedValue(new Error('Network error'));
    render(<Tips />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Generate Tips')).toBeInTheDocument();
    });
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows empty state when no recommendations are returned', async () => {
    (api.fetchTips as any).mockResolvedValue([]);
    render(<Tips />);

    await waitFor(() => {
      expect(screen.getByText('No recommendations generated yet')).toBeInTheDocument();
    });
  });

  it('renders recommendations with detailed accordions and categories', async () => {
    const mockTips = [
      'Reduce vehicle emissions by driving less.',
      'Eat vegetarian meals once a week.',
      'Turn off standby power on electronics.',
      'Set up a home compost system.',
      'Purchase local and seasonal products.',
      'Shorten your showers to save hot water.',
      'Random fallback tip.',
    ];
    (api.fetchTips as any).mockResolvedValue(mockTips);

    render(<Tips />);

    await waitFor(() => {
      expect(screen.getByText('Reduce vehicle emissions by driving less.')).toBeInTheDocument();
    });

    // Check that categories were mapped correctly by looking at badges
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Diet & Agriculture')).toBeInTheDocument();
    expect(screen.getByText('Household Energy')).toBeInTheDocument();
    expect(screen.getByText('Waste Management')).toBeInTheDocument();
    expect(screen.getByText('Shopping & Consumerism')).toBeInTheDocument();
    expect(screen.getByText('Water & Heating')).toBeInTheDocument();
    expect(screen.getByText('General Sustainability')).toBeInTheDocument();

    // The first tip should be expanded by default (expandedIndex = 0)
    expect(screen.getByText('Sustainable Transportation')).toBeInTheDocument();
    expect(screen.getByText('Choose public transit or carpooling for your daily commute.')).toBeInTheDocument();

    // Toggle accordion collapse
    const transportHeaderButton = screen.getAllByRole('button')[1]; // Button to toggle first tip
    fireEvent.click(transportHeaderButton);

    // After collapse, the detail content is hidden
    await waitFor(() => {
      expect(screen.queryByText('Sustainable Transportation')).not.toBeInTheDocument();
    });
  });

  it('retries loading tips when retry button is clicked', async () => {
    (api.fetchTips as any).mockRejectedValueOnce(new Error('First failure'));
    (api.fetchTips as any).mockResolvedValueOnce(['Successful tip']);

    render(<Tips />);

    await waitFor(() => {
      expect(screen.getByText('First failure')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry connection/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Successful tip')).toBeInTheDocument();
    });
  });
});
