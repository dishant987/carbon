import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityForm } from '../components/ActivityForm';

describe('ActivityForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all form fields', () => {
    render(<ActivityForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('Activity Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate & save/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<ActivityForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: /calculate & save/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('clears error when user corrects input and resubmits', async () => {
    const user = userEvent.setup();
    render(<ActivityForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: /calculate & save/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Select type
    await user.click(screen.getByRole('combobox', { name: 'Activity Type' }));
    await user.click(await screen.findByRole('option', { name: 'Transport' }));

    // Select category
    await user.click(await screen.findByRole('combobox', { name: 'Category' }));
    await user.click(await screen.findByRole('option', { name: 'Car' }));

    // Enter amount
    await user.type(screen.getByLabelText('Amount'), '10');

    // Select unit
    await user.click(await screen.findByRole('combobox', { name: 'Unit' }));
    await user.click(await screen.findByRole('option', { name: 'km' }));

    // Resubmit
    await user.click(screen.getByRole('button', { name: /calculate & save/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('shows category and unit selects after selecting type', async () => {
    const user = userEvent.setup();
    render(<ActivityForm onSubmit={mockOnSubmit} />);

    // Open type select
    const typeTrigger = screen.getByRole('combobox', { name: 'Activity Type' });
    await user.click(typeTrigger);

    // Select 'Transport'
    const transportOption = await screen.findByRole('option', { name: 'Transport' });
    await user.click(transportOption);

    // Category and unit should now be visible
    await waitFor(() => {
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Unit')).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid form data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(undefined);
    render(<ActivityForm onSubmit={mockOnSubmit} />);

    // Select type
    await user.click(screen.getByRole('combobox', { name: 'Activity Type' }));
    await user.click(await screen.findByRole('option', { name: 'Transport' }));

    // Select category
    await user.click(await screen.findByRole('combobox', { name: 'Category' }));
    await user.click(await screen.findByRole('option', { name: 'Car' }));

    // Enter amount
    const amountInput = screen.getByLabelText('Amount');
    await user.type(amountInput, '10');

    // Select unit
    await user.click(await screen.findByRole('combobox', { name: 'Unit' }));
    await user.click(await screen.findByRole('option', { name: 'km' }));

    // Submit
    await user.click(screen.getByRole('button', { name: /calculate & save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
