"use client";

import { useEffect, useState } from "react";
import {
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

const LIGHT_THEME = "corporate";
const DARK_THEME = "sunset";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const initial = stored ?? "light";
    setTheme(initial);
    document.documentElement.setAttribute(
      "data-theme",
      initial === "light" ? LIGHT_THEME : DARK_THEME
    );
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute(
      "data-theme",
      next === "light" ? LIGHT_THEME : DARK_THEME
    );
  };

  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-ghost btn-square btn-sm ${className}`}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
}
