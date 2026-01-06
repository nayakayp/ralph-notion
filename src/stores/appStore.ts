import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface AppState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Theme
        theme: "system",
        setTheme: (theme) => {
          set({ theme });
          // Apply theme to document
          const root = document.documentElement;
          root.classList.remove("light", "dark");
          if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
              .matches
              ? "dark"
              : "light";
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        },

        // Sidebar
        isSidebarOpen: true,
        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        setSidebarOpen: (open) => set({ isSidebarOpen: open }),

        // Loading
        isLoading: false,
        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: "app-storage",
        partialize: (state) => ({
          theme: state.theme,
          isSidebarOpen: state.isSidebarOpen,
        }),
      }
    ),
    { name: "AppStore" }
  )
);
