import { useStore } from '../store/useStore';
import { LayoutDashboard, Factory, BarChart3, AlertTriangle, Trophy, Search } from 'lucide-react';

export const Navigation = () => {
  const { activeTab, setActiveTab } = useStore();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plants', label: 'Werke', icon: Factory },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'alerts', label: 'Alarme', icon: AlertTriangle },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
    { id: 'traceability', label: 'Traceability', icon: Search },
  ];

  return (
    <div className="card mb-6">
      <div className="flex border-b border-dark-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 font-medium transition-all
                ${
                  activeTab === tab.id
                    ? 'text-primary-400 border-b-2 border-primary-400 bg-primary-900/10'
                    : 'text-dark-muted hover:text-dark-text hover:bg-dark-border/30'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
