import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { BATCHES, PLANTS, LINES, PRODUCTS, SUPPLIERS } from '../../data/mockData';
import { filterBatches } from '../../utils/filterData';
import { AlertOctagon, AlertTriangle, Info, CheckCircle } from 'lucide-react';

type AlertLevel = 'all' | 'critical' | 'high' | 'medium';

export const AlertsView = () => {
  const { filters, brushSelection, openDrawer, setSelectedPlantId, setActiveTab } = useStore();
  const [alertLevel, setAlertLevel] = useState<AlertLevel>('all');

  const alerts = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);

    // Only show batches with defect rate > 3%
    const alertBatches = filtered.filter((b) => b.defectRate > 3);

    return alertBatches.map((batch) => {
      const plant = PLANTS.find((p) => p.id === batch.plantId);
      const line = LINES.find((l) => l.id === batch.lineId);
      const product = PRODUCTS.find((p) => p.id === batch.productId);
      const supplier = SUPPLIERS.find((s) => s.id === batch.supplierId);

      let level: 'critical' | 'high' | 'medium' = 'medium';
      if (batch.defectRate > 7) level = 'critical';
      else if (batch.defectRate > 5) level = 'high';

      return {
        ...batch,
        plantName: plant?.name || batch.plantId,
        lineName: line?.name || batch.lineId,
        productName: product?.name || batch.productId,
        supplierName: supplier?.name || batch.supplierId,
        level,
      };
    }).filter((alert) => {
      if (alertLevel === 'all') return true;
      return alert.level === alertLevel;
    }).sort((a, b) => b.defectRate - a.defectRate); // Highest first
  }, [filters, brushSelection, alertLevel]);

  const stats = useMemo(() => {
    const allAlerts = filterBatches(BATCHES, filters, brushSelection).filter((b) => b.defectRate > 3);
    return {
      total: allAlerts.length,
      critical: allAlerts.filter((b) => b.defectRate > 7).length,
      high: allAlerts.filter((b) => b.defectRate > 5 && b.defectRate <= 7).length,
      medium: allAlerts.filter((b) => b.defectRate > 3 && b.defectRate <= 5).length,
    };
  }, [filters, brushSelection]);

  const handleAlertClick = (alert: any) => {
    openDrawer('batch', alert);
  };

  const handleGoToLine = (alert: any) => {
    setSelectedPlantId(alert.plantId);
    setActiveTab('plants');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-400">Alarm-Center</h2>
          <p className="text-sm text-dark-muted mt-1">
            Übersicht aller Chargen mit erhöhter Fehlerrate (&gt; 3%)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-3xl font-bold text-dark-text">{stats.total}</div>
          <div className="text-sm text-dark-muted">Gesamt</div>
        </div>
        <div className="card p-4 bg-red-900/10 border-red-700">
          <div className="text-3xl font-bold text-red-400">{stats.critical}</div>
          <div className="text-sm text-dark-muted">Kritisch (&gt;7%)</div>
        </div>
        <div className="card p-4 bg-yellow-900/10 border-yellow-700">
          <div className="text-3xl font-bold text-yellow-400">{stats.high}</div>
          <div className="text-sm text-dark-muted">Hoch (5-7%)</div>
        </div>
        <div className="card p-4 bg-primary-900/10 border-primary-700">
          <div className="text-3xl font-bold text-primary-400">{stats.medium}</div>
          <div className="text-sm text-dark-muted">Mittel (3-5%)</div>
        </div>
      </div>

      {/* Level Filter */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-dark-muted">Filter:</span>
          {(['all', 'critical', 'high', 'medium'] as AlertLevel[]).map((level) => {
            const getIcon = () => {
              if (level === 'critical') return <AlertOctagon className="w-4 h-4" />;
              if (level === 'high') return <AlertTriangle className="w-4 h-4" />;
              if (level === 'medium') return <Info className="w-4 h-4" />;
              return null;
            };

            return (
              <button
                key={level}
                onClick={() => setAlertLevel(level)}
                className={`
                  flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all text-sm
                  ${
                    alertLevel === level
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-border text-dark-text hover:bg-dark-border/70'
                  }
                `}
              >
                {getIcon()}
                <span>
                  {level === 'all' && 'Alle'}
                  {level === 'critical' && 'Kritisch'}
                  {level === 'high' && 'Hoch'}
                  {level === 'medium' && 'Mittel'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="card p-5">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-2 font-medium text-dark-muted">Level</th>
                <th className="text-left py-3 px-2 font-medium text-dark-muted">Charge</th>
                <th className="text-left py-3 px-2 font-medium text-dark-muted">Werk</th>
                <th className="text-left py-3 px-2 font-medium text-dark-muted">Linie</th>
                <th className="text-left py-3 px-2 font-medium text-dark-muted">Produkt</th>
                <th className="text-right py-3 px-2 font-medium text-dark-muted">Fehlerrate</th>
                <th className="text-left py-3 px-2 font-medium text-dark-muted">Zeitpunkt</th>
                <th className="text-left py-3 px-2 font-medium text-dark-muted">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="border-b border-dark-border/50 hover:bg-dark-border/30 transition-colors"
                >
                  <td className="py-3 px-2">
                    <span
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                        ${
                          alert.level === 'critical'
                            ? 'bg-red-900/30 text-red-300 border border-red-700'
                            : alert.level === 'high'
                            ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                            : 'bg-primary-900/30 text-primary-300 border border-primary-700'
                        }
                      `}
                    >
                      {alert.level === 'critical' && <><AlertOctagon className="w-3 h-3" /> Kritisch</>}
                      {alert.level === 'high' && <><AlertTriangle className="w-3 h-3" /> Hoch</>}
                      {alert.level === 'medium' && <><Info className="w-3 h-3" /> Mittel</>}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-primary-400 font-medium">{alert.id}</td>
                  <td className="py-3 px-2">{alert.plantName}</td>
                  <td className="py-3 px-2">{alert.lineName}</td>
                  <td className="py-3 px-2">{alert.productName}</td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-red-400 font-bold">{alert.defectRate.toFixed(2)}%</span>
                  </td>
                  <td className="py-3 px-2 text-dark-muted text-xs">
                    {new Date(alert.timestamp).toLocaleString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAlertClick(alert)}
                        className="text-xs px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleGoToLine(alert)}
                        className="text-xs px-2 py-1 bg-dark-border hover:bg-dark-border/70 text-dark-text rounded transition-colors"
                      >
                        → Linie
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {alerts.length === 0 && (
            <div className="text-center py-12 text-dark-muted">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <div>Keine Alarme für die gewählten Filter.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
