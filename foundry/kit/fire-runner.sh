#!/bin/bash
# Foundry Kit fire runner — invoked by launchd (com.<slug>.fire.plist) on the configured cadence.
# Runs one headless Claude Code fire with the protocol file named in foundry.config.json.
# Generalized from the Gold Rush fire-runner (proven structure kept; constants -> config;
# see the kit's DIVERGENCES.md). Single-instance guarded; logs to <logDir>/fire-YYYYMMDD.log.
# Manual run: bash scripts/fire-runner.sh        Dry run: bash scripts/fire-runner.sh --dry-run
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CFG="$ROOT/foundry.config.json"
cd "$ROOT" || exit 1

# resolve node FIRST — launchd's thin PATH lacks the nvm/user node, and node is needed
# both for config parsing here and for the fire's own gates (tsc/build/e2e). Original
# incident: gates silently failed with "command not found" (s55).
if ! command -v node >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
fi
if ! command -v node >/dev/null 2>&1; then
  for d in "${NVM_DIR:-$HOME/.nvm}"/versions/node/*/bin /opt/homebrew/bin /usr/local/bin "$HOME/.volta/bin" "$HOME/.asdf/shims"; do
    if [ -x "$d/node" ]; then PATH="$d:$PATH"; export PATH; break; fi
  done
fi

# cfg <dot.path> <default> — reads foundry.config.json; falls back when node/config absent.
cfg() {
  local v=""
  if command -v node >/dev/null 2>&1 && [ -f "$CFG" ]; then
    v=$(node -e '
      const c = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
      const v = process.argv[2].split(".").reduce((o, k) => (o == null ? o : o[k]), c);
      if (v == null) process.exit(1);
      process.stdout.write(String(v));
    ' "$CFG" "$1" 2>/dev/null) || v=""
  fi
  if [ -n "$v" ]; then printf '%s\n' "$v"; else printf '%s\n' "$2"; fi
}

FIRE_MODEL="${FIRE_MODEL:-$(cfg fire.model claude-opus-4-8)}"
PROTOCOL="$(cfg fire.protocol scripts/fire.md)"
LOGDIR="$(cfg fire.logDir logs)"
STALE_MIN="$(cfg fire.lockStaleMinutes 50)"
RETAIN_DAYS="$(cfg fire.logRetentionDays 14)"
CLAUDE_DIR="$(cfg fire.claudeConfigDir '')"
[ -n "$CLAUDE_DIR" ] && export CLAUDE_CONFIG_DIR="$CLAUDE_DIR"

LOCKDIR="$ROOT/tasks/.fire.lock"
LOG="$LOGDIR/fire-$(date +%Y%m%d).log"

# resolve claude binary (launchd has a thin PATH)
CLAUDE_BIN="$(command -v claude || true)"
[ -z "$CLAUDE_BIN" ] && for c in "$HOME/.claude/local/claude" /opt/homebrew/bin/claude /usr/local/bin/claude; do
  [ -x "$c" ] && CLAUDE_BIN="$c" && break
done

if [ "${1:-}" = "--dry-run" ]; then
  echo "[fire-runner] DRY-RUN — planned actions only, nothing executed:"
  echo "  repo:       $ROOT"
  if [ -f "$CFG" ]; then echo "  config:     $CFG (found)"; else echo "  config:     $CFG (MISSING — baked defaults in use)"; fi
  echo "  model:      $FIRE_MODEL"
  if [ -f "$PROTOCOL" ]; then echo "  protocol:   $PROTOCOL (found)"; else echo "  protocol:   $PROTOCOL (MISSING — fire would abort)"; fi
  echo "  log:        $LOG (retained $RETAIN_DAYS days)"
  echo "  lock:       $LOCKDIR (reaped when stale >$STALE_MIN min)"
  echo "  claude bin: ${CLAUDE_BIN:-NOT FOUND}"
  echo "  node:       $(command -v node || echo 'NOT FOUND — config parsing + gates degraded')"
  echo "  would run:  \"\$CLAUDE_BIN\" -p \"\$(cat $PROTOCOL)\" --model $FIRE_MODEL >> $LOG"
  exit 0
fi

mkdir -p "$LOGDIR"

# single instance (a lock older than STALE_MIN = crashed fire, reap it)
if ! mkdir "$LOCKDIR" 2>/dev/null; then
  if [ -n "$(find "$LOCKDIR" -maxdepth 0 -mmin +"$STALE_MIN" 2>/dev/null)" ]; then
    rmdir "$LOCKDIR" 2>/dev/null && mkdir "$LOCKDIR" 2>/dev/null || exit 0
    echo "[fire-runner] $(date +%H:%M:%S) reaped stale lock" >> "$LOG"
  else
    exit 0
  fi
fi
trap 'rmdir "$LOCKDIR" 2>/dev/null' EXIT

if [ -z "$CLAUDE_BIN" ]; then echo "[fire-runner] $(date +%H:%M:%S) FATAL: claude binary not found" >> "$LOG"; exit 1; fi
if [ ! -f "$PROTOCOL" ]; then echo "[fire-runner] $(date +%H:%M:%S) FATAL: protocol file missing: $PROTOCOL" >> "$LOG"; exit 1; fi
if command -v node >/dev/null 2>&1; then
  echo "[fire-runner] $(date +%H:%M:%S) node $(node -v) at $(command -v node)" >> "$LOG"
else
  echo "[fire-runner] $(date +%H:%M:%S) WARN: node not on PATH — build/e2e gates will fail" >> "$LOG"
fi

echo "[fire-runner] $(date +%H:%M:%S) FIRE START (model $FIRE_MODEL)" >> "$LOG"
"$CLAUDE_BIN" -p "$(cat "$PROTOCOL")" \
  --model "$FIRE_MODEL" \
  >> "$LOG" 2>&1
RC=$?
echo "[fire-runner] $(date +%H:%M:%S) FIRE END rc=$RC" >> "$LOG"

find "$LOGDIR" -name 'fire-*.log' -mtime +"$RETAIN_DAYS" -delete 2>/dev/null
exit 0
