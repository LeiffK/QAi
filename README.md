# QAI – Quality Assurance Intelligence

Eine umfassende, intelligente App für Werks- und QS-Leitung in der Süßwarenproduktion mit erweiterten Analytics und Drill-Down-Funktionen.

## ✨ Neue Features (Erweitert)

### 🏭 Tab: Werke
- **Werke-Übersicht**: Status-Cards mit Quality-Score
  - Linienanzahl, Durchschnittliche Fehlerrate, FPY, Ausbringung
  - **Quality-Score (0-100)** mit Farbcodierung
  - Farbcodierter Status (Gut, Normal, Alarm)
  - Alarm-Zähler
  - **Klickbar** → Linien-Detail-View

- **Linien-Detail-View**: Live-Status + Chargen-Übersicht
  - Aktueller Status (Läuft, Alarm, Achtung, Idle) mit Animation
  - **Quality-Score** für jede Linie
  - Key Metrics (Fehlerrate, FPY, Ausbringung)
  - Mini-Trend-Chart (letzte 20 Datenpunkte)
  - Letzte Charge mit Zeitstempel
  - **NEU: Chargen-Tabelle** unter jeder Linie
    - Filterbar nach Produkt und Schicht
    - Sortierbar nach Zeit, Fehlerrate, FPY
    - Alle Chargen der Linie mit Details
    - **Klickbar** → Charge-Details im Drawer

### 📊 Tab: Insights
- **Kategorie-Filter**: Alle, Qualität, Produktion, Lieferanten, Korrelationen
- **Qualität & Muster**:
  - Saisonalität-Heatmap (Monate × Defektart)
  - Schicht-Heatmap (Früh/Spät/Nacht × Wochentag)
- **Produktion & Wartung**:
  - Linien-Vergleich mit Brushing/Zoom
  - Wartungs-Timeline
  - Ausbringung ↔ Fehlerrate Scatter
- **Lieferanten-Analyse**:
  - Lieferanten-Impact (klickbare Balken setzen Filter)
- **Korrelationen & KI-Insights**:
  - Korrelations-Matrix
  - Cause-Map (KI-Netzwerk mit klickbaren Knoten)

### ⚠ Tab: Alarme (NEU)
- **Alert-Center**: Zentrale Übersicht aller kritischen Chargen
  - Priorisierung: Kritisch (>7%), Hoch (5-7%), Mittel (3-5%)
  - Statistik-Dashboard mit Anzahl je Priorität
  - Filter nach Alarm-Level
  - **Klickbar**: "→ Linie" springt direkt zur betroffenen Linie
  - **Klickbar**: "Details" öffnet Charge im Drawer

### 🏆 Tab: Ranking (NEU)
- **Performance-Ranking**: Top 3 und Bottom 3
  - **Werke**: Beste und schlechteste nach Fehlerrate
  - **Linien**: Top/Bottom mit Werk-Zuordnung
  - **Produkte**: Qualitäts-Ranking
  - **Lieferanten**: Bottom 3 (Problemfälle)
  - **Schichten**: Vergleich Früh/Spät/Nacht
  - Medaillen-Visualisierung (🥇🥈🥉) und Warn-Icons (🔴🟠🟡)
  - **Quality-Score** für alle Elemente
  - **Klickbar** → setzt Filter und wechselt zu Detail-Ansicht

### 🔍 Tab: Traceability
- Vollständige Tabelle: Werk → Linie → Charge
- **Klickbar** → Charge-Details im Drawer
- Defekte nach Art, Belege & Analysen (Platzhalter)

### ⚡ Erweiterte Interaktivität

**Quick Actions Toolbar** (NEU):
- ⚠ Alarme: Direkt zum Alert-Center
- 🔄 Schichten: Schicht-Vergleich in Insights
- 📦 Lieferanten: Lieferanten-Hotspots anzeigen
- 🏆 Top/Bottom: Performance-Ranking öffnen
- 🔄 Zurücksetzen: Alle Filter zurücksetzen

**Breadcrumbs Navigation** (NEU):
- Zeigt aktuellen Navigationspfad (z.B. 🏭 Werke › Berlin › Linie 1)
- **Klickbar** für Zurück-Navigation

**Drill-Anywhere**:
- Von Werke-Card → Linien-Details → Chargen-Tabelle → Charge-Detail-Drawer
- Von Alert → direkt zur betroffenen Linie
- Von Ranking → direkt zur Werk/Linie/Produkt-Ansicht
- Von Lieferanten-Chart → filtert und zeigt Chargen

**Weitere Interaktivität**:
- Globale Filter wirken auf alle Tabs
- Brushing in Zeitserien setzt globales Zeitfenster
- Cross-Highlighting (Hover/Klick)
- Theme-Toggle (Dark ↔ Light)
- **Quality-Score** überall sichtbar (0-100 mit Farbcodierung)

## Technologie

- React + TypeScript + Vite
- Tailwind CSS (Dark Theme, Blau-Akzent, keine warmen Farben)
- Recharts für Visualisierungen
- Zustand für State Management

## Installation & Start

```bash
# Dependencies installieren
npm install

# Dev-Server starten
npm run dev
```

Die App läuft dann auf **http://localhost:5174/** (oder Port 5173, falls verfügbar).

## Demo-Leitfaden (Erweitert)

### Szenario 1: Werke → Linien → Chargen (Hauptfeature)

1. **Tab "Werke"** öffnen (Standard)
2. Werke-Übersicht zeigt 2 Werke mit **Quality-Score**
   - Berlin: Score 85 (grün = sehr gut)
   - Hamburg: Score mit Farbe je nach Performance
3. **Klicken Sie auf "Werk Berlin"**:
   - Breadcrumbs zeigt: 🏭 Werke › Berlin
   - Detailansicht mit allen Linien
   - Jede Linie: Status (● Läuft), Metriken, **Quality-Score**, Mini-Trend
4. **Klicken Sie auf "→ Alle Chargen"** bei Linie 1:
   - Chargen-Tabelle öffnet sich unter der Linie
   - Zeigt ALLE Chargen dieser Linie
   - Filter: Produkt (Toffifee/Schaumküsse/Knoppers), Schicht (Früh/Spät/Nacht)
   - Sortierung: Nach Zeit, Fehlerrate, FPY
5. **Klicken Sie auf eine Charge** in der Tabelle:
   - Drawer öffnet sich mit vollständigen Details
   - Qualitätskennzahlen, Defekte nach Art, Belege

### Szenario 2: Insights mit Kategorien

1. **Tab "Insights"** öffnen
2. **Standard: Alle Kategorien** aktiv
   - Alle Charts werden angezeigt
3. **Klicken Sie auf "Qualität"**:
   - Nur Saisonalität- und Schicht-Heatmaps werden angezeigt
   - Sommer-Spike bei "Verformung" (Jun-Aug) sichtbar
4. **Klicken Sie auf "Lieferanten"**:
   - Nur Lieferanten-Impact Chart
   - **Lieferant X** rot markiert (höchste Fehlerrate)
5. **Klicken Sie auf Lieferant X-Balken**:
   - Filter "Lieferant X" wird gesetzt
   - Alle Tabs/Charts aktualisieren sich

### Szenario 3: Alarme & Performance-Ranking (NEU)

1. **Quick Action: "⚠ Alarme"** klicken
   - Wechselt zum Alert-Center Tab
   - Zeigt Dashboard mit Gesamt/Kritisch/Hoch/Mittel
   - Tabelle mit allen Alarm-Chargen sortiert nach Fehlerrate
2. **Klicken Sie auf "→ Linie"** bei einem Alarm:
   - Springt direkt zur Linien-Detail-View
   - Breadcrumbs zeigt Pfad
   - Chargen der Linie werden angezeigt
3. **Tab "Ranking"** öffnen:
   - Zeigt Top 3 / Bottom 3 für alle Bereiche
   - **Werke**: 🥇Berlin (beste), Hamburg (schlechteste)
   - **Linien**: Top 3 mit Medaillen
   - **Lieferanten**: Bottom 3 mit 🔴🟠🟡
4. **Klicken Sie auf ein Element** im Ranking:
   - Setzt Filter und wechselt zu Detail-Ansicht
   - Z.B. Klick auf Lieferant X → wechselt zu Insights/Lieferanten

### Szenario 4: Quick Actions & Breadcrumbs

1. **Quick Actions Toolbar** nutzen:
   - 🏆 Top/Bottom → öffnet Ranking
   - 📦 Lieferanten → wechselt zu Insights/Lieferanten
   - 🔄 Zurücksetzen → reset aller Filter
2. **Breadcrumbs Navigation**:
   - Zeigt immer aktuellen Pfad (z.B. 🏭 Werke › Berlin › Linie 1)
   - Klick auf "Werke" → zurück zur Übersicht
   - Klick auf "Berlin" → zurück zu Linien-View

### Interaktivität testen

1. **Tab-Navigation**: Wechseln Sie zwischen Werke, Insights, Traceability
   - Alle Tabs sind unabhängig navigierbar
2. **Drill-Down**: Werk → Linien → Charge
   - Jede Ebene klickbar für mehr Details
3. **Kategorie-Filter** (Insights): Qualität, Produktion, Lieferanten, Korrelationen
   - Charts werden dynamisch gefiltert
4. **Brushing** (Insights): Ziehen Sie im Linienvergleich-Chart
   - Alle Charts zoomen auf den gewählten Zeitraum
5. **Globale Filter**: Ändern Sie Werk, Linie, Produkt, Schicht
   - Alle Tabs/Charts aktualisieren sich sofort
6. **Theme-Toggle**: Klicken Sie auf ☀️/🌙 oben rechts
   - Dark ↔ Light Mode

## Datenmuster (synthetisch, aber realistisch)

- **Sommer-Spikes**: Verformung steigt Jun-Aug (Hitze → Karamell-Verformung)
- **Lieferant X**: Höhere Fehlerrate bei Nuss-Qualität
- **Wartung**: Fehlerrate steigt vor Wartung, sinkt danach
- **Nachtschicht**: Leicht erhöhte Fehlerrate
- **Ausbringung**: Positive Korrelation mit Fehlerrate (höhere Geschwindigkeit → mehr Fehler)

## Botschaft

**QAI – Quality Assurance Intelligence** verbindet Daten, zeigt Zusammenhänge und erklärt **warum**.

## Projekt-Struktur

```
src/
├── components/
│   ├── charts/              # Alle Chart-Komponenten
│   ├── views/               # Tab-Views
│   │   ├── PlantsView.tsx   # Werke-Tab
│   │   ├── PlantsOverview.tsx
│   │   ├── LinesDetail.tsx
│   │   └── InsightsView.tsx # Insights-Tab mit Kategorien
│   ├── Navigation.tsx       # Tab-Navigation
│   ├── TopBar.tsx
│   ├── FilterBar.tsx
│   ├── KPICards.tsx
│   ├── TraceabilityTable.tsx
│   └── Drawer.tsx
├── data/
│   └── mockData.ts          # Alle synthetischen Daten
├── store/
│   └── useStore.ts          # Zustand State Management (mit Tab/Selection State)
├── utils/
│   └── filterData.ts        # Filter & KPI-Berechnungen
├── App.tsx                  # Haupt-App mit Tab-Routing
├── main.tsx
└── index.css
```

## Stabilität

- Keine NaN-Werte in Charts
- Keine negativen Prozent-Achsen
- Empty-States bei fehlenden Daten
- Stabile Chart-Rendering (keine Re-Renders ohne Datenänderung)
- Clean Tooltips mit korrekten Werten

## Design

- **Dark Theme** als Default (Light optional)
- **Blau-Akzent** (#3b82f6, #2563eb)
- **KEINE warmen Farben** (Orange, Braun)
- **Futura-Font** (Fallback: Inter)
- Dezente Micro-Animationen
- Klare Hover/Focus-Zustände
