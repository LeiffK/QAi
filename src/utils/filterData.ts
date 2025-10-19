import { Filters, BrushSelection } from '../store/useStore';
import { Batch, TimeSeriesPoint } from '../data/mockData';

export const getDateRange = (timeRange: string, customStart: Date | null, customEnd: Date | null): { start: Date; end: Date } => {
  const end = new Date();
  let start = new Date();

  switch (timeRange) {
    case '24h':
      start.setHours(start.getHours() - 24);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case 'custom':
      if (customStart && customEnd) {
        return { start: customStart, end: customEnd };
      }
      break;
  }

  return { start, end };
};

export const filterBatches = (batches: Batch[], filters: Filters, brushSelection?: BrushSelection): Batch[] => {
  let filtered = batches;

  // Time range filter
  const dateRange = brushSelection?.startDate && brushSelection?.endDate
    ? { start: brushSelection.startDate, end: brushSelection.endDate }
    : getDateRange(filters.timeRange, filters.customStartDate, filters.customEndDate);

  filtered = filtered.filter(
    (b) => b.timestamp >= dateRange.start && b.timestamp <= dateRange.end
  );

  // Other filters
  if (filters.plantId) {
    filtered = filtered.filter((b) => b.plantId === filters.plantId);
  }

  if (filters.lineId) {
    filtered = filtered.filter((b) => b.lineId === filters.lineId);
  }

  if (filters.productId) {
    filtered = filtered.filter((b) => b.productId === filters.productId);
  }

  if (filters.shift) {
    filtered = filtered.filter((b) => b.shift === filters.shift);
  }

  if (filters.supplierId) {
    filtered = filtered.filter((b) => b.supplierId === filters.supplierId);
  }

  return filtered;
};

export const filterTimeSeries = (
  timeSeries: TimeSeriesPoint[],
  filters: Filters,
  brushSelection?: BrushSelection
): TimeSeriesPoint[] => {
  let filtered = timeSeries;

  // Time range filter
  const dateRange = brushSelection?.startDate && brushSelection?.endDate
    ? { start: brushSelection.startDate, end: brushSelection.endDate }
    : getDateRange(filters.timeRange, filters.customStartDate, filters.customEndDate);

  filtered = filtered.filter(
    (p) => p.timestamp >= dateRange.start && p.timestamp <= dateRange.end
  );

  // Line filter
  if (filters.lineId) {
    filtered = filtered.filter((p) => p.lineId === filters.lineId);
  }

  // Shift filter
  if (filters.shift) {
    filtered = filtered.filter((p) => p.shift === filters.shift);
  }

  return filtered;
};

// Calculate Quality Score (0-100)
export const calculateQualityScore = (defectRate: number, fpy: number, scrapRate: number): number => {
  // Formula: 100 - (defectRate * 10 + (100 - fpy) + scrapRate * 5)
  // Higher is better
  const score = 100 - (defectRate * 10 + (100 - fpy) + scrapRate * 5);
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

export const getScoreBadgeColor = (score: number): string => {
  if (score >= 80) return 'bg-green-900/30 text-green-300 border-green-700';
  if (score >= 60) return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
  return 'bg-red-900/30 text-red-300 border-red-700';
};

export const calculateKPIs = (batches: Batch[]) => {
  if (batches.length === 0) {
    return {
      defectRate: 0,
      fpy: 0,
      scrapRate: 0,
      alarms: 0,
      coverage: 0,
      defectRateDelta: 0,
      fpyDelta: 0,
      scrapRateDelta: 0,
      alarmsDelta: 0,
      coverageDelta: 0,
    };
  }

  // Sort by timestamp
  const sorted = [...batches].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Current period (last 50%)
  const midPoint = Math.floor(sorted.length / 2);
  const currentPeriod = sorted.slice(midPoint);
  const previousPeriod = sorted.slice(0, midPoint);

  const calcAvg = (arr: Batch[], key: keyof Batch) => {
    const sum = arr.reduce((acc, b) => acc + (b[key] as number), 0);
    return arr.length > 0 ? sum / arr.length : 0;
  };

  const current = {
    defectRate: calcAvg(currentPeriod, 'defectRate'),
    fpy: calcAvg(currentPeriod, 'fpy'),
    scrapRate: calcAvg(currentPeriod, 'scrapRate'),
  };

  const previous = {
    defectRate: calcAvg(previousPeriod, 'defectRate'),
    fpy: calcAvg(previousPeriod, 'fpy'),
    scrapRate: calcAvg(previousPeriod, 'scrapRate'),
  };

  // Calculate deltas (percentage change)
  const defectRateDelta = previous.defectRate > 0
    ? ((current.defectRate - previous.defectRate) / previous.defectRate) * 100
    : 0;

  const fpyDelta = previous.fpy > 0
    ? ((current.fpy - previous.fpy) / previous.fpy) * 100
    : 0;

  const scrapRateDelta = previous.scrapRate > 0
    ? ((current.scrapRate - previous.scrapRate) / previous.scrapRate) * 100
    : 0;

  // Alarms (batches with defect rate > 5%)
  const currentAlarms = currentPeriod.filter((b) => b.defectRate > 5).length;
  const previousAlarms = previousPeriod.filter((b) => b.defectRate > 5).length;
  const alarmsDelta = previousAlarms > 0
    ? ((currentAlarms - previousAlarms) / previousAlarms) * 100
    : 0;

  // Coverage (batches with FPY > 95%)
  const currentCoverage = (currentPeriod.filter((b) => b.fpy > 95).length / currentPeriod.length) * 100;
  const previousCoverage = previousPeriod.length > 0
    ? (previousPeriod.filter((b) => b.fpy > 95).length / previousPeriod.length) * 100
    : 0;
  const coverageDelta = previousCoverage > 0
    ? ((currentCoverage - previousCoverage) / previousCoverage) * 100
    : 0;

  return {
    defectRate: Number(current.defectRate.toFixed(2)),
    fpy: Number(current.fpy.toFixed(1)),
    scrapRate: Number(current.scrapRate.toFixed(2)),
    alarms: currentAlarms,
    coverage: Number(currentCoverage.toFixed(1)),
    defectRateDelta: Number(defectRateDelta.toFixed(1)),
    fpyDelta: Number(fpyDelta.toFixed(1)),
    scrapRateDelta: Number(scrapRateDelta.toFixed(1)),
    alarmsDelta: Number(alarmsDelta.toFixed(1)),
    coverageDelta: Number(coverageDelta.toFixed(1)),
  };
};

