export const THEME_KEY = "arcway:theme";

/** Runs before paint so the saved or system theme applies without a flash. */
export const THEME_INIT_SCRIPT = `document.documentElement.classList.add("js");try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

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
