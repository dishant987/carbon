import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

function TrapTestComponent({ active, onEscape }: { active: boolean; onEscape?: () => void }) {
  const ref = useFocusTrap(active, onEscape);
  return (
    <div>
      <button data-testid="outside">Outside</button>
      <div ref={ref} data-testid="container">
        <button data-testid="btn1">Button 1</button>
        <button data-testid="btn2">Button 2</button>
      </div>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('does not trap focus when active is false', async () => {
    render(<TrapTestComponent active={false} />);
    const outside = screen.getByTestId('outside');
    outside.focus();
    expect(document.activeElement).toBe(outside);
  });

  it('traps focus to the first element when active is true', async () => {
    render(<TrapTestComponent active={true} />);
    const btn1 = screen.getByTestId('btn1');
    expect(document.activeElement).toBe(btn1);
  });

  it('triggers onEscape callback when Escape is pressed', async () => {
    const user = userEvent.setup();
    const handleEscape = vi.fn();
    render(<TrapTestComponent active={true} onEscape={handleEscape} />);

    await user.keyboard('{Escape}');
    expect(handleEscape).toHaveBeenCalledTimes(1);
  });

  it('cycles focus within the container using tab', async () => {
    const user = userEvent.setup();
    render(<TrapTestComponent active={true} />);

    const btn1 = screen.getByTestId('btn1');
    const btn2 = screen.getByTestId('btn2');

    expect(document.activeElement).toBe(btn1);

    await user.tab();
    expect(document.activeElement).toBe(btn2);

    await user.tab();
    expect(document.activeElement).toBe(btn1);
  });

  it('cycles focus backward using Shift+Tab', async () => {
    const user = userEvent.setup();
    render(<TrapTestComponent active={true} />);

    const btn1 = screen.getByTestId('btn1');
    const btn2 = screen.getByTestId('btn2');

    expect(document.activeElement).toBe(btn1);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(btn2);
  });
});
