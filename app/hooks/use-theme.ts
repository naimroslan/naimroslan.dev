import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

/**
 * Reads the theme from the source of truth: the `dark` class that the boot
 * script in root.tsx puts on <html> before React ever runs.
 */
const readTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

/**
 * Owns the theme toggle and its persistence. Call this once high in the tree
 * and pass `toggle` / `theme` down — the 3D hero needs the value to retune its
 * lights, and the navbar needs the setter.
 */
export function useTheme() {
  // Starts at the SSR default so the first client render matches the server
  // markup; the effect below reconciles with whatever the boot script applied.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const toggle = useCallback(() => {
    const isDark = document.documentElement.classList.toggle("dark");
    const next: Theme = isDark ? "dark" : "light";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode, blocked cookies); the
      // toggle still works for this page view.
    }
    setTheme(next);
  }, []);

  return { theme, toggle };
}
