export const THEME_KEY = "arcway:theme";

/**
 * Runs before paint so the saved theme applies without a flash. Light is the default; dark only
 * when chosen, or when "System" is chosen and the device is dark.
 */
export const THEME_INIT_SCRIPT = `document.documentElement.classList.add("js");document.documentElement.dataset.intro="1";try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark");var r=localStorage.getItem("arcway:rail");if(r==="collapsed"||r==="expanded")document.documentElement.dataset.rail=r}catch(e){}`;

export const THEME_EVENT = "arcway:theme";

/** Flip light/dark, remember it, and tell any theme buttons on the page. */
export function toggleTheme(): boolean {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  } catch {
    /* preference just won't persist */
  }
  window.dispatchEvent(new Event(THEME_EVENT));
  return next;
}

export type ThemeMode = "light" | "dark" | "system";

export function getThemeMode(): ThemeMode {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "dark" || t === "system" ? t : "light";
  } catch {
    return "light";
  }
}

/** Set light, dark, or follow the system setting. */
export function setThemeMode(mode: ThemeMode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* preference just won't persist */
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}
