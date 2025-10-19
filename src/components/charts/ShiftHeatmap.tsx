import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { SHIFT_DATA, SHIFTS, WEEKDAYS } from '../../data/mockData';

export const ShiftHeatmap = () => {
  const data = SHIFT_DATA.map((entry) => ({
    x: WEEKDAYS.indexOf(entry.weekday),
    y: SHIFTS.indexOf(entry.shift),
    value: entry.value,
    weekday: entry.weekday,
    shift: entry.shift,
  }));

  const maxValue = Math.max(...data.map((entry) => entry.value));

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity < 0.25) return '#17374f';
    if (intensity < 0.5) return '#306892';
    if (intensity < 0.75) return '#3a81af';
    return '#489cd0';
  };

  return (
    <div className="card p-5" id="shift-pattern">
      <h3 className="mb-4 text-lg font-semibold">Schichtmuster â€“ Fehlerrate nach Wochentag</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 24, bottom: 60, left: 120 }}>
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 6]}
              ticks={Array.from({ length: 7 }, (_, index) => index)}
              tickFormatter={(value) => WEEKDAYS[value] ?? ''}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              angle={-30}
              textAnchor="end"
              height={60}
              tickMargin={12}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, SHIFTS.length - 1]}
              ticks={SHIFTS.map((_, index) => index)}
              tickFormatter={(value) => SHIFTS[value] ?? ''}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              width={140}
              tickMargin={12}
            />
            <ZAxis type="number" dataKey="value" range={[700, 700]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#101522',
                border: '1px solid rgba(148,163,184,0.35)',
                borderRadius: 12,
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'Fehlerrate']}
              labelFormatter={(label) => WEEKDAYS[label as number] ?? ''}
            />
            <Scatter data={data} shape="square">
              {data.map((entry, index) => (
                <Cell key={`shift-${index}`} fill={getColor(entry.value)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-dark-muted">
        Hinweis: <strong>Nachtschichten</strong> verzeichnen am Wochenende eine leicht erhöhte Fehlerrate.
      </div>
    </div>
  );
};


