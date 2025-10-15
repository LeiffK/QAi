// Types
export interface Plant {
  id: string;
  name: string;
  location: string;
}

export interface Line {
  id: string;
  plantId: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
}

export interface Supplier {
  id: string;
  name: string;
  material: string;
}

export interface Batch {
  id: string;
  plantId: string;
  lineId: string;
  productId: string;
  supplierId: string;
  lotNumber: string;
  timestamp: Date;
  shift: 'Früh' | 'Spät' | 'Nacht';
  defectRate: number;
  fpy: number;
  scrapRate: number;
  output: number;
  defects: {
    type: string;
    count: number;
  }[];
}

export interface MaintenanceEvent {
  id: string;
  lineId: string;
  timestamp: Date;
  type: 'Geplant' | 'Ungeplant';
  duration: number;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  defectRate: number;
  fpy: number;
  scrapRate: number;
  output: number;
  lineId: string;
  shift: string;
}

// Constants
export const DEFECT_TYPES = ['Verformung', 'Nuss-Qualität', 'Verpackung', 'Gewicht', 'Optik'];
export const SHIFTS = ['Früh', 'Spät', 'Nacht'] as const;
export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

// Master Data
export const PLANTS: Plant[] = [
  { id: 'P1', name: 'Werk Berlin', location: 'Berlin' },
  { id: 'P2', name: 'Werk Hamburg', location: 'Hamburg' },
];

export const LINES: Line[] = [
  { id: 'L1', plantId: 'P1', name: 'Linie 1' },
  { id: 'L2', plantId: 'P1', name: 'Linie 2' },
  { id: 'L3', plantId: 'P2', name: 'Linie 3' },
  { id: 'L4', plantId: 'P2', name: 'Linie 4' },
];

export const PRODUCTS: Product[] = [
  { id: 'PR1', name: 'Toffifee', category: 'Praline' },
  { id: 'PR2', name: 'Schaumküsse', category: 'Schaum' },
  { id: 'PR3', name: 'Knoppers', category: 'Waffel' },
];

export const SUPPLIERS: Supplier[] = [
  { id: 'S1', name: 'Lieferant A', material: 'Nüsse' },
  { id: 'S2', name: 'Lieferant B', material: 'Schokolade' },
  { id: 'S3', name: 'Lieferant C', material: 'Karamell' },
  { id: 'S4', name: 'Lieferant X', material: 'Nüsse' }, // Higher defect rate
  { id: 'S5', name: 'Lieferant D', material: 'Verpackung' },
];

// Helper functions
const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(random(min, max + 1));
const randomChoice = <T,>(arr: readonly T[]): T => arr[randomInt(0, arr.length - 1)];

// Generate time series with realistic patterns
export const generateTimeSeries = (days: number = 30): TimeSeriesPoint[] => {
  const now = new Date();
  const points: TimeSeriesPoint[] = [];

  for (let d = days; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);

    LINES.forEach(line => {
      SHIFTS.forEach(shift => {
        const month = date.getMonth();
        const dayOfWeek = date.getDay();
        const hour = shift === 'Früh' ? 8 : shift === 'Spät' ? 16 : 0;

        // Base defect rate
        let baseDefectRate = 2.5;

        // Summer spike (Jun-Aug: months 5-7)
        if (month >= 5 && month <= 7) {
          baseDefectRate += 1.5;
        }

        // Night shift slightly higher
        if (shift === 'Nacht') {
          baseDefectRate += 0.5;
        }

        // Weekend effect
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          baseDefectRate += 0.3;
        }

        // Line-specific patterns
        if (line.id === 'L3') {
          baseDefectRate += 0.4;
        }

        // Random variation
        const defectRate = Math.max(0, baseDefectRate + random(-0.5, 0.5));

        // FPY inversely related to defect rate
        const fpy = Math.max(85, Math.min(99, 98 - defectRate * 1.5));

        // Scrap rate related to defect rate
        const scrapRate = defectRate * 0.4 + random(0, 0.3);

        // Output varies with defect rate (higher defects = lower output)
        const baseOutput = 5000;
        const output = Math.max(3000, baseOutput - defectRate * 150 + random(-500, 500));

        const timestamp = new Date(date);
        timestamp.setHours(hour);

        points.push({
          timestamp,
          defectRate: Number(defectRate.toFixed(2)),
          fpy: Number(fpy.toFixed(1)),
          scrapRate: Number(scrapRate.toFixed(2)),
          output: Math.round(output),
          lineId: line.id,
          shift,
        });
      });
    });
  }

  return points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

// Generate maintenance events
export const generateMaintenanceEvents = (): MaintenanceEvent[] => {
  const events: MaintenanceEvent[] = [];
  const now = new Date();

  LINES.forEach(line => {
    // 2-3 maintenance events in last 30 days
    const eventCount = randomInt(2, 3);
    for (let i = 0; i < eventCount; i++) {
      const daysAgo = randomInt(5, 28);
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - daysAgo);

      events.push({
        id: `M${events.length + 1}`,
        lineId: line.id,
        timestamp,
        type: Math.random() > 0.3 ? 'Geplant' : 'Ungeplant',
        duration: randomInt(2, 8),
      });
    }
  });

  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

// Generate batches
export const generateBatches = (count: number = 500): Batch[] => {
  const batches: Batch[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = randomInt(0, 30);
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);

    const line = randomChoice(LINES);
    const product = randomChoice(PRODUCTS);
    const supplier = randomChoice(SUPPLIERS);
    const shift = randomChoice(SHIFTS);
    const month = timestamp.getMonth();

    // Base defect rate
    let baseDefectRate = 2.5;

    // Summer spike for "Verformung"
    if (month >= 5 && month <= 7) {
      baseDefectRate += 1.2;
    }

    // Supplier X has higher defect rate (especially for nuts)
    if (supplier.id === 'S4') {
      baseDefectRate += 2.5;
    }

    // Night shift effect
    if (shift === 'Nacht') {
      baseDefectRate += 0.6;
    }

    const defectRate = Math.max(0, baseDefectRate + random(-0.8, 0.8));
    const fpy = Math.max(85, Math.min(99, 97.5 - defectRate * 1.5));
    const scrapRate = defectRate * 0.35 + random(0, 0.4);
    const output = Math.round(4500 + random(-1000, 1500));

    // Generate defects by type
    const defects: { type: string; count: number }[] = [];
    const totalDefects = Math.round(output * (defectRate / 100));

    DEFECT_TYPES.forEach(type => {
      let probability = 0.2; // Base probability

      // Summer increases Verformung
      if (type === 'Verformung' && month >= 5 && month <= 7) {
        probability = 0.4;
      }

      // Supplier X increases Nuss-Qualität
      if (type === 'Nuss-Qualität' && supplier.id === 'S4') {
        probability = 0.5;
      }

      const count = Math.round(totalDefects * probability * random(0.5, 1.5));
      if (count > 0) {
        defects.push({ type, count });
      }
    });

    batches.push({
      id: `C-${String(i + 100).padStart(3, '0')}`,
      plantId: line.plantId,
      lineId: line.id,
      productId: product.id,
      supplierId: supplier.id,
      lotNumber: `L-${String(randomInt(1, 99)).padStart(3, '0')}`,
      timestamp,
      shift,
      defectRate: Number(defectRate.toFixed(2)),
      fpy: Number(fpy.toFixed(1)),
      scrapRate: Number(scrapRate.toFixed(2)),
      output,
      defects,
    });
  }

  return batches.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate seasonality heatmap data
export const generateSeasonalityData = (): { month: string; defectType: string; value: number }[] => {
  const data: { month: string; defectType: string; value: number }[] = [];

  MONTHS.forEach((month, monthIndex) => {
    DEFECT_TYPES.forEach(defectType => {
      let value = random(1.5, 3);

      // Summer spike for Verformung
      if (defectType === 'Verformung' && monthIndex >= 5 && monthIndex <= 7) {
        value += 2;
      }

      // Winter spike for Verpackung (condensation)
      if (defectType === 'Verpackung' && (monthIndex <= 1 || monthIndex >= 11)) {
        value += 1;
      }

      data.push({
        month,
        defectType,
        value: Number(value.toFixed(2)),
      });
    });
  });

  return data;
};

// Generate shift heatmap data
export const generateShiftData = (): { shift: typeof SHIFTS[number]; weekday: string; value: number }[] => {
  const data: { shift: typeof SHIFTS[number]; weekday: string; value: number }[] = [];

  SHIFTS.forEach(shift => {
    WEEKDAYS.forEach((weekday, dayIndex) => {
      let value = 2.5;

      // Night shift higher
      if (shift === 'Nacht') {
        value += 0.8;
      }

      // Weekend effect
      if (dayIndex >= 5) {
        value += 0.5;
      }

      // Friday effect
      if (dayIndex === 4) {
        value += 0.3;
      }

      data.push({
        shift,
        weekday,
        value: Number((value + random(-0.3, 0.3)).toFixed(2)),
      });
    });
  });

  return data;
};

// Generate supplier impact data
export const generateSupplierImpactData = () => {
  return SUPPLIERS.map(supplier => {
    let medianDefectRate = random(2, 3.5);

    // Supplier X has higher rate
    if (supplier.id === 'S4') {
      medianDefectRate = random(5, 7);
    }

    // Generate individual lots
    const lots = Array.from({ length: randomInt(8, 15) }, (_, i) => ({
      lotNumber: `${supplier.id}-L${String(i + 1).padStart(3, '0')}`,
      defectRate: Math.max(0, medianDefectRate + random(-1.5, 1.5)),
    }));

    return {
      supplier: supplier.name,
      supplierId: supplier.id,
      medianDefectRate: Number(medianDefectRate.toFixed(2)),
      lots,
    };
  });
};

// Generate correlation matrix
export const generateCorrelationMatrix = () => {
  return [
    { factor1: 'Saison', factor2: 'Saison', correlation: 1 },
    { factor1: 'Saison', factor2: 'Schicht', correlation: 0.15 },
    { factor1: 'Saison', factor2: 'Linie', correlation: 0.08 },
    { factor1: 'Saison', factor2: 'Wartung', correlation: 0.22 },
    { factor1: 'Saison', factor2: 'Lieferant', correlation: 0.12 },
    { factor1: 'Saison', factor2: 'Ausbringung', correlation: 0.18 },

    { factor1: 'Schicht', factor2: 'Saison', correlation: 0.15 },
    { factor1: 'Schicht', factor2: 'Schicht', correlation: 1 },
    { factor1: 'Schicht', factor2: 'Linie', correlation: 0.05 },
    { factor1: 'Schicht', factor2: 'Wartung', correlation: 0.10 },
    { factor1: 'Schicht', factor2: 'Lieferant', correlation: 0.03 },
    { factor1: 'Schicht', factor2: 'Ausbringung', correlation: 0.25 },

    { factor1: 'Linie', factor2: 'Saison', correlation: 0.08 },
    { factor1: 'Linie', factor2: 'Schicht', correlation: 0.05 },
    { factor1: 'Linie', factor2: 'Linie', correlation: 1 },
    { factor1: 'Linie', factor2: 'Wartung', correlation: 0.45 },
    { factor1: 'Linie', factor2: 'Lieferant', correlation: 0.12 },
    { factor1: 'Linie', factor2: 'Ausbringung', correlation: 0.15 },

    { factor1: 'Wartung', factor2: 'Saison', correlation: 0.22 },
    { factor1: 'Wartung', factor2: 'Schicht', correlation: 0.10 },
    { factor1: 'Wartung', factor2: 'Linie', correlation: 0.45 },
    { factor1: 'Wartung', factor2: 'Wartung', correlation: 1 },
    { factor1: 'Wartung', factor2: 'Lieferant', correlation: 0.08 },
    { factor1: 'Wartung', factor2: 'Ausbringung', correlation: 0.32 },

    { factor1: 'Lieferant', factor2: 'Saison', correlation: 0.12 },
    { factor1: 'Lieferant', factor2: 'Schicht', correlation: 0.03 },
    { factor1: 'Lieferant', factor2: 'Linie', correlation: 0.12 },
    { factor1: 'Lieferant', factor2: 'Wartung', correlation: 0.08 },
    { factor1: 'Lieferant', factor2: 'Lieferant', correlation: 1 },
    { factor1: 'Lieferant', factor2: 'Ausbringung', correlation: 0.20 },

    { factor1: 'Ausbringung', factor2: 'Saison', correlation: 0.18 },
    { factor1: 'Ausbringung', factor2: 'Schicht', correlation: 0.25 },
    { factor1: 'Ausbringung', factor2: 'Linie', correlation: 0.15 },
    { factor1: 'Ausbringung', factor2: 'Wartung', correlation: 0.32 },
    { factor1: 'Ausbringung', factor2: 'Lieferant', correlation: 0.20 },
    { factor1: 'Ausbringung', factor2: 'Ausbringung', correlation: 1 },
  ];
};

// Generate cause-map network
export interface CauseNode {
  id: string;
  label: string;
  type: 'cause' | 'effect';
}

export interface CauseEdge {
  source: string;
  target: string;
  strength: number;
  explanation: string;
  confidence: 1 | 2 | 3; // Stars
}

export const generateCauseMap = (): { nodes: CauseNode[]; edges: CauseEdge[] } => {
  const nodes: CauseNode[] = [
    { id: 'summer', label: 'Sommer-Hitze', type: 'cause' },
    { id: 'night', label: 'Nachtschicht', type: 'cause' },
    { id: 'supplierX', label: 'Lieferant X', type: 'cause' },
    { id: 'highOutput', label: 'Hohe Ausbringung', type: 'cause' },
    { id: 'deformation', label: 'Verformung', type: 'effect' },
    { id: 'nutQuality', label: 'Nuss-Qualität', type: 'effect' },
    { id: 'defectRate', label: 'Erhöhte Fehlerrate', type: 'effect' },
  ];

  const edges: CauseEdge[] = [
    {
      source: 'summer',
      target: 'deformation',
      strength: 0.8,
      explanation: 'Höhere Temperaturen führen zu Karamell-Verformung',
      confidence: 3,
    },
    {
      source: 'deformation',
      target: 'defectRate',
      strength: 0.7,
      explanation: 'Verformungen erhöhen die Gesamtfehlerrate',
      confidence: 3,
    },
    {
      source: 'supplierX',
      target: 'nutQuality',
      strength: 0.85,
      explanation: 'Lieferant X liefert sporadisch minderwertige Nüsse',
      confidence: 2,
    },
    {
      source: 'nutQuality',
      target: 'defectRate',
      strength: 0.65,
      explanation: 'Nuss-Probleme tragen zur Fehlerrate bei',
      confidence: 3,
    },
    {
      source: 'night',
      target: 'defectRate',
      strength: 0.5,
      explanation: 'Nachtschicht zeigt leicht erhöhte Fehlerrate',
      confidence: 2,
    },
    {
      source: 'highOutput',
      target: 'defectRate',
      strength: 0.45,
      explanation: 'Hohe Produktionsgeschwindigkeit korreliert mit mehr Fehlern',
      confidence: 2,
    },
  ];

  return { nodes, edges };
};

// Initialize data
export const TIME_SERIES = generateTimeSeries(30);
export const MAINTENANCE_EVENTS = generateMaintenanceEvents();
export const BATCHES = generateBatches(500);
export const SEASONALITY_DATA = generateSeasonalityData();
export const SHIFT_DATA = generateShiftData();
export const SUPPLIER_IMPACT_DATA = generateSupplierImpactData();
export const CORRELATION_MATRIX = generateCorrelationMatrix();
export const CAUSE_MAP = generateCauseMap();
