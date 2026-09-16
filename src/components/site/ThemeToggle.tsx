import React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle({ className = '' }: {className?: string;}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`rounded-lg border border-white/10 p-2 text-white/60 transition-colors duration-150 ease-out hover:text-white ${className}`}>

      {theme === 'dark' ?
      <SunIcon className="h-4 w-4" aria-hidden="true" /> :
      <MoonIcon className="h-4 w-4" aria-hidden="true" />
      }
    </button>);

}
