import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { PLANTS, LINES, BATCHES } from '../../data/mockData';
import { filterBatches, calculateQualityScore, getScoreBadgeColor } from '../../utils/filterData';
import { CheckCircle, AlertTriangle, Activity } from 'lucide-react';

export const PlantsOverview = () => {
  const { filters, brushSelection, setSelectedPlantId, setActiveTab, accessiblePlantIds } = useStore();

  const plantScope =
    accessiblePlantIds && accessiblePlantIds.length > 0
      ? PLANTS.filter((plant) => accessiblePlantIds.includes(plant.id))
      : PLANTS;

  const lineScope =
    accessiblePlantIds && accessiblePlantIds.length > 0
      ? LINES.filter((line) => accessiblePlantIds.includes(line.plantId))
      : LINES;

  const plantStats = useMemo(() => {
    return plantScope.map((plant) => {
      const plantLines = lineScope.filter((l) => l.plantId === plant.id);
      const plantBatches = filterBatches(
        BATCHES.filter((b) => b.plantId === plant.id),
        filters,
        brushSelection
      );

      const avgDefectRate = plantBatches.length > 0
        ? plantBatches.reduce((sum, b) => sum + b.defectRate, 0) / plantBatches.length
        : 0;

      const avgFpy = plantBatches.length > 0
        ? plantBatches.reduce((sum, b) => sum + b.fpy, 0) / plantBatches.length
        : 0;

      const avgScrapRate = plantBatches.length > 0
        ? plantBatches.reduce((sum, b) => sum + b.scrapRate, 0) / plantBatches.length
        : 0;

      const qualityScore = calculateQualityScore(avgDefectRate, avgFpy, avgScrapRate);

      const totalOutput = plantBatches.reduce((sum, b) => sum + b.output, 0);

      // Get current status of lines
      const activeLines = plantLines.length;
      const recentBatches = plantBatches.slice(0, 10);
      const alertCount = recentBatches.filter((b) => b.defectRate > 3).length;

      return {
        plant,
        lineCount: activeLines,
        avgDefectRate: Number(avgDefectRate.toFixed(2)),
        avgFpy: Number(avgFpy.toFixed(1)),
        totalOutput: Math.round(totalOutput),
        alertCount,
        qualityScore,
        status: alertCount > 0 ? 'warning' : avgDefectRate < 3 ? 'good' : 'normal',
      };
    });
  }, [filters, brushSelection, accessiblePlantIds]);

  const handlePlantClick = (plantId: string) => {
    setSelectedPlantId(plantId);
    setActiveTab('plants'); // Stay on plants tab but show detail view
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary-400">Werke Übersicht</h2>
        <div className="text-sm text-dark-muted">
          Klicken Sie auf ein Werk für Details
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plantStats.map((stat) => (
          <div
            key={stat.plant.id}
            className="card p-6 cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl"
            onClick={() => handlePlantClick(stat.plant.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-dark-text">{stat.plant.name}</h3>
                <p className="text-sm text-dark-muted">{stat.plant.location}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div
                  className={`
                    flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                    ${
                      stat.status === 'good'
                        ? 'bg-green-900/30 text-green-300 border border-green-700'
                        : stat.status === 'warning'
                        ? 'bg-red-900/30 text-red-300 border border-red-700'
                        : 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                    }
                  `}
                >
                  {stat.status === 'good' && <><CheckCircle className="w-3 h-3" /> OK</>}
                  {stat.status === 'warning' && <><AlertTriangle className="w-3 h-3" /> Alarme</>}
                  {stat.status === 'normal' && <><Activity className="w-3 h-3" /> Normal</>}
                </div>
                <div className={`text-xs px-2 py-1 rounded font-medium ${getScoreBadgeColor(stat.qualityScore)}`}>
                  Score: {stat.qualityScore}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold text-primary-400">{stat.lineCount}</div>
                <div className="text-xs text-dark-muted">Linien</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-dark-text">
                  {stat.totalOutput.toLocaleString()}
                </div>
                <div className="text-xs text-dark-muted">Ausbringung (Stk)</div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    stat.avgDefectRate > 5 ? 'text-red-400' : stat.avgDefectRate > 3 ? 'text-yellow-400' : 'text-green-400'
                  }`}
                >
                  {stat.avgDefectRate}%
                </div>
                <div className="text-xs text-dark-muted">Ã˜ Fehlerrate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{stat.avgFpy}%</div>
                <div className="text-xs text-dark-muted">Ã˜ FPY</div>
              </div>
            </div>

            {/* Alerts */}
            {stat.alertCount > 0 && (
              <div className="mt-4 pt-4 border-t border-dark-border">
                <div className="flex items-center gap-2 text-red-400">
                  <span className="text-lg"> </span>
                  <span className="text-sm font-medium">{stat.alertCount} aktive Alarme</span>
                </div>
              </div>
            )}

            {/* Click hint */}
            <div className="mt-4 text-center text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
              â†’ Klicken für Linien-Details
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


