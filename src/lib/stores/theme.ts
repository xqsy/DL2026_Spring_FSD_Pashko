import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type AppTheme = 'dark' | 'light';

const STORAGE_KEY = 'geohoot-theme';

function getInitialTheme(): AppTheme {
  if (!browser) return 'dark';

  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: AppTheme) {
  if (!browser) return;

  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

function createThemeStore() {
  const initialTheme = getInitialTheme();
  const { subscribe, set, update } = writable<AppTheme>(initialTheme);

  if (browser) {
    applyTheme(initialTheme);
  }

  return {
    subscribe,
    setTheme: (theme: AppTheme) => {
      applyTheme(theme);
      set(theme);
    },
    toggleTheme: () =>
      update((theme) => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        return nextTheme;
      }),
  };
}

export const theme = createThemeStore();
