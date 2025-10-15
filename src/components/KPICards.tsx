import { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import { BATCHES } from '../data/mockData';
import { filterBatches, calculateKPIs } from '../utils/filterData';

interface KPICardProps {
  title: string;
  value: number | string;
  unit: string;
  delta: number;
  trend: number[];
  good?: 'high' | 'low'; // What direction is good
}

const KPICard = ({ title, value, unit, delta, trend, good = 'low' }: KPICardProps) => {
  const isPositive = delta > 0;
  const isGood = good === 'high' ? isPositive : !isPositive;

  const trendColor = isGood ? '#10b981' : '#ef4444';

  return (
    <div className="card p-5 hover:scale-105 transform transition-transform">
      <div className="flex flex-col h-full">
        <div className="text-sm text-dark-muted mb-2">{title}</div>

        <div className="flex items-baseline gap-2 mb-3">
          <div className="text-3xl font-bold text-dark-text">
            {value}
          </div>
          <div className="text-sm text-dark-muted">{unit}</div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isGood ? 'text-green-400' : 'text-red-400'
          }`}>
            <span>{isPositive ? '▲' : '▼'}</span>
            <span>{Math.abs(delta).toFixed(1)}%</span>
          </div>

          {/* Mini trend chart */}
          <div className="w-24 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.map((v, i) => ({ value: v, index: i }))}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={trendColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export const KPICards = () => {
  const { filters, brushSelection } = useStore();

  const kpis = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    return calculateKPIs(filtered);
  }, [filters, brushSelection]);

  // Generate trend data for mini charts
  const defectRateTrend = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    const sorted = [...filtered].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const chunkSize = Math.max(1, Math.floor(sorted.length / 10));
    const chunks = [];
    for (let i = 0; i < sorted.length; i += chunkSize) {
      const chunk = sorted.slice(i, i + chunkSize);
      const avg = chunk.reduce((acc, b) => acc + b.defectRate, 0) / chunk.length;
      chunks.push(avg);
    }
    return chunks.slice(0, 10);
  }, [filters, brushSelection]);

  const fpyTrend = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    const sorted = [...filtered].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const chunkSize = Math.max(1, Math.floor(sorted.length / 10));
    const chunks = [];
    for (let i = 0; i < sorted.length; i += chunkSize) {
      const chunk = sorted.slice(i, i + chunkSize);
      const avg = chunk.reduce((acc, b) => acc + b.fpy, 0) / chunk.length;
      chunks.push(avg);
    }
    return chunks.slice(0, 10);
  }, [filters, brushSelection]);

  const scrapRateTrend = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    const sorted = [...filtered].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const chunkSize = Math.max(1, Math.floor(sorted.length / 10));
    const chunks = [];
    for (let i = 0; i < sorted.length; i += chunkSize) {
      const chunk = sorted.slice(i, i + chunkSize);
      const avg = chunk.reduce((acc, b) => acc + b.scrapRate, 0) / chunk.length;
      chunks.push(avg);
    }
    return chunks.slice(0, 10);
  }, [filters, brushSelection]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <KPICard
        title="Fehlerrate"
        value={kpis.defectRate}
        unit="%"
        delta={kpis.defectRateDelta}
        trend={defectRateTrend}
        good="low"
      />

      <KPICard
        title="Erstpass-Quote (FPY)"
        value={kpis.fpy}
        unit="%"
        delta={kpis.fpyDelta}
        trend={fpyTrend}
        good="high"
      />

      <KPICard
        title="Ausschuss"
        value={kpis.scrapRate}
        unit="%"
        delta={kpis.scrapRateDelta}
        trend={scrapRateTrend}
        good="low"
      />

      <KPICard
        title="Alarme"
        value={kpis.alarms}
        unit="Stk"
        delta={kpis.alarmsDelta}
        trend={[...Array(10)].map(() => Math.random() * 5 + kpis.alarms - 2)}
        good="low"
      />

      <KPICard
        title="Abdeckung"
        value={kpis.coverage}
        unit="%"
        delta={kpis.coverageDelta}
        trend={[...Array(10)].map(() => Math.random() * 10 + kpis.coverage - 5)}
        good="high"
      />
    </div>
  );
};
