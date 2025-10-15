import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useStore } from '../../store/useStore';
import { PLANTS, LINES, BATCHES, TIME_SERIES, PRODUCTS, SUPPLIERS } from '../../data/mockData';
import { filterBatches, filterTimeSeries, calculateQualityScore, getScoreBadgeColor } from '../../utils/filterData';

export const LinesDetail = () => {
  const { selectedPlantId, setSelectedPlantId, selectedLineId, setSelectedLineId, filters, brushSelection, openDrawer, comparisonLineIds, toggleComparisonLine } = useStore();
  const [batchSortBy, setBatchSortBy] = useState<'timestamp' | 'defectRate' | 'fpy'>('timestamp');
  const [batchFilterProduct, setBatchFilterProduct] = useState<string | null>(null);
  const [batchFilterShift, setBatchFilterShift] = useState<string | null>(null);

  const plant = PLANTS.find((p) => p.id === selectedPlantId);
  const plantLines = LINES.filter((l) => l.plantId === selectedPlantId);

  const lineStats = useMemo(() => {
    return plantLines.map((line) => {
      const lineBatches = filterBatches(
        BATCHES.filter((b) => b.lineId === line.id),
        filters,
        brushSelection
      );

      const recentBatches = lineBatches.slice(0, 20);
      const latestBatch = recentBatches[0];

      const avgDefectRate = recentBatches.length > 0
        ? recentBatches.reduce((sum, b) => sum + b.defectRate, 0) / recentBatches.length
        : 0;

      const avgFpy = recentBatches.length > 0
        ? recentBatches.reduce((sum, b) => sum + b.fpy, 0) / recentBatches.length
        : 0;

      const avgOutput = recentBatches.length > 0
        ? Math.round(recentBatches.reduce((sum, b) => sum + b.output, 0) / recentBatches.length)
        : 0;

      // Time series for mini chart
      const lineTimeSeries = filterTimeSeries(
        TIME_SERIES.filter((t) => t.lineId === line.id),
        filters,
        brushSelection
      ).slice(-20); // Last 20 points

      // Product distribution
      const productCounts = recentBatches.reduce((acc, b) => {
        const product = PRODUCTS.find((p) => p.id === b.productId);
        const name = product?.name || 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];

      return {
        line,
        avgDefectRate: Number(avgDefectRate.toFixed(2)),
        avgFpy: Number(avgFpy.toFixed(1)),
        avgOutput,
        latestBatch,
        timeSeries: lineTimeSeries,
        topProduct: topProduct ? topProduct[0] : 'N/A',
        batchCount: recentBatches.length,
        status: latestBatch
          ? latestBatch.defectRate > 5
            ? 'alert'
            : latestBatch.defectRate > 3
            ? 'warning'
            : 'running'
          : 'idle',
      };
    });
  }, [plantLines, filters, brushSelection]);

  if (!plant) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🏭</div>
        <div className="text-dark-muted">Kein Werk ausgewählt</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedPlantId(null)}
          className="btn btn-secondary"
        >
          ← Zurück zur Übersicht
        </button>
        <div>
          <h2 className="text-2xl font-bold text-primary-400">{plant.name}</h2>
          <p className="text-sm text-dark-muted">{plantLines.length} Linien aktiv</p>
        </div>
      </div>

      {/* Lines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lineStats.map((stat) => (
          <div
            key={stat.line.id}
            className="card p-6 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => stat.latestBatch && openDrawer('batch', {
              ...stat.latestBatch,
              plantName: plant.name,
              lineName: stat.line.name,
              productName: PRODUCTS.find(p => p.id === stat.latestBatch.productId)?.name,
              supplierName: 'Lieferant',
            })}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-dark-text">{stat.line.name}</h3>
                <p className="text-sm text-dark-muted">Produkt: {stat.topProduct}</p>
              </div>
              <div
                className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${
                    stat.status === 'running'
                      ? 'bg-green-900/30 text-green-300 border border-green-700 animate-pulse'
                      : stat.status === 'alert'
                      ? 'bg-red-900/30 text-red-300 border border-red-700'
                      : stat.status === 'warning'
                      ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                      : 'bg-dark-border text-dark-muted'
                  }
                `}
              >
                {stat.status === 'running' ? '● Läuft' : stat.status === 'alert' ? '⚠ Alarm' : stat.status === 'warning' ? '⚡ Achtung' : '○ Idle'}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <div
                  className={`text-xl font-bold ${
                    stat.avgDefectRate > 5 ? 'text-red-400' : stat.avgDefectRate > 3 ? 'text-yellow-400' : 'text-green-400'
                  }`}
                >
                  {stat.avgDefectRate}%
                </div>
                <div className="text-xs text-dark-muted">Fehlerrate</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-400">{stat.avgFpy}%</div>
                <div className="text-xs text-dark-muted">FPY</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary-400">{stat.avgOutput}</div>
                <div className="text-xs text-dark-muted">Stk/h</div>
              </div>
            </div>

            {/* Mini Trend Chart */}
            {stat.timeSeries.length > 0 && (
              <div className="h-24 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stat.timeSeries}>
                    <XAxis dataKey="timestamp" hide />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#131827',
                        border: '1px solid #1f2937',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleString('de-DE', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit'
                      })}
                      formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Fehlerrate']}
                    />
                    <Line
                      type="monotone"
                      dataKey="defectRate"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Latest Batch Info */}
            {stat.latestBatch && (
              <div className="mt-4 pt-4 border-t border-dark-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-muted">Letzte Charge:</span>
                  <span className="text-primary-400 font-medium">{stat.latestBatch.id}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-dark-muted">Zeitpunkt:</span>
                  <span className="text-dark-text">
                    {new Date(stat.latestBatch.timestamp).toLocaleString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Click hint */}
            <div className="mt-3 text-center text-xs text-primary-400">
              → Klicken für Charge-Details
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
