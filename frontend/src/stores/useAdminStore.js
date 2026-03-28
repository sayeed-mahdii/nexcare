import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
    persist(
        (set, get) => ({
            // UI State
            activeSidebar: 'dashboard',
            sidebarCollapsed: false,

            // Actions
            setActiveSidebar: (item) => set({ activeSidebar: item }),
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

            // Selectors
            getActiveSidebar: () => get().activeSidebar,
            isSidebarCollapsed: () => get().sidebarCollapsed,
        }),
        {
            name: 'admin-ui-storage',
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
            }),
        }
    )
);

export default useAdminStore;
