/**
 * Palette selection for Design System v2.
 *
 *   dark   → A · Ledger Dark  (default)   html[data-theme="dark"]
 *   light  → B · Paper Light              html[data-theme="light"]
 *   bright → C · Bright Pro (vivid light) html[data-theme="light"][data-palette="bright"]
 *
 * The same logic runs twice: inline in <head> before first paint (THEME_HEAD_SCRIPT,
 * so there is no flash of the wrong palette) and from ThemeToggle via applyTheme().
 */
export type ThemeChoice = "dark" | "light" | "bright";

export const THEME_STORAGE_KEY = "tokenops-theme-v2";
export const DEFAULT_THEME: ThemeChoice = "dark";

/** Browser chrome colour (meta theme-color) per palette — mirrors --to-bg in styles.css. */
export const THEME_COLOR: Record<ThemeChoice, string> = {
  dark: "#070A10",
  light: "#F7F5F0",
  bright: "#F5F7FC",
};

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "dark" || value === "light" || value === "bright";
}

export function readStoredTheme(): ThemeChoice {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeChoice(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  root.setAttribute("data-theme", choice === "dark" ? "dark" : "light");
  if (choice === "bright") root.setAttribute("data-palette", "bright");
  else root.removeAttribute("data-palette");
  root.classList.toggle("dark", choice === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[choice]);
}

export function persistTheme(choice: ThemeChoice) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    /* storage blocked (private mode): the choice still applies for this page view */
  }
}

/** Inline, dependency-free copy of readStoredTheme + applyTheme for <head>. */
export const THEME_HEAD_SCRIPT = `(function(){var d=document.documentElement,c=${JSON.stringify(
  THEME_COLOR,
)},t;try{t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});}catch(e){}if(t!=='dark'&&t!=='light'&&t!=='bright'){t=${JSON.stringify(
  DEFAULT_THEME,
)};}d.setAttribute('data-theme',t==='dark'?'dark':'light');if(t==='bright'){d.setAttribute('data-palette','bright');}else{d.removeAttribute('data-palette');}d.classList.toggle('dark',t==='dark');var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute('content',c[t]);}})();`;
