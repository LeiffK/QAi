import { useState } from 'react';
import { SeasonalityHeatmap } from '../charts/SeasonalityHeatmap';
import { ShiftHeatmap } from '../charts/ShiftHeatmap';
import { LineComparison } from '../charts/LineComparison';
import { MaintenanceTimeline } from '../charts/MaintenanceTimeline';
import { SupplierImpact } from '../charts/SupplierImpact';
import { OutputVsDefectRate } from '../charts/OutputVsDefectRate';
import { CorrelationMatrix } from '../charts/CorrelationMatrix';
import { CauseMap } from '../charts/CauseMap';

type InsightCategory = 'all' | 'quality' | 'production' | 'suppliers' | 'correlations';

export const InsightsView = () => {
  const [activeCategory, setActiveCategory] = useState<InsightCategory>('all');

  const categories = [
    { id: 'all' as InsightCategory, label: 'Alle', icon: '📊' },
    { id: 'quality' as InsightCategory, label: 'Qualität', icon: '✓' },
    { id: 'production' as InsightCategory, label: 'Produktion', icon: '⚙️' },
    { id: 'suppliers' as InsightCategory, label: 'Lieferanten', icon: '📦' },
    { id: 'correlations' as InsightCategory, label: 'Korrelationen', icon: '🔗' },
  ];

  const shouldShow = (category: InsightCategory) => {
    return activeCategory === 'all' || activeCategory === category;
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-dark-muted mr-2">Kategorie:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${
                  activeCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-border text-dark-text hover:bg-dark-border/70'
                }
              `}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Section */}
      {shouldShow('quality') && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <h2 className="text-2xl font-bold text-primary-400">Qualität & Muster</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SeasonalityHeatmap />
            <ShiftHeatmap />
          </div>
        </div>
      )}

      {/* Production Section */}
      {shouldShow('production') && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-2xl font-bold text-primary-400">Produktion & Wartung</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <LineComparison />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MaintenanceTimeline />
            <OutputVsDefectRate />
          </div>
        </div>
      )}

      {/* Suppliers Section */}
      {shouldShow('suppliers') && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <h2 className="text-2xl font-bold text-primary-400">Lieferanten-Analyse</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <SupplierImpact />
          </div>
        </div>
      )}

      {/* Correlations Section */}
      {shouldShow('correlations') && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔗</span>
            <h2 className="text-2xl font-bold text-primary-400">Korrelationen & KI-Insights</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CorrelationMatrix />
            <div className="lg:col-span-2">
              <CauseMap />
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="card p-4 bg-primary-900/10 border-primary-700">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="text-sm text-dark-muted">
            <strong className="text-dark-text">Tipp:</strong> Klicken Sie auf Datenpunkte, Balken oder Knoten für Details und Filterung.
            Nutzen Sie die Kategorien oben, um gezielt nach Insights zu suchen.
          </div>
        </div>
      </div>
    </div>
  );
};
