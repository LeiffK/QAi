import type { ComponentType } from 'react';
import { create } from 'zustand';
import { PLANTS, LINES, BATCHES, SHIFTS, MAINTENANCE_EVENTS, type Batch } from '../data/mockData';
import { filterBatches, getDateRange } from '../utils/filterData';
import { buildBatchViewModel, type BatchViewModel } from '../utils/analysis';

export type TabId = 'dashboard' | 'plants' | 'insights' | 'alerts' | 'ranking' | 'traceability';
export type RoleKey = 'thomas' | 'sabine' | 'claudia';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export type InsightCategory = 'all' | 'quality' | 'production' | 'suppliers' | 'correlations';

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

export interface UserInfo {
  username: string;
  displayName: string;
  role: RoleKey;
  roleLabel: string;
}

interface RoleSettings {
  username: string;
  roleLabel: string;
  displayName: string;
  allowedTabs: TabId[];
  defaultTab: TabId;
  defaultFilters: Partial<Filters>;
  defaultSelectedPlantId?: string | null;
  defaultSelectedLineId?: string | null;
  defaultInsightsCategory?: InsightCategory;
}

interface RoleRuntimeDefaults {
  filters: Filters;
  selectedPlantId: string | null;
  selectedLineId: string | null;
  activeTab: TabId;
  insightsCategory: InsightCategory;
}

interface Store {
  user: UserInfo | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  allowedTabs: TabId[];
  currentRoleDefaults: RoleRuntimeDefaults | null;

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

  // Insights category
  activeInsightsCategory: InsightCategory;
  setActiveInsightsCategory: (category: InsightCategory) => void;

  // Highlighted items (for cross-highlighting)
  highlightedSupplier: string | null;
  setHighlightedSupplier: (supplierId: string | null) => void;

  highlightedLine: string | null;
  setHighlightedLine: (lineId: string | null) => void;

  // Drawer state
  drawerOpen: boolean;
  drawerContent: 'batch' | 'supplier' | null;
  drawerData: BatchViewModel | any;
  openDrawer: (content: 'batch' | 'supplier', data: any) => void;
  closeDrawer: () => void;

  chargeAnnotations: Record<
    string,
    {
      comment: string;
      status: 'offen' | 'in_pruefung' | 'geklaert' | 'zurueckgestellt';
      updatedAt: string;
    }
  >;
  setChargeAnnotation: (
    batchId: string,
    annotation: { comment: string; status: 'offen' | 'in_pruefung' | 'geklaert' | 'zurueckgestellt' }
  ) => void;

  // Active tab/section
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

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

const applyThemeClasses = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const { body } = document;

  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
  body.classList.toggle('dark', isDark);
  body.classList.toggle('light', !isDark);
};

const createBaseFilters = (): Filters => ({
  plantId: null,
  lineId: null,
  productId: null,
  shift: null,
  supplierId: null,
  timeRange: '30d',
  customStartDate: null,
  customEndDate: null,
  searchTerm: '',
});

const initialFilters = createBaseFilters();

const defaultPlantId = PLANTS[0]?.id ?? null;
const defaultLineId = defaultPlantId
  ? LINES.find((line) => line.plantId === defaultPlantId)?.id ?? null
  : null;
const defaultShift = SHIFTS[0] ?? null;

const ROLE_SETTINGS: Record<RoleKey, RoleSettings> = {
  thomas: {
    username: 'Thomas',
    displayName: 'Thomas',
    roleLabel: 'Produktion',
    allowedTabs: ['dashboard', 'plants', 'alerts', 'traceability'],
    defaultTab: 'dashboard',
    defaultFilters: {
      plantId: defaultPlantId,
      lineId: defaultLineId,
      shift: defaultShift,
      timeRange: '24h',
    },
    defaultSelectedPlantId: defaultPlantId,
    defaultSelectedLineId: defaultLineId,
    defaultInsightsCategory: 'production',
  },
  sabine: {
    username: 'Sabine',
    displayName: 'Sabine',
    roleLabel: 'QS Reporting',
    allowedTabs: ['dashboard', 'insights', 'alerts', 'ranking', 'traceability'],
    defaultTab: 'dashboard',
    defaultFilters: {
      timeRange: '7d',
    },
    defaultInsightsCategory: 'quality',
  },
  claudia: {
    username: 'Claudia',
    displayName: 'Claudia',
    roleLabel: 'Werksleitung',
    allowedTabs: ['dashboard', 'plants', 'ranking', 'insights'],
    defaultTab: 'dashboard',
    defaultFilters: {
      timeRange: '30d',
      plantId: null,
      lineId: null,
    },
    defaultInsightsCategory: 'all',
  },
};

const USER_ROLE_MAP: Record<string, RoleKey> = {
  thomas: 'thomas',
  sabine: 'sabine',
  claudia: 'claudia',
};

const defaultRoleDefaults: RoleRuntimeDefaults = {
  filters: initialFilters,
  selectedPlantId: null,
  selectedLineId: null,
  insightsCategory: 'all',
  activeTab: 'dashboard',
};

const enrichBatch = (batch: Batch): BatchViewModel => buildBatchViewModel(batch);

if (typeof document !== 'undefined') {
  applyThemeClasses(true);
}

export const useStore = create<Store>((set) => ({
  user: null,
  allowedTabs: ['dashboard', 'plants', 'insights', 'alerts', 'ranking', 'traceability'],
  currentRoleDefaults: defaultRoleDefaults,

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
    set((state) => {
      const updatedFilters = { ...state.filters, [key]: value };
      return { filters: updatedFilters };
    }),
  resetFilters: () =>
    set((state) => {
      const defaults = state.currentRoleDefaults ?? defaultRoleDefaults;
      return {
        filters: { ...defaults.filters },
        selectedPlantId: defaults.selectedPlantId,
        selectedLineId: defaults.selectedLineId,
        brushSelection: { startDate: null, endDate: null },
      };
    }),

  // Brush selection
  brushSelection: { startDate: null, endDate: null },
  setBrushSelection: (selection) => set({ brushSelection: selection }),

  // Insights category
  activeInsightsCategory: 'all',
  setActiveInsightsCategory: (category) => set({ activeInsightsCategory: category }),

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
    set((state) => {
      let payload: any = data;

      if (content === 'batch') {
        payload = enrichBatch(data as Batch);
        const annotation = state.chargeAnnotations[payload.id];
        if (annotation) {
          payload.annotation = annotation;
        }
      }

      return { drawerOpen: true, drawerContent: content, drawerData: payload };
    }),
  closeDrawer: () => set({ drawerOpen: false, drawerContent: null, drawerData: null }),

  chargeAnnotations: {},
  setChargeAnnotation: (batchId, annotation) =>
    set((state) => ({
      chargeAnnotations: {
        ...state.chargeAnnotations,
        [batchId]: { ...annotation, updatedAt: new Date().toISOString() },
      },
      drawerData:
        state.drawerData && state.drawerData.id === batchId
          ? { ...state.drawerData, annotation: { ...annotation, updatedAt: new Date().toISOString() } }
          : state.drawerData,
    })),

  // Active tab
  activeTab: 'dashboard',
  setActiveTab: (tab) =>
    set((state) => {
      if (state.user && !state.allowedTabs.includes(tab)) {
        return {};
      }
      return { activeTab: tab };
    }),

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

  // Auth
  login: (username, password) => {
    const normalized = username.trim().toLowerCase();
    const role = USER_ROLE_MAP[normalized];
    if (!role) {
      return { success: false, error: 'Unbekannter Benutzer' };
    }

    if (password.trim() !== 'demo') {
      return { success: false, error: 'Ungültiges Passwort' };
    }

    const config = ROLE_SETTINGS[role];
    const baseFilters = createBaseFilters();
    const mergedFilters: Filters = { ...baseFilters, ...config.defaultFilters };

    const defaults: RoleRuntimeDefaults = {
      filters: mergedFilters,
      selectedPlantId:
        config.defaultSelectedPlantId !== undefined
          ? config.defaultSelectedPlantId
          : mergedFilters.plantId,
      selectedLineId:
        config.defaultSelectedLineId !== undefined
          ? config.defaultSelectedLineId
          : mergedFilters.lineId,
      insightsCategory: config.defaultInsightsCategory ?? 'all',
      activeTab: config.defaultTab,
    };

    set({
      user: {
        username: config.username,
        displayName: config.displayName,
        role,
        roleLabel: config.roleLabel,
      },
      allowedTabs: config.allowedTabs,
      filters: mergedFilters,
      activeTab: config.defaultTab,
      selectedPlantId: defaults.selectedPlantId ?? null,
      selectedLineId: defaults.selectedLineId ?? null,
      activeInsightsCategory: defaults.insightsCategory,
      brushSelection: { startDate: null, endDate: null },
      comparisonLineIds: [],
      breadcrumbs: [],
      currentRoleDefaults: defaults,
    });

    return { success: true };
  },
  logout: () =>
    set({
      user: null,
      filters: initialFilters,
      activeTab: 'dashboard',
      allowedTabs: ['dashboard', 'plants', 'insights', 'alerts', 'ranking', 'traceability'],
      selectedPlantId: null,
      selectedLineId: null,
      activeInsightsCategory: 'all',
      brushSelection: { startDate: null, endDate: null },
      comparisonLineIds: [],
      breadcrumbs: [],
      currentRoleDefaults: defaultRoleDefaults,
      drawerOpen: false,
      drawerContent: null,
      drawerData: null,
    }),
}));

// Selectors & helpers
export const selectRole = () => useStore.getState().user?.role ?? null;
export const selectFilters = () => useStore.getState().filters;
export const selectBatchesForActiveFilters = () => {
  const { filters, brushSelection } = useStore.getState();
  return filterBatches(BATCHES, filters, brushSelection);
};

export const selectShiftCockpitMetrics = () => {
  const state = useStore.getState();
  const batches = filterBatches(BATCHES, state.filters, state.brushSelection);

  const total = batches.length;
  const defectRate =
    total > 0 ? batches.reduce((sum, batch) => sum + batch.defectRate, 0) / total : 0;
  const fpy = total > 0 ? batches.reduce((sum, batch) => sum + batch.fpy, 0) / total : 0;
  const scrapRate =
    total > 0 ? batches.reduce((sum, batch) => sum + batch.scrapRate, 0) / total : 0;
  const coverage =
    total > 0
      ? (batches.filter((batch) => batch.fpy >= 95).length / total) * 100
      : 0;
  const activeAlarms = batches.filter((batch) => batch.defectRate > 5).length;

  return {
    defectRate: Number(defectRate.toFixed(2)),
    fpy: Number(fpy.toFixed(1)),
    scrapRate: Number(scrapRate.toFixed(2)),
    coverage: Number(coverage.toFixed(1)),
    activeAlarms,
  };
};

export const selectMaintenanceEventsForFilters = () => {
  const { filters } = useStore.getState();
  const dateRange = getDateRange(filters.timeRange, filters.customStartDate, filters.customEndDate);
  return MAINTENANCE_EVENTS.filter(
    (event) =>
      event.timestamp >= dateRange.start &&
      event.timestamp <= dateRange.end &&
      (!filters.lineId || event.lineId === filters.lineId)
  );
};


