import { useCallback, useState } from "react";

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
  // Read the DOM lazily on the client so a dark-mode visitor's hero never gets
  // a frame of light-mode lighting; on the server there is no document, and the
  // SSR default matches the boot script's no-preference branch.
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document === "undefined" ? "light" : readTheme(),
  );

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
