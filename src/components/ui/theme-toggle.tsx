"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("signal-studio-theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const nextLight = saved ? saved === "light" : prefersLight;
    setLight(nextLight);
    document.documentElement.classList.toggle("light", nextLight);
  }, []);

  const toggle = () => {
    const nextLight = !light;
    setLight(nextLight);
    document.documentElement.classList.toggle("light", nextLight);
    window.localStorage.setItem("signal-studio-theme", nextLight ? "light" : "dark");
  };

  return <button type="button" onClick={toggle} aria-label={`Switch to ${light ? "dark" : "light"} mode`} title={`Switch to ${light ? "dark" : "light"} mode`} className="theme-toggle inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white light:border-slate-200 light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900">{light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}</button>;
}
