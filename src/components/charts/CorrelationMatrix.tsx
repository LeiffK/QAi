import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { CORRELATION_MATRIX } from '../../data/mockData';

const FACTORS = ['Saison', 'Schicht', 'Linie', 'Wartung', 'Lieferant', 'Ausbringung'];

export const CorrelationMatrix = () => {
  const data = CORRELATION_MATRIX.map((entry) => ({
    x: FACTORS.indexOf(entry.factor1),
    y: FACTORS.indexOf(entry.factor2),
    value: entry.correlation,
    factor1: entry.factor1,
    factor2: entry.factor2,
  }));

  const getColor = (value: number) => {
    if (value > 0.7) return '#3a81af';
    if (value > 0.4) return '#489cd0';
    if (value > 0.2) return '#64bad9';
    if (value > 0.1) return '#8ccce4';
    return '#17374f';
  };

  return (
    <div className="card p-5" id="correlation">
      <h3 className="mb-4 text-lg font-semibold">Korrelations-Matrix</h3>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 24, bottom: 120, left: 120 }}>
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tickFormatter={(value) => FACTORS[value] || ''}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={90}
              tickMargin={16}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tickFormatter={(value) => FACTORS[value] || ''}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              width={120}
              tickMargin={12}
            />
            <ZAxis type="number" dataKey="value" range={[600, 600]} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const current = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-dark-border bg-dark-surface px-3 py-2 shadow-lg">
                      <div className="text-sm font-medium text-dark-text">
                        {current.factor1} â€“ {current.factor2}
                      </div>
                      <div className="text-sm text-primary-400">
                        Korrelation: {current.value.toFixed(2)}
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
        <strong>Erkenntnis:</strong> Wartung korreliert stark mit Linie (0.45), Ausbringung mit Schicht (0.25).
      </div>
    </div>
  );
};

