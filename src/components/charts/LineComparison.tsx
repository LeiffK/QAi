import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, Brush } from 'recharts';
import { useStore } from '../../store/useStore';
import { TIME_SERIES, LINES } from '../../data/mockData';
import { filterTimeSeries } from '../../utils/filterData';

export const LineComparison = () => {
  const { filters, brushSelection, setBrushSelection } = useStore();

  const chartData = useMemo(() => {
    const filtered = filterTimeSeries(TIME_SERIES, filters, brushSelection);

    // Group by timestamp and line
    const grouped = filtered.reduce((acc, point) => {
      const timeKey = point.timestamp.getTime();
      if (!acc[timeKey]) {
        acc[timeKey] = {
          timestamp: point.timestamp,
          time: point.timestamp.toLocaleString('de-DE', { month: 'short', day: 'numeric', hour: '2-digit' }),
        };
      }
      acc[timeKey][point.lineId] = point.defectRate;
      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [filters, brushSelection]);

  const handleBrushChange = (domain: any) => {
    if (domain && domain.startIndex !== undefined && domain.endIndex !== undefined) {
      const start = chartData[domain.startIndex]?.timestamp;
      const end = chartData[domain.endIndex]?.timestamp;
      if (start && end) {
        setBrushSelection({ startDate: new Date(start), endDate: new Date(end) });
      }
    }
  };

  const colors = ['#489cd0', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <div className="card p-5" id="line-comparison">
      <h3 className="text-lg font-semibold mb-4">Linienvergleich Fehlerrate im Zeitverlauf</h3>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#9ca3af"
              label={{ value: 'Fehlerrate (%)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#131827',
                border: '1px solid #1f2937',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#e5e7eb' }}
            />
            <Legend />
            {LINES.map((line, idx) => (
              <Line
                key={line.id}
                type="monotone"
                dataKey={line.id}
                name={line.name}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
            <Brush dataKey="time" height={30} stroke="#489cd0" fill="#131827" onChange={handleBrushChange} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-dark-muted">
        <strong>Tipp:</strong> Ziehen Sie im unteren Bereich, um zu zoomen. Alle Charts folgen.
      </div>
    </div>
  );
};

