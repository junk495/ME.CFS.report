/* =========================================================
   ME.CFS.report - core.js
   Reine Hilfsfunktionen (ohne DOM-Abhaengigkeit).
   Ausgelagert, damit sie testbar sind.
   ========================================================= */
(function (global) {
  'use strict';

  function norm(s) {
    return String(s).replace(/\uFEFF/g, '').trim();
  }

  function parseNumber(raw) {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === 'number') return raw;
    var s = String(raw).trim();
    if (s === '') return null;
    if (s.indexOf(',') !== -1 && s.indexOf('.') === -1) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (s.indexOf(',') !== -1 && s.indexOf('.') !== -1) {
      // z. B. "1.234,56" -> "1234.56"
      s = s.replace(/\./g, '').replace(',', '.');
    }
    var n = Number(s);
    return isNaN(n) ? null : n;
  }

  function median(arr) {
    if (!arr || arr.length === 0) return null;
    var sorted = arr.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
    return sorted[mid];
  }

  function mean(arr) {
    if (!arr || arr.length === 0) return null;
    var sum = 0;
    for (var i = 0; i < arr.length; i++) sum += arr[i];
    return sum / arr.length;
  }

  function parseDate(s) {
    if (!s) return null;
    var str = String(s).trim();
    var m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
  }

  function parseCSVLine(line) {
    var out = [];
    var cur = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; }
          else inQuotes = false;
        } else cur += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ';') { out.push(cur); cur = ''; }
        else cur += ch;
      }
    }
    out.push(cur);
    return out;
  }

  global.MECFS_core = {
    norm: norm,
    parseNumber: parseNumber,
    median: median,
    mean: mean,
    parseDate: parseDate,
    parseCSVLine: parseCSVLine
  };
})(window);
