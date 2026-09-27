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
  var viewRecords = [];

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

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  function secOn(id) {
    var el = document.getElementById(id);
    return el ? el.checked : true;
  }

  function getVisibleRecords() {
    var rangeEl = document.getElementById('cfg-range');
    var active = rangeEl ? rangeEl.querySelector('.chip.is-active') : null;
    var r = active ? active.dataset.range : 'all';
    if (r === 'all') return records;
    var days = parseInt(r, 10);
    return records.slice(Math.max(0, records.length - days));
  }

  function applyLayout() {
    var pageGroup = document.getElementById('cfg-pagesize');
    var size = 'a4';
    if (pageGroup) {
      var pc = pageGroup.querySelector('.chip.is-active');
      size = pc ? (pc.dataset.size || 'a4') : 'a4';
    }

    var style = document.getElementById('page-size-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'page-size-style';
      document.head.appendChild(style);
    }
    style.textContent = '@page { size: ' + (size === 'letter' ? 'letter' : 'A4') + '; margin: 14mm; }';

    var fontGroup = document.getElementById('cfg-fontsize');
    var font = 'normal';
    if (fontGroup) {
      var fc = fontGroup.querySelector('.chip.is-active');
      font = fc ? (fc.dataset.font || 'normal') : 'normal';
    }
    var paper = document.querySelector('.report-paper');
    if (paper) paper.classList.toggle('font-large', font === 'large');
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

    viewRecords = getVisibleRecords();
    var first = viewRecords[0].dateTs;
    var last = viewRecords[viewRecords.length - 1].dateTs;
    var created = new Date();

    var title = val('cfg-title');
    var patient = val('cfg-patient');
    var birthdate = val('cfg-birthdate');
    var doctor = val('cfg-doctor');
    var note = val('cfg-note');

    var html = '';
    html += '<h1>' + escapeHtml(title || 'ME/CFS-Verlaufsbericht') + '</h1>';
    html += '<p class="report-meta">Zeitraum: ' + fmtFull(first) + ' – ' + fmtFull(last) + ' · ' + viewRecords.length + ' Einträge · Erstellt am ' + fmtFull(created.getTime()) + '</p>';

    var headInfo = [];
    if (patient) headInfo.push('<strong>Patient:in:</strong> ' + escapeHtml(patient));
    if (birthdate) headInfo.push('<strong>Geburtsdatum:</strong> ' + escapeHtml(birthdate));
    if (doctor) headInfo.push('<strong>Behandelnde:r Arzt:in:</strong> ' + escapeHtml(doctor));
    if (headInfo.length) html += '<div class="report-headinfo">' + headInfo.join(' &nbsp;·&nbsp; ') + '</div>';
    if (note) html += '<p class="report-note">' + escapeHtml(note) + '</p>';

    if (secOn('sec-risk')) {
      var risk = computeRisk();
      if (risk) {
        html += '<h2>Crash-Risiko-Orientierung</h2>';
        html += '<div class="risk-gauge risk-' + risk.level + '"><div class="risk-label">Einschätzung</div><div class="risk-level">' + risk.label + '</div><div class="risk-label">' + risk.points + ' Warnpunkte (max. 10)</div></div>';
        html += '<p class="risk-summary">' + risk.summary + '</p>';
        html += '<h3>Warum diese Einschätzung?</h3>' + riskFactorsHtml(risk.factors);
        html += '<h3>Kennzahlen (zuletzt vs. Baseline)</h3><div class="table-wrap">' + riskTableHtml() + '</div>';
      }
    }

    if (secOn('sec-verlauf') && state.verlauf.length) {
      html += '<h2>Verlauf</h2>';
      state.verlauf.forEach(function (key) {
        var src = reportChart(720, 300, function (ctx, W, H) {
          drawTrend(ctx, W, H, key, viewRecords, true, PALETTE);
        });
        html += '<figure class="report-figure"><figcaption>' + metricLabel(key) + '</figcaption><img src="' + src + '" alt="Verlauf: ' + metricLabel(key) + '"></figure>';
      });
    }

    if (secOn('sec-vergleich')) {
      state.vergleich.forEach(function (g) {
        if (!g.metrics.length) return;
        var h = overlayChartHeight(g.metrics);
        var src = reportChart(720, h, function (ctx, W, H) {
          drawOverlay(ctx, W, H, g.metrics, viewRecords, PALETTE);
        });
        html += '<h2>' + escapeHtml(g.title) + '</h2><figure class="report-figure"><img src="' + src + '" alt="Vergleich: ' + escapeHtml(g.title) + '"></figure>';
      });
    }

    if (secOn('sec-heatmap')) {
      var heatH = 10 + DOMAINS.length * 30 + 56;
      var heatSrc = reportChart(720, heatH, function (ctx, W, H) {
        drawHeatmap(ctx, W, H, viewRecords, PALETTE);
      });
      html += '<h2>Heatmap (Symptombereiche)</h2><figure class="report-figure"><img src="' + heatSrc + '" alt="Heatmap der Symptombereiche"></figure>';
    }

    if (secOn('sec-domaenen')) html += '<h2>Symptombereiche (Zusammenfassung)</h2>' + domainSummaryHtml();
    if (secOn('sec-pem')) html += '<h2>PEM-Episoden</h2>' + pemEpisodesHtml();
    if (secOn('sec-notizen')) html += notesHtml();

    html += '<div class="disclaimer"><strong>Hinweis:</strong> Dieser Bericht wurde automatisch aus deinen selbst erfassten Daten erstellt und dient als Übersicht für medizinisches Fachpersonal. Er ersetzt keine ärztliche Diagnose oder Behandlung und ist kein Medizinprodukt.</div>';

    content.innerHTML = html;
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
  function loadFromTracker(silent) {
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
      if (!silent) alert('Keine Tracker-Daten in diesem Browser gefunden. Nutze „CSV/JSON" zum Import.');
      return;
    }
    loadRecords(list);
  }

  // ---------------------------------------------------------------------------
  // Demo-Daten (vollständig, inkl. Symptombereiche für Heatmap & Zusammenfassung)
  // ---------------------------------------------------------------------------

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function buildDemo() {
    var rand = mulberry32(42);
    var list = [];
    var DAY = 86400000;
    var base = new Date(2026, 8, 10).getTime();
    for (var i = 27; i >= 0; i--) {
      var ts = base - i * DAY;
      var d = new Date(ts);
      var iso = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());

      var crash = (i >= 4 && i <= 8) ? 1 : 0;
      var postCrash = (i >= 0 && i <= 3) ? 1 : 0;

      function v(base, spread) {
        var x = base + (rand() - 0.5) * spread;
        if (crash) x += 1.2;
        if (postCrash) x += 0.8;
        return Math.max(0, Math.min(4, Math.round(x)));
      }

      var fatigue = v(1.6, 1.2);
      var pem = crash ? 2 + Math.round(rand()) : 0;
      var state = crash ? 3 : (postCrash ? 4 : 6);
      var bell = crash ? 20 : (postCrash ? 30 : 50);
      var loadK = crash ? 3 : Math.max(0, Math.min(4, Math.round(1 + rand() * 1.5)));
      var loadC = crash ? 3 : Math.max(0, Math.min(4, Math.round(1 + rand() * 1.5)));
      var loadR = crash ? 2 : Math.max(0, Math.min(4, Math.round(rand() * 1.5)));

      var rec = {
        datum: iso,
        erfassungs_typ: 'standard',
        zustand_0_10: state,
        bell_0_100: bell,
        fatigue_0_4: fatigue,
        pem_heute_0_4: pem,
        liegezeit_h: crash || postCrash ? 16 : 12 + Math.round(rand() * 4),
        hilfebedarf_min: crash ? 120 : 30 + Math.round(rand() * 60),
        schlafqualitaet_0_4: v(2, 1.5),
        belastung_koerperlich_0_4: loadK,
        belastung_kognitiv_0_4: loadC,
        belastung_reiz_0_4: loadR,
        pacing_0_4: crash ? 3 : 1,
        arbeitsfaehigkeit_0_4: crash ? 3 : 2,
        teilhabe_0_4: crash ? 3 : 2,
        schlafdauer_h: crash ? 5 : 7,
        schritte: crash ? 300 : 1500 + Math.round(rand() * 4000),
        puls_ruhe: crash ? 72 + Math.round(rand() * 2) : (postCrash ? 69 + Math.round(rand() * 2) : 58 + Math.round(rand() * 4)),
        puls_avg: crash ? 86 + Math.round(rand() * 6) : 73 + Math.round(rand() * 6),
        puls_max: crash ? 135 + Math.round(rand() * 10) : 113 + Math.round(rand() * 12),
        hrv: crash ? 30 + Math.round(rand() * 4) : (postCrash ? 38 + Math.round(rand() * 4) : 47 + Math.round(rand() * 6)),
        spo2: 97 + Math.round(rand() * 2),
        atemfrequenz: 12 + Math.round(rand() * 4),
        temperatur: 36.5 + Math.round(rand() * 4) / 10,
        blutdruck_sys: 118 + Math.round(rand() * 8),
        blutdruck_dia: 77 + Math.round(rand() * 6),
        gewicht: 72 + Math.round(rand() * 20) / 10,

        pem_belastungsdatum: crash ? iso : null,
        pem_ausloeser: crash ? '[13:45] Überanstrengung' : null,
        pem_gesamt_0_4: crash ? 3 : null,
        pem_dauer_h: crash ? 24 + Math.round(rand() * 48) : null,
        notiz: crash ? 'Belastung durch Einkauf, danach 2 Tage Bettruhe' : null,
        kontext: postCrash ? 'Erholung, viel Ruhe' : null,

        schmerz_muskel: v(crash ? 3 : 1.5, 1),
        schmerz_gelenk: v(1, 1),
        schmerz_kopf: v(1.2, 1),
        schmerz_neuro: v(1, 1),
        schmerz_beruehrung: v(1, 1),
        kognition_konzentration: v(2, 1.2),
        kognition_gedaechtnis: v(2, 1.2),
        kognition_sprache: v(1.5, 1),
        kognition_koordination: v(1.2, 1),
        reiz_licht: v(1.5, 1),
        reiz_geraeusch: v(1.8, 1),
        autonom_schwindel: v(1.5, 1),
        autonom_herzrasen: v(1.5, 1),
        autonom_atem: v(1, 1),
        autonom_verdauung: v(1.2, 1),
        autonom_blase: v(0.8, 1),
        autonom_temperatur: v(1, 1),
        immun_grippegefuehl: v(1.5, 1),
        immun_hals: v(0.8, 1),
        mcas_flush: v(0.8, 1),

        schlaf_durchschlaf: v(2, 1.2),
        schlaf_rhythmus: v(1.5, 1),
        schlaf_hypersomnie: v(1.2, 1),
        kognition_verlangsamt: v(2, 1.2),
        kognition_multitasking: v(2, 1.2),
        kognition_desorientierung: v(1, 1),
        reiz_geruch: v(0.8, 1),
        autonom_praesynkope: v(1, 1),
        autonom_synkope: 0,
        autonom_stehintoleranz: v(1.2, 1),
        neuroendokrin_hitze: v(1, 1),
        neuroendokrin_kaelte: v(1, 1),
        neuroendokrin_appetit: v(1, 1),
        neuroendokrin_stress: v(1.5, 1),
        immun_fieber: v(0.5, 1),
        immun_allergie: v(0.5, 1),
        mcas_uebelkeit: v(0.8, 1),
        mcas_bauchschmerz: v(0.8, 1),
        mcas_durchfall: v(0.5, 1),
        mcas_nahrung: v(0.8, 1),
        mcas_medikament: v(0.5, 1),
        funktion_koerperpflege: v(1.5, 1),
        funktion_anziehen: v(1.5, 1),
        funktion_essen: v(1.5, 1),
        funktion_gehen: v(1.8, 1),
        funktion_aufrecht: v(2, 1),
        funktion_haushalt: v(2, 1),
        funktion_kommunikation: v(1.5, 1),
        funktion_ausser_haus: v(2.2, 1),
        funktion_sonne: v(1.5, 1)
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
    document.getElementById('tracker-button').addEventListener('click', function () {
      loadFromTracker();
    });
    document.getElementById('btn-print').addEventListener('click', function () {
      window.print();
    });

    // Vorhandene Tracker-Daten beim Öffnen automatisch laden (gleicher Browser)
    loadFromTracker(true);

    renderDiagramConfig();

    // Konfiguration: Delegation für alle Änderungen
    document.addEventListener('input', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.classList && t.classList.contains('picker-search')) { filterPicker(t); return; }
      var id = t.id;
      if (id && id.indexOf('cfg-') === 0) renderPreview();
    });
    document.addEventListener('change', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.classList) {
        if (t.classList.contains('verlauf-check')) { toggleVerlauf(t.dataset.metric, t.checked); return; }
        if (t.classList.contains('vergleich-check')) { toggleVergleichMetric(t.dataset.group, t.dataset.metric, t.checked); return; }
      }
      var id = t.id;
      if (id && (id.indexOf('sec-') === 0 || id.indexOf('cfg-') === 0)) renderPreview();
    });
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('#btn-add-vergleich')) { addVergleichGroup(); return; }
      var rm = t.closest('.btn-remove');
      if (rm) { removeVergleichGroup(rm.dataset.group); return; }
      var chip = t.closest('.chip');
      if (chip && chip.parentElement && chip.parentElement.classList.contains('chip-row')) {
        var group = chip.parentElement;
        group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        applyLayout();
        if (group.id === 'cfg-range') renderPreview();
      }
    });

    applyLayout();
    updateStatus();
  }

  // ---------------------------------------------------------------------------
  // Schritt 2: Auswertung & Diagramme
  // ---------------------------------------------------------------------------

  var REPORT_METRICS = ['zustand_0_10', 'bell_0_100', 'fatigue_0_4', 'pem_heute_0_4', 'belastung_koerperlich_0_4', 'belastung_kognitiv_0_4', 'belastung_reiz_0_4'];
  var WORSENING_METRICS = ['fatigue_0_4', 'pem_heute_0_4', 'belastung_koerperlich_0_4', 'belastung_kognitiv_0_4', 'belastung_reiz_0_4', 'schlafqualitaet_0_4'];
  var LOAD_METRICS = ['belastung_koerperlich_0_4', 'belastung_kognitiv_0_4', 'belastung_reiz_0_4'];
  var RECENT_WINDOW = 3;
  var BASELINE_WINDOW = 14;

  // Helle Farbpalette für die Diagramme im Bericht (weißes Papier)
  var PALETTE = {
    grid: 'rgba(0,0,0,0.12)',
    axis: 'rgba(0,0,0,0.35)',
    text: '#3a3f46',
    baseline: '#8a6d1f',
    crash: '#b5522a',
    line: '#1f6f9f',
    emptyCell: '#e8e8e8',
    heatScale: [
      [0, 208, 216, 222],
      [1, 150, 182, 166],
      [2, 214, 192, 122],
      [3, 214, 150, 118],
      [4, 200, 108, 96]
    ]
  };

  function colorForScale(v, palette) {
    var stops = palette.heatScale;
    var t = Math.max(0, Math.min(4, v));
    var lo = Math.floor(t);
    var hi = Math.ceil(t);
    var f = t - lo;
    var a = stops[lo], b = stops[hi];
    var r = Math.round(a[0] + (b[0] - a[0]) * f);
    var g = Math.round(a[1] + (b[1] - a[1]) * f);
    var bl = Math.round(a[2] + (b[2] - a[2]) * f);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  function reportChart(width, height, drawFn) {
    var scale = 2;
    var canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    var ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    drawFn(ctx, width, height);
    return canvas.toDataURL('image/png');
  }
  function fmtShort(ts) {
    return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }

  function metricLabel(metric) {
    if (metric.indexOf('domain:') === 0) {
      var d = DOMAINS_BY_KEY[metric.slice(7)];
      return d ? d.label : metric;
    }
    var f = FIELDS_BY_KEY[metric];
    return f ? f.label : metric;
  }

  function getMetricValue(record, metric) {
    if (metric.indexOf('domain:') === 0) {
      var d = DOMAINS_BY_KEY[metric.slice(7)];
      return d ? domainMean(record, d) : null;
    }
    return record[metric];
  }

  function domainMean(record, domain) {
    var vals = [];
    domain.members.forEach(function (k) {
      var v = record[k];
      if (typeof v === 'number') vals.push(v);
    });
    return vals.length ? mean(vals) : null;
  }

  function isAcuteCrash(rec) {
    var s = rec.pem_ausloeser;
    return typeof s === 'string' && s.charAt(0) === '[';
  }

  function yRangeFor(metric, values) {
    var type = metric.indexOf('domain:') === 0 ? '0_4' : FIELDS_BY_KEY[metric].type;
    var nums = values.filter(function (v) { return typeof v === 'number'; });
    var dataMax = nums.length ? Math.max.apply(null, nums) : 1;
    var dataMin = nums.length ? Math.min.apply(null, nums) : 0;
    var min, max;
    if (type === '0_4' || type === '0_10' || type === '0_100') {
      var fixed = type === '0_4' ? 4 : (type === '0_10' ? 10 : 100);
      min = Math.min(0, dataMin);
      max = Math.max(fixed, dataMax);
    } else if (type === 'percent') {
      min = Math.min(85, dataMin);
      max = Math.max(100, dataMax);
    } else if (type === 'celsius') {
      min = Math.min(34, dataMin - 1);
      max = dataMax + 1;
    } else if (type === 'kg') {
      min = Math.max(0, dataMin - 2);
      max = dataMax + 2;
    } else if (type === 'mmhg') {
      min = Math.max(0, dataMin - 10);
      max = dataMax + 10;
    } else {
      min = 0;
      max = dataMax * 1.15;
    }
    if (max <= min) max = min + 1;
    return { min: min, max: max };
  }

  function makeTicks(min, max) {
    var span = max - min;
    var step;
    if (span <= 4) step = 1;
    else if (span <= 10) step = 2;
    else if (span <= 20) step = 5;
    else if (span <= 100) step = 20;
    else step = Math.ceil(span / 5);
    var ticks = [];
    var start = Math.ceil(min / step) * step;
    for (var v = start; v <= max + 1e-9; v += step) ticks.push(v);
    return ticks;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function hasValue(v) {
    return v !== null && v !== undefined && String(v).trim() !== '';
  }
  function drawTrend(ctx, W, H, metric, viewRecords, showBaseline, palette) {
    var padL = 42, padR = 12, padT = 16, padB = 40;

    var allValues = viewRecords.map(function (r) { return getMetricValue(r, metric); });
    var values = viewRecords.map(function (r) { return getMetricValue(r, metric); });
    var range = yRangeFor(metric, values);

    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var ticks = makeTicks(range.min, range.max);

    function xForDate(ts) {
      var first = viewRecords[0].dateTs;
      var last = viewRecords[viewRecords.length - 1].dateTs;
      var span = last - first || 86400000;
      return padL + ((ts - first) / span) * plotW;
    }

    function yFor(v) {
      var span = range.max - range.min || 1;
      return padT + (1 - (v - range.min) / span) * plotH;
    }

    ctx.clearRect(0, 0, W, H);

    // Raster + Y-Achse
    ctx.strokeStyle = palette.grid;
    ctx.fillStyle = palette.text;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.lineWidth = 1;

    ticks.forEach(function (t) {
      if (t < range.min || t > range.max) return;
      var y = yFor(t);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillText(fmtNumber(t), padL - 6, y + 4);
    });

    // X-Achsen-Beschriftung (Datumsangaben)
    var labelCount = Math.max(2, Math.min(6, Math.floor(plotW / 80)));
    var step = Math.max(1, Math.ceil(viewRecords.length / labelCount));
    ctx.textAlign = 'center';
    for (var i = 0; i < viewRecords.length; i += step) {
      var x = xForDate(viewRecords[i].dateTs);
      ctx.fillText(fmtShort(viewRecords[i].dateTs), x, H - padB + 16);
    }
    var lastX = xForDate(viewRecords[viewRecords.length - 1].dateTs);
    ctx.fillText(fmtShort(viewRecords[viewRecords.length - 1].dateTs), lastX, H - padB + 16);

    // Baseline (Median über alle vorhandenen Werte)
    if (showBaseline) {
      var baseVals = allValues.filter(function (v) { return typeof v === 'number'; });
      var med = median(baseVals);
      if (med !== null && baseVals.length >= 2) {
        var by = yFor(med);
        ctx.strokeStyle = palette.baseline;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(padL, by);
        ctx.lineTo(W - padR, by);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = palette.baseline;
        ctx.textAlign = 'left';
        ctx.fillText('Baseline ' + fmtNumber(med), padL + 4, by - 4);
      }
    }

    // Achsenlinien
    ctx.strokeStyle = palette.axis;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(W - padR, padT + plotH);
    ctx.stroke();

    // Akute Crash-Marker
    for (var ci = 0; ci < viewRecords.length; ci++) {
      if (!isAcuteCrash(viewRecords[ci])) continue;
      var cx = xForDate(viewRecords[ci].dateTs);
      ctx.fillStyle = palette.crash;
      ctx.beginPath();
      ctx.moveTo(cx, padT + plotH);
      ctx.lineTo(cx - 3, padT + plotH + 7);
      ctx.lineTo(cx + 3, padT + plotH + 7);
      ctx.closePath();
      ctx.fill();
    }

    // Daten-Linie mit Lücken
    var lineColor = palette.line;
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    var started = false;
    ctx.beginPath();
    for (var j = 0; j < viewRecords.length; j++) {
      var val = values[j];
      if (typeof val !== 'number') { started = false; continue; }
      var px = xForDate(viewRecords[j].dateTs);
      var py = yFor(val);
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Punkte
    ctx.fillStyle = lineColor;
    for (var k = 0; k < viewRecords.length; k++) {
      if (typeof values[k] !== 'number') continue;
      ctx.beginPath();
      ctx.arc(xForDate(viewRecords[k].dateTs), yFor(values[k]), 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function drawHeatmap(ctx, W, H, viewRecords, palette) {
    var rowH = 30;
    var leftW = 96;
    var padT = 10;
    var padB = 56;
    var plotW = W - leftW - 8;

    function xForDate(ts) {
      var first = viewRecords[0].dateTs;
      var last = viewRecords[viewRecords.length - 1].dateTs;
      var span = last - first || 86400000;
      return leftW + ((ts - first) / span) * plotW;
    }

    ctx.clearRect(0, 0, W, H);

    var cellW = plotW / viewRecords.length;
    DOMAINS.forEach(function (domain, r) {
      var y = padT + r * rowH;
      ctx.fillStyle = palette.text;
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(domain.label, leftW - 6, y + rowH / 2 + 4);

      for (var c = 0; c < viewRecords.length; c++) {
        var val = domainMean(viewRecords[c], domain);
        var x = xForDate(viewRecords[c].dateTs);
        var cellW2 = Math.max(cellW - 1, 3);
        if (val === null) {
          ctx.fillStyle = palette.emptyCell;
        } else {
          ctx.fillStyle = colorForScale(val, palette);
        }
        ctx.fillRect(x, y + 2, cellW2, rowH - 4);
      }
    });

    var dateY = padT + DOMAINS.length * rowH + 16;
    ctx.fillStyle = palette.text;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    var labelStep = Math.max(1, Math.ceil(viewRecords.length / 8));
    for (var i = 0; i < viewRecords.length; i += labelStep) {
      ctx.fillText(fmtShort(viewRecords[i].dateTs), xForDate(viewRecords[i].dateTs) + cellW / 2, dateY);
    }

    var legendY = dateY + 22;
    ctx.textAlign = 'left';
    ctx.fillText('0 (niedrig)', leftW, legendY);
    for (var g = 0; g <= 4; g++) {
      ctx.fillStyle = colorForScale(g, palette);
      ctx.fillRect(leftW + 64 + g * 22, legendY - 11, 18, 12);
    }
    ctx.fillStyle = palette.text;
    ctx.fillText('4 (hoch)', leftW + 64 + 5 * 22 + 6, legendY);
  }
  function metricStats(key) {
    var vals = viewRecords.map(function (r) { return typeof r[key] === 'number' ? r[key] : null; });
    var numeric = [];
    for (var i = 0; i < vals.length; i++) if (vals[i] !== null) numeric.push(vals[i]);
    var recent = numeric.slice(-RECENT_WINDOW);
    var base = numeric.slice(0, -RECENT_WINDOW).slice(-BASELINE_WINDOW);
    if (!base.length) base = numeric.slice();
    var rm = mean(recent);
    var bm = median(base);
    var dir = FIELDS_BY_KEY[key].dir;
    var delta = null;
    if (rm !== null && bm !== null) {
      delta = (dir === 'better') ? (bm - rm) : (rm - bm);
    }
    return { recentMean: rm, baseMedian: bm, delta: delta, recentN: recent.length, baseN: base.length };
  }

  function deltaText(v, upVerb, downVerb) {
    if (v === null || Math.abs(v) < 0.05) return 'unverändert';
    return v > 0 ? ('um ' + fmtNumber(v) + ' ' + upVerb) : ('um ' + fmtNumber(-v) + ' ' + downVerb);
  }

  function computeRisk() {
    if (viewRecords.length < 3) return null;

    var factors = [];
    var points = 0;

    // Faktor 1: Symptom-Anstieg
    var deltas = [];
    WORSENING_METRICS.forEach(function (key) {
      var s = metricStats(key);
      if (s.delta !== null) deltas.push(s.delta);
    });
    var avgDelta = deltas.length ? mean(deltas) : 0;
    var p1 = 0;
    if (avgDelta >= 1.0) p1 = 2;
    else if (avgDelta >= 0.5) p1 = 1;
    points += p1;
    factors.push({
      text: 'Die Symptome sind im Schnitt ' + deltaText(avgDelta, 'gestiegen', 'gesunken') + ' (0–4-Skala).',
      value: 'Symptom-Anstieg',
      points: p1
    });

    // Faktor 2: Zustand/Bell-Abfall
    var z = metricStats('zustand_0_10');
    var b = metricStats('bell_0_100');
    var p2 = 0;
    var zWorse = z.delta !== null ? z.delta : 0;
    var bWorse = b.delta !== null ? b.delta : 0;
    if (zWorse >= 2 || bWorse >= 15) p2 = 2;
    else if (zWorse >= 1 || bWorse >= 10) p2 = 1;
    points += p2;
    factors.push({
      text: 'Zustand ' + deltaText(zWorse, 'gefallen', 'gestiegen') + ' (von 10), Bell ' + deltaText(bWorse, 'gefallen', 'gestiegen') + ' (von 100).',
      value: 'Zustand/Bell-Abfall',
      points: p2
    });

    // Faktor 3: Hohe aktuelle Belastung
    var loadVals = [];
    LOAD_METRICS.forEach(function (key) {
      var s = metricStats(key);
      if (s.recentMean !== null) loadVals.push(s.recentMean);
    });
    var loadRecentMean = loadVals.length ? mean(loadVals) : 0;
    var p3 = 0;
    if (loadRecentMean >= 2.5) p3 = 2;
    else if (loadRecentMean >= 2.0) p3 = 1;
    points += p3;
    factors.push({
      text: 'Die Belastung liegt aktuell bei ' + fmtNumber(loadRecentMean) + ' von 4.',
      value: 'Hohe Belastung',
      points: p3
    });

    // Faktor 4: Aktive PEM
    var pemHeuteStats = metricStats('pem_heute_0_4');
    var pemHeute = pemHeuteStats.recentMean !== null ? pemHeuteStats.recentMean : 0;
    var p4 = 0;
    if (pemHeute >= 2) p4 = 2;
    else if (pemHeute >= 1) p4 = 1;
    points += p4;
    factors.push({
      text: 'PEM heute ' + fmtNumber(pemHeute) + ' (von 4).',
      value: 'Aktive PEM',
      points: p4
    });
    // Faktor 5: Schlaf
    var sq = metricStats('schlafqualitaet_0_4');
    var sd = metricStats('schlafdauer_h');
    var p5 = 0;
    if ((sq.recentMean !== null && sq.recentMean >= 3) || (sd.recentMean !== null && sd.recentMean < 6)) p5 = 1;
    points += p5;
    factors.push({
      text: 'Qualität ' + fmtNumber(sq.recentMean !== null ? sq.recentMean : 0) + ' (von 4), Dauer ' + fmtNumber(sd.recentMean !== null ? sd.recentMean : 0) + ' h.',
      value: 'Schlaf',
      points: p5
    });

    // Faktor 6: Objektive Überlastung (Ruhepuls-Anstieg oder HRV-Abfall)
    var pr = metricStats('puls_ruhe');
    var hv = metricStats('hrv');
    var p6 = 0;
    var prUp = (pr.recentMean !== null && pr.baseMedian !== null) ? (pr.recentMean - pr.baseMedian) : null;
    var hvDrop = (hv.recentMean !== null && hv.baseMedian !== null && hv.baseMedian > 0) ? ((hv.baseMedian - hv.recentMean) / hv.baseMedian) : null;
    var objText = 'Keine ausreichenden Messwerte (Ruhepuls/HRV).';
    if (prUp !== null && prUp >= 5) {
      p6 = 1;
      objText = 'Ruhepuls Ø 3 Tage ' + fmtNumber(pr.recentMean) + ' bpm (Baseline ' + fmtNumber(pr.baseMedian) + ' bpm) — erhöht.';
    } else if (hvDrop !== null && hvDrop >= 0.25) {
      p6 = 1;
      objText = 'HRV Ø 3 Tage ' + fmtNumber(hv.recentMean) + ' ms (Baseline ' + fmtNumber(hv.baseMedian) + ' ms) — reduziert.';
    } else if (pr.recentMean !== null || hv.recentMean !== null) {
      objText = 'Ruhepuls und HRV im persönlichen Bereich.';
    }
    points += p6;
    factors.push({
      text: objText,
      value: 'Objektive Überlastung',
      points: p6
    });

    var level, label, summary;
    if (points <= 1) {
      level = 'stable';
      label = 'stabil';
      summary = 'Die aktuellen Werte liegen im Bereich deines persönlichen Basisniveaus. Es gibt aktuell keine deutlichen Warnsignale.';
    } else if (points <= 3) {
      level = 'watch';
      label = 'beobachten';
      summary = 'Einzelne Warnsignale sind sichtbar. Pacing ist jetzt besonders wichtig, um einem möglichen Crash vorzubeugen.';
    } else {
      level = 'high';
      label = 'hohes Crash-Risiko';
      summary = 'Mehrere Warnsignale liegen gleichzeitig vor. Ein PEM-Crash ist möglich. Reduziere Belastung wo immer möglich und gönne dir Pausen.';
    }

    return { level: level, label: label, summary: summary, points: points, factors: factors };
  }

  function riskFactorsHtml(factors) {
    var items = factors.map(function (f) {
      return '<li>' + f.value + ': ' + f.text + ' (' + f.points + ' Punkt' + (f.points === 1 ? '' : 'e') + ')</li>';
    });
    return '<ul class="risk-factors">' + items.join('') + '</ul>';
  }

  function riskTableHtml() {
    var rows = [];
    ['zustand_0_10', 'bell_0_100', 'fatigue_0_4', 'pem_heute_0_4', 'belastung_koerperlich_0_4', 'belastung_kognitiv_0_4', 'belastung_reiz_0_4', 'schlafqualitaet_0_4', 'liegezeit_h', 'schritte', 'puls_ruhe', 'hrv'].forEach(function (key) {
      var s = metricStats(key);
      rows.push({ label: metricLabel(key), recent: s.recentMean, base: s.baseMedian, dir: FIELDS_BY_KEY[key].dir });
    });

    var html = '<table class="report-table"><thead><tr><th>Wert</th><th class="num">Baseline</th><th class="num">Ø 3 Tage</th><th class="num">Veränderung</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      var deltaTxt = '–';
      var cls = 'delta-flat';
      if (r.recent !== null && r.base !== null) {
        var numDelta = r.recent - r.base;
        var sign = numDelta > 0.05 ? '↑' : (numDelta < -0.05 ? '↓' : '→');
        deltaTxt = sign + ' ' + fmtNumber(Math.abs(numDelta));
        if (Math.abs(numDelta) < 0.05) {
          cls = 'delta-flat';
        } else if (r.dir === 'better') {
          cls = numDelta < 0 ? 'delta-up' : 'delta-down';
        } else if (r.dir === 'worse') {
          cls = numDelta > 0 ? 'delta-up' : 'delta-down';
        } else {
          cls = 'delta-flat';
        }
      }
      html += '<tr><td>' + r.label + '</td>' +
        '<td class="num">' + (r.base !== null ? fmtNumber(r.base) : '–') + '</td>' +
        '<td class="num">' + (r.recent !== null ? fmtNumber(r.recent) : '–') + '</td>' +
        '<td class="num ' + cls + '">' + deltaTxt + '</td></tr>';
    });
    html += '</tbody></table>';
    return html;
  }
  function domainSummaryHtml() {
    var rows = DOMAINS.map(function (d) {
      var vals = [];
      viewRecords.forEach(function (r) {
        var v = domainMean(r, d);
        if (v !== null) vals.push(v);
      });
      if (!vals.length) {
        return '<tr><td>' + d.label + '</td><td class="num">–</td><td class="num">–</td><td class="num">–</td><td class="num">–</td><td class="num">0</td></tr>';
      }
      var mn = Math.min.apply(null, vals);
      var mx = Math.max.apply(null, vals);
      return '<tr><td>' + d.label + '</td>' +
        '<td class="num">' + fmtNumber(mean(vals)) + '</td>' +
        '<td class="num">' + fmtNumber(median(vals)) + '</td>' +
        '<td class="num">' + fmtNumber(mn) + '</td>' +
        '<td class="num">' + fmtNumber(mx) + '</td>' +
        '<td class="num">' + vals.length + '</td></tr>';
    }).join('');
    return '<div class="table-wrap"><table class="report-table">' +
      '<thead><tr><th>Bereich</th><th class="num">Ø</th><th class="num">Median</th><th class="num">Min</th><th class="num">Max</th><th class="num">Tage</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  function pemEpisodesHtml() {
    var items = viewRecords.filter(function (r) {
      return hasValue(r.pem_gesamt_0_4) || hasValue(r.pem_ausloeser) || hasValue(r.pem_dauer_h) ||
        hasValue(r.pem_verzoegerung_h) || hasValue(r.pem_belastungsdatum);
    });
    if (!items.length) return '<p>Keine PEM-Episoden erfasst.</p>';

    var rows = items.map(function (r) {
      var ausloeser = hasValue(r.pem_ausloeser) ? escapeHtml(String(r.pem_ausloeser)) : '–';
      var belastung = hasValue(r.pem_belastungsdatum) ? escapeHtml(String(r.pem_belastungsdatum)) : '–';
      var verzoeg = hasValue(r.pem_verzoegerung_h) ? fmtNumber(r.pem_verzoegerung_h) + ' h' : '–';
      var dauer = hasValue(r.pem_dauer_h) ? fmtNumber(r.pem_dauer_h) + ' h' : '–';
      var schwere = hasValue(r.pem_gesamt_0_4) ? fmtNumber(r.pem_gesamt_0_4) + ' / 4' : '–';
      var marker = isAcuteCrash(r) ? ' ⚡' : '';
      return '<tr><td>' + fmtFull(r.dateTs) + marker + '</td><td>' + ausloeser + '</td>' +
        '<td>' + belastung + '</td><td class="num">' + verzoeg + '</td>' +
        '<td class="num">' + dauer + '</td><td class="num">' + schwere + '</td></tr>';
    }).join('');

    return '<div class="table-wrap"><table class="report-table">' +
      '<thead><tr><th>Datum</th><th>Auslöser</th><th>Belastung</th><th class="num">Verzögerung</th><th class="num">Dauer</th><th class="num">Schwere</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  function notesHtml() {
    var notes = viewRecords.filter(function (r) { return hasValue(r.notiz); });
    var kontext = viewRecords.filter(function (r) { return hasValue(r.kontext); });
    if (!notes.length && !kontext.length) return '';

    var html = '';
    if (notes.length) {
      html += '<h3>Notizen</h3><ul class="report-notes">' + notes.map(function (r) {
        return '<li><strong>' + fmtFull(r.dateTs) + ':</strong> ' + escapeHtml(String(r.notiz)) + '</li>';
      }).join('') + '</ul>';
    }
    if (kontext.length) {
      html += '<h3>Kontext</h3><ul class="report-notes">' + kontext.map(function (r) {
        return '<li><strong>' + fmtFull(r.dateTs) + ':</strong> ' + escapeHtml(String(r.kontext)) + '</li>';
      }).join('') + '</ul>';
    }
    return html;
  }

  // ---------------------------------------------------------------------------
  // Schritt 3: Overlay-Diagramm (mehrere Werte übereinander)
  // ---------------------------------------------------------------------------

  var OVERLAY_GROUPS = [
    { title: 'Vergleich: Kernwerte', metrics: ['zustand_0_10', 'bell_0_100', 'fatigue_0_4', 'pem_heute_0_4'] },
    { title: 'Vergleich: Belastung', metrics: ['belastung_koerperlich_0_4', 'belastung_kognitiv_0_4', 'belastung_reiz_0_4'] }
  ];

  function scaleType(metric) {
    return metric.indexOf('domain:') === 0 ? '0_4' : FIELDS_BY_KEY[metric].type;
  }

  function scaleUnit(metric) {
    var units = {
      '0_4': '0–4', '0_10': '0–10', '0_100': '0–100',
      'hours': 'h', 'minutes': 'min', 'steps': 'Schritte', 'bpm': 'bpm', 'ms': 'ms',
      'percent': '%', 'rate': '1/min', 'celsius': '°C', 'mmhg': 'mmHg', 'kg': 'kg'
    };
    return units[scaleType(metric)] || scaleType(metric);
  }

  function normRangeFor(metric, values) {
    var type = scaleType(metric);
    if (type === '0_4') return { min: 0, max: 4 };
    if (type === '0_10') return { min: 0, max: 10 };
    if (type === '0_100') return { min: 0, max: 100 };
    var nums = values.filter(function (v) { return typeof v === 'number'; });
    var dataMax = nums.length ? Math.max.apply(null, nums) : 1;
    var dataMin = nums.length ? Math.min.apply(null, nums) : 0;
    if (type === 'percent') { dataMin = Math.min(85, dataMin); dataMax = Math.max(100, dataMax); }
    if (dataMax <= dataMin) dataMax = dataMin + 1;
    return { min: dataMin, max: dataMax };
  }

  function overlayChartHeight(metrics) {
    var legendLines = Math.max(1, Math.ceil(metrics.length / 2));
    return 240 + legendLines * 22 + 70;
  }

  function overlayYValue(metric, raw, values, normalized) {
    if (!normalized) return raw;
    var rng = normRangeFor(metric, values);
    var span = rng.max - rng.min || 1;
    return Math.max(0, Math.min(100, (raw - rng.min) / span * 100));
  }
  function drawOverlay(ctx, W, H, metrics, viewRecords, palette) {
    var padL = 42, padR = 12, padT = 16;
    var legendLines = Math.max(1, Math.ceil(metrics.length / 2));
    var padB = 40 + legendLines * 22;

    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    var types = metrics.map(function (m) { return scaleType(m); });
    var sameScale = types.every(function (t) { return t === types[0]; });
    var normalized = !sameScale;

    var COLORS = ['#1f6f9f', '#b5522a', '#2e7d4f', '#8a6d1f', '#6b4fa0', '#a03a6b', '#3a8f8f', '#8f6b3a'];

    var series = metrics.map(function (m, idx) {
      return {
        metric: m,
        color: COLORS[idx % COLORS.length],
        values: viewRecords.map(function (r) { return getMetricValue(r, m); })
      };
    });

    var yMin, yMax;
    if (normalized) {
      yMin = 0; yMax = 100;
    } else {
      var allVals = [];
      series.forEach(function (s) {
        s.values.forEach(function (v) { if (typeof v === 'number') allVals.push(v); });
      });
      var rng = yRangeFor(metrics[0], allVals);
      yMin = rng.min; yMax = rng.max;
    }
    var ticks = makeTicks(yMin, yMax);

    function xForDate(ts) {
      var first = viewRecords[0].dateTs;
      var last = viewRecords[viewRecords.length - 1].dateTs;
      var span = last - first || 86400000;
      return padL + ((ts - first) / span) * plotW;
    }
    function yFor(v) {
      var span = yMax - yMin || 1;
      return padT + (1 - (v - yMin) / span) * plotH;
    }

    ctx.clearRect(0, 0, W, H);

    // Raster + Y-Achse
    ctx.strokeStyle = palette.grid;
    ctx.fillStyle = palette.text;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.lineWidth = 1;
    ticks.forEach(function (t) {
      if (t < yMin || t > yMax) return;
      var y = yFor(t);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillText(fmtNumber(t), padL - 6, y + 4);
    });

    // Hinweis bei normalisierter Darstellung
    if (normalized) {
      ctx.textAlign = 'left';
      ctx.fillStyle = palette.text;
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText('Werte normalisiert: 0–100 % des jeweiligen Skalenbereichs', padL + 4, padT + 12);
    }

    // X-Achsen-Beschriftung
    var labelCount = Math.max(2, Math.min(6, Math.floor(plotW / 80)));
    var step = Math.max(1, Math.ceil(viewRecords.length / labelCount));
    ctx.textAlign = 'center';
    for (var i = 0; i < viewRecords.length; i += step) {
      ctx.fillText(fmtShort(viewRecords[i].dateTs), xForDate(viewRecords[i].dateTs), padT + plotH + 16);
    }

    // Achsenlinien
    ctx.strokeStyle = palette.axis;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(W - padR, padT + plotH);
    ctx.stroke();

    // Datenreihen
    series.forEach(function (s) {
      ctx.strokeStyle = s.color;
      ctx.fillStyle = s.color;
      ctx.lineWidth = 2;

      var started = false;
      ctx.beginPath();
      for (var j = 0; j < viewRecords.length; j++) {
        var raw = s.values[j];
        if (typeof raw !== 'number') { started = false; continue; }
        var v = overlayYValue(s.metric, raw, s.values, normalized);
        var px = xForDate(viewRecords[j].dateTs);
        var py = yFor(v);
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      for (var k = 0; k < viewRecords.length; k++) {
        if (typeof s.values[k] !== 'number') continue;
        var vv = overlayYValue(s.metric, s.values[k], s.values, normalized);
        ctx.beginPath();
        ctx.arc(xForDate(viewRecords[k].dateTs), yFor(vv), 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Legende
    var legendY0 = padT + plotH + 34;
    ctx.textAlign = 'left';
    ctx.font = '11px system-ui, sans-serif';
    series.forEach(function (s, idx) {
      var col = idx % 2;
      var row = Math.floor(idx / 2);
      var lx = padL + col * (plotW / 2);
      var ly = legendY0 + row * 22;
      ctx.fillStyle = s.color;
      ctx.fillRect(lx, ly - 9, 12, 12);
      ctx.fillStyle = palette.text;
      ctx.fillText(metricLabel(s.metric) + ' (' + scaleUnit(s.metric) + ')', lx + 16, ly);
    });
  }

  // ---------------------------------------------------------------------------
  // Schritt 7: Diagramm-Auswahl (Verlauf + Vergleich konfigurierbar)
  // ---------------------------------------------------------------------------

  var METRIC_GROUPS = [
    { name: 'Kernwerte', items: ['zustand_0_10', 'bell_0_100', 'fatigue_0_4', 'pem_heute_0_4'] },
    { name: 'Belastung & Pacing', items: ['belastung_koerperlich_0_4', 'belastung_kognitiv_0_4', 'belastung_reiz_0_4', 'pacing_0_4', 'arbeitsfaehigkeit_0_4', 'teilhabe_0_4'] },
    { name: 'Alltag & Schlaf', items: ['liegezeit_h', 'hilfebedarf_min', 'schlafqualitaet_0_4', 'schlafdauer_h', 'schritte'] },
    { name: 'Messwerte', items: ['puls_ruhe', 'puls_avg', 'puls_max', 'hrv', 'spo2', 'atemfrequenz', 'temperatur', 'blutdruck_sys', 'blutdruck_dia', 'gewicht'] },
    { name: 'PEM (rückblickend)', items: ['pem_gesamt_0_4', 'pem_erholung_0_4', 'pem_fatigue_0_4', 'pem_kognition_0_4', 'pem_schmerz_0_4', 'pem_grippe_0_4', 'pem_verzoegerung_h', 'pem_dauer_h'] }
  ];
  DOMAINS.forEach(function (d) {
    METRIC_GROUPS.push({ name: d.label, items: d.members.slice() });
  });

  var state = {
    verlauf: REPORT_METRICS.slice(),
    vergleich: OVERLAY_GROUPS.map(function (g, i) {
      return { id: i + 1, title: g.title, metrics: g.metrics.slice() };
    }),
    nextId: OVERLAY_GROUPS.length + 1
  };

  function findVergleichGroup(groupId) {
    for (var i = 0; i < state.vergleich.length; i++) {
      if (state.vergleich[i].id === Number(groupId)) return state.vergleich[i];
    }
    return null;
  }

  function matchesSearch(metric, search) {
    if (!search) return true;
    var s = String(search).toLowerCase();
    return metricLabel(metric).toLowerCase().indexOf(s) !== -1;
  }

  function groupedCheckboxList(selected, cls, groupId, search) {
    var html = '';
    METRIC_GROUPS.forEach(function (g) {
      var items = g.items.filter(function (m) { return matchesSearch(m, search); });
      if (!items.length) return;
      html += '<div class="picker-group"><h4>' + g.name + '</h4><div class="picker-items">';
      items.forEach(function (m) {
        var on = selected.indexOf(m) !== -1;
        html += '<label class="metric-check"><input type="checkbox" class="' + cls + '" data-metric="' + m + '"' + (groupId ? ' data-group="' + groupId + '"' : '') + (on ? ' checked' : '') + '><span>' + metricLabel(m) + '</span></label>';
      });
      html += '</div></div>';
    });
    return html || '<p class="hint">Keine Treffer.</p>';
  }

  function updateCounts() {
    var v = document.querySelector('#verlauf-picker > summary');
    if (v) v.textContent = 'Verlauf-Werte (' + state.verlauf.length + ')';
    state.vergleich.forEach(function (g) {
      var el = document.querySelector('.vergleich-item[data-group="' + g.id + '"] > summary');
      if (el) el.textContent = g.title + ' (' + g.metrics.length + ')';
    });
  }
  function renderDiagramConfig() {
    var root = document.getElementById('diagram-config');
    if (!root) return;

    var html = '';
    html += '<details class="picker" id="verlauf-picker"><summary>Verlauf-Werte (' + state.verlauf.length + ')</summary><div class="picker-body">';
    html += '<input type="search" class="picker-search" id="verlauf-search" placeholder="Wert suchen…">';
    html += '<div class="picker-groups" id="verlauf-groups">' + groupedCheckboxList(state.verlauf, 'verlauf-check', null, '') + '</div>';
    html += '</div></details>';

    html += '<div class="vergleich-head">Vergleiche</div>';
    state.vergleich.forEach(function (g) {
      html += '<details class="picker vergleich-item" data-group="' + g.id + '"><summary>' + escapeHtml(g.title) + ' (' + g.metrics.length + ')</summary><div class="picker-body">';
      html += '<input type="search" class="picker-search vergleich-search" data-group="' + g.id + '" placeholder="Wert suchen…">';
      html += '<div class="picker-groups vergleich-groups" data-group="' + g.id + '">' + groupedCheckboxList(g.metrics, 'vergleich-check', g.id, '') + '</div>';
      html += '<button type="button" class="btn-remove" data-group="' + g.id + '">Entfernen</button>';
      html += '</div></details>';
    });
    html += '<button type="button" class="btn-add" id="btn-add-vergleich">+ Vergleich hinzufügen</button>';

    root.innerHTML = html;
  }

  function filterPicker(input) {
    var container, selected, cls, groupId;
    if (input.id === 'verlauf-search') {
      container = document.getElementById('verlauf-groups');
      selected = state.verlauf; cls = 'verlauf-check'; groupId = null;
    } else {
      var g = findVergleichGroup(input.dataset.group);
      container = document.querySelector('.vergleich-groups[data-group="' + input.dataset.group + '"]');
      selected = g ? g.metrics : []; cls = 'vergleich-check'; groupId = input.dataset.group;
    }
    if (container) container.innerHTML = groupedCheckboxList(selected, cls, groupId, input.value);
  }

  function toggleVerlauf(metric, on) {
    var i = state.verlauf.indexOf(metric);
    if (on && i === -1) state.verlauf.push(metric);
    else if (!on && i !== -1) state.verlauf.splice(i, 1);
    updateCounts();
    renderPreview();
  }

  function toggleVergleichMetric(groupId, metric, on) {
    var g = findVergleichGroup(groupId);
    if (!g) return;
    var i = g.metrics.indexOf(metric);
    if (on && i === -1) g.metrics.push(metric);
    else if (!on && i !== -1) g.metrics.splice(i, 1);
    updateCounts();
    renderPreview();
  }

  function addVergleichGroup() {
    state.vergleich.push({ id: state.nextId++, title: 'Vergleich ' + (state.vergleich.length + 1), metrics: [] });
    renderDiagramConfig();
  }

  function removeVergleichGroup(groupId) {
    state.vergleich = state.vergleich.filter(function (g) { return g.id !== Number(groupId); });
    renderDiagramConfig();
    renderPreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();




