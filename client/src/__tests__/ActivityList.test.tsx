import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityList } from '../components/ActivityList';
import type { Activity } from '../types';

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'transport',
    category: 'car',
    amount: 10,
    unit: 'km',
    footprint: 2.5,
    date: '2024-01-15T00:00:00.000Z',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    type: 'food',
    category: 'beef',
    amount: 0.5,
    unit: 'kg',
    footprint: 7.5,
    date: '2024-01-16T00:00:00.000Z',
    createdAt: '2024-01-16T00:00:00.000Z',
    updatedAt: '2024-01-16T00:00:00.000Z',
  },
];

describe('ActivityList', () => {
  const mockOnDelete = vi.fn();

  it('shows empty state when no activities', () => {
    render(<ActivityList activities={[]} onDelete={mockOnDelete} />);

    expect(screen.getByText(/no activities yet/i)).toBeInTheDocument();
  });

  it('renders activity items with correct data', () => {
    render(<ActivityList activities={mockActivities} onDelete={mockOnDelete} />);

    expect(screen.getByText('car')).toBeInTheDocument();
    expect(screen.getByText('beef')).toBeInTheDocument();
  });

  it('displays CO2 footprint for each activity', () => {
    render(<ActivityList activities={mockActivities} onDelete={mockOnDelete} />);

    expect(screen.getByText('2.50 kg CO₂')).toBeInTheDocument();
    expect(screen.getByText('7.50 kg CO₂')).toBeInTheDocument();
  });

  it('renders a delete button for each item', () => {
    render(<ActivityList activities={mockActivities} onDelete={mockOnDelete} />);

    const deleteButtons = screen.getAllByRole('button');
    expect(deleteButtons.length).toBe(mockActivities.length);
  });

  it('displays activity type badges', () => {
    render(<ActivityList activities={mockActivities} onDelete={mockOnDelete} />);

    expect(screen.getByText('transport')).toBeInTheDocument();
    expect(screen.getByText('food')).toBeInTheDocument();
  });

  it('renders amount and unit correctly', () => {
    render(<ActivityList activities={mockActivities} onDelete={mockOnDelete} />);

    expect(screen.getByText(/10 km/)).toBeInTheDocument();
    expect(screen.getByText(/0.5 kg/)).toBeInTheDocument();
  });
});
