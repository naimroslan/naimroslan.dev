import { useCallback, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

/**
 * Page background per theme, mirroring `--page` in app.css. The browser UI tint
 * has to be a literal colour in a meta tag, and reading the computed custom
 * property instead is not an option: in dev Vite injects the stylesheet through
 * JS, which runs after the boot script in root.tsx, so it would resolve empty
 * in dev and work in production.
 */
export const PAGE_COLOR: Record<Theme, string> = {
  light: "#faf9f7",
  dark: "#0e0f12",
};

/**
 * Reads the theme from the source of truth: the `dark` class that the boot
 * script in root.tsx puts on <html> before React ever runs.
 */
const readTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

/**
 * Points the browser UI tint at the new page colour, so the iOS standalone
 * status bar and the Android address bar track the theme the page actually
 * rendered. The old markup keyed two metas off prefers-color-scheme, which
 * disagreed with the page for anyone whose OS and stored choice differed.
 *
 * The boot script normally creates this meta; React renders none, which is what
 * stops hydration from reverting it. Creating it here too means a toggle still
 * fixes the tint even if the element went missing.
 */
const applyThemeColor = (theme: Theme): void => {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", PAGE_COLOR[theme]);
};

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
    applyThemeColor(next);
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
