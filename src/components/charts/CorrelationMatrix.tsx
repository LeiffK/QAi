import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { CORRELATION_MATRIX } from '../../data/mockData';

const FACTORS = ['Saison', 'Schicht', 'Linie', 'Wartung', 'Lieferant', 'Ausbringung'];

export const CorrelationMatrix = () => {
  // Transform data for heatmap
  const data = CORRELATION_MATRIX.map((d) => ({
    x: FACTORS.indexOf(d.factor1),
    y: FACTORS.indexOf(d.factor2),
    value: d.correlation,
    factor1: d.factor1,
    factor2: d.factor2,
  }));

  // Color scale (blue for positive correlation)
  const getColor = (value: number) => {
    if (value > 0.7) return '#2563eb';
    if (value > 0.4) return '#3b82f6';
    if (value > 0.2) return '#60a5fa';
    if (value > 0.1) return '#93c5fd';
    return '#1e3a8a';
  };

  return (
    <div className="card p-5" id="correlation">
      <h3 className="text-lg font-semibold mb-4">Korrelations-Matrix</h3>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 100, left: 100 }}
          >
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tickFormatter={(value) => FACTORS[value] || ''}
              stroke="#9ca3af"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tickFormatter={(value) => FACTORS[value] || ''}
              stroke="#9ca3af"
              width={90}
            />
            <ZAxis type="number" dataKey="value" range={[600, 600]} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 shadow-lg">
                      <div className="text-sm font-medium text-dark-text">
                        {data.factor1} × {data.factor2}
                      </div>
                      <div className="text-sm text-primary-400">
                        Korrelation: {data.value.toFixed(2)}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={data} shape="square">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-dark-muted">
        💡 <strong>Erkenntnis:</strong> Wartung korreliert stark mit Linie (0.45), Ausbringung mit Schicht (0.25).
      </div>
    </div>
  );
};
