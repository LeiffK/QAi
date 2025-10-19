import { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { useStore } from '../../store/useStore';
import { SUPPLIER_IMPACT_DATA } from '../../data/mockData';

interface SupplierLot {
  lotNumber: string;
  defectRate: number;
}

interface SupplierBar {
  supplier: string;
  supplierId: string;
  median: number;
  lots: SupplierLot[];
}

export const SupplierImpact = () => {
  const { setFilter, highlightedSupplier, setHighlightedSupplier } = useStore();

  const chartData = useMemo<SupplierBar[]>(
    () =>
      SUPPLIER_IMPACT_DATA.map((entry) => ({
        supplier: entry.supplier,
        supplierId: entry.supplierId,
        median: entry.medianDefectRate,
        lots: entry.lots,
      })),
    []
  );

  const handleBarClick = (data: SupplierBar) => {
    setFilter('supplierId', data.supplierId);
  };

  return (
    <div className="card p-5" id="supplier-impact">
      <h3 className="mb-4 text-lg font-semibold">Lieferanten-Impact</h3>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }} layout="vertical">
            <XAxis
              type="number"
              stroke="#94a3b8"
              label={{ value: 'Fehlerrate (%)', position: 'bottom', style: { fill: '#94a3b8' } }}
              domain={[0, 'auto']}
            />
            <YAxis type="category" dataKey="supplier" stroke="#94a3b8" width={140} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#101522',
                border: '1px solid rgba(148,163,184,0.35)',
                borderRadius: 12,
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'Median Fehlerrate']}
            />
            <Legend />

            <Bar
              dataKey="median"
              name="Median Fehlerrate"
              fill="#489cd0"
              onClick={handleBarClick}
              onMouseEnter={(data) => setHighlightedSupplier(data.supplierId)}
              onMouseLeave={() => setHighlightedSupplier(null)}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.supplierId}
                  fill={
                    highlightedSupplier === entry.supplierId
                      ? '#64bad9'
                      : entry.supplierId === 'S4'
                      ? '#306892'
                      : '#489cd0'
                  }
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-dark-muted">
        Hinweis: <strong>Lieferant X</strong> weist eine deutlich höhere Fehlerrate auf â€“ Auswahl setzt den Lieferantenfilter.
      </div>
    </div>
  );
};


