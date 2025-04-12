import { create } from "zustand";

type SidebarState = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: JSON.parse(localStorage.getItem("sidebarOpen") || "false"),
  toggleSidebar: () =>
    set((state) => {
      const newState = !state.isOpen;
      localStorage.setItem("sidebarOpen", JSON.stringify(newState));
      return { isOpen: newState };
    }),
}));
