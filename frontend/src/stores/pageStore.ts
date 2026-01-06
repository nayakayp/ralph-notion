import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Descendant } from "slate";

export interface Page {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  content: Descendant[];
  parentId?: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  isFavorite: boolean;
}

interface PageState {
  pages: Page[];
  currentPage: Page | null;
  expandedPages: Set<string>;
  isLoading: boolean;

  setPages: (pages: Page[]) => void;
  addPage: (page: Page) => void;
  updatePage: (id: string, updates: Partial<Page>) => void;
  removePage: (id: string) => void;
  setCurrentPage: (page: Page | null) => void;
  toggleExpanded: (pageId: string) => void;
  setPageLoading: (loading: boolean) => void;
}

export const usePageStore = create<PageState>()(
  devtools(
    (set) => ({
      pages: [],
      currentPage: null,
      expandedPages: new Set(),
      isLoading: false,

      setPages: (pages) => set({ pages }),

      addPage: (page) =>
        set((state) => ({
          pages: [...state.pages, page],
        })),

      updatePage: (id, updates) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id ? { ...page, ...updates, updatedAt: new Date() } : page
          ),
          currentPage:
            state.currentPage?.id === id
              ? { ...state.currentPage, ...updates, updatedAt: new Date() }
              : state.currentPage,
        })),

      removePage: (id) =>
        set((state) => ({
          pages: state.pages.filter((page) => page.id !== id),
          currentPage:
            state.currentPage?.id === id ? null : state.currentPage,
        })),

      setCurrentPage: (page) => set({ currentPage: page }),

      toggleExpanded: (pageId) =>
        set((state) => {
          const newExpanded = new Set(state.expandedPages);
          if (newExpanded.has(pageId)) {
            newExpanded.delete(pageId);
          } else {
            newExpanded.add(pageId);
          }
          return { expandedPages: newExpanded };
        }),

      setPageLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "PageStore" }
  )
);
