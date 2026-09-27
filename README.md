# ME.CFS.report

**🌐 Zur Live-App:** [https://junk495.github.io/ME.CFS.report/](https://junk495.github.io/ME.CFS.report/)

Ein eigenständiges, rein lokales Web-Tool zur **interaktiven Auswertung** der vom [ME/CFS-Symptom-Tracker](https://github.com/junk495/ME.CFS) exportierten Daten (CSV oder JSON) und zum Erstellen eines **konfigurierbaren Arztberichts (PDF)** — optimiert für PC, Laptop und Tablet.

Im Unterschied zum schnellen Arztbericht in [ME.CFS.graph](https://github.com/junk495/ME.CFS.graph) lassen sich hier Abschnitte, Zeitraum und Diagramme frei zusammenstellen und **mehrere Messwerte in einem Diagramm übereinanderlegen**.

## 📚 Dokumentation

Die vollständige Dokumentation liegt im **[Projekt-Wiki](https://github.com/junk495/ME.CFS/wiki)** (für Tracker, Graph und Report): Bedienungsanleitung, FAQ, fachliche Grundlagen, Datenmodell und Entwickler-Handbuch.

## 📄 Weitere Dateien in diesem Repository

- **[CHANGELOG.md](./CHANGELOG.md)** — Versionshistorie.
- **[LICENSE.md](./LICENSE.md)** — Lizenz (CC BY-NC-SA 4.0) und medizinischer Haftungsausschluss.

## 🚧 Roadmap / Geplante Funktionen

- Eigenständiger HTML-Export (eine portierbare Datei, nicht nur PDF).
- Frei wählbarer Zeitraum (Von/Bis) zusätzlich zu den Presets.
- Speichern der Konfiguration (localStorage).

### Idee: PWA (optional)

**Idee:** Das Tool zusätzlich als PWA (`manifest.json` + `sw.js`) auszuliefern, damit es installierbar und offline-fähig wird — bewusst als optionale Erweiterung, nicht als Standard.

**Warum optional?**
- Am PC/Laptop bringt „installierbar" wenig; die Seite läuft auch im Browser.
- Auf iOS/iPadOS haben installierte PWAs einen getrennten `localStorage` — das kann die automatische Datenübernahme aus dem Tracker aushebeln.
- Offline betrifft nur die App-Shell, nicht die (ohnehin lokalen) Daten.

**Offene Punkte:**
- PNG-Icons (192/512) wären zu erzeugen.
- Ob der Zusatzaufwand (Cache-/Update-Flow) den Nutzen rechtfertigt.

## Technische Basis

Statische Single Page Application (SPA) auf GitHub Pages: HTML5, reines CSS, Vanilla JavaScript (ES6+). Diagramme mit nativem Canvas, keine Frameworks, keine externen Abhängigkeiten, 100 % lokal, bewusst ohne PWA.
