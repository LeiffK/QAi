import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { BATCHES } from '../../data/mockData';
import { filterBatches } from '../../utils/filterData';
import { buildBatchViewModel, severityColorClasses, severityLabel } from '../../utils/analysis';
import { AlertOctagon, AlertTriangle, CheckCircle, ClipboardList, Info } from 'lucide-react';

type AlertLevel = 'all' | 'critical' | 'high' | 'medium';

const annotationStatusLabels: Record<
  'offen' | 'in_pruefung' | 'geklaert' | 'zurueckgestellt',
  string
> = {
  offen: 'Offen',
  in_pruefung: 'In Pruefung',
  geklaert: 'Geklaert',
  zurueckgestellt: 'Zurueckgestellt',
};

export const AlertsView = () => {
  const {
    filters,
    brushSelection,
    openDrawer,
    setSelectedPlantId,
    setActiveTab,
    chargeAnnotations,
  } = useStore((state) => ({
    filters: state.filters,
    brushSelection: state.brushSelection,
    openDrawer: state.openDrawer,
    setSelectedPlantId: state.setSelectedPlantId,
    setActiveTab: state.setActiveTab,
    chargeAnnotations: state.chargeAnnotations,
  }));
  const [alertLevel, setAlertLevel] = useState<AlertLevel>('all');

  const alerts = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection).filter(
      (batch) => batch.defectRate > 3
    );

    return filtered
      .map((batch) => buildBatchViewModel(batch))
      .filter((alert) => {
        if (alertLevel === 'all') return true;
        if (alertLevel === 'critical') return alert.analysis.severity === 'critical';
        if (alertLevel === 'high') return alert.analysis.severity === 'high';
        return alert.analysis.severity === 'medium';
      })
      .sort((a, b) => b.defectRate - a.defectRate);
  }, [filters, brushSelection, alertLevel]);

  const stats = useMemo(() => {
    const total = alerts.length;
    const critical = alerts.filter((alert) => alert.analysis.severity === 'critical').length;
    const high = alerts.filter((alert) => alert.analysis.severity === 'high').length;
    const medium = alerts.filter((alert) => alert.analysis.severity === 'medium').length;
    return { total, critical, high, medium };
  }, [alerts]);

  const handleAlertClick = (alert: any) => openDrawer('batch', alert);

  const handleGoToLine = (alert: any) => {
    setSelectedPlantId(alert.plantId);
    setActiveTab('plants');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-400 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary-200" />
            Alarm-Center
          </h2>
          <p className="text-sm text-dark-muted mt-1">
            Uebersicht aller Chargen mit Fehlerrate ueber 3 Prozent inklusive Ursache und
            Massnahme.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Gesamt" value={stats.total} tone="default" />
        <StatCard label="Kritisch (>7%)" value={stats.critical} tone="critical" />
        <StatCard label="Hoch (5-7%)" value={stats.high} tone="warning" />
        <StatCard label="Mittel (3-5%)" value={stats.medium} tone="info" />
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-dark-muted">Filter:</span>
          {(['all', 'critical', 'high', 'medium'] as AlertLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setAlertLevel(level)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                alertLevel === level
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-border text-dark-text hover:bg-dark-border/70'
              }`}
            >
              {level === 'critical' && <AlertOctagon className="h-4 w-4" />}
              {level === 'high' && <AlertTriangle className="h-4 w-4" />}
              {level === 'medium' && <Info className="h-4 w-4" />}
              {level === 'all' ? 'Alle' : level === 'critical' ? 'Kritisch' : level === 'high' ? 'Hoch' : 'Mittel'}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-xs uppercase tracking-[0.2em] text-dark-muted">
                <th className="px-2 py-3 text-left">Level</th>
                <th className="px-2 py-3 text-left">Charge</th>
                <th className="px-2 py-3 text-left">Werk / Linie</th>
                <th className="px-2 py-3 text-left">Produkt</th>
                <th className="px-2 py-3 text-left">Ursache</th>
                <th className="px-2 py-3 text-left">Massnahme</th>
                <th className="px-2 py-3 text-right">Fehlerrate</th>
                <th className="px-2 py-3 text-left">Zeit</th>
                <th className="px-2 py-3 text-left">Status</th>
                <th className="px-2 py-3 text-left">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => {
                const annotation = chargeAnnotations[alert.id];
                return (
                  <tr
                    key={alert.id}
                    className="border-b border-dark-border/60 hover:bg-dark-border/20 transition-colors"
                  >
                    <td className="px-2 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold ${severityColorClasses(
                          alert.analysis.severity
                        )}`}
                      >
                        {severityLabel(alert.analysis.severity)}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-primary-200 font-semibold">{alert.id}</td>
                    <td className="px-2 py-3 text-dark-muted">
                      {alert.plantName} / {alert.lineName}
                    </td>
                    <td className="px-2 py-3 text-dark-muted">{alert.productName}</td>
                    <td className="px-2 py-3 text-xs text-dark-text">{alert.analysis.cause}</td>
                    <td className="px-2 py-3 text-xs text-primary-200">
                      {alert.analysis.measures[0]}
                    </td>
                    <td className="px-2 py-3 text-right text-red-300 font-bold">
                      {alert.defectRate.toFixed(2)}%
                    </td>
                    <td className="px-2 py-3 text-xs text-dark-muted">
                      {alert.timestamp.toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-2 py-3 text-xs text-dark-muted">
                      {annotation ? annotationStatusLabels[annotation.status] : 'Offen'}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAlertClick(alert)}
                          className="rounded-lg bg-primary-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-primary-500"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleGoToLine(alert)}
                          className="rounded-lg bg-dark-border px-3 py-1 text-xs font-semibold text-dark-text transition-colors hover:bg-dark-border/70"
                        >
                          Linie
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-12 text-dark-muted">
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-emerald-300" />
            Keine Alarme fuer die gewählten Filter.
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  tone: 'default' | 'critical' | 'warning' | 'info';
}

const StatCard = ({ label, value, tone }: StatCardProps) => {
  const toneClasses =
    tone === 'critical'
      ? 'bg-red-900/20 border border-red-700 text-red-200'
      : tone === 'warning'
      ? 'bg-yellow-900/20 border border-yellow-700 text-yellow-200'
      : tone === 'info'
      ? 'bg-primary-900/20 border border-primary-700 text-primary-200'
      : 'bg-dark-bg/60 border border-dark-border text-dark-text';

  return (
    <div className={`rounded-2xl px-5 py-4 ${toneClasses}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-[0.3em] text-dark-muted mt-2">{label}</div>
    </div>
  );
};

