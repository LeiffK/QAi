import { PLANTS, LINES, PRODUCTS, SUPPLIERS, type Batch } from '../data/mockData';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface BatchAnalysis {
  severity: SeverityLevel;
  cause: string;
  measures: string[];
  risk: string;
  summary: string;
}

export interface BatchViewModel extends Batch {
  plantName: string;
  lineName: string;
  productName: string;
  supplierName: string;
  analysis: BatchAnalysis;
  primaryDefect: string | null;
  annotation?: {
    comment: string;
    status: 'offen' | 'in_pruefung' | 'geklaert' | 'zurueckgestellt';
    updatedAt: string;
  };
}

const DEFECT_LIBRARY: Record<
  string,
  {
    cause: string;
    measures: string[];
    risk: string;
  }
> = {
  Verformung: {
    cause: 'Temperaturschwankung in der Kuehlstrecke fuehrt zu Formabweichungen.',
    measures: [
      'Kuehlstrecke auf 18 Grad stabilisieren',
      'Zusatzliche Stichproben der Charge durchfuehren',
      'Technik-Team per Alarm informieren',
    ],
    risk: 'Erhoehter Ausschuss und Kundenbeschwerden wegen Formabweichung.',
  },
  'Nuss-Qualitaet': {
    cause: 'Rohwarencharge weist hohe Bruchrate auf.',
    measures: [
      'Wareneingangssperre fuer betroffene Lieferung setzen',
      'Lieferant zur Nachlieferung gemaess Spezifikation auffordern',
      'Alternative Liefercharge pruefen',
    ],
    risk: 'Geschmackseinbussen und Reklamationsrisiko durch Fremdpartikel.',
  },
  Verpackung: {
    cause: 'Siegeltemperatur variiert, Packungen schliessen nicht sauber.',
    measures: [
      'Siegelparameter neu kalibrieren',
      'Linie fuer 15 Minuten stoppen und Testversuche fahren',
      'Bereits verpackte Einheiten nachpruefen',
    ],
    risk: 'Produktsicherheit und Haltbarkeit sind gefaehrdet.',
  },
  Gewicht: {
    cause: 'Dosiereinheit laeuft ausserhalb der Toleranz.',
    measures: [
      'Dosiereinheit sofort nachjustieren',
      'Kalibriergewicht einsetzen und dokumentieren',
      'Produktion temporaer auf 80 Prozent Geschwindigkeit reduzieren',
    ],
    risk: 'Verstoss gegen gesetzliche Vorgaben und wirtschaftliche Verluste.',
  },
  Optik: {
    cause: 'Temperatur- oder Feuchtigkeitsspitzen mindern den Glanz.',
    measures: [
      'Klimatisierung der Verpackungslinie pruefen',
      'Sensorik und Kamera reinigen',
      'Prozesswerte im Liniencockpit dokumentieren',
    ],
    risk: 'Beeintraechtigung des Markenauftritts und erhoehte Retourenquote.',
  },
};

const DEFAULT_LIBRARY_ENTRY = {
  cause: 'Abweichung im Prozess erkannt, vertiefte Analyse erforderlich.',
  measures: [
    'Prozessparameter dokumentieren und mit Referenz vergleichen',
    'Schichtleiter informieren und Ursachenanalyse starten',
    'Stichproben verdoppeln, bis Ursache identifiziert ist',
  ],
  risk: 'Unbekanntes Risiko - erhöhte Überwachung erforderlich.',
};

const determineSeverity = (defectRate: number): SeverityLevel => {
  if (defectRate > 7) return 'critical';
  if (defectRate > 5) return 'high';
  if (defectRate > 3) return 'medium';
  return 'low';
};

export const getPrimaryDefect = (batch: Batch): { type: string; count: number } | null => {
  if (!batch.defects || batch.defects.length === 0) return null;
  const [primary] = [...batch.defects].sort((a, b) => b.count - a.count);
  return primary ?? null;
};

export const analyzeBatch = (batch: Batch): BatchAnalysis => {
  const primaryDefect = getPrimaryDefect(batch);
  const knowledge = primaryDefect?.type
    ? DEFECT_LIBRARY[primaryDefect.type] ?? DEFAULT_LIBRARY_ENTRY
    : DEFAULT_LIBRARY_ENTRY;

  const severity = determineSeverity(batch.defectRate);
  const timestamp = batch.timestamp.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const summaryParts = [
    `Charge ${batch.id}`,
    `${batch.defectRate.toFixed(2)}% Fehlerrate`,
    primaryDefect?.type ? `Top-Defekt: ${primaryDefect.type}` : 'Kein dominanter Defekt',
    `Zeit: ${timestamp}`,
  ];

  return {
    severity,
    cause: knowledge.cause,
    measures: knowledge.measures,
    risk: knowledge.risk,
    summary: summaryParts.join(' Â· '),
  };
};

export const buildBatchViewModel = (batch: Batch): BatchViewModel => {
  const plant = PLANTS.find((item) => item.id === batch.plantId);
  const line = LINES.find((item) => item.id === batch.lineId);
  const product = PRODUCTS.find((item) => item.id === batch.productId);
  const supplier = SUPPLIERS.find((item) => item.id === batch.supplierId);

  const analysis = analyzeBatch(batch);
  const primaryDefect = getPrimaryDefect(batch)?.type ?? null;

  return {
    ...batch,
    plantName: plant?.name ?? batch.plantId,
    lineName: line?.name ?? batch.lineId,
    productName: product?.name ?? batch.productId,
    supplierName: supplier?.name ?? batch.supplierId,
    analysis,
    primaryDefect,
  };
};

export const severityLabel = (severity: SeverityLevel) => {
  switch (severity) {
    case 'critical':
      return 'Kritisch';
    case 'high':
      return 'Hoch';
    case 'medium':
      return 'Mittel';
    default:
      return 'Niedrig';
  }
};

export const severityColorClasses = (severity: SeverityLevel) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-900/40 text-red-300 border-red-600/70';
    case 'high':
      return 'bg-yellow-900/40 text-yellow-300 border-yellow-600/70';
    case 'medium':
      return 'bg-primary-900/30 text-primary-200 border-primary-600/50';
    default:
      return 'bg-emerald-900/30 text-emerald-200 border-emerald-600/60';
  }
};

