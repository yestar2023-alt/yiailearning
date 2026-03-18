import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  jest.useFakeTimers();

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));

    expect(result.current).toBe('test');
  });

  it('debounces value change', () => {
    let value = 'initial';
    const { result, rerender } = renderHook(() => useDebounce(value, 500));

    expect(result.current).toBe('initial');

    value = 'updated';
    rerender();

    // Immediately after rerender, should still be old value
    expect(result.current).toBe('initial');

    // After delay, should be new value
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('resets timer when value changes rapidly', () => {
    let value = 'initial';
    const { result, rerender } = renderHook(() => useDebounce(value, 500));

    value = 'second';
    rerender();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    value = 'third';
    rerender();

    // Timer should reset, value should still be 'second'
    expect(result.current).toBe('second');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('third');
  });

  it('handles different delay values', () => {
    let value = 'test';
    const { result, rerender } = renderHook(() => useDebounce(value, 1000));

    value = 'updated';
    rerender();

    // After 500ms, should not be updated
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('test');

    // After 1000ms, should be updated
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('handles number values', () => {
    let value = 0;
    const { result, rerender } = renderHook(() => useDebounce(value, 300));

    value = 10;
    rerender();

    expect(result.current).toBe(0);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(10);
  });

  it('handles object values', () => {
    let value = { name: 'test' };
    const { result, rerender } = renderHook(() => useDebounce(value, 300));

    value = { name: 'updated' };
    rerender();

    expect(result.current).toEqual({ name: 'test' });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toEqual({ name: 'updated' });
  });
});
