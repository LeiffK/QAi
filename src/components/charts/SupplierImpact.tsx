import { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Scatter, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { useStore } from '../../store/useStore';
import { SUPPLIER_IMPACT_DATA } from '../../data/mockData';

export const SupplierImpact = () => {
  const { setFilter, highlightedSupplier, setHighlightedSupplier } = useStore();

  const chartData = useMemo(() => {
    return SUPPLIER_IMPACT_DATA.map((d) => ({
      supplier: d.supplier,
      supplierId: d.supplierId,
      median: d.medianDefectRate,
      lots: d.lots,
    }));
  }, []);

  const handleBarClick = (data: any) => {
    setFilter('supplierId', data.supplierId);
    // Scroll to supplier detail (could be implemented)
  };

  return (
    <div className="card p-5" id="supplier-impact">
      <h3 className="text-lg font-semibold mb-4">Lieferanten-Impact</h3>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            layout="vertical"
          >
            <XAxis
              type="number"
              stroke="#9ca3af"
              label={{ value: 'Fehlerrate (%)', position: 'bottom', style: { fill: '#9ca3af' } }}
              domain={[0, 'auto']}
            />
            <YAxis
              type="category"
              dataKey="supplier"
              stroke="#9ca3af"
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#131827',
                border: '1px solid #1f2937',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#e5e7eb' }}
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 shadow-lg">
                      <div className="text-sm font-medium text-dark-text">{data.supplier}</div>
                      <div className="text-sm text-primary-400">Median: {data.median.toFixed(2)}%</div>
                      <div className="text-sm text-dark-muted">{data.lots.length} Lots</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />

            {/* Median bars */}
            <Bar
              dataKey="median"
              name="Median Fehlerrate"
              fill="#3b82f6"
              onClick={handleBarClick}
              onMouseEnter={(data) => setHighlightedSupplier(data.supplierId)}
              onMouseLeave={() => setHighlightedSupplier(null)}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    highlightedSupplier === entry.supplierId
                      ? '#60a5fa'
                      : entry.supplierId === 'S4'
                      ? '#ef4444'
                      : '#3b82f6'
                  }
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-dark-muted">
        💡 <strong>Erkenntnis:</strong> Lieferant X zeigt deutlich höhere Fehlerrate (rot markiert). Klicken filtert.
      </div>
    </div>
  );
};
