# check.ps1 — Konsistenz-Checks fuer ME.CFS (Tracker) + ME.CFS.graph + ME.CFS.report
# Dev-Tool (nicht Teil der App). Aufruf:  pwsh ./scripts/check.ps1
$ErrorActionPreference = 'Stop'

$reportRoot = Split-Path -Parent $PSScriptRoot
$parentRoot = Split-Path -Parent $reportRoot
$trackerRoot = Join-Path $parentRoot 'ME.CFS'
$graphRoot   = Join-Path $parentRoot 'ME.CFS.graph'

$trackerApp = Join-Path $trackerRoot 'app.js'
$graphApp   = Join-Path $graphRoot 'app.js'
$reportApp  = Join-Path $reportRoot 'app.js'

$trackerSw  = Join-Path $trackerRoot 'sw.js'
$graphSw    = Join-Path $graphRoot 'sw.js'

$trackerChg = Join-Path $trackerRoot 'CHANGELOG.md'
$graphChg   = Join-Path $graphRoot 'CHANGELOG.md'
$reportChg  = Join-Path $reportRoot 'CHANGELOG.md'

$trackerHtml = Join-Path $trackerRoot 'index.html'
$graphHtml   = Join-Path $graphRoot 'index.html'
$reportHtml  = Join-Path $reportRoot 'index.html'

$trackerMan = Join-Path $trackerRoot 'manifest.json'
$graphMan   = Join-Path $graphRoot 'manifest.json'

$errors = 0
function Ok($m)  { Write-Host "  [OK] $m" -ForegroundColor Green }
function Err($m) { Write-Host "  [FEHLER] $m" -ForegroundColor Red; $script:errors++ }

Write-Host "`n=== 1. Daten-Vertrag (EXPORT_COLUMNS <-> FIELD_DEFS x2) ===" -ForegroundColor Cyan
$t = [System.IO.File]::ReadAllText($trackerApp)
$g = [System.IO.File]::ReadAllText($graphApp)
$r = [System.IO.File]::ReadAllText($reportApp)

$tMap = @{}
if ($t -match '(?s)EXPORT_COLUMNS\s*=\s*\[(.*?)\];') { [regex]::Matches($Matches[1], "key: '([^']+)', header: '([^']+)'") | ForEach-Object { $tMap[$_.Groups[1].Value] = $_.Groups[2].Value } } else { Err 'Tracker: EXPORT_COLUMNS nicht gefunden' }

$gMap = @{}
if ($g -match '(?s)FIELD_DEFS\s*=\s*\[(.*?)\];') { [regex]::Matches($Matches[1], "\['([^']+)', '([^']+)'") | ForEach-Object { $gMap[$_.Groups[1].Value] = $_.Groups[2].Value } } else { Err 'Graph: FIELD_DEFS nicht gefunden' }

$rMap = @{}
if ($r -match '(?s)FIELD_DEFS\s*=\s*\[(.*?)\];') { [regex]::Matches($Matches[1], "\['([^']+)', '([^']+)'") | ForEach-Object { $rMap[$_.Groups[1].Value] = $_.Groups[2].Value } } else { Err 'Report: FIELD_DEFS nicht gefunden' }

$all = @($tMap.Keys) + @($gMap.Keys) + @($rMap.Keys) | Sort-Object -Unique
$mismatch = 0
foreach ($k in $all) {
  if (-not $tMap.ContainsKey($k)) { Err "Key '$k' fehlt im Tracker"; $mismatch++; continue }
  if (-not $gMap.ContainsKey($k)) { Err "Key '$k' fehlt im Graph"; $mismatch++; continue }
  if (-not $rMap.ContainsKey($k)) { Err "Key '$k' fehlt im Report"; $mismatch++; continue }
  if ($tMap[$k] -ne $gMap[$k]) { Err "Header '$k': Tracker='$($tMap[$k])' Graph='$($gMap[$k])'"; $mismatch++ }
  elseif ($tMap[$k] -ne $rMap[$k]) { Err "Header '$k': Tracker='$($tMap[$k])' Report='$($rMap[$k])'"; $mismatch++ }
}
if ($mismatch -eq 0 -and $all.Count -gt 0) { Ok "$($all.Count) Felder, Keys + Header identisch (Tracker/Graph/Report)" }

Write-Host "`n=== 2. Version (sw.js/Meta-Tag == CHANGELOG) ===" -ForegroundColor Cyan
function Check-Version-Sw($name, $swPath, $htmlPath, $chgPath) {
  $sw = [System.IO.File]::ReadAllText($swPath)
  $html = [System.IO.File]::ReadAllText($htmlPath)
  $chg = [System.IO.File]::ReadAllText($chgPath)
  if ($sw -notmatch "VERSION\s*=\s*'([^']+)'") { Err "${name}: VERSION nicht gefunden"; return }
  $v = $Matches[1]
  if ($html -notmatch '<meta name="app-version" content="([^"]+)"') { Err "${name}: Meta-Tag nicht gefunden"; return }
  $meta = $Matches[1]
  if ($chg -notmatch '##\s+(\S+)') { Err "${name}: Changelog-Eintrag nicht gefunden"; return }
  $top = $Matches[1]
  if ($v -eq $meta -and $meta -eq $top) { Ok "${name}: $v (sw.js / Meta / Changelog) stimmen ueberein" }
  else { Err "${name}: sw.js='$v' Meta='$meta' Changelog='$top'" }
}
function Check-Version-NoSw($name, $htmlPath, $chgPath) {
  $html = [System.IO.File]::ReadAllText($htmlPath)
  $chg = [System.IO.File]::ReadAllText($chgPath)
  if ($html -notmatch '<meta name="app-version" content="([^"]+)"') { Err "${name}: Meta-Tag nicht gefunden"; return }
  $meta = $Matches[1]
  if ($chg -notmatch '##\s+(\S+)') { Err "${name}: Changelog-Eintrag nicht gefunden"; return }
  $top = $Matches[1]
  if ($meta -eq $top) { Ok "${name}: $meta (Meta / Changelog) stimmen ueberein" }
  else { Err "${name}: Meta='$meta' Changelog='$top'" }
}
Check-Version-Sw 'Tracker' $trackerSw $trackerHtml $trackerChg
Check-Version-Sw 'Graph' $graphSw $graphHtml $graphChg
Check-Version-NoSw 'Report' $reportHtml $reportChg

Write-Host "`n=== 3. manifest.json valide ===" -ForegroundColor Cyan
foreach ($m in @(@('Tracker', $trackerMan), @('Graph', $graphMan))) {
  $name = $m[0]; $path = $m[1]
  try { $null = [System.IO.File]::ReadAllText($path) | ConvertFrom-Json; Ok "${name}: manifest.json gueltig" }
  catch { Err "${name}: manifest.json ungueltig" }
}

Write-Host ''
if ($errors -eq 0) { Write-Host 'ALLE CHECKS OK' -ForegroundColor Green } else { Write-Host "$errors FEHLER" -ForegroundColor Red }
