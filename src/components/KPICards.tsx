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
  good?: 'high' | 'low';
}

const KPICard = ({ title, value, unit, delta, trend, good = 'low' }: KPICardProps) => {
  const isPositive = delta > 0;
  const isGood = good === 'high' ? isPositive : !isPositive;
  const trendColor = isGood ? '#10b981' : '#ef4444';

  return (
    <div className="card p-5 hover:scale-105 transform transition-transform">
      <div className="flex h-full flex-col">
        <div className="mb-2 text-sm text-dark-muted">{title}</div>

        <div className="mb-3 flex items-baseline gap-2">
          <div className="text-3xl font-bold text-dark-text">{value}</div>
          <div className="text-sm text-dark-muted">{unit}</div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isGood ? 'text-green-400' : 'text-red-400'
            }`}
          >
            <span>{isPositive ? '\u2191' : '\u2193'}</span>
            <span>{Math.abs(delta).toFixed(1)}%</span>
          </div>

          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.map((value, index) => ({ value, index }))}>
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

  const defectRateTrend = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    const sorted = [...filtered].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const chunkSize = Math.max(1, Math.floor(sorted.length / 10));
    const chunks: number[] = [];

    for (let index = 0; index < sorted.length; index += chunkSize) {
      const chunk = sorted.slice(index, index + chunkSize);
      const avg = chunk.reduce((acc, batch) => acc + batch.defectRate, 0) / chunk.length;
      chunks.push(avg);
    }

    return chunks.slice(0, 10);
  }, [filters, brushSelection]);

  const fpyTrend = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    const sorted = [...filtered].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const chunkSize = Math.max(1, Math.floor(sorted.length / 10));
    const chunks: number[] = [];

    for (let index = 0; index < sorted.length; index += chunkSize) {
      const chunk = sorted.slice(index, index + chunkSize);
      const avg = chunk.reduce((acc, batch) => acc + batch.fpy, 0) / chunk.length;
      chunks.push(avg);
    }

    return chunks.slice(0, 10);
  }, [filters, brushSelection]);

  const scrapRateTrend = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    const sorted = [...filtered].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const chunkSize = Math.max(1, Math.floor(sorted.length / 10));
    const chunks: number[] = [];

    for (let index = 0; index < sorted.length; index += chunkSize) {
      const chunk = sorted.slice(index, index + chunkSize);
      const avg = chunk.reduce((acc, batch) => acc + batch.scrapRate, 0) / chunk.length;
      chunks.push(avg);
    }

    return chunks.slice(0, 10);
  }, [filters, brushSelection]);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
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

