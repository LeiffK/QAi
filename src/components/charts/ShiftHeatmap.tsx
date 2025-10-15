import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { SHIFT_DATA, SHIFTS, WEEKDAYS } from '../../data/mockData';

export const ShiftHeatmap = () => {
  // Transform data for heatmap
  const data = SHIFT_DATA.map((d, idx) => ({
    x: WEEKDAYS.indexOf(d.weekday),
    y: SHIFTS.indexOf(d.shift),
    value: d.value,
    weekday: d.weekday,
    shift: d.shift,
  }));

  // Color scale (blue theme, no orange)
  const getColor = (value: number) => {
    const max = Math.max(...data.map(d => d.value));
    const intensity = value / max;

    if (intensity < 0.3) return '#1e3a8a';
    if (intensity < 0.5) return '#1e40af';
    if (intensity < 0.7) return '#2563eb';
    if (intensity < 0.85) return '#3b82f6';
    return '#ef4444';
  };

  return (
    <div className="card p-5" id="shift-pattern">
      <h3 className="text-lg font-semibold mb-4">Schichtmuster – Fehlerrate nach Wochentag</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 60, left: 100 }}
          >
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 6]}
              ticks={[0, 1, 2, 3, 4, 5, 6]}
              tickFormatter={(value) => WEEKDAYS[value] || ''}
              stroke="#9ca3af"
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 2]}
              ticks={[0, 1, 2]}
              tickFormatter={(value) => SHIFTS[value] || ''}
              stroke="#9ca3af"
              width={90}
            />
            <ZAxis type="number" dataKey="value" range={[800, 800]} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 shadow-lg">
                      <div className="text-sm font-medium text-dark-text">{data.shift} – {data.weekday}</div>
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
        💡 <strong>Erkenntnis:</strong> Nachtschicht zeigt leicht erhöhte Fehlerrate, besonders am Wochenende.
      </div>
    </div>
  );
};
