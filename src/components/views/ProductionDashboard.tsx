import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart2,
  CalendarClock,
  ClipboardList,
  Clock,
  Factory,
  Flame,
  Info,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { BATCHES } from '../../data/mockData';
import { filterBatches } from '../../utils/filterData';
import {
  buildBatchViewModel,
  severityColorClasses,
  severityLabel,
  type BatchViewModel,
} from '../../utils/analysis';

type AlarmLevelFilter = 'all' | 'critical' | 'high' | 'medium';

const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const formatTimestamp = (date: Date) =>
  date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const ProductionDashboard = () => {
  const {
    filters,
    brushSelection,
    openDrawer,
    resetFilters,
    setActiveTab,
    setSelectedPlantId,
  } = useStore((state) => ({
    filters: state.filters,
    brushSelection: state.brushSelection,
    openDrawer: state.openDrawer,
    resetFilters: state.resetFilters,
    setActiveTab: state.setActiveTab,
    setSelectedPlantId: state.setSelectedPlantId,
  }));

  const [alarmLevel, setAlarmLevel] = useState<AlarmLevelFilter>('all');

  const batches = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    return [...filtered].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [filters, brushSelection]);

  const metrics = useMemo(() => {
    if (batches.length === 0) {
      return {
        defectRate: 0,
        fpy: 0,
        scrapRate: 0,
        coverage: 0,
        activeAlarms: 0,
      };
    }

    const total = batches.length;
    const defectRate = batches.reduce((acc, batch) => acc + batch.defectRate, 0) / total;
    const fpy = batches.reduce((acc, batch) => acc + batch.fpy, 0) / total;
    const scrapRate = batches.reduce((acc, batch) => acc + batch.scrapRate, 0) / total;
    const coverage =
      (batches.filter((batch) => batch.fpy >= 95).length / total) * 100;
    const activeAlarms = batches.filter((batch) => batch.defectRate > 5).length;

    return {
      defectRate: Number(defectRate.toFixed(2)),
      fpy: Number(fpy.toFixed(1)),
      scrapRate: Number(scrapRate.toFixed(2)),
      coverage: Number(coverage.toFixed(1)),
      activeAlarms,
    };
  }, [batches]);

  const alarms = useMemo(() => {
    return batches
      .filter((batch) => batch.defectRate > 3)
      .map((batch) => buildBatchViewModel(batch))
      .sort((a, b) => {
        const orderDiff = severityOrder[a.analysis.severity] - severityOrder[b.analysis.severity];
        if (orderDiff !== 0) return orderDiff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
  }, [batches]);

  const filteredAlarms = useMemo(() => {
    if (alarmLevel === 'all') return alarms;
    return alarms.filter((alarm) => alarm.analysis.severity === alarmLevel);
  }, [alarms, alarmLevel]);

  const handover = useMemo(() => {
    const latestAlarms = alarms.slice(0, 3);
    const recentBatch = batches.length > 0 ? buildBatchViewModel(batches[0]) : null;

    const defectMap = new Map<string, number>();
    batches.slice(0, 80).forEach((batch) =>
      batch.defects?.forEach((defect) => {
        defectMap.set(defect.type, (defectMap.get(defect.type) ?? 0) + defect.count);
      })
    );

    const topDefects = Array.from(defectMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    const openMeasures = latestAlarms.flatMap((alarm) => {
      const [firstMeasure] = alarm.analysis.measures;
      if (!firstMeasure) return [];
      return [
        {
          id: `${alarm.id}-measure`,
          measure: firstMeasure,
          severity: alarm.analysis.severity,
          chargeId: alarm.id,
        },
      ];
    });

    const windowStart = batches[batches.length - 1]?.timestamp;
    const windowEnd = batches[0]?.timestamp;

    return {
      latestAlarms,
      recentBatch,
      topDefects,
      openMeasures,
      window:
        windowStart && windowEnd
          ? `${formatTimestamp(windowStart)} - ${formatTimestamp(windowEnd)}`
          : null,
    };
  }, [alarms, batches]);

  const goToAlerts = () => {
    setActiveTab('alerts');
  };

  const goToTraceability = () => {
    setActiveTab('traceability');
  };

  const goToPlants = (plantId: string) => {
    setSelectedPlantId(plantId);
    setActiveTab('plants');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-primary-200 tracking-wide">
          Schichtcockpit Produktion - Sicherheit im Fokus
        </h2>
        <p className="text-sm text-dark-muted">
          Alle Kennzahlen der aktiven Schicht auf einen Blick. Drei Klicks fuehren von der Anmeldung
          zur Detailcharge mit konkreter Massnahme.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5 text-red-300" />}
          label="Fehlerrate"
          value={`${metrics.defectRate.toFixed(2)} %`}
          helper="Grenzwert 3 %"
        />
        <MetricCard
          icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}
          label="FPY"
          value={`${metrics.fpy.toFixed(1)} %`}
          helper=">= 95 % angestrebt"
        />
        <MetricCard
          icon={<Flame className="h-5 w-5 text-orange-300" />}
          label="Ausschuss"
          value={`${metrics.scrapRate.toFixed(2)} %`}
          helper="Reduzieren"
        />
        <MetricCard
          icon={<Activity className="h-5 w-5 text-primary-200" />}
          label="Aktive Alarme"
          value={metrics.activeAlarms}
          helper="> 5 % markiert"
        />
        <MetricCard
          icon={<ShieldCheck className="h-5 w-5 text-sky-300" />}
          label="Abdeckung"
          value={`${metrics.coverage.toFixed(1)} %`}
          helper="FPY >= 95 %"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3 rounded-2xl border border-dark-border/70 bg-dark-surface/80 p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-300" />
                Priorisierte Alarme
              </h3>
              <p className="text-xs text-dark-muted mt-1">
                Jeder Eintrag zeigt Produkt, Linie, Zeit, Ursache und empfohlene Massnahme.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'critical', 'high', 'medium'] as AlarmLevelFilter[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setAlarmLevel(level)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    alarmLevel === level
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-border/60 text-dark-muted hover:bg-dark-border'
                  }`}
                >
                  {level === 'all' && 'Alle'}
                  {level === 'critical' && '> 7 %'}
                  {level === 'high' && '5 - 7 %'}
                  {level === 'medium' && '3 - 5 %'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredAlarms.length === 0 ? (
              <div className="rounded-xl border border-green-700 bg-green-900/20 px-4 py-6 text-sm text-emerald-200 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Keine Alarme innerhalb der gewählten Filter.
              </div>
            ) : (
              filteredAlarms.slice(0, 8).map((alarm) => (
                <button
                  key={alarm.id}
                  onClick={() => openDrawer('batch', alarm)}
                  className="w-full text-left rounded-xl border border-dark-border/60 bg-dark-bg/60 px-4 py-4 transition-all hover:border-primary-600 hover:bg-primary-900/20"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityColorClasses(
                        alarm.analysis.severity
                      )}`}
                    >
                      {severityLabel(alarm.analysis.severity)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-primary-100">
                        <span className="font-semibold">{alarm.productName}</span>
                        <span className="text-dark-muted">/</span>
                        <span>{alarm.lineName}</span>
                        <span className="text-dark-muted">/</span>
                        <span>{formatTimestamp(alarm.timestamp)}</span>
                      </div>
                      <div className="text-xs text-dark-muted leading-relaxed">
                        <strong>Ursache:</strong> {alarm.analysis.cause}
                      </div>
                      <div className="text-xs text-primary-200 leading-relaxed">
                        <strong>Massnahme:</strong> {alarm.analysis.measures[0]}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-red-300">
                        {alarm.defectRate.toFixed(2)}%
                      </div>
                      <div className="text-xs text-dark-muted">Charge {alarm.id}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-dark-muted">
            <button
              onClick={goToAlerts}
              className="flex items-center gap-2 rounded-xl border border-primary-600/40 bg-primary-900/20 px-3 py-2 text-primary-100 hover:bg-primary-900/30"
            >
              <ClipboardList className="h-4 w-4" />
              Komplettes Alarm-Center öffnen
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-xl border border-dark-border/60 bg-dark-bg/60 px-3 py-2 hover:border-primary-500 hover:text-primary-100"
            >
              <RefreshCw className="h-4 w-4" />
              Filter zurücksetzen
            </button>
          </div>
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-dark-border/70 bg-dark-surface/80 p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-200" />
              Handover Panel - Schichtwechsel &lt; 60 s
            </h3>
            {handover.window && (
              <span className="text-xs text-dark-muted flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                {handover.window}
              </span>
            )}
          </div>

          <section>
            <h4 className="text-xs uppercase tracking-[0.35em] text-dark-muted mb-2">
              Letzte Alarme
            </h4>
            <div className="space-y-2">
              {handover.latestAlarms.length === 0 && (
                <div className="rounded-xl border border-dark-border/60 bg-dark-bg/60 px-3 py-3 text-xs text-dark-muted">
                  Keine Alarme in der aktuellen Schicht.
                </div>
              )}
              {handover.latestAlarms.map((item) => (
                <button
                  key={`handover-${item.id}`}
                  onClick={() => openDrawer('batch', item)}
                  className="w-full rounded-xl border border-dark-border/60 bg-dark-bg/60 px-3 py-3 text-left transition-all hover:border-primary-500 hover:bg-primary-900/20"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm text-primary-100 font-medium">{item.productName}</div>
                      <div className="text-xs text-dark-muted">
                        {item.lineName} / {formatTimestamp(item.timestamp)}
                      </div>
                    </div>
                    <div className="text-xs text-red-300 font-semibold">
                      {item.defectRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-dark-muted">
                    {item.analysis.measures[0]}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-[0.35em] text-dark-muted mb-2">
              Offene Maßnahmen
            </h4>
            <div className="space-y-2">
              {handover.openMeasures.length === 0 && (
                <div className="rounded-xl border border-dark-border/60 bg-dark-bg/60 px-3 py-3 text-xs text-dark-muted">
                  Keine offenen Maßnahmen - weiter produzieren.
                </div>
              )}
              {handover.openMeasures.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-xs ${severityColorClasses(
                    item.severity
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.measure}</span>
                    <span className="font-semibold text-right">Charge {item.chargeId}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-xs uppercase tracking-[0.35em] text-dark-muted mb-2">
                Top-Defekte
              </h4>
              <div className="space-y-2">
                {handover.topDefects.length === 0 && (
                  <div className="rounded-xl border border-dark-border/60 bg-dark-bg/60 px-3 py-3 text-xs text-dark-muted">
                    Keine Defekte erfasst.
                  </div>
                )}
                {handover.topDefects.map((defect) => (
                  <div
                    key={defect.type}
                    className="rounded-xl border border-dark-border/60 bg-dark-bg/60 px-3 py-3 text-xs text-dark-muted flex items-center justify-between"
                  >
                    <span className="font-medium text-primary-100">{defect.type}</span>
                    <span>{defect.count} Befunde</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.35em] text-dark-muted mb-2">
                Jüngste Charge
              </h4>
              {handover.recentBatch ? (
                <div className="rounded-xl border border-dark-border/60 bg-dark-bg/60 px-3 py-3 text-xs text-dark-muted space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-100 font-semibold">
                      Charge {handover.recentBatch.id}
                    </span>
                    <span>{handover.recentBatch.defectRate.toFixed(2)}%</span>
                  </div>
                  <div>{handover.recentBatch.productName}</div>
                  <div>{handover.recentBatch.lineName}</div>
                  <div>{formatTimestamp(handover.recentBatch.timestamp)}</div>
                  <button
                    onClick={() => openDrawer('batch', handover.recentBatch as BatchViewModel)}
                    className="mt-2 inline-flex items-center gap-2 rounded-xl border border-primary-500/40 bg-primary-900/20 px-3 py-2 text-primary-100 hover:bg-primary-900/30"
                  >
                    <Info className="h-4 w-4" />
                    Detailansicht oeffnen
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-dark-border/60 bg-dark-bg/60 px-3 py-3 text-xs text-dark-muted">
                  Keine Charge ausgewählt.
                </div>
              )}
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3 text-xs text-dark-muted">
            <button
              onClick={goToTraceability}
              className="flex items-center gap-2 rounded-xl border border-dark-border/60 bg-dark-bg/60 px-3 py-2 hover:border-primary-500 hover:text-primary-100"
            >
              <BarChart2 className="h-4 w-4" />
              Traceability oeffnen
            </button>
            <button
              onClick={() => goToPlants(filters.plantId ?? '')}
              disabled={!filters.plantId}
              className="flex items-center gap-2 rounded-xl border border-dark-border/60 bg-dark-bg/60 px-3 py-2 disabled:opacity-50 hover:border-primary-500 hover:text-primary-100"
            >
              <Factory className="h-4 w-4" />
              Werkansicht
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  helper: string;
}

const MetricCard = ({ icon, label, value, helper }: MetricCardProps) => (
  <div className="rounded-2xl border border-dark-border/60 bg-dark-bg/60 p-5 shadow-inner">
    <div className="flex items-center justify-between">
      <div className="rounded-2xl bg-dark-border/70 p-2">{icon}</div>
      <span className="text-xs uppercase tracking-[0.3em] text-dark-muted">{helper}</span>
    </div>
    <div className="mt-4 text-2xl font-semibold text-primary-100">{value}</div>
    <div className="text-xs text-dark-muted mt-1 uppercase tracking-[0.25em]">{label}</div>
  </div>
);

