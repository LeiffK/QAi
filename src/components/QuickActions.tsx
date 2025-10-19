import { useStore } from '../store/useStore';
import { AlertTriangle, Clock, Package, RotateCcw, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type TabTarget = 'dashboard' | 'plants' | 'insights' | 'alerts' | 'ranking' | 'traceability';

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  requiresTab?: TabTarget;
  handler: () => void;
}

export const QuickActions = () => {
  const { setActiveTab, resetFilters, allowedTabs, setActiveInsightsCategory } = useStore(
    (state) => ({
      setActiveTab: state.setActiveTab,
      resetFilters: state.resetFilters,
      allowedTabs: state.allowedTabs,
      setActiveInsightsCategory: state.setActiveInsightsCategory,
    })
  );

  const actions: QuickAction[] = [
    {
      id: 'show-alerts',
      label: 'Alarme',
      icon: AlertTriangle,
      description: 'Alle kritischen Chargen anzeigen',
      requiresTab: 'alerts',
      handler: () => setActiveTab('alerts'),
    },
    {
      id: 'compare-shifts',
      label: 'Schichten',
      icon: Clock,
      description: 'Schicht-Performance vergleichen',
      requiresTab: 'insights',
      handler: () => {
        setActiveInsightsCategory('production');
        setActiveTab('insights');
      },
    },
    {
      id: 'supplier-hotspots',
      label: 'Lieferanten',
      icon: Package,
      description: 'Problematische Lieferanten identifizieren',
      requiresTab: 'insights',
      handler: () => {
        setActiveInsightsCategory('suppliers');
        setActiveTab('insights');
      },
    },
    {
      id: 'top-performers',
      label: 'Top/Bottom',
      icon: Trophy,
      description: 'Beste und schlechteste Performance',
      requiresTab: 'ranking',
      handler: () => setActiveTab('ranking'),
    },
    {
      id: 'reset-all',
      label: 'Zuruecksetzen',
      icon: RotateCcw,
      description: 'Alle Filter auf Rollen-Defaults setzen',
      handler: () => {
        resetFilters();
        setActiveTab('dashboard');
      },
    },
  ];

  const visibleActions = actions.filter(
    (action) => !action.requiresTab || allowedTabs.includes(action.requiresTab)
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dark-border/70 bg-dark-surface/80 px-5 py-4 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.8)]">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.35em] text-dark-muted">Quick Actions</span>
        <span className="text-[10px] uppercase tracking-[0.4em] text-dark-muted/70">
          Direktzugriff
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {visibleActions.map(({ id, label, icon: Icon, handler, description }) => (
          <button
            key={id}
            onClick={handler}
            title={description}
            className="group flex min-h-[48px] items-center gap-3 rounded-xl border border-transparent bg-dark-bg/60 px-4 py-2 text-sm font-semibold text-dark-text transition-all duration-200 hover:-translate-y-[1px] hover:border-primary-500 hover:bg-primary-900/20 hover:text-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Icon className="h-5 w-5 flex-shrink-0 text-primary-300 transition-transform duration-200 group-hover:scale-110" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

