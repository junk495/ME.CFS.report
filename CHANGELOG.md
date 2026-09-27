# Changelog

Alle Änderungen an der App, geordnet nach Version.
Die Version wird in `<meta name="app-version">` in `index.html` gepflegt und folgt Semantic Versioning (`MAJOR.MINOR.PATCH`) — bei jedem Release `index.html` und diesen Eintrag gemeinsam aktualisieren.

Nur Änderungen, die die App selbst betreffen (Funktionen, UI, Verhalten), werden aufgeführt. Änderungen an Dokumentation, Lizenz oder anderen Nicht-App-Dateien gehören nicht hierher. Versionen ohne App-Änderungen werden übersprungen.

## v1.1.0 – 2026-09-26

### Neu

- **Diagramm-Auswahl:** Im Bereich „Diagramme" lassen sich jetzt beliebige der ~80 erfassten Werte für den Verlauf auswählen (Suchfeld + gruppierte Liste). Vergleiche (mehrere Werte übereinander) können frei angelegt, befüllt und entfernt werden.

## v1.0.0 – 2026-09-26

### Neu

- **Grundgerüst:** Desktop-Layout (Kopfleiste, Konfigurations-Sidebar, Vorschau), CSV-/JSON-Import, „Tracker"-Übernahme (localStorage) und Beispiel-Daten.
- **Auswertung:** Verlaufs-Diagramme, Heatmap, Symptombereiche-Zusammenfassung, PEM-Episoden, Notizen und Crash-Risiko.
- **Vergleich:** Überlagerungs-Diagramm (mehrere Messwerte in einem Diagramm, Hybrid-Skala: gleiche Skala = Rohwerte, gemischt = normalisiert auf 0–100 %).
- **Konfiguration:** Kopfdaten (Titel, Patient:in, Arzt:in, Freitext), Zeitraum (Alle/90/30 Tage), Abschnitte ein-/ausschalten.
- **Layout & PDF:** Seitengröße (A4/Letter), Schriftgröße, Druckausgabe mit sauberen Seitenumbrüchen.
