"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolved: "light",
  setTheme: () => {},
});

const STORAGE_KEY = "relocategh-theme";

function getSystemPreference(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStorageSnapshot(): Theme {
  return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
}

function getServerSnapshot(): Theme {
  return "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToStorage,
    getStorageSnapshot,
    getServerSnapshot,
  );

  const resolved = theme === "system" ? getSystemPreference() : theme;

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const current =
        (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
      if (current === "system") {
        applyTheme(getSystemPreference());
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
