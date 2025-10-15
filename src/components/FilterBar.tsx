import { useStore } from '../store/useStore';
import { PLANTS, LINES, PRODUCTS, SHIFTS, SUPPLIERS } from '../data/mockData';

export const FilterBar = () => {
  const { filters, setFilter, resetFilters } = useStore();

  // Get lines for selected plant
  const availableLines = filters.plantId
    ? LINES.filter((l) => l.plantId === filters.plantId)
    : LINES;

  return (
    <div className="card mb-6 px-6 py-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium text-dark-muted">Filter:</span>

        {/* Plant */}
        <select
          className="select text-sm"
          value={filters.plantId || ''}
          onChange={(e) => setFilter('plantId', e.target.value || null)}
        >
          <option value="">Alle Werke</option>
          {PLANTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Line */}
        <select
          className="select text-sm"
          value={filters.lineId || ''}
          onChange={(e) => setFilter('lineId', e.target.value || null)}
          disabled={!filters.plantId && availableLines.length > 4}
        >
          <option value="">Alle Linien</option>
          {availableLines.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        {/* Product */}
        <select
          className="select text-sm"
          value={filters.productId || ''}
          onChange={(e) => setFilter('productId', e.target.value || null)}
        >
          <option value="">Alle Produkte</option>
          {PRODUCTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Shift */}
        <select
          className="select text-sm"
          value={filters.shift || ''}
          onChange={(e) => setFilter('shift', e.target.value || null)}
        >
          <option value="">Alle Schichten</option>
          {SHIFTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Supplier */}
        <select
          className="select text-sm"
          value={filters.supplierId || ''}
          onChange={(e) => setFilter('supplierId', e.target.value || null)}
        >
          <option value="">Alle Lieferanten</option>
          {SUPPLIERS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Reset Button */}
        <button onClick={resetFilters} className="btn btn-secondary text-sm ml-auto">
          Zurücksetzen
        </button>
      </div>
    </div>
  );
};
