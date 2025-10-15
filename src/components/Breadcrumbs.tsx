import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { PLANTS } from '../data/mockData';
import { LayoutDashboard, Factory, BarChart3, Search, AlertTriangle, Trophy } from 'lucide-react';

export const Breadcrumbs = () => {
  const { breadcrumbs, setBreadcrumbs, selectedPlantId, setSelectedPlantId, activeTab, setActiveTab } = useStore();

  useEffect(() => {
    const crumbs: Array<{ label: string; icon?: any; action: () => void }> = [];

    // Always start with current tab
    if (activeTab === 'dashboard') {
      crumbs.push({
        label: 'Dashboard',
        icon: LayoutDashboard,
        action: () => setActiveTab('dashboard'),
      });
    } else if (activeTab === 'plants') {
      crumbs.push({
        label: 'Werke',
        icon: Factory,
        action: () => {
          setSelectedPlantId(null);
          setActiveTab('plants');
        },
      });

      if (selectedPlantId) {
        const plant = PLANTS.find((p) => p.id === selectedPlantId);
        if (plant) {
          crumbs.push({
            label: plant.name,
            action: () => {}, // Current page, no action
          });
        }
      }
    } else if (activeTab === 'insights') {
      crumbs.push({
        label: 'Insights',
        icon: BarChart3,
        action: () => setActiveTab('insights'),
      });
    } else if (activeTab === 'traceability') {
      crumbs.push({
        label: 'Traceability',
        icon: Search,
        action: () => setActiveTab('traceability'),
      });
    } else if (activeTab === 'alerts') {
      crumbs.push({
        label: 'Alarme',
        icon: AlertTriangle,
        action: () => setActiveTab('alerts'),
      });
    } else if (activeTab === 'ranking') {
      crumbs.push({
        label: 'Ranking',
        icon: Trophy,
        action: () => setActiveTab('ranking'),
      });
    }

    setBreadcrumbs(crumbs);
  }, [activeTab, selectedPlantId, setSelectedPlantId, setActiveTab, setBreadcrumbs]);

  if (breadcrumbs.length === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => {
        const Icon = crumb.icon;
        return (
          <div key={index} className="flex items-center gap-2">
            <button
              onClick={crumb.action}
              className={`
                flex items-center gap-1 transition-colors
                ${
                  index === breadcrumbs.length - 1
                    ? 'text-primary-400 font-medium cursor-default'
                    : 'text-dark-muted hover:text-dark-text cursor-pointer'
                }
              `}
              disabled={index === breadcrumbs.length - 1}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{crumb.label}</span>
            </button>
            {index < breadcrumbs.length - 1 && (
              <span className="text-dark-muted">›</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
