#requires -Version 5.1
<#
.SYNOPSIS
  DevHub local launcher - start the Spring Boot backend (H2) and the static
  frontend server together, in one command, then open the hub in your browser.

.DESCRIPTION
  Wires both halves for local development:
    - Backend  : mvnw.cmd -f backend\pom.xml spring-boot:run   (H2, http://localhost:8081)
    - Frontend : python -m http.server <port>  served from .\frontend
                 (http://localhost:5500/app - clean URLs, CORS-allowed by the backend)

  Each runs in its own titled console window so you can read its logs. Leave THIS
  window open; press Ctrl+C here to stop both (it kills each process tree). The
  log windows stay open on a crash so you can read the error.

  The frontend config.js has DEVHUB_API_BASE = null, so it already targets the
  local backend at :8081 - no edit needed for local dev.

.PARAMETER FrontendPort
  Port for the static frontend server. Default 5500.

.PARAMETER FrontendOnly
  Skip the backend; just serve the static pages (they render without the API -
  sign-in / progress simply won't be available).

.PARAMETER NoBrowser
  Don't auto-open the browser.

.EXAMPLE
  .\dev.ps1
    Start backend + frontend, wait for health, open the hub.

.EXAMPLE
  .\dev.ps1 -FrontendOnly
    Just browse the visualizer pages (fast - no Maven, no backend).

.NOTES
  If PowerShell blocks the script, run it once as:
    powershell -ExecutionPolicy Bypass -File .\dev.ps1
#>
[CmdletBinding()]
param(
  [int]$FrontendPort = 5500,
  [switch]$FrontendOnly,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root        = $PSScriptRoot
$frontendDir = Join-Path $root 'frontend'
$BackendPort = 8081   # fixed by backend dev profile (application.yml); informational here
$procs       = @()

function Resolve-StaticServer {
  param([int]$Port)
  if (Get-Command py     -ErrorAction SilentlyContinue) { return [pscustomobject]@{ Desc = "py devserver.py $Port" } }
  if (Get-Command python -ErrorAction SilentlyContinue) { return [pscustomobject]@{ Desc = "python devserver.py $Port" } }
  if (Get-Command node   -ErrorAction SilentlyContinue) { return [pscustomobject]@{ Desc = "npx --yes serve -l $Port" } }
  throw "No static file server found. Install Python (py / python) or Node.js, then re-run."
}

function Stop-All {
  foreach ($p in $script:procs) {
    try {
      if ($p -and -not $p.HasExited) {
        Write-Host "  - stopping PID $($p.Id) (and children)" -ForegroundColor DarkGray
        taskkill /PID $p.Id /T /F *> $null
      }
    } catch { }
  }
}

# -- preflight ----------------------------------------------------------------
if (-not (Test-Path (Join-Path $frontendDir 'app.html'))) {
  throw "frontend\app.html not found under $root - run dev.ps1 from the project root."
}
if (-not $FrontendOnly) {
  if (-not (Test-Path (Join-Path $root 'mvnw.cmd')))        { throw "mvnw.cmd not found at $root" }
  if (-not (Test-Path (Join-Path $root 'backend\pom.xml'))) { throw "backend\pom.xml not found under $root" }
}
$serve = Resolve-StaticServer -Port $FrontendPort

Write-Host ""
Write-Host "  === DevHub local launcher ===" -ForegroundColor Cyan
Write-Host "  root: $root" -ForegroundColor DarkGray
Write-Host ""

try {
  # -- backend ----------------------------------------------------------------
  if (-not $FrontendOnly) {
    $alreadyUp = $false
    try { if ((Invoke-RestMethod "http://localhost:$BackendPort/actuator/health" -TimeoutSec 2).status -eq 'UP') { $alreadyUp = $true } } catch { }
    if ($alreadyUp) {
      Write-Host "  > backend   already UP on :$BackendPort - reusing it" -ForegroundColor Green
    } else {
      Write-Host "  > backend   starting on :$BackendPort   (Spring Boot, H2)" -ForegroundColor Green
      $beArgs = '/k cd /d "{0}" && title DevHub Backend :{1} && mvnw.cmd -f "backend\pom.xml" spring-boot:run' -f $root, $BackendPort
      $procs += Start-Process cmd.exe -ArgumentList $beArgs -PassThru
    }
  }

  # -- frontend ---------------------------------------------------------------
  # If something already owns the frontend port, reuse it only when it's actually
  # OUR hub; otherwise stop the stale server (the usual reason a re-run "does
  # nothing": an old `http.server` squats :5500 so devserver can't bind).
  $feReused = $false
  $existing = Get-NetTCPConnection -LocalPort $FrontendPort -State Listen -ErrorAction SilentlyContinue
  if ($existing) {
    $isHub = $false
    try {
      $r = Invoke-WebRequest "http://localhost:$FrontendPort/app" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
      if ($r.StatusCode -eq 200 -and $r.Content -match 'id="viewer"') { $isHub = $true }
    } catch { }
    if ($isHub) {
      Write-Host "  > frontend  already serving the hub on :$FrontendPort - reusing it" -ForegroundColor Green
      $feReused = $true
    } else {
      foreach ($procId in ($existing.OwningProcess | Sort-Object -Unique)) {
        $pn = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
        Write-Host "  ! :$FrontendPort held by a stale server (PID $procId $pn) - stopping it so the hub can bind" -ForegroundColor Yellow
        taskkill /PID $procId /T /F *> $null
      }
      Start-Sleep -Milliseconds 400
    }
  }
  if (-not $feReused) {
    Write-Host "  > frontend  http://localhost:$FrontendPort/app   ($($serve.Desc))" -ForegroundColor Green
    $feArgs = '/k cd /d "{0}" && title DevHub Frontend :{1} && {2}' -f $frontendDir, $FrontendPort, $serve.Desc
    $procs += Start-Process cmd.exe -ArgumentList $feArgs -PassThru
  }

  # -- open browser -----------------------------------------------------------
  if (-not $NoBrowser) {
    $url = "http://localhost:$FrontendPort/app"
    if (-not $FrontendOnly) {
      Write-Host ""
      Write-Host "  waiting for backend health (first Maven run can take ~1 min)..." -ForegroundColor DarkGray
      $healthy = $false
      for ($i = 0; $i -lt 60; $i++) {
        try {
          $h = Invoke-RestMethod "http://localhost:$BackendPort/actuator/health" -TimeoutSec 2
          if ($h.status -eq 'UP') { $healthy = $true; break }
        } catch { }
        Start-Sleep -Seconds 2
      }
      if ($healthy) { Write-Host "  backend is UP" -ForegroundColor Green }
      else          { Write-Host "  health timed out - opening anyway; check the backend window." -ForegroundColor Yellow }
    } else {
      Start-Sleep -Seconds 1
    }
    Start-Process $url
  }

  Write-Host ""
  Write-Host "  Everything is running. Press Ctrl+C here to stop it all." -ForegroundColor Cyan
  Write-Host "  (backend and frontend each have their own log window)" -ForegroundColor DarkGray
  Write-Host ""

  $live = @($procs | Where-Object { $_ -and -not $_.HasExited } | ForEach-Object Id)
  if ($live.Count) { Wait-Process -Id $live }
}
finally {
  Write-Host ""
  Write-Host "  shutting down..." -ForegroundColor Cyan
  Stop-All
  Write-Host "  done." -ForegroundColor DarkGray
}
