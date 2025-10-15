import type { ComponentType } from 'react';
import { create } from 'zustand';

export interface Filters {
  plantId: string | null;
  lineId: string | null;
  productId: string | null;
  shift: string | null;
  supplierId: string | null;
  timeRange: '24h' | '7d' | '30d' | 'custom';
  customStartDate: Date | null;
  customEndDate: Date | null;
  searchTerm: string;
}

export interface BrushSelection {
  startDate: Date | null;
  endDate: Date | null;
}

export interface BreadcrumbItem {
  label: string;
  action: () => void;
  icon?: ComponentType<{ className?: string }>;
}

const applyThemeClasses = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const { body } = document;

  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
  body.classList.toggle('dark', isDark);
  body.classList.toggle('light', !isDark);
};

interface Store {
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Filters
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;

  // Brush selection (for time series zoom)
  brushSelection: BrushSelection;
  setBrushSelection: (selection: BrushSelection) => void;

  // Highlighted items (for cross-highlighting)
  highlightedSupplier: string | null;
  setHighlightedSupplier: (supplierId: string | null) => void;

  highlightedLine: string | null;
  setHighlightedLine: (lineId: string | null) => void;

  // Drawer state
  drawerOpen: boolean;
  drawerContent: 'batch' | 'supplier' | null;
  drawerData: any;
  openDrawer: (content: 'batch' | 'supplier', data: any) => void;
  closeDrawer: () => void;

  // Active tab/section
  activeTab: string;
  setActiveTab: (tab: string) => void;

  activeSection: string;
  setActiveSection: (section: string) => void;

  // Selected plant/line for drill-down
  selectedPlantId: string | null;
  setSelectedPlantId: (plantId: string | null) => void;

  selectedLineId: string | null;
  setSelectedLineId: (lineId: string | null) => void;

  // Comparison mode
  comparisonLineIds: string[];
  toggleComparisonLine: (lineId: string) => void;
  clearComparison: () => void;

  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (crumbs: BreadcrumbItem[]) => void;
}

const initialFilters: Filters = {
  plantId: null,
  lineId: null,
  productId: null,
  shift: null,
  supplierId: null,
  timeRange: '30d',
  customStartDate: null,
  customEndDate: null,
  searchTerm: '',
};

if (typeof document !== 'undefined') {
  applyThemeClasses(true);
}

export const useStore = create<Store>((set) => ({
  // Theme
  isDarkMode: true,
  toggleTheme: () =>
    set((state) => {
      const newMode = !state.isDarkMode;
      applyThemeClasses(newMode);
      return { isDarkMode: newMode };
    }),

  // Filters
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: initialFilters }),

  // Brush selection
  brushSelection: { startDate: null, endDate: null },
  setBrushSelection: (selection) => set({ brushSelection: selection }),

  // Highlighted items
  highlightedSupplier: null,
  setHighlightedSupplier: (supplierId) => set({ highlightedSupplier: supplierId }),

  highlightedLine: null,
  setHighlightedLine: (lineId) => set({ highlightedLine: lineId }),

  // Drawer
  drawerOpen: false,
  drawerContent: null,
  drawerData: null,
  openDrawer: (content, data) =>
    set({ drawerOpen: true, drawerContent: content, drawerData: data }),
  closeDrawer: () =>
    set({ drawerOpen: false, drawerContent: null, drawerData: null }),

  // Active tab
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Active section
  activeSection: 'overview',
  setActiveSection: (section) => set({ activeSection: section }),

  // Selected plant/line
  selectedPlantId: null,
  setSelectedPlantId: (plantId) => set({ selectedPlantId: plantId }),

  selectedLineId: null,
  setSelectedLineId: (lineId) => set({ selectedLineId: lineId }),

  // Comparison mode
  comparisonLineIds: [],
  toggleComparisonLine: (lineId) =>
    set((state) => {
      const exists = state.comparisonLineIds.includes(lineId);
      return {
        comparisonLineIds: exists
          ? state.comparisonLineIds.filter((id) => id !== lineId)
          : [...state.comparisonLineIds, lineId],
      };
    }),
  clearComparison: () => set({ comparisonLineIds: [] }),

  // Breadcrumbs
  breadcrumbs: [],
  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
}));
