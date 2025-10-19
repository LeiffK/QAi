import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { PLANTS, LINES, PRODUCTS, SUPPLIERS, BATCHES, SHIFTS } from '../../data/mockData';
import { filterBatches, calculateQualityScore, getScoreBadgeColor } from '../../utils/filterData';
import { Factory, Settings, Package, Truck, Clock, Award, CheckCircle, AlertTriangle, Circle } from 'lucide-react';

export const RankingView = () => {
  const { filters, brushSelection, setFilter, setSelectedPlantId, setActiveTab, accessiblePlantIds } = useStore();

  const plantScope =
    accessiblePlantIds && accessiblePlantIds.length > 0
      ? PLANTS.filter((plant) => accessiblePlantIds.includes(plant.id))
      : PLANTS;

  const lineScope =
    accessiblePlantIds && accessiblePlantIds.length > 0
      ? LINES.filter((line) => accessiblePlantIds.includes(line.plantId))
      : LINES;

  const rankings = useMemo(() => {
    const filtered = filterBatches(BATCHES, filters, brushSelection);

    // Plants Ranking
    const plantRanking = plantScope.map((plant) => {
      const plantBatches = filtered.filter((b) => b.plantId === plant.id);
      const avgDefectRate = plantBatches.length > 0
        ? plantBatches.reduce((sum, b) => sum + b.defectRate, 0) / plantBatches.length
        : 0;
      const avgFpy = plantBatches.length > 0
        ? plantBatches.reduce((sum, b) => sum + b.fpy, 0) / plantBatches.length
        : 0;
      const avgScrapRate = plantBatches.length > 0
        ? plantBatches.reduce((sum, b) => sum + b.scrapRate, 0) / plantBatches.length
        : 0;
      const score = calculateQualityScore(avgDefectRate, avgFpy, avgScrapRate);

      return {
        id: plant.id,
        name: plant.name,
        defectRate: Number(avgDefectRate.toFixed(2)),
        fpy: Number(avgFpy.toFixed(1)),
        score,
        batchCount: plantBatches.length,
      };
    }).sort((a, b) => a.defectRate - b.defectRate);

    // Lines Ranking
    const lineRanking = lineScope.map((line) => {
      const lineBatches = filtered.filter((b) => b.lineId === line.id);
      const avgDefectRate = lineBatches.length > 0
        ? lineBatches.reduce((sum, b) => sum + b.defectRate, 0) / lineBatches.length
        : 0;
      const avgFpy = lineBatches.length > 0
        ? lineBatches.reduce((sum, b) => sum + b.fpy, 0) / lineBatches.length
        : 0;
      const avgScrapRate = lineBatches.length > 0
        ? lineBatches.reduce((sum, b) => sum + b.scrapRate, 0) / lineBatches.length
        : 0;
      const score = calculateQualityScore(avgDefectRate, avgFpy, avgScrapRate);
      const plant = plantScope.find((p) => p.id === line.plantId);

      return {
        id: line.id,
        name: line.name,
        plantName: plant?.name || '',
        plantId: line.plantId,
        defectRate: Number(avgDefectRate.toFixed(2)),
        fpy: Number(avgFpy.toFixed(1)),
        score,
        batchCount: lineBatches.length,
      };
    }).sort((a, b) => a.defectRate - b.defectRate);

    // Products Ranking
    const productRanking = PRODUCTS.map((product) => {
      const productBatches = filtered.filter((b) => b.productId === product.id);
      const avgDefectRate = productBatches.length > 0
        ? productBatches.reduce((sum, b) => sum + b.defectRate, 0) / productBatches.length
        : 0;
      const avgFpy = productBatches.length > 0
        ? productBatches.reduce((sum, b) => sum + b.fpy, 0) / productBatches.length
        : 0;
      const avgScrapRate = productBatches.length > 0
        ? productBatches.reduce((sum, b) => sum + b.scrapRate, 0) / productBatches.length
        : 0;
      const score = calculateQualityScore(avgDefectRate, avgFpy, avgScrapRate);

      return {
        id: product.id,
        name: product.name,
        defectRate: Number(avgDefectRate.toFixed(2)),
        fpy: Number(avgFpy.toFixed(1)),
        score,
        batchCount: productBatches.length,
      };
    }).sort((a, b) => a.defectRate - b.defectRate);

    // Suppliers Ranking
    const supplierRanking = SUPPLIERS.map((supplier) => {
      const supplierBatches = filtered.filter((b) => b.supplierId === supplier.id);
      const avgDefectRate = supplierBatches.length > 0
        ? supplierBatches.reduce((sum, b) => sum + b.defectRate, 0) / supplierBatches.length
        : 0;
      const avgFpy = supplierBatches.length > 0
        ? supplierBatches.reduce((sum, b) => sum + b.fpy, 0) / supplierBatches.length
        : 0;
      const avgScrapRate = supplierBatches.length > 0
        ? supplierBatches.reduce((sum, b) => sum + b.scrapRate, 0) / supplierBatches.length
        : 0;
      const score = calculateQualityScore(avgDefectRate, avgFpy, avgScrapRate);

      return {
        id: supplier.id,
        name: supplier.name,
        defectRate: Number(avgDefectRate.toFixed(2)),
        fpy: Number(avgFpy.toFixed(1)),
        score,
        batchCount: supplierBatches.length,
      };
    }).sort((a, b) => a.defectRate - b.defectRate);

    // Shifts Ranking
    const shiftRanking = SHIFTS.map((shift) => {
      const shiftBatches = filtered.filter((b) => b.shift === shift);
      const avgDefectRate = shiftBatches.length > 0
        ? shiftBatches.reduce((sum, b) => sum + b.defectRate, 0) / shiftBatches.length
        : 0;
      const avgFpy = shiftBatches.length > 0
        ? shiftBatches.reduce((sum, b) => sum + b.fpy, 0) / shiftBatches.length
        : 0;
      const avgScrapRate = shiftBatches.length > 0
        ? shiftBatches.reduce((sum, b) => sum + b.scrapRate, 0) / shiftBatches.length
        : 0;
      const score = calculateQualityScore(avgDefectRate, avgFpy, avgScrapRate);

      return {
        name: shift,
        defectRate: Number(avgDefectRate.toFixed(2)),
        fpy: Number(avgFpy.toFixed(1)),
        score,
        batchCount: shiftBatches.length,
      };
    }).sort((a, b) => a.defectRate - b.defectRate);

    return { plantRanking, lineRanking, productRanking, supplierRanking, shiftRanking };
  }, [filters, brushSelection, accessiblePlantIds]);

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-yellow-400';  // Gold
    if (index === 1) return 'text-gray-300';    // Silver
    if (index === 2) return 'text-orange-400';  // Bronze
    return 'text-dark-muted';
  };

  const getBottomColor = (index: number, total: number) => {
    const fromBottom = total - index - 1;
    if (fromBottom === 0) return 'text-red-400';
    if (fromBottom === 1) return 'text-orange-400';
    if (fromBottom === 2) return 'text-yellow-400';
    return 'text-dark-muted';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-400">Performance-Ranking</h2>
        <p className="text-sm text-dark-muted mt-1">
          Top 3 und Bottom 3 nach durchschnittlicher Fehlerrate
        </p>
      </div>

      {/* Plants Ranking */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Factory className="w-5 h-5 text-primary-400" />
          <span>Werke</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top 3 */}
          <div>
            <div className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Top 3 (Beste)</span>
            </div>
            <div className="space-y-2">
              {rankings.plantRanking.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-green-900/10 border border-green-700/30 rounded-lg cursor-pointer hover:bg-green-900/20 transition-colors"
                  onClick={() => {
                    setSelectedPlantId(item.id);
                    setActiveTab('plants');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Award className={`w-6 h-6 ${getMedalColor(idx)}`} />
                    <div>
                      <div className="font-medium text-dark-text">{item.name}</div>
                      <div className="text-xs text-dark-muted">{item.batchCount} Chargen</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">{item.defectRate}%</div>
                    <div className={`text-xs px-2 py-0.5 rounded ${getScoreBadgeColor(item.score)}`}>
                      Score: {item.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 3 */}
          <div>
            <div className="text-sm font-medium text-red-400 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Bottom 3 (Schlechteste)</span>
            </div>
            <div className="space-y-2">
              {rankings.plantRanking.slice(-3).reverse().map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-red-900/10 border border-red-700/30 rounded-lg cursor-pointer hover:bg-red-900/20 transition-colors"
                  onClick={() => {
                    setSelectedPlantId(item.id);
                    setActiveTab('plants');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Circle className={`w-6 h-6 fill-current ${getBottomColor(rankings.plantRanking.length - idx - 1, rankings.plantRanking.length)}`} />
                    <div>
                      <div className="font-medium text-dark-text">{item.name}</div>
                      <div className="text-xs text-dark-muted">{item.batchCount} Chargen</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-400">{item.defectRate}%</div>
                    <div className={`text-xs px-2 py-0.5 rounded ${getScoreBadgeColor(item.score)}`}>
                      Score: {item.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lines & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lines Ranking */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-400" />
            <span>Linien</span>
          </h3>
          <div className="space-y-3">
            <div className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Top 3</span>
            </div>
            {rankings.lineRanking.slice(0, 3).map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-dark-border rounded cursor-pointer hover:bg-dark-border/70 transition-colors text-sm"
                onClick={() => {
                  setSelectedPlantId(item.plantId);
                  setActiveTab('plants');
                }}
              >
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 ${getMedalColor(idx)}`} />
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-dark-muted">({item.plantName})</span>
                </div>
                <span className="font-bold text-green-400">{item.defectRate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Products Ranking */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-400" />
            <span>Produkte</span>
          </h3>
          <div className="space-y-3">
            <div className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Top 3</span>
            </div>
            {rankings.productRanking.slice(0, 3).map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-dark-border rounded cursor-pointer hover:bg-dark-border/70 transition-colors text-sm"
                onClick={() => setFilter('productId', item.id)}
              >
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 ${getMedalColor(idx)}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-green-400">{item.defectRate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suppliers & Shifts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suppliers Ranking */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary-400" />
            <span>Lieferanten</span>
          </h3>
          <div className="space-y-3">
            <div className="text-sm font-medium text-red-400 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Bottom 3</span>
            </div>
            {rankings.supplierRanking.slice(-3).reverse().map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-dark-border rounded cursor-pointer hover:bg-dark-border/70 transition-colors text-sm"
                onClick={() => setFilter('supplierId', item.id)}
              >
                <div className="flex items-center gap-2">
                  <Circle className={`w-4 h-4 fill-current ${getBottomColor(rankings.supplierRanking.length - idx - 1, rankings.supplierRanking.length)}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-red-400">{item.defectRate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shifts Ranking */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-400" />
            <span>Schichten</span>
          </h3>
          <div className="space-y-3">
            {rankings.shiftRanking.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 bg-dark-border rounded cursor-pointer hover:bg-dark-border/70 transition-colors text-sm"
                onClick={() => setFilter('shift', item.name)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-dark-muted">{idx + 1}.</span>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className={`font-bold ${idx === 0 ? 'text-green-400' : idx === rankings.shiftRanking.length - 1 ? 'text-red-400' : 'text-dark-text'}`}>
                  {item.defectRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

