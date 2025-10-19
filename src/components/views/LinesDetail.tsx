import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useStore } from '../../store/useStore';
import { PLANTS, LINES, BATCHES, TIME_SERIES, PRODUCTS, SUPPLIERS, SHIFTS } from '../../data/mockData';
import { filterBatches, filterTimeSeries, calculateQualityScore, getScoreBadgeColor } from '../../utils/filterData';

export const LinesDetail = () => {
  const { selectedPlantId, setSelectedPlantId, filters, brushSelection, openDrawer } = useStore();
  const [batchSortBy, setBatchSortBy] = useState<'timestamp' | 'defectRate' | 'fpy'>('timestamp');
  const [batchFilterProduct, setBatchFilterProduct] = useState<string | null>(null);
  const [batchFilterShift, setBatchFilterShift] = useState<string | null>(null);
  const [showBatchesForLine, setShowBatchesForLine] = useState<string | null>(null);

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

      const avgScrapRate = recentBatches.length > 0
        ? recentBatches.reduce((sum, b) => sum + b.scrapRate, 0) / recentBatches.length
        : 0;

      const avgOutput = recentBatches.length > 0
        ? Math.round(recentBatches.reduce((sum, b) => sum + b.output, 0) / recentBatches.length)
        : 0;

      const qualityScore = calculateQualityScore(avgDefectRate, avgFpy, avgScrapRate);

      // Time series for mini chart
      const lineTimeSeries = filterTimeSeries(
        TIME_SERIES.filter((t) => t.lineId === line.id),
        filters,
        brushSelection
      ).slice(-20);

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
        avgScrapRate: Number(avgScrapRate.toFixed(2)),
        avgOutput,
        latestBatch,
        timeSeries: lineTimeSeries,
        topProduct: topProduct ? topProduct[0] : 'N/A',
        batchCount: recentBatches.length,
        qualityScore,
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

  // Batches for selected line
  const lineBatchesFiltered = useMemo(() => {
    if (!showBatchesForLine) return [];

    let batches = filterBatches(
      BATCHES.filter((b) => b.lineId === showBatchesForLine),
      filters,
      brushSelection
    );

    // Apply product filter
    if (batchFilterProduct) {
      batches = batches.filter((b) => b.productId === batchFilterProduct);
    }

    // Apply shift filter
    if (batchFilterShift) {
      batches = batches.filter((b) => b.shift === batchFilterShift);
    }

    // Sort
    if (batchSortBy === 'timestamp') {
      batches.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } else if (batchSortBy === 'defectRate') {
      batches.sort((a, b) => b.defectRate - a.defectRate);
    } else if (batchSortBy === 'fpy') {
      batches.sort((a, b) => a.fpy - b.fpy); // Lower FPY is worse
    }

    return batches.slice(0, 50).map((batch) => {
      const product = PRODUCTS.find((p) => p.id === batch.productId);
      const supplier = SUPPLIERS.find((s) => s.id === batch.supplierId);
      return {
        ...batch,
        productName: product?.name || batch.productId,
        supplierName: supplier?.name || batch.supplierId,
        plantName: plant?.name || '',
        lineName: LINES.find((l) => l.id === batch.lineId)?.name || '',
      };
    });
  }, [showBatchesForLine, filters, brushSelection, batchFilterProduct, batchFilterShift, batchSortBy, plant]);

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
          onClick={() => {
            setSelectedPlantId(null);
            setShowBatchesForLine(null);
          }}
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
          <div key={stat.line.id} className="card p-6 hover:shadow-xl transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-dark-text">{stat.line.name}</h3>
                <p className="text-sm text-dark-muted">Produkt: {stat.topProduct}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
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
                <div className={`text-xs px-2 py-1 rounded font-medium ${getScoreBadgeColor(stat.qualityScore)}`}>
                  Score: {stat.qualityScore}
                </div>
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

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => stat.latestBatch && openDrawer('batch', {
                  ...stat.latestBatch,
                  plantName: plant.name,
                  lineName: stat.line.name,
                  productName: PRODUCTS.find(p => p.id === stat.latestBatch.productId)?.name,
                  supplierName: 'Lieferant',
                })}
                className="flex-1 text-xs px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
              >
                Letzte Charge Details
              </button>
              <button
                onClick={() => setShowBatchesForLine(stat.line.id)}
                className="flex-1 text-xs px-3 py-2 bg-dark-border hover:bg-dark-border/70 text-dark-text rounded transition-colors"
              >
                {showBatchesForLine === stat.line.id ? '✓ Chargen angezeigt' : '→ Alle Chargen'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Batches Table for Selected Line */}
      {showBatchesForLine && (
        <div className="card p-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Chargen: {LINES.find((l) => l.id === showBatchesForLine)?.name}
            </h3>
            <button
              onClick={() => setShowBatchesForLine(null)}
              className="text-sm text-dark-muted hover:text-dark-text"
            >
              ✕ Schließen
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <select
              className="select text-sm"
              value={batchFilterProduct || ''}
              onChange={(e) => setBatchFilterProduct(e.target.value || null)}
            >
              <option value="">Alle Produkte</option>
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              className="select text-sm"
              value={batchFilterShift || ''}
              onChange={(e) => setBatchFilterShift(e.target.value || null)}
            >
              <option value="">Alle Schichten</option>
              {SHIFTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              className="select text-sm"
              value={batchSortBy}
              onChange={(e) => setBatchSortBy(e.target.value as any)}
            >
              <option value="timestamp">Nach Zeit</option>
              <option value="defectRate">Nach Fehlerrate</option>
              <option value="fpy">Nach FPY</option>
            </select>

            <button
              onClick={() => {
                setBatchFilterProduct(null);
                setBatchFilterShift(null);
                setBatchSortBy('timestamp');
              }}
              className="btn btn-secondary text-sm"
            >
              Zurücksetzen
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-2 font-medium text-dark-muted">Charge</th>
                  <th className="text-left py-3 px-2 font-medium text-dark-muted">Produkt</th>
                  <th className="text-left py-3 px-2 font-medium text-dark-muted">Lieferant</th>
                  <th className="text-left py-3 px-2 font-medium text-dark-muted">Schicht</th>
                  <th className="text-right py-3 px-2 font-medium text-dark-muted">Fehlerrate</th>
                  <th className="text-right py-3 px-2 font-medium text-dark-muted">FPY</th>
                  <th className="text-left py-3 px-2 font-medium text-dark-muted">Zeit</th>
                </tr>
              </thead>
              <tbody>
                {lineBatchesFiltered.map((batch) => (
                  <tr
                    key={batch.id}
                    className="border-b border-dark-border/50 hover:bg-dark-border/30 transition-colors cursor-pointer"
                    onClick={() => openDrawer('batch', batch)}
                  >
                    <td className="py-2 px-2 text-primary-400 font-medium">{batch.id}</td>
                    <td className="py-2 px-2">{batch.productName}</td>
                    <td className="py-2 px-2">{batch.supplierName}</td>
                    <td className="py-2 px-2">
                      <span className="badge badge-info">{batch.shift}</span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span
                        className={`font-medium ${
                          batch.defectRate > 5 ? 'text-red-400' : batch.defectRate > 3 ? 'text-yellow-400' : 'text-green-400'
                        }`}
                      >
                        {batch.defectRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">{batch.fpy.toFixed(1)}%</td>
                    <td className="py-2 px-2 text-xs text-dark-muted">
                      {new Date(batch.timestamp).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {lineBatchesFiltered.length === 0 && (
              <div className="text-center py-12 text-dark-muted">
                <div className="text-4xl mb-2">📊</div>
                <div>Keine Chargen für die gewählten Filter.</div>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-dark-muted">
            Zeige {lineBatchesFiltered.length} von {BATCHES.filter((b) => b.lineId === showBatchesForLine).length} Chargen
          </div>
        </div>
      )}
    </div>
  );
};




