import { useStore } from '../store/useStore';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const Drawer = () => {
  const { drawerOpen, drawerContent, drawerData, closeDrawer } = useStore();

  if (!drawerOpen || !drawerData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-2xl h-full bg-dark-surface border-l border-dark-border shadow-2xl overflow-y-auto scrollbar-thin animate-slide-in-right">
        <div className="sticky top-0 bg-dark-surface border-b border-dark-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-dark-text">
            {drawerContent === 'batch' ? `Charge ${drawerData.id}` : 'Details'}
          </h2>
          <button
            onClick={closeDrawer}
            className="btn btn-secondary"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {drawerContent === 'batch' && (
            <>
              {/* Basic Info */}
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-3">Übersicht</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-dark-muted">Werk</div>
                    <div className="font-medium">{drawerData.plantName}</div>
                  </div>
                  <div>
                    <div className="text-dark-muted">Linie</div>
                    <div className="font-medium">{drawerData.lineName}</div>
                  </div>
                  <div>
                    <div className="text-dark-muted">Produkt</div>
                    <div className="font-medium">{drawerData.productName}</div>
                  </div>
                  <div>
                    <div className="text-dark-muted">Lieferant</div>
                    <div className="font-medium">{drawerData.supplierName}</div>
                  </div>
                  <div>
                    <div className="text-dark-muted">Lot</div>
                    <div className="font-medium">{drawerData.lotNumber}</div>
                  </div>
                  <div>
                    <div className="text-dark-muted">Schicht</div>
                    <div className="font-medium">
                      <span className="badge badge-info">{drawerData.shift}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-dark-muted">Zeitpunkt</div>
                    <div className="font-medium">
                      {new Date(drawerData.timestamp).toLocaleString('de-DE')}
                    </div>
                  </div>
                  <div>
                    <div className="text-dark-muted">Ausbringung</div>
                    <div className="font-medium">{drawerData.output} Stk/h</div>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-3">Qualitätskennzahlen</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{drawerData.defectRate.toFixed(2)}%</div>
                    <div className="text-sm text-dark-muted">Fehlerrate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{drawerData.fpy.toFixed(1)}%</div>
                    <div className="text-sm text-dark-muted">FPY</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{drawerData.scrapRate.toFixed(2)}%</div>
                    <div className="text-sm text-dark-muted">Ausschuss</div>
                  </div>
                </div>
              </div>

              {/* Defects by Type */}
              {drawerData.defects && drawerData.defects.length > 0 && (
                <div className="card p-4">
                  <h3 className="text-lg font-semibold mb-3">Defekte nach Art</h3>
                  <div className="h-64">
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
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Document Placeholders */}
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-3">Belege & Analysen</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-dark-border rounded p-3 text-center hover:bg-dark-border/30 transition-colors cursor-pointer">
                    <div className="text-3xl mb-2">📄</div>
                    <div className="text-sm text-dark-muted">Prüfprotokoll</div>
                  </div>
                  <div className="border border-dark-border rounded p-3 text-center hover:bg-dark-border/30 transition-colors cursor-pointer">
                    <div className="text-3xl mb-2">🔬</div>
                    <div className="text-sm text-dark-muted">Laboranalyse</div>
                  </div>
                  <div className="border border-dark-border rounded p-3 text-center hover:bg-dark-border/30 transition-colors cursor-pointer">
                    <div className="text-3xl mb-2">📷</div>
                    <div className="text-sm text-dark-muted">Bilder (3)</div>
                  </div>
                  <div className="border border-dark-border rounded p-3 text-center hover:bg-dark-border/30 transition-colors cursor-pointer">
                    <div className="text-3xl mb-2">🔊</div>
                    <div className="text-sm text-dark-muted">Ultraschall</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
