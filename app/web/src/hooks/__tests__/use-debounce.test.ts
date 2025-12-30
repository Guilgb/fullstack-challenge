import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounce } from "@/hooks/use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));

    expect(result.current).toBe("initial");
  });

  it("should debounce value changes", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    expect(result.current).toBe("initial");

    // Update the value
    rerender({ value: "updated", delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe("initial");

    // Fast-forward time
    vi.advanceTimersByTime(500);

    // Now the value should be updated
    await waitFor(() => {
      expect(result.current).toBe("updated");
    });
  });

  it("should reset timer on rapid changes", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    // First change
    rerender({ value: "first", delay: 500 });
    vi.advanceTimersByTime(250);

    // Second change before delay expires
    rerender({ value: "second", delay: 500 });
    vi.advanceTimersByTime(250);

    // Value should still be initial
    expect(result.current).toBe("initial");

    // Complete the delay
    vi.advanceTimersByTime(250);

    // Should update to the last value
    await waitFor(() => {
      expect(result.current).toBe("second");
    });
  });

  it("should handle different delay values", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 1000 },
      }
    );

    rerender({ value: "updated", delay: 1000 });

    vi.advanceTimersByTime(500);
    expect(result.current).toBe("initial");

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toBe("updated");
    });
  });

  it("should handle zero delay", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 0 },
      }
    );

    rerender({ value: "updated", delay: 0 });

    vi.advanceTimersByTime(0);

    await waitFor(() => {
      expect(result.current).toBe("updated");
    });
  });

  it("should work with different data types", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 500 },
      }
    );

    expect(result.current).toBe(0);

    rerender({ value: 42, delay: 500 });
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toBe(42);
    });
  });

  it("should handle object values", async () => {
    const initialObj = { name: "initial" };
    const updatedObj = { name: "updated" };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialObj, delay: 500 },
      }
    );

    expect(result.current).toEqual(initialObj);

    rerender({ value: updatedObj, delay: 500 });
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toEqual(updatedObj);
    });
  });
});
