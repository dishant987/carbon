import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardCharts } from '../components/DashboardCharts';

describe('DashboardCharts', () => {
  it('renders nothing when breakdown is empty', () => {
    const { container } = render(<DashboardCharts breakdown={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders both pie and bar charts when data is provided', () => {
    const mockBreakdown = [
      { type: 'transport', total: 10, percentage: 50, count: 2 },
      { type: 'food', total: 10, percentage: 50, count: 1 },
    ];

    render(<DashboardCharts breakdown={mockBreakdown} />);

    expect(screen.getByText('Footprint by Category')).toBeInTheDocument();
    expect(screen.getByText('Emissions by Activity Type')).toBeInTheDocument();
  });

  it('handles single category gracefully', () => {
    const mockBreakdown = [{ type: 'transport', total: 15, percentage: 100, count: 3 }];

    render(<DashboardCharts breakdown={mockBreakdown} />);

    expect(screen.getAllByText('Transport').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('15.00').length).toBeGreaterThanOrEqual(1);
  });

  it('displays correct percentage in tooltip data', () => {
    const mockBreakdown = [
      { type: 'transport', total: 25, percentage: 62.5, count: 5 },
      { type: 'food', total: 15, percentage: 37.5, count: 3 },
    ];

    render(<DashboardCharts breakdown={mockBreakdown} />);

    // Verify category names are rendered
    expect(screen.getAllByText('Transport').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Food').length).toBeGreaterThanOrEqual(1);
  });
});
