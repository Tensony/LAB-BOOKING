import { Moon, Sun } from 'lucide-react';
import useThemeStore from '../store/themeStore';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl text-slate-600 hover:bg-surface-100 dark:text-slate-300 dark:hover:bg-surface-800 transition-colors ${className}`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
