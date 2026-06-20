import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'hello' },
    });

    expect(result.current).toBe('hello');

    rerender({ val: 'world' });
    // Still 'hello' immediately after update
    expect(result.current).toBe('hello');

    // Advance timers by less than delay
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('hello');

    // Advance the rest of the time
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('world');
  });
});
