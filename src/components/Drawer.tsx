import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useStore } from '../store/useStore';

export const Drawer = () => {
  const { drawerOpen, drawerContent, drawerData, closeDrawer } = useStore();

  if (!drawerOpen || !drawerData) {
    return null;
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-dark-border/70 bg-dark-surface/90 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.85)]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-dark-border/60 bg-dark-surface/95 px-6 py-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-dark-muted">Detailansicht</p>
          <h2 className="text-xl font-semibold text-primary-200">
            {drawerContent === 'batch' ? `Charge ${drawerData.id}` : 'Details'}
          </h2>
        </div>
        <button
          onClick={closeDrawer}
          className="btn btn-secondary flex h-10 w-10 items-center justify-center rounded-xl border-dark-border/60 bg-dark-bg/60 text-dark-muted transition-all hover:border-primary-500 hover:bg-primary-900/20 hover:text-primary-100"
          aria-label="Detailbereich schließen"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto space-y-6 px-6 py-6">
        {drawerContent === 'batch' && (
          <>
            <section className="rounded-2xl border border-dark-border/70 bg-dark-bg/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-200">Überblick</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <InfoItem label="Werk" value={drawerData.plantName} />
                <InfoItem label="Linie" value={drawerData.lineName} />
                <InfoItem label="Produkt" value={drawerData.productName} />
                <InfoItem label="Lieferant" value={drawerData.supplierName} />
                <InfoItem label="Lot" value={drawerData.lotNumber} />
                <InfoItem
                  label="Schicht"
                  value={
                    <span className="badge badge-info text-xs font-medium uppercase tracking-wide">
                      {drawerData.shift}
                    </span>
                  }
                />
                <InfoItem
                  label="Zeitpunkt"
                  value={new Date(drawerData.timestamp).toLocaleString('de-DE')}
                />
                <InfoItem label="Ausbringung" value={`${drawerData.output} Stk/h`} />
              </div>
            </section>

            <section className="rounded-2xl border border-dark-border/70 bg-dark-bg/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-200">Qualitätskennzahlen</h3>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <MetricBlock label="Fehlerrate" value={`${drawerData.defectRate.toFixed(2)}%`} tone="error" />
                <MetricBlock label="FPY" value={`${drawerData.fpy.toFixed(1)}%`} tone="success" />
                <MetricBlock label="Ausschuss" value={`${drawerData.scrapRate.toFixed(2)}%`} tone="warning" />
              </div>
            </section>

            {drawerData.defects && drawerData.defects.length > 0 && (
              <section className="rounded-2xl border border-dark-border/70 bg-dark-bg/70 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-200">Defekte nach Art</h3>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={drawerData.defects} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
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
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-dark-border/70 bg-dark-bg/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-200">Belege & Analysen</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {drawerData.documents?.map((doc: { label: string; icon?: string }) => (
                  <DocumentBlock key={doc.label} label={doc.label} icon={doc.icon} />
                ))}
                {!drawerData.documents && (
                  <>
                    <DocumentBlock label="Prüfprotokoll" icon="DOC" />
                    <DocumentBlock label="Laboranalyse" icon="LAB" />
                    <DocumentBlock label="Bilder (3)" icon="IMG" />
                    <DocumentBlock label="Ultraschall" icon="NDT" />
                  </>
                )}
              </div>
            </section>
          </>
        )}
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
