# AGENTS.md — Hinweise für KI-Agenten (ME.CFS.report)

## Was ist das?

Statisches, rein lokales HTML-Tool (PC/Laptop/Tablet) zur **interaktiven Auswertung** der ME/CFS-Tracker-Daten (CSV/JSON) und zum Erstellen eines **konfigurierbaren Arztberichts (PDF)**. Ergänzt den schnellen Arztbericht in ME.CFS.graph, ersetzt ihn aber nicht.

## Ausführen / Testen

- Keine Build-Tools, kein npm, kein Test-Runner. Einfach `index.html` im Browser öffnen oder über einen lokalen Webserver (z. B. VS Code „Live Server") laden.
- Daten laden: „Beispiel" (Demo-Daten), „CSV/JSON" (Datei-Auswahl) oder „Tracker" (localStorage, gleicher Browser/Origin).
- Es gibt **kein** `manifest.json`/`sw.js` (bewusst keine PWA).

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Einzige Seite: Kopfleiste (Import/Aktionen) + linke Sidebar (Konfiguration) + rechte Vorschau |
| `style.css` | Reines CSS: Desktop/Tablet-Layout, Dark-Theme; Bericht/Vorschau hell für den Druck |
| `app.js` | Komplette Logik (Vanilla JS, IIFE) |
| `core.js` | Reine Hilfsfunktionen (Parsing, Statistik) — ohne DOM-Abhängigkeit |
| `README.md` / `CHANGELOG.md` / `LICENSE.md` | Einstieg, Versionshistorie, Lizenz + Haftungsausschluss |

## Wichtige Konventionen

- Vanilla JS (ES6+), kein Framework, kein jQuery, keine externen Bibliotheken, kein CDN.
- **100 % lokal:** niemals Nutzerdaten an externe Server/APIs senden.
- **Daten-Vertrag:** `FIELD_DEFS` in `app.js` muss mit dem Tracker (`EXPORT_COLUMNS`) und der Graph-App (`FIELD_DEFS`) übereinstimmen — Referenz im Wiki `Datenmodell`.
- **null-Konvention:** leere Felder = `null` (nie `0`), Dezimalkomma (`7,5`) → `7.5`.
- **Skalen-Richtung:** 0–4 = höher schlechter; Zustand (0–10) und Bell (0–100) = höher besser.
- **Diagramme:** nativ mit Canvas zeichnen. Überlagerung (Multi-Series): gleiche Skala = Rohwerte, gemischt = normalisiert auf 0–100 %.
- **PDF:** nur über `window.print()` + `@media print`, kein HTML-Download, keine PDF-Bibliothek.
- **Versionierung:** `<meta name="app-version">` in `index.html` + oberster Eintrag in `CHANGELOG.md` (kein `sw.js`).

## Checks

- Optional: `scripts/check.ps1` (PowerShell) prüft den Daten-Vertrag Tracker ↔ Graph ↔ Report und die Versions-Konsistenz.
