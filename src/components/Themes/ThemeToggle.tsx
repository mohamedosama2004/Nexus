"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

const LIGHT_THEME = "corporate";
const DARK_THEME = "sunset";

type Theme = "light" | "dark";

const THEME_CHANGE_EVENT = "theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Theme {
  try {
    return (localStorage.getItem("theme") as Theme) ?? "light";
  } catch {
    return "light";
  }
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute(
      "data-theme",
      next === "light" ? LIGHT_THEME : DARK_THEME,
    );
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-ghost btn-square btn-sm ${className}`}
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
    >
      {theme === "light" ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
}
