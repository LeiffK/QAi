import { useStore } from '../store/useStore';
import { PLANTS, LINES, PRODUCTS, SHIFTS, SUPPLIERS } from '../data/mockData';

export const FilterBar = () => {
  const { filters, setFilter, resetFilters, accessiblePlantIds } = useStore((state) => ({
    filters: state.filters,
    setFilter: state.setFilter,
    resetFilters: state.resetFilters,
    accessiblePlantIds: state.accessiblePlantIds,
  }));

  const plantOptions =
    accessiblePlantIds && accessiblePlantIds.length > 0
      ? PLANTS.filter((plant) => accessiblePlantIds.includes(plant.id))
      : PLANTS;

  const scopedLines =
    accessiblePlantIds && accessiblePlantIds.length > 0
      ? LINES.filter((line) => accessiblePlantIds.includes(line.plantId))
      : LINES;

  const availableLines = filters.plantId
    ? scopedLines.filter((line) => line.plantId === filters.plantId)
    : scopedLines;

  const plantSelectValue =
    filters.plantId ?? (plantOptions.length === 1 ? plantOptions[0].id : '');
  const showAllPlantsOption = !accessiblePlantIds || accessiblePlantIds.length > 1;

  return (
    <div className="rounded-2xl border border-dark-border/70 bg-dark-surface/80 px-5 py-4 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.8)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs uppercase tracking-[0.35em] text-dark-muted">Filtermatrix</span>
        <button
          onClick={resetFilters}
          className="btn btn-secondary h-10 rounded-xl border-dark-border/60 bg-dark-bg/60 px-4 text-xs font-semibold uppercase tracking-wide text-dark-muted transition-all hover:border-primary-400 hover:bg-primary-900/20 hover:text-primary-100"
        >
          Zurücksetzen
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <label className="flex flex-col gap-1 text-dark-muted">
          <span className="text-[11px] uppercase tracking-[0.25em] whitespace-nowrap">Werk</span>
          <select
            className="select h-11 rounded-xl border-dark-border/70 bg-dark-bg/70 text-sm"
            value={plantSelectValue}
            onChange={(event) => setFilter('plantId', event.target.value || null)}
            disabled={plantOptions.length <= 1}
          >
            {showAllPlantsOption && <option value="">Alle Werke</option>}
            {plantOptions.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-dark-muted">
          <span className="text-[11px] uppercase tracking-[0.25em] whitespace-nowrap">Linie</span>
          <select
            className="select h-11 rounded-xl border-dark-border/70 bg-dark-bg/70 text-sm"
            value={filters.lineId || ''}
            onChange={(event) => setFilter('lineId', event.target.value || null)}
            disabled={!filters.plantId && availableLines.length > 4}
          >
            <option value="">Alle Linien</option>
            {availableLines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-dark-muted">
          <span className="text-[11px] uppercase tracking-[0.25em] whitespace-nowrap">Produkt</span>
          <select
            className="select h-11 rounded-xl border-dark-border/70 bg-dark-bg/70 text-sm"
            value={filters.productId || ''}
            onChange={(event) => setFilter('productId', event.target.value || null)}
          >
            <option value="">Alle Produkte</option>
            {PRODUCTS.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-dark-muted">
          <span className="text-[11px] uppercase tracking-[0.25em] whitespace-nowrap">Schicht</span>
          <select
            className="select h-11 rounded-xl border-dark-border/70 bg-dark-bg/70 text-sm"
            value={filters.shift || ''}
            onChange={(event) => setFilter('shift', event.target.value || null)}
          >
            <option value="">Alle Schichten</option>
            {SHIFTS.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-dark-muted">
          <span className="text-[11px] uppercase tracking-[0.25em] whitespace-nowrap">Lieferant</span>
          <select
            className="select h-11 rounded-xl border-dark-border/70 bg-dark-bg/70 text-sm"
            value={filters.supplierId || ''}
            onChange={(event) => setFilter('supplierId', event.target.value || null)}
          >
            <option value="">Alle Lieferanten</option>
            {SUPPLIERS.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

