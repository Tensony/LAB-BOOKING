import { create } from 'zustand';

const getInitialTheme = () => {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

const useThemeStore = create((set) => {
  const initial = getInitialTheme();
  applyTheme(initial);

  return {
    theme: initial,
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
        return { theme: next };
      }),
    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
      set({ theme });
    },
  };
});

export default useThemeStore;
