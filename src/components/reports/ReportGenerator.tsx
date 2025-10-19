import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Loader2, Send, Settings } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { filterBatches, calculateKPIs, getDateRange } from '../../utils/filterData';
import { buildBatchViewModel } from '../../utils/analysis';
import { BATCHES, PRODUCTS, SUPPLIERS } from '../../data/mockData';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);

export const ReportGenerator = () => {
  const { filters, brushSelection } = useStore((state) => ({
    filters: state.filters,
    brushSelection: state.brushSelection,
  }));

  const [title, setTitle] = useState('QS-Report');
  const [productId, setProductId] = useState<string>('all');
  const [supplierId, setSupplierId] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const batches = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);
    return filtered.filter(
      (batch) =>
        (productId === 'all' || batch.productId === productId) &&
        (supplierId === 'all' || batch.supplierId === supplierId)
    );
  }, [filters, brushSelection, productId, supplierId]);

  const reportRange = useMemo(() => {
    if (batches.length === 0) {
      const range = getDateRange(filters.timeRange, filters.customStartDate, filters.customEndDate);
      return `${range.start.toLocaleDateString('de-DE')} – ${range.end.toLocaleDateString('de-DE')}`;
    }
    const sorted = [...batches].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return `${sorted[0].timestamp.toLocaleDateString('de-DE')} – ${
      sorted[sorted.length - 1].timestamp.toLocaleDateString('de-DE')
    }`;
  }, [batches, filters]);

  const metrics = useMemo(() => calculateKPIs(batches), [batches]);
  const enrichedRows = useMemo(
    () => batches.map((batch) => buildBatchViewModel(batch)),
    [batches]
  );

  const handleGenerate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsGenerating(true);
    setMessage(null);

    if (enrichedRows.length === 0) {
      setMessage('Keine Daten für den ausgewählten Filter – bitte Filter anpassen.');
      setIsGenerating(false);
      return;
    }

    const fileNameBase = slugify(title || 'qs-report');
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text(title || 'QS-Report', 14, 18);
    pdf.setFontSize(10);
    pdf.text(`Zeitraum: ${reportRange}`, 14, 28);
    pdf.text(
      `Filter: ${
        productId === 'all'
          ? 'Alle Produkte'
          : PRODUCTS.find((product) => product.id === productId)?.name ?? productId
      } · ${
        supplierId === 'all'
          ? 'Alle Lieferanten'
          : SUPPLIERS.find((supplier) => supplier.id === supplierId)?.name ?? supplierId
      }`,
      14,
      34
    );

    pdf.setFontSize(11);
    const overviewLines = [
      `Fehlerrate: ${metrics.defectRate.toFixed(2)} % (Δ ${metrics.defectRateDelta.toFixed(1)} % )`,
      `FPY: ${metrics.fpy.toFixed(1)} % (Δ ${metrics.fpyDelta.toFixed(1)} % )`,
      `Ausschuss: ${metrics.scrapRate.toFixed(2)} % (Δ ${metrics.scrapRateDelta.toFixed(1)} % )`,
      `Abdeckung: ${metrics.coverage.toFixed(1)} % (Δ ${metrics.coverageDelta.toFixed(1)} % )`,
      `Alarme: ${metrics.alarms} (Δ ${metrics.alarmsDelta.toFixed(1)} % )`,
    ];

    let positionY = 48;
    overviewLines.forEach((line) => {
      pdf.text(line, 14, positionY);
      positionY += 6;
    });

    pdf.setFontSize(11);
    pdf.text(
      'Top-Chargen (Charge -> Produkt -> Linie -> Fehlerrate -> Ursache -> Maßnahme)',
      14,
      positionY + 4
    );
    positionY += 10;
    pdf.setFontSize(9);

    enrichedRows.slice(0, 20).forEach((row) => {
      const text = `${row.id} -> ${row.productName} -> ${row.lineName} -> ${row.defectRate.toFixed(
        2
      )}% -> ${row.analysis.cause} -> ${row.analysis.measures[0]}`;
      pdf.text(text.substring(0, 120), 14, positionY, { maxWidth: 180 });
      positionY += 6;
      if (positionY > 270) {
        pdf.addPage();
        positionY = 20;
      }
    });

    pdf.save(`${fileNameBase}.pdf`);

    const csvHeader = [
      'Charge',
      'Produkt',
      'Werk',
      'Linie',
      'Fehlerrate (%)',
      'FPY (%)',
      'Ausschuss (%)',
      'Ursache',
      'Empfohlene Maßnahme',
    ];

    const csvRows = enrichedRows.map((row) => [
      row.id,
      row.productName,
      row.plantName,
      row.lineName,
      row.defectRate.toFixed(2),
      row.fpy.toFixed(1),
      row.scrapRate.toFixed(2),
      row.analysis.cause.replace(/[\r\n]+/g, ' '),
      row.analysis.measures[0]?.replace(/[\r\n]+/g, ' ') ?? '',
    ]);

    const csvContent = [csvHeader, ...csvRows]
      .map((columns) => columns.map((value) => `"${value}"`).join(';'))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileNameBase}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setMessage('Report als PDF und CSV gespeichert.');
    setIsGenerating(false);
  };

  return (
    <section className="rounded-2xl border border-dark-border/70 bg-dark-surface/80 p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-200" />
          Report-Generator
        </h3>
        <span className="text-xs text-dark-muted uppercase tracking-[0.3em]">
          3 Eingaben · 1 Klick
        </span>
      </div>

      <form className="grid grid-cols-1 gap-4 md:grid-cols-4" onSubmit={handleGenerate}>
        <label className="flex flex-col gap-2 text-xs text-dark-muted md:col-span-2">
          <span className="uppercase tracking-[0.3em] text-dark-muted/70">Titel</span>
          <div className="rounded-xl border border-dark-border/70 bg-dark-bg/60 px-3 py-3">
            <input
              className="w-full bg-transparent text-sm text-dark-text outline-none"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="QS-Report KW 42"
            />
          </div>
        </label>

        <label className="flex flex-col gap-2 text-xs text-dark-muted">
          <span className="uppercase tracking-[0.3em] text-dark-muted/70">Produkt</span>
          <select
            className="rounded-xl border border-dark-border/70 bg-dark-bg/60 px-3 py-3 text-sm text-dark-text"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
          >
            <option value="all">Alle Produkte</option>
            {PRODUCTS.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-xs text-dark-muted">
          <span className="uppercase tracking-[0.3em] text-dark-muted/70">Lieferant</span>
          <select
            className="rounded-xl border border-dark-border/70 bg-dark-bg/60 px-3 py-3 text-sm text-dark-text"
            value={supplierId}
            onChange={(event) => setSupplierId(event.target.value)}
          >
            <option value="all">Alle Lieferanten</option>
            {SUPPLIERS.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-4 flex items-center justify-between">
          <div className="text-xs text-dark-muted flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Zahlenbasis entspricht exakt der CSV.
          </div>
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Erstellt …
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                PDF & CSV erzeugen
              </>
            )}
          </button>
        </div>
      </form>

      {message && (
        <div className="rounded-xl border border-dark-border/60 bg-dark-bg/60 px-4 py-3 text-xs text-primary-100">
          {message}
        </div>
      )}
    </section>
  );
};
