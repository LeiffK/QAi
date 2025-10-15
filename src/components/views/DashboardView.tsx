import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Package,
  Users,
  Clock,
  Target,
  Zap,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, ReferenceLine } from 'recharts';
import { useStore } from '../../store/useStore';
import { PLANTS, LINES, BATCHES, PRODUCTS, SHIFTS } from '../../data/mockData';
import { filterBatches, calculateKPIs, calculateQualityScore } from '../../utils/filterData';

export const DashboardView = () => {
  const { filters, brushSelection, setActiveTab, setSelectedPlantId, setFilter } = useStore();

  // Global KPIs
  const globalKPIs = useMemo(() => {
    const allBatches = filterBatches(BATCHES, filters, brushSelection);
    return calculateKPIs(allBatches);
  }, [filters, brushSelection]);

  // Plant Status
  const plantStatus = useMemo(() => {
    return PLANTS.map((plant) => {
      const plantBatches = filterBatches(
        BATCHES.filter((b) => b.plantId === plant.id),
        filters,
        brushSelection
      );
      const plantLines = LINES.filter((l) => l.plantId === plant.id);

      const avgDefectRate = plantBatches.length > 0
        ? plantBatches.reduce((sum, b) => sum + b.defectRate, 0) / plantBatches.length
        : 0;
      const avgFpy = plantBatches.length > 0
        ? plantBatches.reduce((sum, b) => sum + b.fpy, 0) / plantBatches.length
        : 0;
      const avgScrapRate = plantBatches.length > 0
        ? plantBatches.reduce((sum, b) => sum + b.scrapRate, 0) / plantBatches.length
        : 0;

      const qualityScore = calculateQualityScore(avgDefectRate, avgFpy, avgScrapRate);
      const recentBatches = plantBatches.slice(0, 20);
      const alertCount = recentBatches.filter((b) => b.defectRate > 5).length;

      return {
        plant,
        linesActive: plantLines.length,
        avgDefectRate: Number(avgDefectRate.toFixed(2)),
        qualityScore,
        alertCount,
        status: alertCount > 3 ? 'critical' : avgDefectRate < 3 ? 'good' : 'warning',
        batchCount: plantBatches.length,
      };
    });
  }, [filters, brushSelection]);

  // Recent Alerts
  const recentAlerts = useMemo(() => {
    const allBatches = filterBatches(BATCHES, filters, brushSelection);
    return allBatches
      .filter((b) => b.defectRate > 5)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5)
      .map((batch) => {
        const plant = PLANTS.find((p) => p.id === batch.plantId);
        const line = LINES.find((l) => l.id === batch.lineId);
        return {
          ...batch,
          plantName: plant?.name || '',
          lineName: line?.name || '',
        };
      });
  }, [filters, brushSelection]);

  // Trend Data (last 24 points)
  const trendData = useMemo(() => {
    const allBatches = filterBatches(BATCHES, filters, brushSelection);
    const sorted = [...allBatches].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const chunkSize = Math.max(1, Math.floor(sorted.length / 24));
    const chunks = [];

    for (let i = 0; i < sorted.length; i += chunkSize) {
      const chunk = sorted.slice(i, i + chunkSize);
      if (chunk.length > 0) {
        const avgDefectRate = chunk.reduce((sum, b) => sum + b.defectRate, 0) / chunk.length;
        const avgFpy = chunk.reduce((sum, b) => sum + b.fpy, 0) / chunk.length;
        const timestamp = chunk[Math.floor(chunk.length / 2)].timestamp;

        chunks.push({
          time: timestamp.toLocaleString('de-DE', { month: 'short', day: 'numeric', hour: '2-digit' }),
          defectRate: Number(avgDefectRate.toFixed(2)),
          fpy: Number(avgFpy.toFixed(1)),
          target: 3, // Target defect rate
        });
      }
    }

    return chunks.slice(-24);
  }, [filters, brushSelection]);

  // Predictive Forecast (simple trend extrapolation)
  const forecast = useMemo(() => {
    if (trendData.length < 3) return null;

    const recent = trendData.slice(-5);
    const avgChange = recent.reduce((sum, point, idx) => {
      if (idx === 0) return 0;
      return sum + (point.defectRate - recent[idx - 1].defectRate);
    }, 0) / (recent.length - 1);

    const lastValue = recent[recent.length - 1].defectRate;
    const next24h = lastValue + avgChange * 24;

    return {
      current: lastValue,
      predicted: Math.max(0, Number(next24h.toFixed(2))),
      trend: avgChange > 0.05 ? 'increasing' : avgChange < -0.05 ? 'decreasing' : 'stable',
      confidence: 85,
    };
  }, [trendData]);

  // Heatmap Calendar Data (last 30 days)
  // Product Performance
  const productPerformance = useMemo(() => {
    return PRODUCTS.map((product) => {
      const productBatches = filterBatches(
        BATCHES.filter((b) => b.productId === product.id),
        filters,
        brushSelection
      );

      const avgDefectRate = productBatches.length > 0
        ? productBatches.reduce((sum, b) => sum + b.defectRate, 0) / productBatches.length
        : 0;

      return {
        name: product.name,
        defectRate: Number(avgDefectRate.toFixed(2)),
        count: productBatches.length,
      };
    }).sort((a, b) => a.defectRate - b.defectRate);
  }, [filters, brushSelection]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Dashboard</h1>
          <p className="text-dark-muted mt-1">Echtzeit-Übersicht aller Qualitätsmetriken</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-dark-muted">Live-Daten</span>
        </div>
      </div>

      {/* Main KPIs - Prominent */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Defect Rate */}
        <div className="card p-6 bg-gradient-to-br from-red-900/20 to-dark-surface border-red-700/30">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              globalKPIs.defectRateDelta > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {globalKPIs.defectRateDelta > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(globalKPIs.defectRateDelta).toFixed(1)}%</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-dark-text mb-1">{globalKPIs.defectRate}%</div>
          <div className="text-sm text-dark-muted">Durchschn. Fehlerrate</div>
          <div className="mt-3 text-xs text-dark-muted">Ziel: &lt; 3.0%</div>
        </div>

        {/* FPY */}
        <div className="card p-6 bg-gradient-to-br from-green-900/20 to-dark-surface border-green-700/30">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              globalKPIs.fpyDelta > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {globalKPIs.fpyDelta > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(globalKPIs.fpyDelta).toFixed(1)}%</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-dark-text mb-1">{globalKPIs.fpy}%</div>
          <div className="text-sm text-dark-muted">Erstpass-Quote (FPY)</div>
          <div className="mt-3 text-xs text-dark-muted">Ziel: &gt; 95%</div>
        </div>

        {/* Active Alarms */}
        <div className="card p-6 bg-gradient-to-br from-yellow-900/20 to-dark-surface border-yellow-700/30">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-yellow-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              globalKPIs.alarmsDelta > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {globalKPIs.alarmsDelta > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(globalKPIs.alarmsDelta).toFixed(1)}%</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-dark-text mb-1">{globalKPIs.alarms}</div>
          <div className="text-sm text-dark-muted">Aktive Alarme</div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="mt-3 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            Details anzeigen <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quality Coverage */}
        <div className="card p-6 bg-gradient-to-br from-primary-900/20 to-dark-surface border-primary-700/30">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-primary-900/30 rounded-lg">
              <Target className="w-6 h-6 text-primary-400" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              globalKPIs.coverageDelta > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {globalKPIs.coverageDelta > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(globalKPIs.coverageDelta).toFixed(1)}%</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-dark-text mb-1">{globalKPIs.coverage}%</div>
          <div className="text-sm text-dark-muted">Qualitätsabdeckung</div>
          <div className="mt-3 text-xs text-dark-muted">Chargen mit FPY &gt; 95%</div>
        </div>
      </div>

      {/* Second Row: Trend & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart with SPC */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Fehlerrate-Trend (SPC)
            </h3>
            <div className="flex items-center gap-4 text-xs text-dark-muted">
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-primary-500" />
                <span>Ist-Wert</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-red-500 border-t-2 border-dashed" />
                <span>Ziel (3%)</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorDefectRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Fehlerrate (%)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 11 } }}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131827',
                    border: '1px solid #1f2937',
                    borderRadius: '8px',
                  }}
                />
                {/* Target line */}
                <ReferenceLine
                  y={3}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{ value: 'Ziel', position: 'right', fill: '#ef4444', fontSize: 11 }}
                />
                <Area
                  type="monotone"
                  dataKey="defectRate"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorDefectRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            KI-Vorhersage
          </h3>

          {forecast && (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-dark-muted mb-1">Nächste 24h Prognose</div>
                <div className="text-3xl font-bold text-dark-text">{forecast.predicted}%</div>
                <div className={`text-sm mt-1 flex items-center gap-1 ${
                  forecast.trend === 'increasing' ? 'text-red-400' :
                  forecast.trend === 'decreasing' ? 'text-green-400' :
                  'text-yellow-400'
                }`}>
                  {forecast.trend === 'increasing' && <TrendingUp className="w-4 h-4" />}
                  {forecast.trend === 'decreasing' && <TrendingDown className="w-4 h-4" />}
                  {forecast.trend === 'stable' && <Activity className="w-4 h-4" />}
                  <span className="capitalize">{forecast.trend === 'increasing' ? 'Steigend' : forecast.trend === 'decreasing' ? 'Fallend' : 'Stabil'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dark-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-muted">Konfidenz</span>
                  <span className="font-medium text-dark-text">{forecast.confidence}%</span>
                </div>
                <div className="mt-2 h-2 bg-dark-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
                    style={{ width: `${forecast.confidence}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-dark-border">
                <div className="text-xs text-dark-muted mb-2">Empfehlung</div>
                <div className="text-sm text-dark-text">
                  {forecast.trend === 'increasing' ? (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span>Erhöhte Fehlerrate erwartet. Präventive Maßnahmen empfohlen.</span>
                    </div>
                  ) : forecast.trend === 'decreasing' ? (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Qualität verbessert sich. Aktuelle Maßnahmen beibehalten.</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Activity className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                      <span>Stabile Performance. Monitoring fortsetzen.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Third Row: Plant Status & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plant Status */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Werke-Status
          </h3>
          <div className="space-y-3">
            {plantStatus.map((stat) => (
              <div
                key={stat.plant.id}
                className="p-4 bg-dark-border rounded-lg hover:bg-dark-border/70 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedPlantId(stat.plant.id);
                  setActiveTab('plants');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      stat.status === 'good' ? 'bg-green-400' :
                      stat.status === 'warning' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`} />
                    <span className="font-medium text-dark-text">{stat.plant.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-dark-muted">{stat.linesActive} Linien</span>
                    <div className="px-2 py-1 bg-primary-900/30 text-primary-300 rounded font-medium">
                      Score: {stat.qualityScore}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-dark-muted">Fehlerrate</div>
                    <div className={`font-medium ${
                      stat.avgDefectRate > 5 ? 'text-red-400' :
                      stat.avgDefectRate > 3 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {stat.avgDefectRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-dark-muted">Alarme</div>
                    <div className="font-medium text-dark-text">{stat.alertCount}</div>
                  </div>
                  <div>
                    <div className="text-dark-muted">Chargen</div>
                    <div className="font-medium text-dark-text">{stat.batchCount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Aktuelle Alarme
            </h3>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentAlerts.length > 0 ? (
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-red-900/10 border border-red-700/30 rounded-lg hover:bg-red-900/20 transition-colors cursor-pointer"
                  onClick={() => setActiveTab('alerts')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-dark-text flex items-center gap-2">
                        <span>{alert.id}</span>
                        <span className="text-xs text-dark-muted">·</span>
                        <span className="text-xs text-dark-muted">{alert.plantName} / {alert.lineName}</span>
                      </div>
                      <div className="text-xs text-dark-muted mt-1">
                        {new Date(alert.timestamp).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-400">{alert.defectRate.toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-dark-muted">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <div>Keine aktiven Alarme</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Product Performance & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Performance */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Produkt-Performance
          </h3>
          <div className="space-y-3">
            {productPerformance.map((product, idx) => (
              <div
                key={product.name}
                className="flex items-center gap-3 p-3 bg-dark-border rounded-lg hover:bg-dark-border/70 transition-colors cursor-pointer"
                onClick={() => {
                  setFilter('productId', PRODUCTS.find(p => p.name === product.name)?.id || null);
                  setActiveTab('insights');
                }}
              >
                <div className="text-2xl">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-dark-text">{product.name}</div>
                  <div className="text-xs text-dark-muted">{product.count} Chargen</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    product.defectRate > 5 ? 'text-red-400' :
                    product.defectRate > 3 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {product.defectRate.toFixed(2)}%
                  </div>
                  <div className="text-xs text-dark-muted">Fehlerrate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Schnellübersicht
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-dark-muted">
                <Users className="w-4 h-4" />
                <span>Schichten</span>
              </div>
              <div className="text-sm font-medium text-dark-text">{SHIFTS.length}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-dark-muted">
                <Package className="w-4 h-4" />
                <span>Produkte</span>
              </div>
              <div className="text-sm font-medium text-dark-text">{PRODUCTS.length}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-dark-muted">
                <Activity className="w-4 h-4" />
                <span>Aktive Linien</span>
              </div>
              <div className="text-sm font-medium text-dark-text">{LINES.length}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-dark-muted">
                <Calendar className="w-4 h-4" />
                <span>Chargen (Periode)</span>
              </div>
              <div className="text-sm font-medium text-dark-text">
                {filterBatches(BATCHES, filters, brushSelection).length}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-dark-border">
            <button
              onClick={() => setActiveTab('ranking')}
              className="w-full btn btn-primary text-sm flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              Performance-Ranking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
