import { useStore } from '../store/useStore';

export const TopBar = () => {
  const { isDarkMode, toggleTheme, filters, setFilter } = useStore();

  return (
    <div className="card mb-6 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary-400">
            QAI – Quality Assurance Intelligence
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-muted">Zeitraum:</span>
            <select
              className="select text-sm"
              value={filters.timeRange}
              onChange={(e) => setFilter('timeRange', e.target.value as any)}
            >
              <option value="24h">Letzte 24 Stunden</option>
              <option value="7d">Letzte 7 Tage</option>
              <option value="30d">Letzte 30 Tage</option>
              <option value="custom">Benutzerdefiniert</option>
            </select>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Suchen..."
            className="input text-sm w-48"
            value={filters.searchTerm}
            onChange={(e) => setFilter('searchTerm', e.target.value)}
          />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary text-sm"
            aria-label="Toggle theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </div>
  );
};
