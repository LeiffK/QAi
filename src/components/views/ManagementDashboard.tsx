import { useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Factory,
  Flame,
  Gauge,
  LineChart,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  PLANTS,
  LINES,
  SUPPLIERS,
  PRODUCTS,
  BATCHES,
  MAINTENANCE_EVENTS,
} from '../../data/mockData';
import { filterBatches, calculateKPIs } from '../../utils/filterData';

interface PlantCard {
  id: string;
  name: string;
  qualityScore: number;
  defectRate: number;
  fpy: number;
  output: number;
  alarmCount: number;
  status: 'good' | 'watch' | 'critical';
  reason: string;
}

interface ForecastInsight {
  current: number;
  predicted: number;
  trend: 'steigend' | 'fallend' | 'stabil';
  warning: string | null;
}

interface RankingEntry {
  label: string;
  value: string;
  metric: string;
  severityClass: string;
}

export const ManagementDashboard = () => {
  const {
    filters,
    brushSelection,
    setFilter,
    setActiveTab,
    setSelectedPlantId,
  } = useStore((state) => ({
    filters: state.filters,
    brushSelection: state.brushSelection,
    setFilter: state.setFilter,
    setActiveTab: state.setActiveTab,
    setSelectedPlantId: state.setSelectedPlantId,
  }));

  const batches = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    return [...filtered].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [filters, brushSelection]);

  const plantCards = useMemo<PlantCard[]>(() => {
    return PLANTS.map((plant) => {
      const plantBatches = batches.filter((batch) => batch.plantId === plant.id);
      if (plantBatches.length === 0) {
        return {
          id: plant.id,
          name: plant.name,
          qualityScore: 0,
          defectRate: 0,
          fpy: 0,
          output: 0,
          alarmCount: 0,
          status: 'watch',
          reason: 'Keine Daten im gewählten Zeitraum',
        };
      }

      const kpis = calculateKPIs(plantBatches);
      const output = plantBatches.reduce((acc, batch) => acc + batch.output, 0);
      const alarmCount = plantBatches.filter((batch) => batch.defectRate > 5).length;
      const qualityScore = kpis.coverage > 0
        ? Math.max(0, Math.min(100, Math.round(100 - (kpis.defectRate * 10 + (100 - kpis.fpy) + kpis.scrapRate * 5))))
        : Math.max(0, Math.min(100, Math.round(100 - (kpis.defectRate * 10 + (100 - kpis.fpy) + kpis.scrapRate * 5))));

      let status: PlantCard['status'] = 'good';
      let reason = 'Stabil innerhalb Zielwerte';

      if (qualityScore < 60 || kpis.defectRate > 5.5) {
        status = 'critical';
        reason = 'Mehrere Kennzahlen überschreiten Warnschwelle';
      } else if (qualityScore < 75 || kpis.defectRate > 4) {
        status = 'watch';
        reason = 'Erhöhte Fehlerrate - Maßnahmen prüfen';
      }

      return {
        id: plant.id,
        name: plant.name,
        qualityScore,
        defectRate: kpis.defectRate,
        fpy: kpis.fpy,
        output,
        alarmCount,
        status,
        reason,
      };
    });
  }, [batches]);

  const forecast = useMemo<ForecastInsight>(() => {
    if (batches.length < 6) {
      return {
        current: 0,
        predicted: 0,
        trend: 'stabil',
        warning: 'Zuwenig Datenpunkte für Prognose',
      };
    }

    const lastPoints = batches.slice(-8);
    const lastValue = lastPoints[lastPoints.length - 1].defectRate;
    const changes = lastPoints
      .slice(1)
      .map((item, index) => item.defectRate - lastPoints[index].defectRate);

    const avgChange =
      changes.reduce((acc, value) => acc + value, 0) / Math.max(changes.length, 1);
    const predicted = Math.max(0, Number((lastValue + avgChange * 4).toFixed(2)));

    let trend: ForecastInsight['trend'] = 'stabil';
    if (avgChange > 0.05) trend = 'steigend';
    if (avgChange < -0.05) trend = 'fallend';

    let warning: string | null = null;
    if (predicted > 7) {
      warning = 'Frühwarnung: Kritischer Bereich (> 7 %) in unter 2 Stunden erreichbar.';
    } else if (predicted > 5.5) {
      warning = 'Achtung: Fehlerrate nähert sich 5,5 %. MaÃŸnahmen prüfen.';
    }

    return {
      current: Number(lastValue.toFixed(2)),
      predicted,
      trend,
      warning,
    };
  }, [batches]);

  const maintenanceEvents = useMemo(() => {
    return MAINTENANCE_EVENTS.filter((event) => {
      if (filters.lineId && event.lineId !== filters.lineId) return false;
      return true;
    })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-6);
  }, [filters]);

  const ranking = useMemo(() => {
    const plantRanking = [...plantCards]
      .sort((a, b) => a.defectRate - b.defectRate)
      .map<RankingEntry>((plant, index) => ({
        label: `${index + 1}. ${plant.name}`,
        value: `${plant.defectRate.toFixed(2)}% Fehlerrate`,
        metric: `Quality Score ${plant.qualityScore}`,
        severityClass:
          plant.status === 'critical'
            ? 'text-red-300'
            : plant.status === 'watch'
            ? 'text-yellow-300'
            : 'text-emerald-300',
      }))
      .slice(0, 3);

    const lineRanking = LINES.map((line) => {
      const lineBatches = batches.filter((batch) => batch.lineId === line.id);
      if (lineBatches.length === 0) {
        return null;
      }

      const kpis = calculateKPIs(lineBatches);
      return {
        label: line.name,
        value: `${kpis.defectRate.toFixed(2)}%`,
        severityClass: kpis.defectRate > 5 ? 'text-red-300' : 'text-emerald-300',
      };
    })
      .filter(Boolean)
      .sort((a, b) => parseFloat((a as RankingEntry).value) - parseFloat((b as RankingEntry).value))
      .slice(0, 3) as RankingEntry[];

    const supplierRanking = SUPPLIERS.map((supplier) => {
      const supplierBatches = batches.filter((batch) => batch.supplierId === supplier.id);
      if (supplierBatches.length === 0) return null;

      const avgDefect =
        supplierBatches.reduce((acc, batch) => acc + batch.defectRate, 0) /
        supplierBatches.length;
      return {
        label: supplier.name,
        value: `${avgDefect.toFixed(2)}%`,
        severityClass: avgDefect > 5 ? 'text-red-300' : 'text-dark-muted',
      };
    })
      .filter(Boolean)
      .sort((a, b) => parseFloat((b as RankingEntry).value) - parseFloat((a as RankingEntry).value))
      .slice(0, 3) as RankingEntry[];

    const productRanking = PRODUCTS.map((product) => {
      const productBatches = batches.filter((batch) => batch.productId === product.id);
      if (productBatches.length === 0) return null;
      const avgDefect =
        productBatches.reduce((acc, batch) => acc + batch.defectRate, 0) /
        productBatches.length;

      return {
        label: product.name,
        value: `${avgDefect.toFixed(2)}%`,
        severityClass: avgDefect > 5 ? 'text-red-300' : 'text-dark-muted',
      };
    })
      .filter(Boolean)
      .sort((a, b) => parseFloat((a as RankingEntry).value) - parseFloat((b as RankingEntry).value))
      .slice(0, 3) as RankingEntry[];

    return {
      plantRanking,
      lineRanking,
      supplierRanking,
      productRanking,
    };
  }, [plantCards, batches]);

  const openPlant = (plantId: string) => {
    setSelectedPlantId(plantId);
    setActiveTab('plants');
  };

  const drillDownRanking = (filterKey: 'supplierId' | 'productId', value: string) => {
    setFilter(filterKey, value);
    setActiveTab(filterKey === 'supplierId' ? 'insights' : 'insights');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-primary-100 flex items-center gap-3">
          <Factory className="h-6 w-6 text-primary-200" />
          Werks-KPI-Board - klare Ampeln, klare Entscheidungen
        </h2>
        <p className="text-sm text-dark-muted">
          Qualitätsstatus je Werk mit Begründung, Frühwarnung der nächsten 24 Stunden und Ranking
          über Werke, Linien, Lieferanten, Produkte und Schichten. Maximal vier Klicks führen zur
          ursächlichen Charge.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plantCards.map((plant) => (
          <button
            key={plant.id}
            onClick={() => openPlant(plant.id)}
            className="rounded-2xl border border-dark-border/70 bg-dark-surface/80 p-6 text-left shadow-lg transition-all hover:border-primary-500 hover:bg-primary-900/15"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-100">{plant.name}</h3>
                <p className="text-xs text-dark-muted">Quality Score {plant.qualityScore}</p>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-1 text-xs font-semibold ${
                  plant.status === 'good'
                    ? 'bg-emerald-900/30 text-emerald-200 border border-emerald-600/60'
                    : plant.status === 'watch'
                    ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-600/70'
                    : 'bg-red-900/30 text-red-300 border border-red-700'
                }`}
              >
                {plant.status === 'good' && <CheckCircle2 className="h-4 w-4" />}
                {plant.status === 'watch' && <TrendingUp className="h-4 w-4" />}
                {plant.status === 'critical' && <AlertCircle className="h-4 w-4" />}
                {plant.status === 'good'
                  ? 'Stabil'
                  : plant.status === 'watch'
                  ? 'Im Fokus'
                  : 'Alarm'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-dark-muted">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-dark-muted/70">
                  Fehlerrate
                </span>
                <div className="text-red-300 font-semibold">{plant.defectRate.toFixed(2)}%</div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-dark-muted/70">FPY</span>
                <div className="text-emerald-300 font-semibold">{plant.fpy.toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-dark-muted/70">
                  Ausbringung
                </span>
                <div className="text-primary-200 font-semibold">
                  {plant.output.toLocaleString('de-DE')} Stk
                </div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-dark-muted/70">
                  Alarme
                </span>
                <div className="text-orange-300 font-semibold">{plant.alarmCount}</div>
              </div>
            </div>

            <p className="mt-4 text-xs text-dark-muted leading-relaxed">{plant.reason}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-primary-200">
              Werk öffnen
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-dark-border/70 bg-dark-surface/80 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary-200" />
              Frühwarnung 24 Stunden
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-dark-muted">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-dark-muted/70">Aktuell</span>
              <div className="text-red-300 text-xl font-semibold">
                {forecast.current.toFixed(2)}%
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-dark-muted/70">
                Prognose 24h
              </span>
              <div className="text-orange-300 text-xl font-semibold">
                {forecast.predicted.toFixed(2)}%
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-dark-muted/70">Trend</span>
              <div className="flex items-center gap-2 text-primary-200">
                {forecast.trend === 'steigend' && <TrendingUp className="h-4 w-4" />}
                {forecast.trend === 'fallend' && <TrendingDown className="h-4 w-4" />}
                {forecast.trend === 'stabil' && <Activity className="h-4 w-4" />}
                {forecast.trend.charAt(0).toUpperCase() + forecast.trend.slice(1)}
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-dark-muted/70">
                Empfohlene Aktion
              </span>
              <div className="text-xs text-dark-muted">
                {forecast.trend === 'steigend'
                  ? 'Qualitätsteam informieren und MaÃŸnahmen prüfen.'
                  : forecast.trend === 'fallend'
                  ? 'Entspannung, Monitoring fortsetzen.'
                  : 'Status stabil, regelmäÃŸige Checks beibehalten.'}
              </div>
            </div>
          </div>

          {forecast.warning ? (
            <div className="rounded-xl border border-red-700 bg-red-900/30 px-3 py-3 text-xs text-red-200 flex items-start gap-2">
              <Flame className="h-4 w-4 flex-shrink-0" />
              {forecast.warning}
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-700 bg-emerald-900/20 px-3 py-3 text-xs text-emerald-200 flex items-start gap-2">
              <Gauge className="h-4 w-4 flex-shrink-0" />
              Prognose innerhalb des sicheren Bereichs.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-dark-border/70 bg-dark-surface/80 p-6 shadow-lg space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-200" />
              Wartungs-Timeline
            </h3>
          </div>

          <div className="space-y-3">
            {maintenanceEvents.length === 0 && (
              <div className="rounded-xl border border-dark-border/60 bg-dark-bg/60 px-4 py-4 text-xs text-dark-muted">
                Keine Wartungseinträge im gewählten Zeitraum.
              </div>
            )}
            {maintenanceEvents.map((event) => {
              const line = LINES.find((item) => item.id === event.lineId);
              return (
                <div
                  key={event.id}
                  className="rounded-xl border border-dark-border/60 bg-dark-bg/60 px-4 py-3 text-sm text-dark-muted flex items-center gap-3"
                >
                  <div className="text-xs uppercase tracking-[0.3em] text-dark-muted/70">
                    {event.timestamp.toLocaleString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="text-primary-100">
                      {line?.name ?? event.lineId} {event.type}
                    </div>
                    <div className="text-xs text-dark-muted">
                      Dauer {event.duration} h Â· proaktive Prüfung empfohlen.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-dark-border/70 bg-dark-surface/80 p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-200" />
            Ranking Schnellstart Drill-down
          </h3>
          <div className="text-xs text-dark-muted flex items-center gap-2">
            <Target className="h-4 w-4" />
            Vier Klicks bis zur Ursache
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RankingColumn title="Werke" entries={ranking.plantRanking} />
          <RankingColumn title="Linien" entries={ranking.lineRanking} />
          <RankingColumn title="Lieferanten" entries={ranking.supplierRanking} onEntryClick={(entry) => {
            const supplier = SUPPLIERS.find((item) => entry.label.includes(item.name));
            if (supplier) {
              drillDownRanking('supplierId', supplier.id);
            }
          }} />
          <RankingColumn title="Produkte" entries={ranking.productRanking} onEntryClick={(entry) => {
            const product = PRODUCTS.find((item) => entry.label.includes(item.name));
            if (product) {
              drillDownRanking('productId', product.id);
            }
          }} />
        </div>
      </section>
    </div>
  );
};

interface RankingColumnProps {
  title: string;
  entries: RankingEntry[];
  onEntryClick?: (entry: RankingEntry) => void;
}

const RankingColumn = ({ title, entries, onEntryClick }: RankingColumnProps) => (
  <div className="rounded-2xl border border-dark-border/60 bg-dark-bg/60 p-4">
    <h4 className="text-xs uppercase tracking-[0.3em] text-dark-muted mb-3">{title}</h4>
    <div className="space-y-2 text-sm text-dark-muted">
      {entries.length === 0 && <div className="text-xs text-dark-muted">Keine Daten</div>}
      {entries.map((entry, idx) => (
        <button
          key={`${title}-${idx}`}
          onClick={() => onEntryClick?.(entry)}
          className="w-full text-left rounded-xl border border-dark-border/50 bg-dark-surface/70 px-3 py-3 transition-all hover:border-primary-500 hover:bg-primary-900/15"
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`font-semibold ${entry.severityClass}`}>{entry.label}</span>
            <span className="text-xs text-primary-200">{entry.value}</span>
          </div>
          {entry.metric && (
            <div className="text-[11px] uppercase tracking-[0.3em] text-dark-muted mt-1">
              {entry.metric}
            </div>
          )}
        </button>
      ))}
    </div>
  </div>
);


