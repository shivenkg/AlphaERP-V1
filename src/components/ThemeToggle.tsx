import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button' | 'pill';
  id?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  size = 'md',
  variant = 'icon',
  id = 'theme-toggle-btn',
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'px-3 py-2 text-sm',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  if (variant === 'pill') {
    return (
      <button
        id={id}
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        aria-pressed={isDark}
        title={`Toggle ${isDark ? 'Light' : 'Dark'} Mode (Ctrl+Shift+D)`}
        className={`relative inline-flex items-center h-7 w-13 rounded-full transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer ${
          isDark ? 'bg-indigo-600' : 'bg-slate-300'
        } ${className}`}
      >
        <span
          className={`inline-flex items-center justify-center h-5.5 w-5.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
            isDark ? 'translate-x-6.5 bg-slate-900 text-amber-400' : 'translate-x-0.5 text-slate-700'
          }`}
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={`Toggle ${isDark ? 'Light' : 'Dark'} Mode (Ctrl+Shift+D)`}
      className={`group relative flex items-center justify-center gap-2 rounded-xl border transition-all duration-200 cursor-pointer ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border-slate-700 hover:border-amber-500/40 shadow-xs'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-indigo-600 border-slate-200 hover:border-indigo-300 shadow-xs'
      } ${sizeClasses[size]} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun
            className={`${iconSizes[size]} transition-transform duration-300 group-hover:rotate-45 text-amber-400`}
          />
        ) : (
          <Moon
            className={`${iconSizes[size]} transition-transform duration-300 group-hover:-rotate-12 text-slate-700 group-hover:text-indigo-600`}
          />
        )}
      </div>

      {showLabel && (
        <span className="font-semibold capitalize text-xs tracking-wide">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
