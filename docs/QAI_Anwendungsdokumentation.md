# QAI â€“ Anwendungsdokumentation

## 1. Ziel, Zielgruppe und Ausgangslage

QAI (Quality Assurance Intelligence) ist ein webbasiertes Leitstandsystem fuer Werk- und Qualitaetsverantwortliche in der Lebensmittel- und Suesswarenproduktion. Die Anwendung fuehrt betriebliche Kennzahlen und Kontextinformationen in einer modernen, dunklen Benutzeroberflaeche zusammen. Dieses Dokument beschreibt den Aufbau und die Bedienung so, dass sich auch Personen ohne Sehfaehigkeit ein praezises Bild machen koennen. Jeder Abschnitt skizziert, welche Informationen angezeigt werden, wie sie strukturiert sind, welche Aktionen moeglich sind und welche Rueckmeldungen das System liefert.

## 2. Aufbau des Arbeitsbereichs

Die Oberflaeche ist in drei vertikale Zonen gegliedert:

- **Linker Seitenbereich**: Eine Navigationsleiste mit sechs Hauptreitern (Dashboard, Werke, Insights, Alarme, Ranking, Traceability). Jeder Eintrag ist eine Schaltflaeche mit Symbol und Titel. Aktivierte Tabs sind deutlich markiert und loesen einen Inhaltewechsel im Hauptbereich aus.
- **Zentrale Arbeitsflaeche**: Hier erscheinen Quick Actions, ein globaler Filterbereich, Brotkrumen zur Orientierung und der jeweils aktive Inhaltsbereich. Die Inhalte sind in Karten (rechteckige Abschnitte) organisiert und mit Ueberschriften versehen.
- **Rechter Seitenbereich**: Ein ausklappbarer Drawer (Seitendialog) dient als Detailansicht fuer ausgewaehlte Chargen oder Lieferanten. Er erscheint nur, wenn gezielt Details angefordert werden, und deckt dann etwa ein Viertel der Bildschirmbreite ab.

Oberhalb der Zonen befindet sich die kopfzeilenartige **TopBar**. Sie enthaelt das QAI-Logo, den Produktnamen, eine Zeitraumauswahl, ein globales Suchfeld und einen Schalter zum Wechsel zwischen dunklem und hellem Farbschema. In der dunklen Grundeinstellung sind alle Karten leicht transparenter und heben sich durch Konturen vom Hintergrund ab; farbliche Hervorhebungen kennzeichnen positive oder kritische Werte. Wo Farben verwendet werden (zum Beispiel Rot fuer kritische Kennzahlen), stehen immer Zahlen und textliche Labels daneben, sodass auch ohne Farbinformation klar ist, worum es geht.

## 3. Globale Funktionen und Navigation

### 3.1 Navigationsleiste

Die Navigationsleiste links ist vertikal aufgebaut. Jeder der sechs Tabs kann mit Tastatur oder Maus ausgewaehlt werden. Beim Wechsel wird der entsprechende Inhalt in der Mitte geladen. Die aktive Auswahl ist an einer Kombination aus Hintergrundmarkierung und einem schmalen Balken an der linken Seite zu erkennen (Screenreader erhalten zusaetzlich den Status "aktiv").

### 3.2 Quick Actions

Direkt unter der Kopfzeile zeigt die Quick-Action-Leiste fuenf grosse Schaltflaechen:

1. **Alarme** oeffnet sofort die Alarmuebersicht.
2. **Schichten** springt zum Insights-Bereich mit Schichtvergleichen.
3. **Lieferanten** zeigt die Lieferantenanalyse innerhalb der Insights.
4. **Top/Bottom** fuehrt in das Ranking.
5. **Zuruecksetzen** setzt alle Filter zurueck und bringt den Anwender auf das Dashboard.

Jede Schaltflaeche besitzt einen zweizeiligen Beschreibungstext (Titel und Kurzbeschreibung), sodass Screenreader die Funktion ohne visuelle Hinweise erkennen.

### 3.3 Filtermatrix

Der Filterbereich besteht aus fuenf Auswahlfeldern fuer Werk, Linie, Produkt, Schicht und Lieferant sowie einer separaten Zeitraumauswahl in der Kopfzeile. Wird ein Werk gewaehlt, passt sich die Linienauswahl an und zeigt nur die zugehoerigen Linien. Alle Filter wirken global: Saemtliche Kennzahlen, Tabellen, Diagramme und Ranglisten aktualisieren sich dynamisch anhand der gewaehlten Kriterien. Die Schaltflaeche "Zuruecksetzen" im Filterbereich hebt alle Auswahlfelder auf.

### 3.4 Brotkrumen

Die Brotkrumenleiste erscheint, sobald mehrere Ebenen durchlaufen werden (zum Beispiel beim Drill-down von einem Werk in eine Linie). Sie zeigt den aktuellen Pfad, zum Beispiel "Werke > Werk Berlin". Fruehere Stufen sind als Schaltflaechen ausgebildet, sodass man jederzeit zurueckspringen kann. Der aktuelle Endpunkt wird als Text ohne Schaltflaechenfunktion dargestellt.

### 3.5 Drawer (Detailansicht)

Wenn in Tabellen oder Karten auf einen Eintrag geklickt wird, oeffnet sich rechts ein Drawer. Er enthaelt strukturierte Informationen zur ausgewaehlten Charge: Werk, Linie, Produkt, Lieferant, Lot-Nummer, Schicht, Zeitstempel, Ausbringung, Kennzahlen (Fehlerrate, Erstpass-Quote, Ausschuss), aufgeschluesselte Defekte nach Art und eine Sammlung verknuepfter Dokumente. Oben befindet sich eine Schaltflaeche "Schliessen", die den Drawer wieder einfaehrt. Alle Angaben sind in Textform, angeordnet in Abschnitten mit Ueberschriften.

## 4. Datenbasis und Kennzahlenlogik

Die Anwendung nutzt synthetische, aber realistisch strukturierte Daten. Wichtige Datenobjekte sind:

- **Werke (Plants)**: Zwei Standorte (Berlin, Hamburg) dienen als Einstiegspunkte.
- **Linien (Lines)**: Vier Produktionslinien, je zwei pro Werk.
- **Produkte**: Drei Produktkategorien wie Toffifee, Schaumkuesse, Knoppers.
- **Lieferanten**: Fuenf Lieferanten mit unterschiedlichen Rohstoffen; ein Lieferant weist bewusst erhoehte Fehlerraten auf.
- **Chargen (Batches)**: Jede Charge enthaelt Werk, Linie, Produkt, Lieferant, Lot-Nummer, Schicht, Zeitstempel, Fehlerrate, Erstpass-Quote (FPY), Ausschussquote, Ausbringung und Defekte nach Art.
- **Zeitreihenpunkte**: Fuer jede Linie und Schicht existieren taegliche Messungen ueber etwa einen Monat. Jahreszeitliche Effekte (Sommer), Schichtunterschiede und Linienbesonderheiten sind eingearbeitet.
- **Wartungsereignisse**: Geplante und ungeplante Stillstaende mit Dauer und Zeitpunkt.

Die Filterlogik arbeitet in zwei Stufen:

1. Zunaechst wird der Zeitbereich bestimmt (24 Stunden, 7 Tage, 30 Tage oder benutzerdefiniert). Alternativ kann der Benutzer durch Ziehen in Diagrammen einen Zeitausschnitt (Brush Selection) setzen, der alle anderen Analysen ueberschreibt.
2. Danach werden Werk, Linie, Produkt, Schicht und Lieferant angewendet. Nur Chargen, die alle Kriterien erfuellen und in den Zeitraum fallen, werden ausgewertet.

Aus den gefilterten Chargen werden Kennzahlen abgeleitet:

- **Fehlerrate**: Durchschnittliche Prozentzahl fehlerhafter Einheiten.
- **FPY (First Pass Yield)**: Anteil fehlerfrei produzierter Einheiten beim ersten Durchgang.
- **Ausschuss**: Durchschnittliche Ausschussquote.
- **Alarme**: Zahl der Chargen mit Fehlerrate ueber 5 Prozent.
- **Abdeckung**: Anteil der Chargen, deren FPY ueber 95 Prozent liegt.
- **Quality Score**: Eine zusammengesetzte Bewertung (0 bis 100). Sie zieht Fehlerrate, FPY und Ausschuss zusammen. Ab Score 80 gilt ein Werk als sehr gut, unter 60 als kritisch. Farben dienen nur zur zusaetzlichen Hervorhebung; die Score-Werte stehen immer als Zahlen dabei.

## 5. Dashboard â€“ Operational Control Center

Das Dashboard ist die Startansicht und fasst alle wichtigen Kennzahlen zusammen.

### 5.1 Struktur

1. **Ganz oben** steht eine Ueberschrift mit Subtitle (zum Beispiel "Strategischer Ueberblick").
2. **KPICards**: Fuenf Karten nebeneinander zeigen Fehlerrate, FPY, Ausschuss, Alarme und Abdeckung. Jede Karte enthaelt:
   - Einen Titel.
   - Den aktuellen Wert im Klartext.
  - Ein Delta in Prozent, das angibt, wie sich der Wert gegenueber dem vorherigen Zeitraum veraendert hat (positiv, negativ oder stabil).
  - Ein kleines Liniendiagramm mit dem Verlauf der letzten zehn Zeitabschnitte. Der Verlauf ist durch Zahlen und Legende erklaert; der Screenreader liest die Zwischenwerte als Trend.
3. **Werksstatus**: Ein Raster aus Karten pro Werk. Jede Karte nennt den Standort, die Zahl aktiver Linien, durchschnittliche Fehlerrate, Quality Score, Ausbringung und Anzahl aktueller Alarme. Ein Statuslabel (z. B. "OK", "Alarme") erklaert die derzeitige Lage.
4. **Trendbereich**: Ein Bereich mit einem Diagramm, das Fehlerrate und FPY ueber die Zeit kombiniert sowie ein Ziel (3 Prozent Fehlerrate). Ein "Forecast"-Block daneben extrapoliert die Fehlerrate der naechsten 24 Stunden und ordnet den Trend als steigend, fallend oder stabil ein.
5. **Linienleistung**: Karten je Linie innerhalb des gewaehlten Werkes mit Kennzahlen, Letztstatus, Ausbringung, meist produziertem Produkt, kleinem Verlauf und Quality Score.
6. **Letzte Alarme**: Eine Liste der fuenf kritischsten Chargen mit Charge-ID, Werk, Linie, Zeitstempel und Fehlerrate.
7. **Produktperformance**: Eine Tabelle, die die erfolgreichsten Produkte mit Fehlerraten und Chargenzahlen ausweist. Ein Klick auf ein Produkt filtert die Insights auf dieses Produkt.
8. **Schnelluebersicht**: Vier Kennzahlen (Anzahl Schichten, Produkte, aktive Linien, Chargen im Zeitraum) plus ein Button, der ins Ranking fuehrt.

### 5.2 Interaktionsmoeglichkeiten

- Ein Klick auf ein Werk im Werksstatus springt automatisch in die Detailansicht der jeweiligen Werke.
- Beim Trenddiagramm kann ein Zeitfenster markiert werden (Brush), wodurch alle anderen Bereiche auf diesen Zeitraum zoomen.
- Die Liste letzter Alarme bietet Schaltflaechen, um den Drawer zu oeffnen oder direkt zur Linienansicht zu wechseln.
- Produktkacheln sind Schaltflaechen, die das globale Filterfeld "Produkt" setzen und den Tab "Insights" oeffnen.

## 6. Werke und Linien â€“ Drill-down in die Produktion

### 6.1 Werkeuebersicht

Die Werke-Ansicht unterscheidet zwischen einer globalen Werkebene und der Linienebene. Solange keine Linie ausgewaehlt wurde, zeigt die Ansicht die Werkeuebersicht:

- Jede Karte listet Werkname, Standort, Anzahl Linien, aktuelle Ausbringung, durchschnittliche Fehlerrate mit verbaler Bewertung sowie Erstpass-Quote.
- Eine Zeile "aktive Alarme" wird nur eingeblendet, wenn im betrachteten Zeitraum kritische Chargen existieren.
- Ein Hinweis fordert zum Klicken auf, um Linien-Details zu sehen.

### 6.2 Linien-Detail

Nach Auswahl eines Werkes erscheint eine mehrspaltige Ansicht:

1. **Uebersichtskopf**: Werkname, Standort, Quality Score, Buttons fuer Rueckkehr zur Werkeebene und zum Zuruecksetzen ausgewaehlter Linien.
2. **Linienkarten**: Pro Linie gibt es eine Karte mit:
   - Betriebsstatus (Running, Achtung, Alarm, Idle).
   - Quality Score.
   - Kennzahlen (Fehlerrate, FPY, Ausschuss, Ausbringung).
   - Letzte Charge samt Zeitstempel und Produktname.
   - Kleines Liniendiagramm der Fehlerrate ueber die letzten 20 Messpunkte.
   - Informationskasten mit haeufigstem Produkt und Batch-Zaehlern.
   - Steuerungsbuttons zum Vergleichsmodus oder zum Anfordern der Chargentabelle.
3. **Vergleichsauswahl**: Unten befindet sich ein Panel fuer Linienvergleiche. Anwender koennen Linien markieren und deren Kennzahlen in einer Tabelle nebeneinander sehen. Kennzahlen umfassen Fehlerrate, FPY, Ausschuss, Ausbringung, Alarme und Quality Score. Die Tabelle zeigt ausserdem Abweichungen zwischen den Linien.
4. **Chargentabelle**: Beim Klick auf "Chargen anzeigen" oeffnet sich eine Liste der Chargen der gewaehlten Linie. Filter fuer Produkt, Schicht und Sortierreihenfolge erleichtern die Analyse. Spalten listen Charge-ID, Produkt, Lieferant, Schicht, Fehlerrate, FPY und Zeit.

Alle Tabellen sind tastaturzugänglich. Ein Enter auf einer Zeile oeffnet den Drawer mit Detailinformationen.

## 7. Insights â€“ Analytik nach Kategorien

Die Insights gliedern Analysen nach Kategorien. Oberhalb befindet sich eine horizontale Schaltergruppe, mit der sich die sichtbaren Diagramme filterbar machen (Alle, Qualitaet, Produktion, Lieferanten, Korrelationen). Die Schalter sind als Buttons mit Text umgesetzt.

### 7.1 Qualitaet und Muster

- **Saisonalitaets-Heatmap**: Ein quadratisches Raster aus Monaten (x-Achse) und Defektarten (y-Achse). Jedes Feld repraesentiert die Fehlerrate fuer eine Kombination. Die Legende erklaert, dass dunklere Felder niedrigere, helle Felder hoehere Werte zeigen. Der begleitende Text beschreibt, dass Verformungen im Sommer auffaellig haeufig sind.
- **Schicht-Heatmap**: Aehnlicher Aufbau, aber Achsen sind Schichten und Wochentage. Der Text verweist darauf, dass Nachtschichten eine etwas hoehere Fehlerrate und Wochenenden leichte Ausschlaege zeigen.

### 7.2 Produktion und Wartung

- **Linienvergleich**: Ein interaktives Linien-Chart mit mehreren Linien fuer verschiedene Linien. Benutzer koennen Bereiche markieren (Brush), wodurch sich der globale Zeitbereich anpasst. Die Legende beschreibt jede Linie.
- **Wartungs-Timeline**: Ein Zeitstrahl mit Punkten fuer geplante und ungeplante Wartungen, jeweils mit Dauer. Tooltipps nennen Typ, Datum und Dauer.
- **Ausbringung versus Fehlerrate**: Ein Streudiagramm mit Punkten; jeder Punkt zeigt eine Charge. Der Text erlaeutert die Beziehung: hoehere Ausbringung geht oft mit erhoehter Fehlerrate einher.

### 7.3 Lieferantenanalyse

- **Supplier Impact**: Ein Balkendiagramm, das pro Lieferant Fehlerrate und Anzahl betroffener Chargen zeigt. Ein Hover oder Klick setzt den Filter "Lieferant" und aktualisiert alle anderen Ansichten. Ein Hinweistext erklärt, dass Lieferant X ueberdurchschnittliche Fehlerraten verursacht.

### 7.4 Korrelationen und KI-Insights

- **Korrelationsmatrix**: Ein Raster, das Zusammenhaenge zwischen Kennzahlen (z. B. Fehlerrate vs. FPY) bewertet. Positive und negative Korrelationen werden farblich und mit Zahlenwerten dargestellt. Der begleitende Text beschreibt die wichtigsten Beziehungen.
- **Cause-Map**: Ein Netzdiagramm, das Ursachenketten (z. B. Hitze â†’ Verformung â†’ Hoehere Ausschussquote) zeigt. Knoten lassen sich anklicken, um den Drawer mit Zusatzinformationen zu oeffnen.

Alle Diagramme sind mit Ueberschrift, Achsenbeschreibungen und Hilfstext ausgestattet, damit Screenreader den Kontext vermitteln. Tooltipps enthalten vollstaendige Werte (z. B. "Monat Juni, Defektart Verformung, Fehlerrate 4,5 Prozent").

## 8. Alarme â€“ Priorisierung kritischer Faelle

Die Alarmansicht konzentriert sich auf Chargen mit Fehlerraten uerber 3 Prozent.

1. **Header**: Titel "Alarm-Center" plus Beschreibung, welche Chargen enthalten sind.
2. **Statistikkarten**: Vier Karten mit Gesamtzahl, kritische Alarme (ueber 7 Prozent), hohe Alarme (5 bis 7 Prozent) und mittlere Alarme (3 bis 5 Prozent). Jede Karte nennt die Schwelle in Textform.
3. **Filterleiste**: Buttons fuer "Alle", "Kritisch", "Hoch" und "Mittel". Das aktive Filterlabel ist deutlich markiert.
4. **Alarmtabelle**: Eine Tabelle mit Level, Charge, Werk, Linie, Produkt, Fehlerrate, Zeitpunkt und Aktionen. Die Aktionen bestehen aus zwei Buttons:
   - **Details** oeffnet den Drawer.
   - **Zur Linie** springt in die Werkeansicht und zeigt die entsprechende Linie.

Wenn keine Alarme vorliegen, erscheint eine textliche Bestaetigung ("Keine Alarme fuer die gewaehlten Filter") mit einem Symbol.

## 9. Ranking â€“ Spitzenreiter und Problemfaelle

Der Ranking-Tab vergleicht Werke, Linien, Produkte, Lieferanten und Schichten miteinander.

- **Werke**: Eine Tabelle listet alle Werke mit Quality Score, Fehlerrate, FPY, Chargenanzahl und Status. Die Top drei und die drei Schlusslichter sind markiert. Ein Auswahlfeld erlaubt das Filtern nach Status (alle, gut, normal, kritisch).
- **Linien**: Zwei Abschnitte zeigen Top 3 und Bottom 3 Linien. Ein Klick auf eine Linie wechselt in die Werkeansicht und fokussiert die gewaehlte Linie.
- **Produkte**: Die besten drei Produkte werden hervorgehoben; ein Klick setzt das Produktfilterfeld.
- **Lieferanten**: Der Bereich zeigt die drei schlechtesten Lieferanten (Bottom 3). Sie koennen per Klick gefiltert werden. Jeder Eintrag nennt die Fehlerrate explizit.
- **Schichten**: Eine Liste ordnet Frueh-, Spaet- und Nachtschicht nach Fehlerrate. Die beste Schicht ist gruen markiert, die schlechteste rot; Zahlen benennen die Werte.

Der Rankingbereich dient sowohl zur schnellen Orientierung als auch als Sprungbrett in tiefergehende Analysen.

## 10. Traceability â€“ Vollstaendige Rueckverfolgung

Die Traceability-Ansicht praesentiert eine tabellarische Liste der Chargen mit Werk, Linie, Produkt, Lieferant, Lot, Schicht, Fehlerrate, FPY und Ausschuss. Ein Hinweis unterhalb der Tabelle nennt, wie viele Datensaetze angezeigt werden und dass ein Klick Details oeffnet. Somit laesst sich jede Charge eindeutig dem Herstellungszusammenhang zuordnen.

## 11. Bedienablaeufe fuer Screenreader-Nutzende

1. **Starten und orientieren**:
   - Beim Laden der Seite landet der Fokus auf der TopBar. Screenreader lesen "Quality Assurance Intelligence, Zeitraum, Suchfeld, Theme-Schalter".
   - Mit der Tabulator-Taste gelangen Nutzende in die Quick Actions und weiter zur Navigation.
2. **Navigation per Tastatur**:
   - Binnen der Navigationsleiste koennen Pfeiltasten oder Tabulator genutzt werden. Der aktive Tab wird als "aktiv" beschrieben.
   - Ein Druck auf Enter (oder Space) wechselt den Inhaltsbereich.
3. **Filter setzen**:
   - Mit Tab zum Filterbereich springen, Auswahlfelder aufklappen (Enter) und mit den Pfeiltasten den gewuenschten Wert waehlen. Der Screenreader liest die ausgewaehlten Optionen laut vor.
   - Die Schaltflaeche "Zuruecksetzen" ist am Ende der Filterliste.
4. **Tabellen bedienen**:
   - Tabellen sind in Zeilen und Spalten gegliedert. Jede Zeile laesst sich per Enter oeffnen, um den Drawer zu starten.
   - Beim Oeffnen eines Drawers wird der Fokus auf den Close-Button gesetzt. Nach dem Schliessen springt der Fokus zur vorherigen Tabellenzeile zurueck.
5. **Drill-down und Brotkrumen**:
   - Nach einem Drill-down erscheint die Brotkrumenleiste. Mit Tab erreicht man die Schaltflaechen fuer vorherige Ebenen (z. B. "Werke").
6. **Diagramme**:
   - Diagramme liefern Tooltipps beim Fokus oder Hover. Bei Tastaturbedienung stellt der Screenreader die Werte ueber ARIA-Live-Bereiche bereit (z. B. "Monat Juni, Verformung, Fehlerrate 4,5 Prozent").
7. **Suche**:
   - Das Suchfeld nimmt frei eingegebenen Text entgegen und filtert Listen nach intelligenten Regeln (z. B. Charge-ID, Produktname). Das Tastaturkuerzel Ctrl+K wird als Hinweis angezeigt, erfordert aber eine spaetere Implementierung fuer globale Suche.

## 12. Technische Grundlagen

- **Frameworks**: React mit TypeScript und Vite als Build-Tool.
- **State-Management**: Zustand speichert globale Stati wie aktive Tabs, Filter, Drawer, Breadcrums, Vergleichslisten und Theme-Einstellungen.
- **Styling**: Tailwind CSS fuer Layout, Farbgebung und Typografie. Ein dunkles Farbschema ist Standard; ein Lichtmodus kann per Toggle aktiviert werden.
- **Visualisierung**: Recharts liefert Heatmaps, Liniendiagramme, Streudiagramme, Balkendiagramme und Netzvisualisierungen.
- **Daten**: Alle Daten stammen aus `src/data/mockData.ts` und werden beim Laden generiert. Sie enthalten saisonale Muster, Lieferantenprobleme und Schichtunterschiede, um Analysen zu demonstrieren.
- **Hilfsfunktionen**: `filterData.ts` kuemmert sich um Filterlogik, Kennzahlenberechnung, Quality Score und Farbklassifizierung.

## 13. Typische Nutzungsszenarien

### Szenario A: Alarmbearbeitung

1. Start auf dem Dashboard, Quick Action "Alarme" auswaehlen.
2. In der Alarmtabelle nach kritischen Alarmen (Level "Kritisch") sortieren.
3. Mit Enter eine Charge oeffnen, Drawer zeigt Defektarten und relevante Dokumente (z. B. Pruefprotokoll).
4. Mit "Zur Linie" in die Werkeansicht springen, um die betroffene Linie im Kontext zu sehen.
5. Im Linien-Detail die Chargentabelle filtern (zum Beispiel nach Schicht Nacht), um Muster zu erkennen.

### Szenario B: Lieferantenvergleich

1. Im Insights-Tab den Filter "Lieferanten" aufrufen.
2. Im Diagramm einen Lieferanten auswaehlen; dadurch wird global das Lieferantenfilter gesetzt.
3. Zum Ranking wechseln, um zu sehen, wie sich derselbe Lieferant in der Rangliste platziert.
4. In Traceability jede Charge des Lieferanten nachverfolgen und bei Bedarf in den Drawer wechseln.

### Szenario C: Produktionsoptimierung

1. Im Dashboard einen Zeitraum (z. B. letzte 7 Tage) waehlen.
2. Ueber die Werke-Karten die Linie mit erhoehter Fehlerrate identifizieren.
3. Drill-down in die Linienansicht, Chargentabelle nach Produkt oder Schicht filtern.
4. Im Insights-Bereich die Wartungs-Timeline und das Ausbringung-gegen-Fehlerrate-Diagramm betrachten, um Zusammenhaenge zu entdecken.
5. Ein Vergleich mehrerer Linien starten und die Abweichung bei FPY und Ausschuss analysieren.

## 14. Begriffslexikon

- **FPY (First Pass Yield)**: Anteil der Einheiten, die bereits im ersten Fertigungsdurchlauf fehlerfrei sind.
- **Quality Score**: Gesamtbewertung auf Basis von Fehlerrate, FPY und Ausschuss. Hohe Werte signalisieren stabile Produktion.
- **Ausschuss**: Anteil der Produktion, der verworfen werden muss.
- **Drill-down**: Schichtweises Navigieren von Uebersichten in detailliertere Ebenen (Werk â†’ Linie â†’ Charge).
- **Brush Selection**: Markierung eines Zeitfensters in einem Diagramm, das den globalen Zeitraum ueberschreibt.

## 15. Weiteres Vorgehen und Anpassungspotenzial

- **Barrierefreiheit vertiefen**: Die Anwendung bietet bereits klare Texte und strukturierte Tabellen. Zusaetzliche ARIA-Rollen fuer Diagramme und Filterkoepfe koennen Screenreader-Unterstuetzung weiter verbessern.
- **Echte Datenintegration**: Der Wechsel von Mock-Daten zu Produktionsdaten erfordert eine API-Anbindung und Authentifizierung.
- **Benutzerrechte**: Rollenkonzepte (z. B. Werksleiter, Linienverantwortliche) koennen zukuenftig unterschiedliche Sichten oder Schreibrechte erhalten.
- **Zusatzanalysen**: Praediktive Module koennen erweitert werden, um konkrete Handlungsempfehlungen (z. B. Wartungsvorschlaege) zu geben.

## 16. Zusammenfassung

QAI bietet in einer zentralen Plattform Transparenz ueber Qualitaet, Produktion und Lieferantenkette. Die Kombination aus hierarchischer Navigation, flexibler Filterung, reichhaltigen Visualisierungen und detailierten Tabellen ermoeglicht schnelle Entscheidungen. Dank klarer Textstrukturen, beschrifteter Aktionen und gezielter Drill-Down-Wege laesst sich die Anwendung auch ohne visuelle Anhaltspunkte verstehen. Dieses Dokument dient als Leitfaden, um Aufbau, Funktionsweise und typische Arbeitsablaeufe nachvollziehen zu koennen und bildet die Grundlage fuer Trainings- oder Einfuehrungsveranstaltungen.



