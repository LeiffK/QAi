import { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Scatter, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';
import { useStore } from '../../store/useStore';
import { TIME_SERIES, MAINTENANCE_EVENTS, LINES } from '../../data/mockData';
import { filterTimeSeries } from '../../utils/filterData';

export const MaintenanceTimeline = () => {
  const { filters, brushSelection } = useStore();

  const chartData = useMemo(() => {
    const filtered = filterTimeSeries(TIME_SERIES, filters, brushSelection);

    // Group by timestamp, average defect rate
    const grouped = filtered.reduce((acc, point) => {
      const timeKey = point.timestamp.toLocaleString('de-DE', { month: 'short', day: 'numeric' });
      if (!acc[timeKey]) {
        acc[timeKey] = {
          time: timeKey,
          timestamp: point.timestamp,
          defectRate: 0,
          count: 0,
        };
      }
      acc[timeKey].defectRate += point.defectRate;
      acc[timeKey].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped)
      .map((d: any) => ({
        time: d.time,
        timestamp: d.timestamp,
        defectRate: d.defectRate / d.count,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filters, brushSelection]);

  // Map maintenance events to chart data
  const maintenanceMarkers = useMemo(() => {
    const dateRange = {
      start: chartData[0]?.timestamp || new Date(),
      end: chartData[chartData.length - 1]?.timestamp || new Date(),
    };

    return MAINTENANCE_EVENTS.filter(
      (event) =>
        event.timestamp >= dateRange.start &&
        event.timestamp <= dateRange.end &&
        (!filters.lineId || event.lineId === filters.lineId)
    ).map((event) => {
      const line = LINES.find((l) => l.id === event.lineId);
      return {
        time: event.timestamp.toLocaleString('de-DE', { month: 'short', day: 'numeric' }),
        timestamp: event.timestamp,
        maintenance: 8, // Y-position for marker
        type: event.type,
        line: line?.name || event.lineId,
      };
    });
  }, [chartData, filters]);

  return (
    <div className="card p-5" id="maintenance">
      <h3 className="text-lg font-semibold mb-4">Wartung & Fehlerrate</h3>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
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
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 shadow-lg">
                      <div className="text-sm font-medium text-dark-text">{data.time}</div>
                      {data.defectRate !== undefined && (
                        <div className="text-sm text-primary-400">Fehlerrate: {data.defectRate.toFixed(2)}%</div>
                      )}
                      {data.type && (
                        <>
                          <div className="text-sm text-yellow-400">Wartung: {data.type}</div>
                          <div className="text-sm text-dark-muted">{data.line}</div>
                        </>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />

            {/* Defect rate line */}
            <Line
              type="monotone"
              dataKey="defectRate"
              name="Fehlerrate"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />

            {/* Maintenance markers */}
            {maintenanceMarkers.map((marker, idx) => (
              <ReferenceLine
                key={idx}
                x={marker.time}
                stroke={marker.type === 'Geplant' ? '#10b981' : '#ef4444'}
                strokeDasharray="3 3"
                label={{ value: '🔧', position: 'top' }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-dark-muted">
        💡 <strong>Erkenntnis:</strong> Fehlerrate steigt vor Wartung leicht an, sinkt danach ab.
      </div>
    </div>
  );
};
