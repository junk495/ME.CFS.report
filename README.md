# ME.CFS.report

**🌐 Zur Live-App:** [https://junk495.github.io/ME.CFS.report/](https://junk495.github.io/ME.CFS.report/)

Ein eigenständiges, rein lokales Web-Tool zur **interaktiven Auswertung** der vom [ME/CFS-Symptom-Tracker](https://github.com/junk495/ME.CFS) exportierten Daten (CSV oder JSON) und zum Erstellen eines **konfigurierbaren Arztberichts (PDF)** — optimiert für PC, Laptop und Tablet.

Im Unterschied zum schnellen Arztbericht in [ME.CFS.graph](https://github.com/junk495/ME.CFS.graph) lassen sich hier Abschnitte, Zeitraum und Diagramme frei zusammenstellen und **mehrere Messwerte in einem Diagramm übereinanderlegen**.

## 📚 Dokumentation

Die vollständige Dokumentation liegt im **[Projekt-Wiki](https://github.com/junk495/ME.CFS/wiki)** (für Tracker, Graph und Report): Bedienungsanleitung, FAQ, fachliche Grundlagen, Datenmodell und Entwickler-Handbuch.

## 📄 Weitere Dateien in diesem Repository

- **[CHANGELOG.md](./CHANGELOG.md)** — Versionshistorie.
- **[LICENSE.md](./LICENSE.md)** — Lizenz (CC BY-NC-SA 4.0) und medizinischer Haftungsausschluss.

## Roadmap (geplant, noch nicht umgesetzt)

- Eigenständiger HTML-Export (eine portierbare Datei, nicht nur PDF).
- Individuelle Zusammenstellung der Vergleichs-Diagramme (eigene Metrik-Auswahl pro Diagramm).
- Frei wählbarer Zeitraum (Von/Bis) zusätzlich zu den Presets.
- Speichern der Konfiguration (localStorage).

## Technische Basis

Statische Single Page Application (SPA) auf GitHub Pages: HTML5, reines CSS, Vanilla JavaScript (ES6+). Diagramme mit nativem Canvas, keine Frameworks, keine externen Abhängigkeiten, 100 % lokal, bewusst ohne PWA.
