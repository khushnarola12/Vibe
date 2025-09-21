/**
 * Unit tests for useCurrentTheme hook.
 *
 * Framework:
 *  - Test runner: Determined by repo config (Jest or Vitest). This test uses describe/it/expect compatible with both.
 *  - Library: @testing-library/react (renderHook) and optional @testing-library/jest-dom for matchers if configured.
 *
 * We mock next-themes' useTheme to simulate combinations of theme and systemTheme.
 */

import React from "react";

// Import the hook. The implementation provided resides at this path.
// If the repository later renames the implementation (recommended), update this import accordingly.
import { useCurrentTheme } from "../use-current-theme.test";

// Hook testing utility: prefer renderHook from @testing-library/react (v13+)
import { renderHook } from "@testing-library/react";

// Mock next-themes useTheme
const mockUseTheme = jest.fn ? jest.fn() : (vi as any).fn();
jest?.mock?.("next-themes", () => ({ useTheme: () => mockUseTheme() }));
// For Vitest:
try {
  // @ts-ignore
  vi.mock?.("next-themes", () => ({ useTheme: () => mockUseTheme() }));
} catch {}

describe("useCurrentTheme", () => {
  beforeEach(() => {
    mockUseTheme.mockReset?.();
  });

  it("returns 'dark' when theme is explicitly 'dark'", () => {
    mockUseTheme.mockReturnValue?.({ theme: "dark", systemTheme: "light" });
    const { result } = renderHook(() => useCurrentTheme());
    expect(result.current).toBe("dark");
  });

  it("returns 'light' when theme is explicitly 'light'", () => {
    mockUseTheme.mockReturnValue?.({ theme: "light", systemTheme: "dark" });
    const { result } = renderHook(() => useCurrentTheme());
    expect(result.current).toBe("light");
  });

  it("falls back to systemTheme when theme is 'system'", () => {
    mockUseTheme.mockReturnValue?.({ theme: "system", systemTheme: "dark" });
    const { result } = renderHook(() => useCurrentTheme());
    expect(result.current).toBe("dark");
  });

  it("falls back to systemTheme when theme is undefined", () => {
    mockUseTheme.mockReturnValue?.({ theme: undefined, systemTheme: "light" });
    const { result } = renderHook(() => useCurrentTheme());
    expect(result.current).toBe("light");
  });

  it("falls back to systemTheme when theme is an unexpected value", () => {
    mockUseTheme.mockReturnValue?.({ theme: "amoled", systemTheme: "dark" });
    const { result } = renderHook(() => useCurrentTheme());
    expect(result.current).toBe("dark");
  });

  it("returns undefined when both theme and systemTheme are undefined", () => {
    mockUseTheme.mockReturnValue?.({ theme: undefined, systemTheme: undefined });
    const { result } = renderHook(() => useCurrentTheme());
    expect(result.current).toBeUndefined();
  });

  it("handles nulls gracefully by returning systemTheme", () => {
    mockUseTheme.mockReturnValue?.({ theme: null, systemTheme: "dark" });
    const { result } = renderHook(() => useCurrentTheme());
    expect(result.current).toBe("dark");
  });

  it("prefers explicit theme even if systemTheme matches opposite", () => {
    mockUseTheme.mockReturnValue?.({ theme: "dark", systemTheme: "dark" });
    const { result } = renderHook(() => useCurrentTheme());
    expect(result.current).toBe("dark");
  });

  it("does not throw if useTheme returns a partial object", () => {
    mockUseTheme.mockReturnValue?.({}); // both missing
    const { result } = renderHook(() => useCurrentTheme());
    expect(result.current).toBeUndefined();
  });
});