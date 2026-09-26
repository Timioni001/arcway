'use client';

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { THEME_EVENT, toggleTheme } from "../lib/theme";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  return (
    <button className="btn btn--ghost btn--icon" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}
