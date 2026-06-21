import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Offsets } from '../pages/Offsets';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  fetchOffsets: vi.fn(),
  fetchDashboardSummary: vi.fn(),
  generateAiReport: vi.fn(),
  createOffsetPledge: vi.fn(),
}));

describe('Offsets Page', () => {
  const mockProjects: api.OffsetProject[] = [
    {
      id: 'amazon-reforestation',
      name: 'Amazon Rainforest Protection',
      description: 'Preserves critical forest habitats from logging in Brazil.',
      location: 'Amazonas, Brazil',
      costPerTonUSD: 15,
      category: 'Forestry',
      image: 'reforestation',
    },
  ];

  const mockPledges: api.OffsetPledge[] = [
    {
      id: 'pledge-1',
      project: 'amazon-reforestation',
      amount: 25.0,
      createdAt: '2024-01-20T10:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    vi.mocked(api.fetchOffsets).mockReturnValue(new Promise(() => {}));
    vi.mocked(api.fetchDashboardSummary).mockReturnValue(new Promise(() => {}));

    render(<Offsets />);

    expect(screen.getByText('Loading simulator & projects...')).toBeInTheDocument();
  });

  it('renders projects and pledges after loading successfully', async () => {
    vi.mocked(api.fetchOffsets).mockResolvedValue({
      projects: mockProjects,
      pledges: mockPledges,
      totalOffset: 25.0,
    });
    vi.mocked(api.fetchDashboardSummary).mockResolvedValue({
      totalFootprint: 100.0,
      dailyAverage: 14.2,
      weeklyTotal: 100.0,
      monthlyTotal: 400.0,
      activityCount: 10,
    });

    render(<Offsets />);

    await waitFor(() => {
      expect(screen.queryByText('Loading simulator & projects...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Amazon Rainforest Protection')).toBeInTheDocument();
    expect(screen.getByText('Lifetime Pledged Offsets')).toBeInTheDocument();
    expect(screen.getByText('25 kg')).toBeInTheDocument();
    expect(screen.getByText('75.0 kg left')).toBeInTheDocument();
  });

  it('creates carbon offset pledge successfully', async () => {
    vi.mocked(api.fetchOffsets).mockResolvedValue({
      projects: mockProjects,
      pledges: mockPledges,
      totalOffset: 25.0,
    });
    vi.mocked(api.fetchDashboardSummary).mockResolvedValue({
      totalFootprint: 100.0,
      dailyAverage: 14.2,
      weeklyTotal: 100.0,
      monthlyTotal: 400.0,
      activityCount: 10,
    });

    render(<Offsets />);

    await waitFor(() => {
      expect(screen.queryByText('Loading simulator & projects...')).not.toBeInTheDocument();
    });

    // Mock successful createOffsetPledge call
    vi.mocked(api.createOffsetPledge).mockResolvedValue({
      id: 'pledge-2',
      project: 'amazon-reforestation',
      amount: 10.0,
      createdAt: '2024-01-20T10:00:00.000Z',
    });

    const amountInput = screen.getByLabelText(/Pledge CO2 Amount to Offset/i);
    fireEvent.change(amountInput, { target: { value: '10' } });

    const submitBtn = screen.getByRole('button', { name: /Pledge Virtual Offset/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createOffsetPledge).toHaveBeenCalledWith('amazon-reforestation', 10);
    });
  });

  it('generates AI report card when click button', async () => {
    vi.mocked(api.fetchOffsets).mockResolvedValue({
      projects: mockProjects,
      pledges: [],
      totalOffset: 0,
    });
    vi.mocked(api.fetchDashboardSummary).mockResolvedValue({
      totalFootprint: 50.0,
      dailyAverage: 7.1,
      weeklyTotal: 50.0,
      monthlyTotal: 200.0,
      activityCount: 5,
    });

    render(<Offsets />);

    await waitFor(() => {
      expect(screen.queryByText('Loading simulator & projects...')).not.toBeInTheDocument();
    });

    const mockReport: api.AiReportResponse = {
      grade: 'A',
      score: 95,
      analysis: 'You have done a fantastic job minimizing emissions.',
      actionPlan: [
        {
          week: 1,
          challengeName: 'Carpooling',
          description: 'Try carpooling to work.',
          expectedSavingKg: 10,
        },
      ],
    };
    vi.mocked(api.generateAiReport).mockResolvedValue(mockReport);

    const generateBtn = screen.getByRole('button', { name: /Generate AI Report Card/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument();
      expect(screen.getByText('You have done a fantastic job minimizing emissions.')).toBeInTheDocument();
      expect(screen.getByText('Carpooling')).toBeInTheDocument();
    });
  });
});
