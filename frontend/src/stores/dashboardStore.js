import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useDashboardStore = create(
    persist(
        (set, get) => ({
            // State
            stats: null,
            recentBookings: [],
            user: null,
            lastUpdated: null,
            loading: false,
            error: null,

            // Actions
            fetchStats: async (showLoading = true) => {
                if (showLoading) set({ loading: true });
                try {
                    console.log('[DashboardStore] Fetching stats...');
                    const response = await api.get('/users/stats');
                    console.log('[DashboardStore] Raw API response:', response);
                    console.log('[DashboardStore] response.data:', response.data);
                    const data = response.data.data;
                    console.log('[DashboardStore] Parsed data:', data);
                    console.log('[DashboardStore] Stats object:', data?.stats);
                    set({
                        stats: data.stats,
                        recentBookings: data.recentBookings || [],
                        user: data.user,
                        lastUpdated: data.lastUpdated || new Date().toISOString(),
                        loading: false,
                        error: null,
                    });
                    return data;
                } catch (error) {
                    console.error('[DashboardStore] Fetch error:', error);
                    console.error('[DashboardStore] Error response:', error.response?.data);
                    set({
                        error: error.message,
                        loading: false
                    });
                    throw error;
                }
            },

            // Refresh without loading state (for polling)
            refreshStats: async () => {
                try {
                    const response = await api.get('/users/stats');
                    const data = response.data.data;
                    set({
                        stats: data.stats,
                        recentBookings: data.recentBookings || [],
                        user: data.user,
                        lastUpdated: data.lastUpdated || new Date().toISOString(),
                    });
                    return data;
                } catch (error) {
                    console.error('Failed to refresh stats:', error);
                }
            },

            // Clear store
            clearStats: () => {
                set({
                    stats: null,
                    recentBookings: [],
                    user: null,
                    lastUpdated: null,
                    loading: false,
                    error: null,
                });
            },

            // Selectors
            getStatValue: (key) => get().stats?.[key] || 0,
            isLoading: () => get().loading,
            getTimeAgo: () => {
                const lastUpdated = get().lastUpdated;
                if (!lastUpdated) return '';
                const seconds = Math.floor((new Date() - new Date(lastUpdated)) / 1000);
                if (seconds < 60) return `${seconds}s ago`;
                const minutes = Math.floor(seconds / 60);
                if (minutes < 60) return `${minutes}m ago`;
                const hours = Math.floor(minutes / 60);
                return `${hours}h ago`;
            },
        }),
        {
            name: 'dashboard-storage',
            partialize: (state) => ({
                stats: state.stats,
                lastUpdated: state.lastUpdated,
            }),
        }
    )
);

export default useDashboardStore;
