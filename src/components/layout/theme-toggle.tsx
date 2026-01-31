'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="relative w-14 h-8 rounded-full bg-secondary/50 border border-border/50 transition-colors hover:bg-secondary/80"
      aria-label="Toggle theme"
    >
      <span
        className={`absolute top-1 w-6 h-6 rounded-full bg-foreground flex items-center justify-center transition-all duration-300 ${
          isDark ? 'left-1' : 'left-7'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-background" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-background" />
        )}
      </span>
    </button>
  );
}
