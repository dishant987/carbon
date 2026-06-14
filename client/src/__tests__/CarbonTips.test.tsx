import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarbonTips } from '../components/CarbonTips';

describe('CarbonTips', () => {
  it('shows empty state message when tips is empty', () => {
    const onRefresh = vi.fn();
    render(<CarbonTips tips={[]} onRefresh={onRefresh} />);

    expect(screen.getByText(/add some activities/i)).toBeInTheDocument();
  });

  it('renders a list of tips', () => {
    const tips = ['Tip one', 'Tip two', 'Tip three'];
    const onRefresh = vi.fn();
    render(<CarbonTips tips={tips} onRefresh={onRefresh} />);

    expect(screen.getByText('Tip one')).toBeInTheDocument();
    expect(screen.getByText('Tip two')).toBeInTheDocument();
    expect(screen.getByText('Tip three')).toBeInTheDocument();
  });

  it('renders tips with numbered labels', () => {
    const tips = ['First tip'];
    const onRefresh = vi.fn();
    render(<CarbonTips tips={tips} onRefresh={onRefresh} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('First tip')).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn().mockResolvedValue(['new tip']);
    render(<CarbonTips tips={['old tip']} onRefresh={onRefresh} />);

    const refreshButton = screen.getByRole('button', { name: 'Refresh tips' });
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('has a card title with Tips heading', () => {
    const onRefresh = vi.fn();
    render(<CarbonTips tips={['test']} onRefresh={onRefresh} />);

    expect(screen.getByText('Tips to Reduce Footprint')).toBeInTheDocument();
  });

  it('handles async refresh without throwing', async () => {
    const onRefresh = vi.fn().mockResolvedValue(['refreshed tip']);
    render(<CarbonTips tips={['old']} onRefresh={onRefresh} />);

    const refreshButton = screen.getByRole('button', { name: 'Refresh tips' });
    await userEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalled();
  });
});
