/* =========================================================
   ME.CFS.report - app.js
   Vanilla JS (ES6+), keine Frameworks, rein lokale Verarbeitung.
   ========================================================= */
(function () {
  'use strict';

  // Reine Hilfsfunktionen (ausgelagert nach core.js)
  var norm = MECFS_core.norm;
  var parseNumber = MECFS_core.parseNumber;
  var median = MECFS_core.median;
  var mean = MECFS_core.mean;
  var parseDate = MECFS_core.parseDate;
  var parseCSVLine = MECFS_core.parseCSVLine;

  // ---------------------------------------------------------------------------
  // Konstanten & Feld-Definitionen
  // ---------------------------------------------------------------------------

  // [key, CSV-Header, Label, Typ, Skalen-Richtung]
  // Richtung: 'worse' = höher ist schlechter, 'better' = höher ist besser,
  //           'neutral' = keine Bewertungs-Richtung.
  var FIELD_DEFS = [
    ['datum', 'Datum', 'Datum', 'date', 'neutral'],
    ['erfassungs_typ', 'Erfassungs-Typ', 'Erfassungs-Typ', 'text', 'neutral'],
    ['zustand_0_10', 'Zustand (0-10)', 'Zustand', '0_10', 'better'],
    ['bell_0_100', 'Bell (0-100)', 'Bell', '0_100', 'better'],
    ['fatigue_0_4', 'Fatigue (0-4)', 'Fatigue', '0_4', 'worse'],
    ['pem_heute_0_4', 'PEM heute (0-4)', 'PEM heute', '0_4', 'worse'],
    ['liegezeit_h', 'Liegezeit (h)', 'Liegezeit', 'hours', 'worse'],
    ['hilfebedarf_min', 'Hilfebedarf (min)', 'Hilfebedarf', 'minutes', 'worse'],
    ['schlafqualitaet_0_4', 'Schlafqualitaet (0-4)', 'Schlafqualität', '0_4', 'worse'],
    ['belastung_koerperlich_0_4', 'Koerperliche Belastung (0-4)', 'Belastung körperlich', '0_4', 'worse'],
    ['belastung_kognitiv_0_4', 'Kognitive Belastung (0-4)', 'Belastung kognitiv', '0_4', 'worse'],
    ['belastung_reiz_0_4', 'Reizbelastung (0-4)', 'Reizbelastung', '0_4', 'worse'],
    ['pacing_0_4', 'Pacing (0-4)', 'Pacing', '0_4', 'worse'],
    ['arbeitsfaehigkeit_0_4', 'Arbeitsfaehigkeit (0-4)', 'Arbeitsfähigkeit', '0_4', 'worse'],
    ['teilhabe_0_4', 'Teilhabe (0-4)', 'Teilhabe', '0_4', 'worse'],
    ['schlafdauer_h', 'Schlafdauer (h)', 'Schlafdauer', 'hours', 'neutral'],
    ['schritte', 'Schritte', 'Schritte', 'steps', 'neutral'],
    ['puls_ruhe', 'Ruhepuls (bpm)', 'Ruhepuls', 'bpm', 'worse'],
    ['puls_avg', 'Puls Mittel (bpm)', 'Puls Durchschnitt', 'bpm', 'neutral'],
    ['puls_max', 'Puls Maximum (bpm)', 'Puls Maximum', 'bpm', 'worse'],
    ['hrv', 'HRV (ms)', 'HRV', 'ms', 'better'],
    ['spo2', 'SpO2 (%)', 'SpO2', 'percent', 'better'],
    ['atemfrequenz', 'Atemfrequenz (1/min)', 'Atemfrequenz', 'rate', 'neutral'],
    ['temperatur', 'Temperatur (°C)', 'Körpertemperatur', 'celsius', 'neutral'],
    ['blutdruck_sys', 'Blutdruck systolisch (mmHg)', 'Blutdruck systolisch', 'mmhg', 'neutral'],
    ['blutdruck_dia', 'Blutdruck diastolisch (mmHg)', 'Blutdruck diastolisch', 'mmhg', 'neutral'],
    ['gewicht', 'Gewicht (kg)', 'Gewicht', 'kg', 'neutral'],
    ['kontext', 'Kontext', 'Kontext', 'text', 'neutral'],
    ['notiz', 'Notiz', 'Notiz', 'text', 'neutral'],
    ['pem_belastungsdatum', 'Belastungsdatum', 'Belastungsdatum', 'date', 'neutral'],
    ['pem_ausloeser', 'Ausloeser', 'Auslöser', 'text', 'neutral'],
    ['pem_verzoegerung_h', 'Verzoegerung (h)', 'Verzögerung', 'hours', 'neutral'],
    ['pem_dauer_h', 'PEM Dauer (h)', 'PEM Dauer', 'hours', 'neutral'],
    ['pem_gesamt_0_4', 'PEM Gesamtschwere (0-4)', 'PEM Gesamtschwere', '0_4', 'worse'],
    ['pem_erholung_0_4', 'PEM Erholungsdauer (0-4)', 'PEM Erholungsdauer', '0_4', 'worse'],
    ['pem_fatigue_0_4', 'PEM Zunahme Fatigue (0-4)', 'PEM Zunahme Fatigue', '0_4', 'worse'],
    ['pem_kognition_0_4', 'PEM Zunahme Kognition (0-4)', 'PEM Zunahme Kognition', '0_4', 'worse'],
    ['pem_schmerz_0_4', 'PEM Zunahme Schmerzen (0-4)', 'PEM Zunahme Schmerzen', '0_4', 'worse'],
    ['pem_grippe_0_4', 'PEM Zunahme Krankheitsgefuehl (0-4)', 'PEM Zunahme Krankheitsgefühl', '0_4', 'worse'],
    ['pem_symptome', 'PEM Symptome', 'PEM Symptome', 'text', 'neutral'],
    ['schmerz_muskel', 'Schmerz Muskel (0-4)', 'Schmerz Muskel', '0_4', 'worse'],
    ['schmerz_gelenk', 'Schmerz Gelenk (0-4)', 'Schmerz Gelenk', '0_4', 'worse'],
    ['schmerz_kopf', 'Schmerz Kopf (0-4)', 'Schmerz Kopf', '0_4', 'worse'],
    ['schmerz_neuro', 'Schmerz Neuropathisch (0-4)', 'Schmerz neuropathisch', '0_4', 'worse'],
    ['schmerz_beruehrung', 'Schmerz Beruehrung (0-4)', 'Schmerz Berührung', '0_4', 'worse'],
    ['kognition_konzentration', 'Kognition Konzentration (0-4)', 'Konzentration', '0_4', 'worse'],
    ['kognition_gedaechtnis', 'Kognition Gedaechtnis (0-4)', 'Gedächtnis', '0_4', 'worse'],
    ['kognition_sprache', 'Kognition Sprache (0-4)', 'Wortfindung', '0_4', 'worse'],
    ['kognition_koordination', 'Kognition Koordination (0-4)', 'Koordination', '0_4', 'worse'],
    ['reiz_licht', 'Reiz Licht (0-4)', 'Lichtempfindlichkeit', '0_4', 'worse'],
    ['reiz_geraeusch', 'Reiz Geraeusch (0-4)', 'Geräuschempfindlichkeit', '0_4', 'worse'],
    ['autonom_schwindel', 'Autonom Schwindel (0-4)', 'Schwindel', '0_4', 'worse'],
    ['autonom_herzrasen', 'Autonom Herzrasen (0-4)', 'Herzrasen', '0_4', 'worse'],
    ['autonom_atem', 'Autonom Atem (0-4)', 'Atemprobleme', '0_4', 'worse'],
    ['autonom_verdauung', 'Autonom Verdauung (0-4)', 'Verdauung', '0_4', 'worse'],
    ['autonom_blase', 'Autonom Blase (0-4)', 'Blase', '0_4', 'worse'],
    ['autonom_temperatur', 'Autonom Temperatur (0-4)', 'Temperaturregulation', '0_4', 'worse'],
    ['immun_grippegefuehl', 'Immun Grippegefuehl (0-4)', 'Grippegefühl', '0_4', 'worse'],
    ['immun_hals', 'Immun Hals (0-4)', 'Hals', '0_4', 'worse'],
    ['mcas_flush', 'MCAS Flush (0-4)', 'Flush', '0_4', 'worse'],
    ['schlaf_durchschlaf', 'Schlaf Durchschlafen (0-4)', 'Durchschlafen', '0_4', 'worse'],
    ['schlaf_rhythmus', 'Schlaf Rhythmus (0-4)', 'Schlafrhythmus', '0_4', 'worse'],
    ['schlaf_hypersomnie', 'Schlaf Hypersomnie (0-4)', 'Hypersomnie', '0_4', 'worse'],
    ['kognition_verlangsamt', 'Kognition Verlangsamt (0-4)', 'Verlangsamt', '0_4', 'worse'],
    ['kognition_multitasking', 'Kognition Multitasking (0-4)', 'Multitasking', '0_4', 'worse'],
    ['kognition_desorientierung', 'Kognition Desorientierung (0-4)', 'Desorientierung', '0_4', 'worse'],
    ['reiz_geruch', 'Reiz Geruch (0-4)', 'Geruch', '0_4', 'worse'],
    ['autonom_praesynkope', 'Autonom Praesynkope (0-4)', 'Präsynkope', '0_4', 'worse'],
    ['autonom_synkope', 'Autonom Synkope (0-4)', 'Synkope', '0_4', 'worse'],
    ['autonom_stehintoleranz', 'Autonom Stehintoleranz (0-4)', 'Stehintoleranz', '0_4', 'worse'],
    ['neuroendokrin_hitze', 'Neuroendokrin Hitze (0-4)', 'Hitzeintoleranz', '0_4', 'worse'],
    ['neuroendokrin_kaelte', 'Neuroendokrin Kaelte (0-4)', 'Kälteintoleranz', '0_4', 'worse'],
    ['neuroendokrin_appetit', 'Neuroendokrin Appetit (0-4)', 'Appetit', '0_4', 'worse'],
    ['neuroendokrin_stress', 'Neuroendokrin Stress (0-4)', 'Stressintoleranz', '0_4', 'worse'],
    ['immun_fieber', 'Immun Fieber (0-4)', 'Fiebergefühl', '0_4', 'worse'],
    ['immun_allergie', 'Immun Allergie (0-4)', 'Allergie', '0_4', 'worse'],
    ['mcas_uebelkeit', 'MCAS Uebelkeit (0-4)', 'Übelkeit', '0_4', 'worse'],
    ['mcas_bauchschmerz', 'MCAS Bauchschmerz (0-4)', 'Bauchschmerz', '0_4', 'worse'],
    ['mcas_durchfall', 'MCAS Durchfall (0-4)', 'Durchfall', '0_4', 'worse'],
    ['mcas_nahrung', 'MCAS Nahrung (0-4)', 'Nahrung', '0_4', 'worse'],
    ['mcas_medikament', 'MCAS Medikament (0-4)', 'Medikament', '0_4', 'worse'],
    ['funktion_koerperpflege', 'Funktion Koerperpflege (0-4)', 'Körperpflege', '0_4', 'worse'],
    ['funktion_anziehen', 'Funktion Anziehen (0-4)', 'Anziehen', '0_4', 'worse'],
    ['funktion_essen', 'Funktion Essen (0-4)', 'Essen', '0_4', 'worse'],
    ['funktion_gehen', 'Funktion Gehen (0-4)', 'Gehen', '0_4', 'worse'],
    ['funktion_aufrecht', 'Funktion Aufrecht (0-4)', 'Aufrecht', '0_4', 'worse'],
    ['funktion_haushalt', 'Funktion Haushalt (0-4)', 'Haushalt', '0_4', 'worse'],
    ['funktion_kommunikation', 'Funktion Kommunikation (0-4)', 'Kommunikation', '0_4', 'worse'],
    ['funktion_ausser_haus', 'Funktion Ausser Haus (0-4)', 'Außer Haus', '0_4', 'worse'],
    ['funktion_sonne', 'Funktion Sonne (0-4)', 'Sonne', '0_4', 'worse']
  ];

  var FIELDS_BY_KEY = {};
  var HEADER_MAP = {};
  FIELD_DEFS.forEach(function (f) {
    var key = f[0], header = f[1], label = f[2], type = f[3], dir = f[4];
    FIELDS_BY_KEY[key] = { key: key, header: header, label: label, type: type, dir: dir };
    HEADER_MAP[norm(header)] = key;
  });

  // Symptom-Bereiche (Domänen) für Heatmap und Zusammenfassungen
  var DOMAINS = [
    { key: 'schmerz', label: 'Schmerz', members: ['schmerz_muskel', 'schmerz_gelenk', 'schmerz_kopf', 'schmerz_neuro', 'schmerz_beruehrung'] },
    { key: 'kognition', label: 'Kognition', members: ['kognition_konzentration', 'kognition_gedaechtnis', 'kognition_sprache', 'kognition_koordination', 'kognition_verlangsamt', 'kognition_multitasking', 'kognition_desorientierung'] },
    { key: 'reiz', label: 'Reize', members: ['reiz_licht', 'reiz_geraeusch', 'reiz_geruch'] },
    { key: 'autonom', label: 'Autonom/POTS', members: ['autonom_schwindel', 'autonom_herzrasen', 'autonom_atem', 'autonom_verdauung', 'autonom_blase', 'autonom_temperatur', 'autonom_praesynkope', 'autonom_synkope', 'autonom_stehintoleranz'] },
    { key: 'neuroendokrin', label: 'Neuroendokrin', members: ['neuroendokrin_hitze', 'neuroendokrin_kaelte', 'neuroendokrin_appetit', 'neuroendokrin_stress'] },
    { key: 'immun', label: 'Immun', members: ['immun_grippegefuehl', 'immun_hals', 'immun_fieber', 'immun_allergie'] },
    { key: 'mcas', label: 'MCAS', members: ['mcas_flush', 'mcas_uebelkeit', 'mcas_bauchschmerz', 'mcas_durchfall', 'mcas_nahrung', 'mcas_medikament'] },
    { key: 'schlaf', label: 'Schlaf (spez.)', members: ['schlaf_durchschlaf', 'schlaf_rhythmus', 'schlaf_hypersomnie'] },
    { key: 'funktion', label: 'Funktion', members: ['funktion_koerperpflege', 'funktion_anziehen', 'funktion_essen', 'funktion_gehen', 'funktion_aufrecht', 'funktion_haushalt', 'funktion_kommunikation', 'funktion_ausser_haus', 'funktion_sonne'] }
  ];

  var DOMAINS_BY_KEY = {};
  DOMAINS.forEach(function (d) { DOMAINS_BY_KEY[d.key] = d; });

  // ---------------------------------------------------------------------------
  // Zustand
  // ---------------------------------------------------------------------------

  var records = [];
  var PREVIEW_COLUMNS = ['zustand_0_10', 'bell_0_100', 'fatigue_0_4', 'pem_heute_0_4', 'belastung_koerperlich_0_4', 'belastung_kognitiv_0_4', 'belastung_reiz_0_4'];

  // ---------------------------------------------------------------------------
  // Formatierungs-Helfer
  // ---------------------------------------------------------------------------

  function fmtFull(ts) {
    return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function fmtNumber(v) {
    if (Math.abs(v) >= 1000) return String(Math.round(v));
    return String(Math.round(v * 10) / 10);
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // ---------------------------------------------------------------------------
  // CSV/JSON-Parser
  // ---------------------------------------------------------------------------

  function recordsFromCSV(text) {
    text = text.replace(/\uFEFF/g, '');
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim() !== ''; });
    if (lines.length < 2) return [];

    var headers = parseCSVLine(lines[0]).map(norm);
    var keyByIndex = headers.map(function (h) { return HEADER_MAP[h] || null; });

    var out = [];
    for (var r = 1; r < lines.length; r++) {
      var cells = parseCSVLine(lines[r]);
      var rec = {};
      for (var c = 0; c < cells.length; c++) {
        var key = keyByIndex[c];
        if (!key) continue;
        var def = FIELDS_BY_KEY[key];
        var val = cells[c];
        if (def.type === 'date' || def.type === 'text') {
          rec[key] = (val === '') ? null : val;
        } else {
          rec[key] = parseNumber(val);
        }
      }
      out.push(rec);
    }
    return out;
  }

  function recordsFromJSON(text) {
    var data = JSON.parse(text);
    var arr = Array.isArray(data) ? data : (Array.isArray(data.records) ? data.records : (Array.isArray(data.data) ? data.data : null));
    if (!arr) return [];

    return arr.map(function (item) {
      var rec = {};
      Object.keys(FIELDS_BY_KEY).forEach(function (key) {
        var def = FIELDS_BY_KEY[key];
        if (key in item) {
          var val = item[key];
          if (def.type === 'date' || def.type === 'text') {
            rec[key] = (val === null || val === undefined || val === '') ? null : val;
          } else {
            rec[key] = parseNumber(val);
          }
        }
      });
      return rec;
    });
  }

  function normalizeRecords(list) {
    return list
      .map(function (rec) {
        rec.dateTs = parseDate(rec.datum);
        return rec;
      })
      .filter(function (rec) { return rec.dateTs !== null; })
      .sort(function (a, b) { return a.dateTs - b.dateTs; });
  }

  // ---------------------------------------------------------------------------
  // Import & Vorschau
  // ---------------------------------------------------------------------------

  function loadRecords(list) {
    records = normalizeRecords(list);
    updateStatus();
    renderPreview();
  }

  function updateStatus() {
    var el = document.getElementById('import-status');
    var printBtn = document.getElementById('btn-print');
    if (!records.length) {
      el.textContent = 'Noch keine Daten geladen.';
      if (printBtn) printBtn.disabled = true;
      return;
    }
    var first = fmtFull(records[0].dateTs);
    var last = fmtFull(records[records.length - 1].dateTs);
    el.textContent = records.length + ' Tage geladen (' + first + ' bis ' + last + ').';
    if (printBtn) printBtn.disabled = false;
  }

  function renderPreview() {
    var empty = document.getElementById('preview-empty');
    var content = document.getElementById('preview-content');
    if (!records.length) {
      empty.hidden = false;
      content.hidden = true;
      return;
    }
    empty.hidden = true;
    content.hidden = false;

    var first = records[0].dateTs;
    var last = records[records.length - 1].dateTs;

    var heads = ['<th>Datum</th>'].concat(PREVIEW_COLUMNS.map(function (k) {
      return '<th class="num">' + FIELDS_BY_KEY[k].label + '</th>';
    })).join('');

    var rows = records.map(function (r) {
      var cells = ['<td>' + fmtFull(r.dateTs) + '</td>'];
      PREVIEW_COLUMNS.forEach(function (key) {
        var v = r[key];
        cells.push('<td class="num">' + (typeof v === 'number' ? fmtNumber(v) : '–') + '</td>');
      });
      return '<tr>' + cells.join('') + '</tr>';
    }).join('');

    content.innerHTML =
      '<h2>Übersicht</h2>' +
      '<p>Zeitraum: ' + fmtFull(first) + ' – ' + fmtFull(last) + ' · ' + records.length + ' Einträge.</p>' +
      '<table class="report-table"><thead><tr>' + heads + '</tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p style="color:#4a515c; font-size:0.85rem; margin-top:16px;">Die konfigurierbaren Diagramme und Berichts-Abschnitte folgen in den nächsten Schritten.</p>';
  }

  function handleFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var text = String(reader.result);
        var list;
        var ext = (file.name || '').toLowerCase();
        var trimmed = text.trim();
        if (ext.endsWith('.json') || trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') {
          list = recordsFromJSON(text);
        } else {
          list = recordsFromCSV(text);
        }
        if (!list.length) {
          alert('Es konnten keine Datensätze gelesen werden.');
          return;
        }
        loadRecords(list);
      } catch (e) {
        alert('Import fehlgeschlagen: ' + e.message);
      }
    };
    reader.onerror = function () {
      alert('Datei konnte nicht gelesen werden.');
    };
    reader.readAsText(file);
  }

  // Lädt die Daten direkt aus dem localStorage des ME/CFS-Symptom-Trackers.
  function loadFromTracker() {
    var prefix = 'mecfs_tagescheck_';
    var list = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key || key.indexOf(prefix) !== 0) continue;
        try {
          var entry = JSON.parse(localStorage.getItem(key));
          if (entry && entry.datum) list.push(entry);
        } catch (e) {
          // beschädigte Einträge überspringen
        }
      }
    } catch (e) {
      // localStorage nicht verfügbar
    }
    if (!list.length) {
      alert('Keine Tracker-Daten in diesem Browser gefunden. Nutze „CSV/JSON" zum Import.');
      return;
    }
    loadRecords(list);
  }

  // ---------------------------------------------------------------------------
  // Demo-Daten
  // ---------------------------------------------------------------------------

  function buildDemo() {
    var list = [];
    var DAY = 86400000;
    var base = new Date(2026, 8, 10).getTime();
    for (var i = 13; i >= 0; i--) {
      var ts = base - i * DAY;
      var d = new Date(ts);
      var iso = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
      var w = Math.sin(i / 2.5);
      var crash = (i === 3 || i === 4) ? 1 : 0;
      var rec = {
        datum: iso,
        erfassungs_typ: 'standard',
        zustand_0_10: clamp(Math.round(5 + w * 2 - crash * 2), 0, 10),
        bell_0_100: clamp(Math.round(50 + w * 15 - crash * 15), 0, 100),
        fatigue_0_4: clamp(Math.round(2 + (1 - w) + crash), 0, 4),
        pem_heute_0_4: crash ? 3 : 0,
        liegezeit_h: Math.round(14 + w),
        schlafqualitaet_0_4: clamp(Math.round(2 + w + crash), 0, 4),
        belastung_koerperlich_0_4: clamp(Math.round(2 + (1 - w) + crash), 0, 4),
        belastung_kognitiv_0_4: clamp(Math.round(2 + (1 - w)), 0, 4),
        belastung_reiz_0_4: clamp(Math.round(1 + (1 - w)), 0, 4),
        schlafdauer_h: Math.round((7 + w * 0.5 - crash) * 10) / 10,
        schritte: Math.max(0, Math.round(1500 + w * 800 + 1000 - crash * 800)),
        notiz: crash ? 'Belastung durch Einkauf' : null
      };
      list.push(rec);
    }
    return list;
  }

  // ---------------------------------------------------------------------------
  // Initialisierung
  // ---------------------------------------------------------------------------

  function init() {
    document.getElementById('file-input').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
      e.target.value = '';
    });
    document.getElementById('demo-button').addEventListener('click', function () {
      loadRecords(buildDemo());
    });
    document.getElementById('tracker-button').addEventListener('click', loadFromTracker);
    document.getElementById('btn-print').addEventListener('click', function () {
      window.print();
    });
    updateStatus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();




