import { useEffect } from 'react';
import { useStore, type BreadcrumbItem } from '../store/useStore';
import { PLANTS } from '../data/mockData';
import { LayoutDashboard, Factory, BarChart3, Search, AlertTriangle, Trophy } from 'lucide-react';

export const Breadcrumbs = () => {
  const {
    breadcrumbs,
    setBreadcrumbs,
    selectedPlantId,
    setSelectedPlantId,
    activeTab,
    setActiveTab,
  } = useStore();

  useEffect(() => {
    const crumbs: BreadcrumbItem[] = [];

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
        const plant = PLANTS.find((plant) => plant.id === selectedPlantId);
        if (plant) {
          crumbs.push({
            label: plant.name,
            action: () => {},
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

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Brotkrumen" className="flex items-center gap-2 text-xs text-dark-muted">
      {breadcrumbs.map((crumb, index) => {
        const Icon = crumb.icon;
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {isLast ? (
              <span className="flex items-center gap-1 font-medium tracking-wide text-primary-200">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{crumb.label}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={crumb.action}
                className="flex items-center gap-1 rounded-lg px-2 py-1 transition-colors hover:text-primary-100"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span className="tracking-wide">{crumb.label}</span>
              </button>
            )}
            {!isLast && <span className="text-dark-muted/70">›</span>}
          </div>
        );
      })}
    </nav>
  );
};
