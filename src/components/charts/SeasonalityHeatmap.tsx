import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { SEASONALITY_DATA, MONTHS, DEFECT_TYPES } from '../../data/mockData';

export const SeasonalityHeatmap = () => {
  // Transform data for heatmap
  const data = SEASONALITY_DATA.map((d, idx) => ({
    x: MONTHS.indexOf(d.month),
    y: DEFECT_TYPES.indexOf(d.defectType),
    value: d.value,
    month: d.month,
    defectType: d.defectType,
  }));

  // Color scale (blue theme, no orange)
  const getColor = (value: number) => {
    const max = Math.max(...data.map(d => d.value));
    const intensity = value / max;

    if (intensity < 0.3) return '#1e3a8a'; // dark blue
    if (intensity < 0.5) return '#1e40af';
    if (intensity < 0.7) return '#2563eb'; // blue
    if (intensity < 0.85) return '#3b82f6';
    return '#ef4444'; // red for high values
  };

  return (
    <div className="card p-5" id="seasonality">
      <h3 className="text-lg font-semibold mb-4">Saisonalität – Defekte nach Monat</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 60, left: 100 }}
          >
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 11]}
              ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
              tickFormatter={(value) => MONTHS[value] || ''}
              stroke="#9ca3af"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, DEFECT_TYPES.length - 1]}
              ticks={[0, 1, 2, 3, 4]}
              tickFormatter={(value) => DEFECT_TYPES[value] || ''}
              stroke="#9ca3af"
              width={90}
            />
            <ZAxis type="number" dataKey="value" range={[400, 400]} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 shadow-lg">
                      <div className="text-sm font-medium text-dark-text">{data.month} – {data.defectType}</div>
                      <div className="text-sm text-primary-400">{data.value.toFixed(2)}% Fehlerrate</div>
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
        💡 <strong>Erkenntnis:</strong> Verformung steigt im Sommer (Jun-Aug) durch höhere Temperaturen.
      </div>
    </div>
  );
};
