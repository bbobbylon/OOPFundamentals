#!/usr/bin/env bash
#
# startapp.sh - DevHub local launcher
#
# Start the Spring Boot backend (H2, :8081) and the static frontend (:5500)
# together, then open the hub (app.html) in your browser. One command:
#
#     ./startapp.sh                  # backend + frontend, then open the hub
#     ./startapp.sh --frontend-only  # just the static pages (no Maven, no backend)
#     ./startapp.sh --no-browser     # don't auto-open the browser
#
# Leave this terminal open; press Ctrl+C to stop what the script started.
# If a backend is already running on :8081 it is detected and reused (so this
# is safe to run when you already have `mvnw spring-boot:run` going).
#
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_PORT="${FRONTEND_PORT:-5500}"
BACKEND_PORT=8081
FRONTEND_ONLY=0
NO_BROWSER=0

for arg in "$@"; do
  case "$arg" in
    --frontend-only) FRONTEND_ONLY=1 ;;
    --no-browser)    NO_BROWSER=1 ;;
    -h|--help)
      echo "usage: ./startapp.sh [--frontend-only] [--no-browser]"
      exit 0 ;;
    *) echo "unknown option: $arg (try -h)" >&2; exit 2 ;;
  esac
done

# --- find a Python for the static server -------------------------------------
PY=""
for c in py python python3; do
  if command -v "$c" >/dev/null 2>&1; then PY="$c"; break; fi
done
if [ -z "$PY" ]; then
  echo "ERROR: no Python found (tried py, python, python3). Install Python 3." >&2
  exit 1
fi

# --- preflight ---------------------------------------------------------------
[ -f "$ROOT/frontend/app.html" ] || { echo "ERROR: frontend/app.html not found under $ROOT" >&2; exit 1; }
if [ "$FRONTEND_ONLY" -eq 0 ]; then
  [ -f "$ROOT/mvnw" ]            || { echo "ERROR: mvnw not found at $ROOT" >&2; exit 1; }
  [ -f "$ROOT/backend/pom.xml" ] || { echo "ERROR: backend/pom.xml not found" >&2; exit 1; }
fi

backend_up() { curl -fsS "http://localhost:${BACKEND_PORT}/actuator/health" >/dev/null 2>&1; }

# Is OUR hub already being served on the frontend port? (clean-URL /app -> the hub)
frontend_serves_hub() { curl -fsS "http://localhost:${FRONTEND_PORT}/app" 2>/dev/null | grep -q 'id="viewer"'; }

# Free the frontend port if a stale/foreign server is squatting it. This is the
# usual reason a re-run "does nothing": an old `http.server` still owns :5500, so
# devserver can't bind and the old (no-clean-URL) server keeps 404ing /app.
free_port() {
  local port="$1" pid
  if command -v netstat >/dev/null 2>&1; then          # Windows / Git Bash
    for pid in $(netstat -ano 2>/dev/null | grep -iE "[:.]${port}[[:space:]].*LISTENING" | awk '{print $NF}' | sort -u); do
      [ -n "$pid" ] && [ "$pid" -gt 0 ] 2>/dev/null || continue
      echo "  ! :${port} held by a stale server (PID ${pid}) - stopping it"
      taskkill //PID "$pid" //F >/dev/null 2>&1 || kill "$pid" 2>/dev/null || true
    done
  elif command -v lsof >/dev/null 2>&1; then            # macOS / Linux
    for pid in $(lsof -ti "tcp:${port}" 2>/dev/null); do
      echo "  ! :${port} held by a stale server (PID ${pid}) - stopping it"
      kill "$pid" 2>/dev/null || true
    done
  fi
}

open_url() {
  local url="$1"
  # Prefer Python's webbrowser (we already require Python) - most reliable from
  # Git Bash; cmd.exe/explorer arg handling for URLs is flaky under MSYS.
  if   "$PY" -m webbrowser -t "$url" >/dev/null 2>&1; then :
  elif command -v explorer.exe >/dev/null 2>&1; then explorer.exe "$url" >/dev/null 2>&1 || true
  elif command -v cmd.exe      >/dev/null 2>&1; then cmd.exe //c start "" "$url" >/dev/null 2>&1 || true
  elif command -v open         >/dev/null 2>&1; then open "$url" || true
  elif command -v xdg-open     >/dev/null 2>&1; then xdg-open "$url" || true
  else echo "  open this in your browser: $url"; fi
}

PIDS=()
cleanup() {
  trap - INT TERM EXIT
  echo
  echo "  stopping (only what this script started)..."
  for pid in "${PIDS[@]:-}"; do
    [ -n "${pid:-}" ] && kill "$pid" 2>/dev/null || true
  done
  exit 0
}
trap cleanup INT TERM EXIT

echo
echo "  === DevHub local launcher ==="
echo "  root: $ROOT"
echo

# --- backend -----------------------------------------------------------------
if [ "$FRONTEND_ONLY" -eq 0 ]; then
  if backend_up; then
    echo "  > backend   already UP on :${BACKEND_PORT} - reusing it"
  else
    echo "  > backend   starting on :${BACKEND_PORT}  (Spring Boot, H2)"
    ( cd "$ROOT" && exec ./mvnw -f backend/pom.xml spring-boot:run -Dspring-boot.run.fork=false ) &
    PIDS+=("$!")
  fi
fi

# --- frontend ----------------------------------------------------------------
if frontend_serves_hub; then
  echo "  > frontend  already serving the hub on :${FRONTEND_PORT} - reusing it"
else
  free_port "${FRONTEND_PORT}"   # clear any stale server so devserver can bind
  echo "  > frontend  http://localhost:${FRONTEND_PORT}/app   (${PY} devserver.py — clean URLs)"
  ( cd "$ROOT/frontend" && exec "$PY" devserver.py "$FRONTEND_PORT" ) &
  PIDS+=("$!")
fi

# --- open the hub once things are ready --------------------------------------
URL="http://localhost:${FRONTEND_PORT}/app"
if [ "$NO_BROWSER" -eq 0 ]; then
  (
    if [ "$FRONTEND_ONLY" -eq 0 ]; then
      echo "  waiting for backend health (first Maven run can take ~1 min)..."
      for _ in $(seq 1 60); do backend_up && break; sleep 2; done
      if backend_up; then echo "  backend is UP"; else echo "  (health timed out - opening anyway; check the logs above)"; fi
    else
      sleep 1
    fi
    open_url "$URL"
  ) &
fi

echo
echo "  Hub:  $URL"
echo "  (the bare URL http://localhost:${FRONTEND_PORT}/ redirects here; old landing page at /index-legacy.html)"
echo "  Press Ctrl+C to stop."
echo
wait
