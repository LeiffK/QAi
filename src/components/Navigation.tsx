import { useStore } from '../store/useStore';
import {
  AlertTriangle,
  BarChart3,
  Factory,
  LayoutDashboard,
  Search,
  Trophy,
} from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'plants', label: 'Werke', icon: Factory },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'alerts', label: 'Alarme', icon: AlertTriangle },
  { id: 'ranking', label: 'Ranking', icon: Trophy },
  { id: 'traceability', label: 'Traceability', icon: Search },
] as const;

export const Navigation = () => {
  const { activeTab, setActiveTab, allowedTabs, user } = useStore((state) => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
    allowedTabs: state.allowedTabs,
    user: state.user,
  }));

  const visibleTabs = tabs.filter((tab) => allowedTabs.includes(tab.id));

  return (
    <nav className="sticky top-[7.5rem] flex max-h-[calc(100vh-8.5rem)] flex-col overflow-hidden rounded-2xl border border-dark-border/80 bg-dark-surface/80 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.8)]">
      <div className="px-6 pb-4 pt-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.3em] text-dark-muted">Navigation</span>
          {user && (
            <span className="text-[11px] uppercase tracking-[0.28em] text-primary-200">
              {user.displayName} Â· {user.roleLabel}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {visibleTabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              title={label}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-900/25 text-primary-100 shadow-inner'
                  : 'text-dark-muted hover:bg-dark-border/40 hover:text-primary-50'
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 h-8 -translate-y-1/2 rounded-r-full transition-all ${
                  isActive ? 'w-1 bg-primary-400' : 'w-0 bg-transparent group-hover:w-1 group-hover:bg-primary-600'
                }`}
              />
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-300' : 'text-dark-muted group-hover:text-primary-200'}`} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

