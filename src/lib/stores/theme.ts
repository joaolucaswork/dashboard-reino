import { writable, derived } from "svelte/store";
import { browser } from "$app/environment";

// =====================================================================
// Types
// =====================================================================

export type Theme = "light" | "dark";

// =====================================================================
// Constants
// =====================================================================

const THEME_STORAGE_KEY = "dashboard-reino-theme";
const DEFAULT_THEME: Theme = "dark";

// =====================================================================
// Helper Functions
// =====================================================================

/**
 * Load theme preference from localStorage
 */
function loadThemeFromStorage(): Theme {
  if (!browser) return DEFAULT_THEME;

  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" ? "light" : "dark";
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Save theme preference to localStorage
 */
function saveThemeToStorage(theme: Theme): void {
  if (!browser) return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Silent failure if localStorage is not available
  }
}

/**
 * Apply theme to document
 */
function applyThemeToDocument(theme: Theme): void {
  if (!browser) return;

  const html = document.documentElement;
  const body = document.body;

  if (theme === "light") {
    html.classList.remove("dark");
    html.classList.add("light");
    body.classList.remove("dark");
    body.classList.add("light");
  } else {
    html.classList.remove("light");
    html.classList.add("dark");
    body.classList.remove("light");
    body.classList.add("dark");
  }
}

// =====================================================================
// Theme Store
// =====================================================================

/**
 * Create theme store with persistence and document updates
 */
function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(loadThemeFromStorage());

  return {
    subscribe,
    /**
     * Set theme and persist to localStorage
     */
    setTheme: (theme: Theme) => {
      set(theme);
      saveThemeToStorage(theme);
      applyThemeToDocument(theme);
    },
    /**
     * Toggle between light and dark themes
     */
    toggleTheme: () => {
      update((currentTheme) => {
        const newTheme = currentTheme === "light" ? "dark" : "light";
        saveThemeToStorage(newTheme);
        applyThemeToDocument(newTheme);
        return newTheme;
      });
    },
    /**
     * Reset to default theme
     */
    resetTheme: () => {
      set(DEFAULT_THEME);
      saveThemeToStorage(DEFAULT_THEME);
      applyThemeToDocument(DEFAULT_THEME);
    },
    /**
     * Initialize theme on app load
     */
    initializeTheme: () => {
      const theme = loadThemeFromStorage();
      set(theme);
      applyThemeToDocument(theme);
    },
  };
}

export const themeStore = createThemeStore();

// =====================================================================
// Derived Stores
// =====================================================================

/**
 * Check if current theme is dark
 */
export const isDarkTheme = derived(themeStore, ($theme) => $theme === "dark");

/**
 * Check if current theme is light
 */
export const isLightTheme = derived(themeStore, ($theme) => $theme === "light");

/**
 * Get theme display name
 */
export const themeDisplayName = derived(themeStore, ($theme) => 
  $theme === "light" ? "Claro" : "Escuro"
);

// =====================================================================
// Initialization
// =====================================================================

// Initialize theme when store is imported
if (browser) {
  themeStore.initializeTheme();
}
