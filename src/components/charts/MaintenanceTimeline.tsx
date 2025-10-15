import { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';
import { useStore } from '../../store/useStore';
import { TIME_SERIES, MAINTENANCE_EVENTS, LINES } from '../../data/mockData';
import { filterTimeSeries } from '../../utils/filterData';

export const MaintenanceTimeline = () => {
  const { filters, brushSelection } = useStore();

  const chartData = useMemo(() => {
    const filtered = filterTimeSeries(TIME_SERIES, filters, brushSelection);

    const grouped = filtered.reduce<Record<string, { time: string; timestamp: Date; defectRate: number; count: number }>>(
      (acc, point) => {
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
      },
      {}
    );

    return Object.values(grouped)
      .map((value) => ({
        time: value.time,
        timestamp: value.timestamp,
        defectRate: value.defectRate / value.count,
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [filters, brushSelection]);

  const maintenanceMarkers = useMemo(() => {
    if (chartData.length === 0) {
      return [];
    }

    const dateRange = {
      start: chartData[0].timestamp,
      end: chartData[chartData.length - 1].timestamp,
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
        label: event.type === 'Geplant' ? 'Plan' : 'Akut',
        stroke: event.type === 'Geplant' ? '#10b981' : '#2563eb',
        line: line?.name ?? event.lineId,
        type: event.type,
      };
    });
  }, [chartData, filters]);

  return (
    <div className="card p-5" id="maintenance">
      <h3 className="mb-4 text-lg font-semibold">Wartung & Fehlerrate</h3>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <XAxis dataKey="time" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
            <YAxis
              stroke="#94a3b8"
              label={{ value: 'Fehlerrate (%)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#101522',
                border: '1px solid rgba(148,163,184,0.35)',
                borderRadius: 12,
              }}
              labelStyle={{ color: '#e5e7eb' }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'Fehlerrate']}
            />
            <Legend />

            <Line type="monotone" dataKey="defectRate" name="Fehlerrate" stroke="#3b82f6" strokeWidth={2} dot={false} />

            {maintenanceMarkers.map((marker, idx) => (
              <ReferenceLine
                key={`${marker.time}-${idx}`}
                x={marker.time}
                stroke={marker.stroke}
                strokeDasharray="3 3"
                label={{ value: marker.label, position: 'top', fill: '#94a3b8' }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-dark-muted">
        Hinweis: <strong>Fehlerraten</strong> steigen vor Wartungen leicht an und stabilisieren sich nach Abschluss.
      </div>
    </div>
  );
};
