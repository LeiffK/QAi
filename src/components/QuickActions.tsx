import { useStore } from '../store/useStore';
import { AlertTriangle, Clock, Package, Trophy, RotateCcw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
  description: string;
}

export const QuickActions = () => {
  const { setActiveTab, resetFilters } = useStore();

  const actions: QuickAction[] = [
    {
      id: 'show-alerts',
      label: 'Alarme',
      icon: AlertTriangle,
      description: 'Alle kritischen Chargen anzeigen',
      action: () => {
        setActiveTab('alerts');
      },
    },
    {
      id: 'compare-shifts',
      label: 'Schichten',
      icon: Clock,
      description: 'Schicht-Performance vergleichen',
      action: () => {
        setActiveTab('insights');
      },
    },
    {
      id: 'supplier-hotspots',
      label: 'Lieferanten',
      icon: Package,
      description: 'Problematische Lieferanten identifizieren',
      action: () => {
        setActiveTab('insights');
      },
    },
    {
      id: 'top-performers',
      label: 'Top/Bottom',
      icon: Trophy,
      description: 'Beste und schlechteste Performance',
      action: () => {
        setActiveTab('ranking');
      },
    },
    {
      id: 'reset-all',
      label: 'Zurücksetzen',
      icon: RotateCcw,
      description: 'Alle Filter zurücksetzen',
      action: () => {
        resetFilters();
        setActiveTab('dashboard');
      },
    },
  ];

  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-dark-muted">Quick Actions:</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className="group relative flex items-center gap-2 px-4 py-2 bg-dark-border hover:bg-primary-600 text-dark-text hover:text-white rounded-lg transition-all font-medium text-sm"
              title={action.description}
            >
              <Icon className="w-4 h-4" />
              <span>{action.label}</span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-dark-surface border border-dark-border rounded-lg text-xs text-dark-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {action.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
