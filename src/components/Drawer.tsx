import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { X, ClipboardCheck, Save } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useStore } from '../store/useStore';
import type { BatchViewModel } from '../utils/analysis';

const statusOptions = [
  { value: 'offen', label: 'Offen' },
  { value: 'in_pruefung', label: 'In Prüfung' },
  { value: 'geklaert', label: 'Geklärt' },
  { value: 'zurueckgestellt', label: 'Zurückgestellt' },
];

export const Drawer = () => {
  const { drawerOpen, drawerContent, drawerData, closeDrawer, setChargeAnnotation } = useStore(
    (state) => ({
      drawerOpen: state.drawerOpen,
      drawerContent: state.drawerContent,
      drawerData: state.drawerData,
      closeDrawer: state.closeDrawer,
      setChargeAnnotation: state.setChargeAnnotation,
    })
  );

  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'offen' | 'in_pruefung' | 'geklaert' | 'zurueckgestellt'>(
    'offen'
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (drawerContent === 'batch' && drawerData?.annotation) {
      setNote(drawerData.annotation.comment);
      setStatus(drawerData.annotation.status);
    } else {
      setNote('');
      setStatus('offen');
    }
    setSavedMessage(null);
  }, [drawerContent, drawerData]);

  useEffect(() => {
    if (!drawerOpen) return;
    if (typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen || !drawerData) {
    return null;
  }

  const batch = drawerData as BatchViewModel;

  const handleSaveAnnotation = () => {
    setChargeAnnotation(batch.id, { comment: note, status });
    setSavedMessage('Kommentar gespeichert.');
    setTimeout(() => setSavedMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8 sm:px-6">
      <div
        className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={drawerContent === 'batch' ? `Charge ${batch.id}` : 'Details'}
        className="relative z-10 flex h-full max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl border border-dark-border/70 bg-dark-surface/95 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.85)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-dark-border/60 bg-dark-surface/95 px-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-dark-muted">Detailansicht</p>
            <h2 className="text-xl font-semibold text-primary-200">
              {drawerContent === 'batch' ? `Charge ${batch.id}` : 'Details'}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="btn btn-secondary flex h-10 w-10 items-center justify-center rounded-xl border-dark-border/60 bg-dark-bg/60 text-dark-muted transition-all hover:border-primary-500 hover:bg-primary-900/20 hover:text-primary-100"
            aria-label="Detailbereich schliessen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto space-y-6 px-6 py-6">
          {drawerContent === 'batch' && (
            <>
            <section className="rounded-2xl border border-dark-border/70 bg-dark-bg/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-200">
                Überblick
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <InfoItem label="Werk" value={batch.plantName} />
                <InfoItem label="Linie" value={batch.lineName} />
                <InfoItem label="Produkt" value={batch.productName} />
                <InfoItem label="Lieferant" value={batch.supplierName} />
                <InfoItem label="Lot" value={batch.lotNumber} />
                <InfoItem
                  label="Schicht"
                  value={
                    <span className="badge badge-info text-xs font-medium uppercase tracking-wide">
                      {batch.shift}
                    </span>
                  }
                />
                <InfoItem
                  label="Zeitpunkt"
                  value={batch.timestamp.toLocaleString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
                <InfoItem label="Ausbringung" value={`${batch.output} Stk/h`} />
              </div>
            </section>

            <section className="rounded-2xl border border-dark-border/70 bg-dark-bg/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-200">
                Qualitätskennzahlen
              </h3>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <MetricBlock label="Fehlerrate" value={`${batch.defectRate.toFixed(2)}%`} tone="error" />
                <MetricBlock label="FPY" value={`${batch.fpy.toFixed(1)}%`} tone="success" />
                <MetricBlock label="Ausschuss" value={`${batch.scrapRate.toFixed(2)}%`} tone="warning" />
              </div>
            </section>

            <section className="rounded-2xl border border-dark-border/70 bg-dark-bg/70 p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-200 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary-200" />
                Geführte Fehleranalyse
              </h3>
              <div className="rounded-xl border border-dark-border/60 bg-dark-surface/60 px-4 py-3 text-sm text-dark-muted leading-relaxed">
                {batch.analysis.summary}
              </div>
              <div className="rounded-xl border border-dark-border/60 bg-dark-surface/60 px-4 py-3 text-sm">
                <strong className="text-primary-100">Ursache:</strong> {batch.analysis.cause}
              </div>
              <div className="space-y-2">
                <strong className="text-xs uppercase tracking-[0.3em] text-dark-muted">
                  Empfohlene Maßnahmen
                </strong>
                <ul className="space-y-2 text-sm text-dark-muted list-disc pl-5">
                  {batch.analysis.measures.map((measure, index) => (
                    <li key={index}>{measure}</li>
                  ))}
                </ul>
              </div>
            </section>

            {batch.defects && batch.defects.length > 0 && (
              <section className="rounded-2xl border border-dark-border/70 bg-dark-bg/70 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-200">
                  Defekte nach Art
                </h3>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={batch.defects}
                      margin={{ top: 5, right: 20, left: 20, bottom: 60 }}
                    >
                      <XAxis
                        dataKey="type"
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#131827',
                          border: '1px solid #1f2937',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#489cd0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-dark-border/70 bg-dark-bg/70 p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-200">
                Kommentar & QS-Status
              </h3>
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-2 text-xs text-dark-muted">
                  <span className="uppercase tracking-[0.3em] text-dark-muted/80">Status</span>
                  <select
                    className="rounded-xl border border-dark-border/60 bg-dark-surface/60 px-3 py-2 text-sm text-dark-text"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as typeof status)
                    }
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-xs text-dark-muted">
                  <span className="uppercase tracking-[0.3em] text-dark-muted/80">Kommentar</span>
                  <textarea
                    className="min-h-[120px] rounded-xl border border-dark-border/60 bg-dark-surface/60 px-3 py-2 text-sm text-dark-text focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Massnahme, Ansprechpartner, Pruefergebnis..."
                  />
                </label>
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSaveAnnotation}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-primary-500"
                  >
                    <Save className="h-4 w-4" />
                    Speichern
                  </button>
                  {savedMessage && (
                    <span className="text-xs text-primary-200">{savedMessage}</span>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-dark-border/70 bg-dark-bg/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-200">
                Belege & Analysen
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <DocumentBlock label="Pruefprotokoll" icon="DOC" />
                <DocumentBlock label="Laboranalyse" icon="LAB" />
                <DocumentBlock label="Bilder (3)" icon="IMG" />
                <DocumentBlock label="Ultraschall" icon="NDT" />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: ReactNode;
}

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="flex flex-col gap-1 rounded-xl border border-dark-border/50 bg-dark-surface/50 px-3 py-2">
    <span className="text-[11px] uppercase tracking-[0.25em] text-dark-muted">{label}</span>
    <span className="text-sm font-medium text-dark-text">{value}</span>
  </div>
);

interface MetricBlockProps {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'error';
}

const toneStyles: Record<MetricBlockProps['tone'], string> = {
  success: 'text-green-300 border-green-600/50 bg-green-900/20',
  warning: 'text-yellow-300 border-yellow-600/50 bg-yellow-900/20',
  error: 'text-red-300 border-red-600/50 bg-red-900/20',
};

const MetricBlock = ({ label, value, tone }: MetricBlockProps) => (
  <div className={`flex flex-col items-center gap-1 rounded-2xl border px-4 py-5 ${toneStyles[tone]}`}>
    <span className="text-2xl font-semibold">{value}</span>
    <span className="text-xs uppercase tracking-[0.25em] text-dark-muted/80">{label}</span>
  </div>
);

interface DocumentBlockProps {
  label: string;
  icon?: string;
}

const DocumentBlock = ({ label, icon }: DocumentBlockProps) => (
  <div className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dark-border/60 bg-dark-surface/60 px-4 py-6 text-center text-sm text-dark-muted transition-all hover:border-primary-500 hover:bg-primary-900/10 hover:text-primary-100">
    {icon && <div className="text-xs font-semibold tracking-[0.4em] text-primary-200">{icon}</div>}
    <div className="text-xs uppercase tracking-[0.2em]">{label}</div>
  </div>
);

