import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Keys for the columns array from CoderDashboard
const ALL_COLUMN_KEYS = [
  "checkbox", "Worklist", "SNo", "Client", "Location", "Specialty",
  "chart_no", "DateOfService", "OriginalCoder", "FollowUpCoder",
  "OriginalAuditor", "AllocatedUser", "Status", "Milestone",
  "qc_status", "Process", "ReceivedDate", "SubSpecialty",
  "date_of_coder_allocation", "date_of_auditor_allocation",
];

export const useChartsStore = create(
  persist(
    (set, get) => ({
      // --- Chart navigation (not persisted, set at runtime) ---
      chartIds: [],         // ordered array of chart IDs from the last fetch
      firstId: null,
      lastId: null,

      setChartIds: (ids) => set({
        chartIds: ids,
        firstId: ids.length > 0 ? ids[0] : null,
        lastId: ids.length > 0 ? ids[ids.length - 1] : null,
      }),

      // Get prev/next ID relative to a given ID
      getPrevId: (currentId) => {
        const { chartIds } = get();
        const idx = chartIds.indexOf(currentId);
        return idx > 0 ? chartIds[idx - 1] : null;
      },

      getNextId: (currentId) => {
        const { chartIds } = get();
        const idx = chartIds.indexOf(currentId);
        return idx >= 0 && idx < chartIds.length - 1 ? chartIds[idx + 1] : null;
      },

      // --- User preferences (persisted to localStorage) ---
      activeTab: "Critical",
      pageSize: 10,
      visibleColumns: ALL_COLUMN_KEYS, // stored as array for JSON serialization
      sidebarCollapsed: false,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setPageSize: (size) => set({ pageSize: size }),
      setVisibleColumns: (columns) => set({
        visibleColumns: Array.isArray(columns) ? columns : [...columns],
      }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'charts-preferences',
      // Only persist user preferences, not runtime navigation state
      partialize: (state) => ({
        activeTab: state.activeTab,
        pageSize: state.pageSize,
        visibleColumns: state.visibleColumns,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
