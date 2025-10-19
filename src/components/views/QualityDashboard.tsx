import { useMemo } from 'react';
import { AlertTriangle, BarChart2, Download, Filter, LineChart, PackageCheck, Truck } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { BATCHES, PRODUCTS, SUPPLIERS } from '../../data/mockData';
import { filterBatches, calculateKPIs } from '../../utils/filterData';
import {
  buildBatchViewModel,
  severityColorClasses,
  severityLabel,
} from '../../utils/analysis';
import { ReportGenerator } from '../reports/ReportGenerator';

interface ProductIssueRow {
  productId: string;
  productName: string;
  averageDefectRate: number;
  averageFpy: number;
  volume: number;
  topCause: string | null;
  topSupplier: {
    supplierId: string;
    supplierName: string;
    contribution: number;
  } | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface SupplierImpactRow {
  supplierId: string;
  supplierName: string;
  averageDefectRate: number;
  volume: number;
  dominantProduct: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const severityFromRate = (value: number): 'critical' | 'high' | 'medium' | 'low' => {
  if (value > 7) return 'critical';
  if (value > 5) return 'high';
  if (value > 3) return 'medium';
  return 'low';
};

export const QualityDashboard = () => {
  const {
    filters,
    brushSelection,
    setFilter,
    setActiveTab,
    setActiveInsightsCategory,
  } = useStore((state) => ({
    filters: state.filters,
    brushSelection: state.brushSelection,
    setFilter: state.setFilter,
    setActiveTab: state.setActiveTab,
    setActiveInsightsCategory: state.setActiveInsightsCategory,
  }));

  const batches = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    return [...filtered].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [filters, brushSelection]);

  const productIssues = useMemo<ProductIssueRow[]>(() => {
    const groups = new Map<string, ProductIssueRow & { sums: { defect: number; fpy: number }; causes: Map<string, number>; supplierHits: Map<string, number> }>();

    batches
      .filter((batch) => batch.defectRate > 3)
      .forEach((batch) => {
        const product = PRODUCTS.find((item) => item.id === batch.productId);
        const supplier = SUPPLIERS.find((item) => item.id === batch.supplierId);
        const view = buildBatchViewModel(batch);

        const existing =
          groups.get(batch.productId) ??
          {
            productId: batch.productId,
            productName: product?.name ?? batch.productId,
            averageDefectRate: 0,
            averageFpy: 0,
            volume: 0,
            topCause: null,
            topSupplier: null,
            severity: severityFromRate(batch.defectRate),
            sums: { defect: 0, fpy: 0 },
            causes: new Map<string, number>(),
            supplierHits: new Map<string, number>(),
          };

        existing.volume += 1;
        existing.sums.defect += batch.defectRate;
        existing.sums.fpy += batch.fpy;
        existing.severity = severityFromRate(Math.max(existing.severity === 'critical' ? 8 : batch.defectRate, batch.defectRate));

        if (view.primaryDefect) {
          const causeCount = existing.causes.get(view.primaryDefect) ?? 0;
          existing.causes.set(view.primaryDefect, causeCount + 1);
        }
        if (supplier) {
          const supplierCount = existing.supplierHits.get(supplier.id) ?? 0;
          existing.supplierHits.set(supplier.id, supplierCount + 1);
        }

        groups.set(batch.productId, existing);
      });

    return Array.from(groups.values()).map((entry) => {
      const topCause =
        Array.from(entry.causes.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      const topSupplierKey = Array.from(entry.supplierHits.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0];
      const supplierInfo = topSupplierKey
        ? SUPPLIERS.find((supplier) => supplier.id === topSupplierKey[0])
        : null;

      return {
        productId: entry.productId,
        productName: entry.productName,
        averageDefectRate: Number((entry.sums.defect / entry.volume).toFixed(2)),
        averageFpy: Number((entry.sums.fpy / entry.volume).toFixed(1)),
        volume: entry.volume,
        topCause,
        topSupplier: supplierInfo
          ? {
              supplierId: supplierInfo.id,
              supplierName: supplierInfo.name,
              contribution: topSupplierKey?.[1] ?? 0,
            }
          : null,
        severity: severityFromRate(entry.sums.defect / entry.volume),
      };
    });
  }, [batches]);

  const supplierImpact = useMemo<SupplierImpactRow[]>(() => {
    const groups = new Map<
      string,
      SupplierImpactRow & { sums: { defect: number }; products: Map<string, number> }
    >();

    batches
      .filter((batch) => batch.defectRate > 3)
      .forEach((batch) => {
        const supplier = SUPPLIERS.find((item) => item.id === batch.supplierId);
        const product = PRODUCTS.find((item) => item.id === batch.productId);

        if (!supplier) return;

        const existing =
          groups.get(supplier.id) ??
          {
            supplierId: supplier.id,
            supplierName: supplier.name,
            averageDefectRate: 0,
            volume: 0,
            dominantProduct: null,
            severity: severityFromRate(batch.defectRate),
            sums: { defect: 0 },
            products: new Map<string, number>(),
          };

        existing.volume += 1;
        existing.sums.defect += batch.defectRate;
        existing.severity = severityFromRate(Math.max(batch.defectRate, existing.severity === 'critical' ? 8 : batch.defectRate));

        if (product) {
          const count = existing.products.get(product.name) ?? 0;
          existing.products.set(product.name, count + 1);
        }

        groups.set(supplier.id, existing);
      });

    return Array.from(groups.values()).map((entry) => {
      const dominantProduct =
        Array.from(entry.products.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      return {
        supplierId: entry.supplierId,
        supplierName: entry.supplierName,
        averageDefectRate: entry.volume > 0 ? Number((entry.sums.defect / entry.volume).toFixed(2)) : 0,
        volume: entry.volume,
        dominantProduct,
        severity: severityFromRate(entry.sums.defect / Math.max(entry.volume, 1)),
      };
    });
  }, [batches]);

  const handleProductClick = (row: ProductIssueRow) => {
    setFilter('productId', row.productId);
    setActiveInsightsCategory('quality');
    setActiveTab('insights');
  };

  const handleSupplierClick = (row: SupplierImpactRow) => {
    setFilter('supplierId', row.supplierId);
    setActiveInsightsCategory('suppliers');
    setActiveTab('insights');
  };

  const overallKpis = useMemo(() => calculateKPIs(batches), [batches]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-primary-100 flex items-center gap-3">
          <PackageCheck className="h-6 w-6 text-primary-200" />
          QS-Konsole â€“ von Ursache bis Lieferantenwirkung
        </h2>
        <p className="text-sm text-dark-muted">
          Jeder Klick setzt Produkt- oder Lieferantenfilter global und öffnet automatisch die
          passenden Insights. Der Report-Generator liefert PDF & CSV ohne Excel-Nacharbeit.
        </p>
      </header>

      <section className="rounded-2xl border border-dark-border/70 bg-dark-surface/80 p-6 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary-200" />
              Fehlerhafte Produkte
            </h3>
            <p className="text-xs text-dark-muted">
              Durchschnittswerte basierend auf allen Chargen der letzten {filters.timeRange === '7d' ? '7 Tage' : filters.timeRange === '24h' ? '24 Stunden' : '30 Tage'}.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-dark-muted">
            <Filter className="h-4 w-4" />
            {productIssues.length} betroffene Produkte
          </div>
        </div>

        <div className="overflow-auto scrollbar-thin rounded-xl border border-dark-border/60">
          <table className="min-w-full text-sm">
            <thead className="bg-dark-bg/60">
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-dark-muted">
                <th className="px-4 py-3 font-medium">Produkt</th>
                <th className="px-4 py-3 font-medium">Fehlerrate</th>
                <th className="px-4 py-3 font-medium">FPY</th>
                <th className="px-4 py-3 font-medium">Volumen</th>
                <th className="px-4 py-3 font-medium">Hauptursache</th>
                <th className="px-4 py-3 font-medium">Lieferantenwirkung</th>
              </tr>
            </thead>
            <tbody>
              {productIssues.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-dark-muted">
                    Keine Produkte mit erhöhter Fehlerrate.
                  </td>
                </tr>
              )}
              {productIssues.map((row) => (
                <tr
                  key={row.productId}
                  className="border-t border-dark-border/60 hover:bg-primary-900/10 transition-colors cursor-pointer"
                  onClick={() => handleProductClick(row)}
                >
                  <td className="px-4 py-3 text-primary-100 font-medium">{row.productName}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-red-300">{row.averageDefectRate.toFixed(2)}%</span>
                  </td>
                  <td className="px-4 py-3 text-emerald-200">{row.averageFpy.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-dark-muted">{row.volume}</td>
                  <td className="px-4 py-3 text-dark-muted">
                    {row.topCause ?? 'Analyse erforderlich'}
                  </td>
                  <td className="px-4 py-3">
                    {row.topSupplier ? (
                      <span
                        className="inline-flex items-center gap-2 rounded-xl border border-dark-border/60 bg-dark-bg/60 px-3 py-1 text-xs text-primary-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleSupplierClick({
                            supplierId: row.topSupplier!.supplierId,
                            supplierName: row.topSupplier!.supplierName,
                            averageDefectRate: row.averageDefectRate,
                            volume: row.volume,
                            dominantProduct: row.productName,
                            severity: row.severity,
                          });
                        }}
                      >
                        <Truck className="h-3.5 w-3.5" />
                        {row.topSupplier.supplierName}
                      </span>
                    ) : (
                      <span className="text-dark-muted text-xs">Keine Auffälligkeit</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-dark-muted">
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-300" />
            Jeder Alarm enthält Ursache & Klärungsstatus im Drawer.
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-dark-border/70 bg-dark-surface/80 p-6 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary-200" />
              Lieferantenwirkung
            </h3>
            <p className="text-xs text-dark-muted">
              Klick auf einen Lieferanten aktualisiert Kennzahlen global und springt zu den
              Lieferanten-Insights.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-dark-muted">
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Delta FPY: {overallKpis.fpyDelta.toFixed(1)} %
            </span>
            <span className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Delta Fehlerrate: {overallKpis.defectRateDelta.toFixed(1)} %
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {supplierImpact.slice(0, 6).map((row) => (
            <button
              key={row.supplierId}
              onClick={() => handleSupplierClick(row)}
              className={`rounded-2xl border px-4 py-4 text-left transition-all hover:border-primary-500 hover:bg-primary-900/20 ${severityColorClasses(
                row.severity
              )}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-primary-100">{row.supplierName}</div>
                <div className="text-xs text-dark-muted">{row.volume} Chargen</div>
              </div>
              <div className="mt-2 text-xs text-dark-muted">
                Fehlerrate <span className="font-semibold text-red-200">{row.averageDefectRate.toFixed(2)}%</span>
              </div>
              <div className="mt-1 text-xs text-dark-muted">
                Schwerpunkt: {row.dominantProduct ?? 'keine Zuordnung'}
              </div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-dark-border/60 bg-dark-bg/60 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-dark-muted">
                {severityLabel(row.severity)}
              </div>
            </button>
          ))}
        </div>
      </section>

      <ReportGenerator />
    </div>
  );
};


