import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { SEASONALITY_DATA, MONTHS, DEFECT_TYPES } from '../../data/mockData';

export const SeasonalityHeatmap = () => {
  const data = SEASONALITY_DATA.map((entry) => ({
    x: MONTHS.indexOf(entry.month),
    y: DEFECT_TYPES.indexOf(entry.defectType),
    value: entry.value,
    month: entry.month,
    defectType: entry.defectType,
  }));

  const maxValue = Math.max(...data.map((entry) => entry.value));

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity < 0.25) return '#1e3a8a';
    if (intensity < 0.5) return '#1d4ed8';
    if (intensity < 0.75) return '#2563eb';
    return '#3b82f6';
  };

  return (
    <div className="card p-5" id="seasonality">
      <h3 className="mb-4 text-lg font-semibold">Saisonalität – Defekte nach Monat</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 24, bottom: 60, left: 120 }}>
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 11]}
              ticks={Array.from({ length: 12 }, (_, index) => index)}
              tickFormatter={(value) => MONTHS[value] ?? ''}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={70}
              tickMargin={16}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, DEFECT_TYPES.length - 1]}
              ticks={DEFECT_TYPES.map((_, index) => index)}
              tickFormatter={(value) => DEFECT_TYPES[value] ?? ''}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              width={140}
              tickMargin={12}
            />
            <ZAxis type="number" dataKey="value" range={[400, 400]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#101522',
                border: '1px solid rgba(148,163,184,0.35)',
                borderRadius: 12,
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'Fehlerrate']}
              labelFormatter={(label) => MONTHS[label as number] ?? ''}
            />
            <Scatter data={data} shape="square">
              {data.map((entry, index) => (
                <Cell key={`seasonality-${index}`} fill={getColor(entry.value)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-dark-muted">
        Hinweis: <strong>Verformungen</strong> nehmen in den Sommermonaten (Juni–August) spürbar zu.
      </div>
    </div>
  );
};
