import { SeasonalityHeatmap } from '../charts/SeasonalityHeatmap';
import { ShiftHeatmap } from '../charts/ShiftHeatmap';
import { LineComparison } from '../charts/LineComparison';
import { MaintenanceTimeline } from '../charts/MaintenanceTimeline';
import { SupplierImpact } from '../charts/SupplierImpact';
import { OutputVsDefectRate } from '../charts/OutputVsDefectRate';
import { CorrelationMatrix } from '../charts/CorrelationMatrix';
import { CauseMap } from '../charts/CauseMap';
import { useStore, type InsightCategory } from '../../store/useStore';

export const InsightsView = () => {
  const { activeInsightsCategory, setActiveInsightsCategory } = useStore((state) => ({
    activeInsightsCategory: state.activeInsightsCategory,
    setActiveInsightsCategory: state.setActiveInsightsCategory,
  }));

  const categories = [
    { id: 'all' as InsightCategory, label: 'Alle', icon: 'A' },
    { id: 'quality' as InsightCategory, label: 'Qualität', icon: 'Q' },
    { id: 'production' as InsightCategory, label: 'Produktion', icon: 'P' },
    { id: 'suppliers' as InsightCategory, label: 'Lieferanten', icon: 'L' },
    { id: 'correlations' as InsightCategory, label: 'Korrelationen', icon: 'K' },
  ];

  const shouldShow = (category: InsightCategory) =>
    activeInsightsCategory === 'all' || activeInsightsCategory === category;

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-dark-muted mr-2">Kategorie:</span>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveInsightsCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeInsightsCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-border text-dark-text hover:bg-dark-border/70'
              }`}
            >
              <span className="text-xs font-semibold tracking-[0.3em] text-primary-200">
                {category.icon}
              </span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {shouldShow('quality') && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-dark-muted">Qualitaet</span>
            <h2 className="text-2xl font-bold text-primary-400">Qualitaet & Muster</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SeasonalityHeatmap />
            <ShiftHeatmap />
          </div>
        </div>
      )}

      {shouldShow('production') && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-dark-muted">Produktion</span>
            <h2 className="text-2xl font-bold text-primary-400">Produktion & Wartung</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <LineComparison />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MaintenanceTimeline />
            <OutputVsDefectRate />
          </div>
        </div>
      )}

      {shouldShow('suppliers') && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-dark-muted">Lieferanten</span>
            <h2 className="text-2xl font-bold text-primary-400">Lieferanten-Analyse</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <SupplierImpact />
          </div>
        </div>
      )}

      {shouldShow('correlations') && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-dark-muted">Korrelation</span>
            <h2 className="text-2xl font-bold text-primary-400">Korrelationen & KI-Insights</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CorrelationMatrix />
            <div className="lg:col-span-2">
              <CauseMap />
            </div>
          </div>
        </div>
      )}

      <div className="card border-primary-700 bg-primary-900/10 p-4">
        <div className="text-sm text-dark-muted">
          <strong className="text-dark-text">Tipp:</strong> Klicken Sie auf Datenpunkte, Balken
          oder Knoten fuer Details und Filterung. Nutzen Sie die Kategorien oben, um gezielt nach
          Insights zu suchen.
        </div>
      </div>
    </div>
  );
};

