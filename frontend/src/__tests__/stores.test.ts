import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { usePageStore } from "@/stores/pageStore";

describe("Zustand Stores", () => {
  describe("useAppStore", () => {
    beforeEach(() => {
      // Reset store to initial state
      useAppStore.setState({
        theme: "system",
        isSidebarOpen: true,
        isLoading: false,
      });
    });

    it("should initialize with default values", () => {
      const state = useAppStore.getState();
      expect(state.theme).toBe("system");
      expect(state.isSidebarOpen).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("should toggle sidebar state", () => {
      const { toggleSidebar } = useAppStore.getState();

      expect(useAppStore.getState().isSidebarOpen).toBe(true);
      toggleSidebar();
      expect(useAppStore.getState().isSidebarOpen).toBe(false);
      toggleSidebar();
      expect(useAppStore.getState().isSidebarOpen).toBe(true);
    });

    it("should set sidebar open state", () => {
      const { setSidebarOpen } = useAppStore.getState();

      setSidebarOpen(false);
      expect(useAppStore.getState().isSidebarOpen).toBe(false);
      setSidebarOpen(true);
      expect(useAppStore.getState().isSidebarOpen).toBe(true);
    });

    it("should set loading state", () => {
      const { setLoading } = useAppStore.getState();

      setLoading(true);
      expect(useAppStore.getState().isLoading).toBe(true);
      setLoading(false);
      expect(useAppStore.getState().isLoading).toBe(false);
    });
  });

  describe("useAuthStore", () => {
    beforeEach(() => {
      // Reset store to initial state
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });
    });

    it("should initialize with default values", () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
    });

    it("should login user correctly", () => {
      const { login } = useAuthStore.getState();
      const testUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
      };

      login(testUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(testUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("should logout user correctly", () => {
      const { login, logout } = useAuthStore.getState();
      const testUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
      };

      login(testUser);
      logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("should set user correctly", () => {
      const { setUser } = useAuthStore.getState();
      const testUser = {
        id: "2",
        email: "another@example.com",
        name: "Another User",
        avatarUrl: "https://example.com/avatar.jpg",
      };

      setUser(testUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(testUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should set auth loading state", () => {
      const { setAuthLoading } = useAuthStore.getState();

      setAuthLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
      setAuthLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });

  describe("useWorkspaceStore", () => {
    const testWorkspace = {
      id: "ws-1",
      name: "Test Workspace",
      ownerId: "user-1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };

    beforeEach(() => {
      // Reset store to initial state
      useWorkspaceStore.setState({
        workspaces: [],
        currentWorkspace: null,
        isLoading: false,
      });
    });

    it("should initialize with default values", () => {
      const state = useWorkspaceStore.getState();
      expect(state.workspaces).toEqual([]);
      expect(state.currentWorkspace).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it("should add workspace", () => {
      const { addWorkspace } = useWorkspaceStore.getState();

      addWorkspace(testWorkspace);

      const state = useWorkspaceStore.getState();
      expect(state.workspaces).toHaveLength(1);
      expect(state.workspaces[0]).toEqual(testWorkspace);
    });

    it("should set workspaces", () => {
      const { setWorkspaces } = useWorkspaceStore.getState();
      const workspaces = [testWorkspace];

      setWorkspaces(workspaces);

      expect(useWorkspaceStore.getState().workspaces).toEqual(workspaces);
    });

    it("should update workspace", () => {
      const { addWorkspace, updateWorkspace } = useWorkspaceStore.getState();

      addWorkspace(testWorkspace);
      updateWorkspace("ws-1", { name: "Updated Workspace" });

      const state = useWorkspaceStore.getState();
      expect(state.workspaces[0].name).toBe("Updated Workspace");
    });

    it("should remove workspace", () => {
      const { addWorkspace, removeWorkspace } = useWorkspaceStore.getState();

      addWorkspace(testWorkspace);
      expect(useWorkspaceStore.getState().workspaces).toHaveLength(1);

      removeWorkspace("ws-1");
      expect(useWorkspaceStore.getState().workspaces).toHaveLength(0);
    });

    it("should set current workspace", () => {
      const { setCurrentWorkspace } = useWorkspaceStore.getState();

      setCurrentWorkspace(testWorkspace);

      expect(useWorkspaceStore.getState().currentWorkspace).toEqual(
        testWorkspace
      );
    });

    it("should set workspace loading state", () => {
      const { setWorkspaceLoading } = useWorkspaceStore.getState();

      setWorkspaceLoading(true);
      expect(useWorkspaceStore.getState().isLoading).toBe(true);
      setWorkspaceLoading(false);
      expect(useWorkspaceStore.getState().isLoading).toBe(false);
    });
  });

  describe("usePageStore", () => {
    const testPage = {
      id: "page-1",
      title: "Test Page",
      content: [{ type: "paragraph", children: [{ text: "Hello" }] }],
      workspaceId: "ws-1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      isArchived: false,
      isFavorite: false,
    };

    beforeEach(() => {
      // Reset store to initial state
      usePageStore.setState({
        pages: [],
        currentPage: null,
        expandedPages: new Set(),
        isLoading: false,
      });
    });

    it("should initialize with default values", () => {
      const state = usePageStore.getState();
      expect(state.pages).toEqual([]);
      expect(state.currentPage).toBeNull();
      expect(state.expandedPages.size).toBe(0);
      expect(state.isLoading).toBe(false);
    });

    it("should add page", () => {
      const { addPage } = usePageStore.getState();

      addPage(testPage);

      const state = usePageStore.getState();
      expect(state.pages).toHaveLength(1);
      expect(state.pages[0]).toEqual(testPage);
    });

    it("should set pages", () => {
      const { setPages } = usePageStore.getState();
      const pages = [testPage];

      setPages(pages);

      expect(usePageStore.getState().pages).toEqual(pages);
    });

    it("should update page", () => {
      const { addPage, updatePage } = usePageStore.getState();

      addPage(testPage);
      updatePage("page-1", { title: "Updated Title" });

      const state = usePageStore.getState();
      expect(state.pages[0].title).toBe("Updated Title");
    });

    it("should remove page", () => {
      const { addPage, removePage } = usePageStore.getState();

      addPage(testPage);
      expect(usePageStore.getState().pages).toHaveLength(1);

      removePage("page-1");
      expect(usePageStore.getState().pages).toHaveLength(0);
    });

    it("should set current page", () => {
      const { setCurrentPage } = usePageStore.getState();

      setCurrentPage(testPage);

      expect(usePageStore.getState().currentPage).toEqual(testPage);
    });

    it("should toggle expanded pages", () => {
      const { toggleExpanded } = usePageStore.getState();

      toggleExpanded("page-1");
      expect(usePageStore.getState().expandedPages.has("page-1")).toBe(true);

      toggleExpanded("page-1");
      expect(usePageStore.getState().expandedPages.has("page-1")).toBe(false);
    });

    it("should set page loading state", () => {
      const { setPageLoading } = usePageStore.getState();

      setPageLoading(true);
      expect(usePageStore.getState().isLoading).toBe(true);
      setPageLoading(false);
      expect(usePageStore.getState().isLoading).toBe(false);
    });
  });
});
