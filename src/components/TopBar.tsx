import { Moon, Sun } from 'lucide-react';
import { useStore } from '../store/useStore';

export const TopBar = () => {
  const { isDarkMode, toggleTheme, filters, setFilter, user, logout } = useStore((state) => ({
    isDarkMode: state.isDarkMode,
    toggleTheme: state.toggleTheme,
    filters: state.filters,
    setFilter: state.setFilter,
    user: state.user,
    logout: state.logout,
  }));

  return (
    <div className="flex items-center justify-between rounded-2xl border border-dark-border/80 bg-dark-surface/95 px-6 py-4 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.75)] backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-900/40 text-sm font-semibold tracking-[0.3em] text-primary-200">
          QAI
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-dark-muted">Quality Assurance Intelligence</span>
          <h1 className="text-lg font-semibold text-primary-300">Operational Control Center</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-dark-border/80 bg-dark-bg/60 px-3 py-2 shadow-inner">
          <span className="text-xs font-medium uppercase tracking-wide text-dark-muted">Zeitraum</span>
          <select
            className="select h-9 min-w-[150px] border-none bg-transparent px-0 text-sm text-dark-text focus:ring-0"
            value={filters.timeRange}
            onChange={(e) => setFilter('timeRange', e.target.value as typeof filters.timeRange)}
          >
            <option value="24h">Letzte 24 Stunden</option>
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="custom">Benutzerdefiniert</option>
          </select>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Suchen..."
            className="input h-12 w-48 rounded-xl border-dark-border/70 bg-dark-bg/60 pr-10 text-sm"
            value={filters.searchTerm}
            onChange={(e) => setFilter('searchTerm', e.target.value)}
          />
          <span className="pointer-events-none absolute right-3 text-xs uppercase tracking-wide text-dark-muted">Ctrl+K</span>
        </div>

        {user && (
          <div className="hidden items-center gap-3 rounded-xl border border-primary-500/40 bg-primary-900/20 px-4 py-2 text-xs text-primary-100 md:flex">
            <div className="flex flex-col leading-tight">
              <span className="font-semibold tracking-[0.25em] uppercase">{user.displayName}</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary-200/80">
                {user.roleLabel}
              </span>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-primary-600/60 px-3 py-1 text-[11px] uppercase tracking-[0.25em] transition-all hover:bg-primary-600 hover:text-white"
            >
              Logout
            </button>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="btn btn-secondary flex h-11 w-11 items-center justify-center rounded-xl border-dark-border/70 bg-dark-bg/70 text-primary-200 transition-all hover:border-primary-500 hover:bg-primary-900/30 hover:text-primary-100"
          aria-label="Theme wechseln"
        >
          {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

