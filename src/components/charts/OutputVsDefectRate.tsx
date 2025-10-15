import { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ZAxis } from 'recharts';
import { useStore } from '../../store/useStore';
import { BATCHES } from '../../data/mockData';
import { filterBatches } from '../../utils/filterData';

export const OutputVsDefectRate = () => {
  const { filters, brushSelection } = useStore();

  const chartData = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    return filtered.map((batch) => ({
      output: batch.output,
      defectRate: batch.defectRate,
      id: batch.id,
    }));
  }, [filters, brushSelection]);

  return (
    <div className="card p-5" id="output-correlation">
      <h3 className="text-lg font-semibold mb-4">Ausbringung ↔ Fehlerrate</h3>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <XAxis
              type="number"
              dataKey="output"
              name="Ausbringung"
              stroke="#9ca3af"
              label={{ value: 'Ausbringung (Stk/h)', position: 'bottom', offset: 0, style: { fill: '#9ca3af' } }}
            />
            <YAxis
              type="number"
              dataKey="defectRate"
              name="Fehlerrate"
              stroke="#9ca3af"
              label={{ value: 'Fehlerrate (%)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
              domain={[0, 'auto']}
            />
            <ZAxis range={[50, 50]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
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
                      <div className="text-sm font-medium text-dark-text">Charge {data.id}</div>
                      <div className="text-sm text-primary-400">Ausbringung: {data.output} Stk/h</div>
                      <div className="text-sm text-primary-400">Fehlerrate: {data.defectRate.toFixed(2)}%</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter
              data={chartData}
              fill="#3b82f6"
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-dark-muted">
        💡 <strong>Erkenntnis:</strong> Leicht positive Korrelation – höhere Ausbringung = leicht mehr Fehler.
      </div>
    </div>
  );
};
