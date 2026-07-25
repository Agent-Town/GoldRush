#!/bin/bash
# Gold Rush fire runner — invoked by launchd every 15 min (com.goldrush.fire.plist).
# Runs one headless Claude Code fire (Opus 4.8) with the protocol in scripts/fire.md.
# Single-instance guarded; logs to logs/fire-YYYYMMDD.log. Manual run: bash scripts/fire-runner.sh
set -u
REPO="/Users/robin/Claude/Projects/Gold Rush"
LOCKDIR="$REPO/tasks/.fire.lock"
cd "$REPO" || exit 1
mkdir -p logs
LOG="logs/fire-$(date +%Y%m%d).log"

# single instance (stale after 50 min = crashed fire, reap it)
if ! mkdir "$LOCKDIR" 2>/dev/null; then
  if [ -n "$(find "$LOCKDIR" -maxdepth 0 -mmin +50 2>/dev/null)" ]; then
    rmdir "$LOCKDIR" 2>/dev/null && mkdir "$LOCKDIR" 2>/dev/null || exit 0
    echo "[fire-runner] $(date +%H:%M:%S) reaped stale lock" >> "$LOG"
  else
    exit 0
  fi
fi
trap 'rmdir "$LOCKDIR" 2>/dev/null' EXIT

# resolve claude binary (launchd has a thin PATH)
CLAUDE_BIN="$(command -v claude || true)"
[ -z "$CLAUDE_BIN" ] && for c in "$HOME/.claude/local/claude" /opt/homebrew/bin/claude /usr/local/bin/claude; do
  [ -x "$c" ] && CLAUDE_BIN="$c" && break
done
if [ -z "$CLAUDE_BIN" ]; then echo "[fire-runner] $(date +%H:%M:%S) FATAL: claude binary not found" >> "$LOG"; exit 1; fi

# resolve node onto PATH — launchd's thin PATH lacks the nvm/user node, so tsc/build/e2e
# and scripts/extract-alpha.mjs (all gates) silently fail with "command not found". (s55)
if ! command -v node >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
fi
if ! command -v node >/dev/null 2>&1; then
  for d in "$NVM_DIR"/versions/node/*/bin /opt/homebrew/bin /usr/local/bin "$HOME/.volta/bin" "$HOME/.asdf/shims"; do
    if [ -x "$d/node" ]; then PATH="$d:$PATH"; export PATH; break; fi
  done
fi
if command -v node >/dev/null 2>&1; then
  echo "[fire-runner] $(date +%H:%M:%S) node $(node -v) at $(command -v node)" >> "$LOG"
else
  echo "[fire-runner] $(date +%H:%M:%S) WARN: node not on PATH — build/e2e/art gates will fail" >> "$LOG"
fi

# Opus weekly cap hit 2026-07-15 (resets Jul 18 01:00 Asia/Bangkok) — Sonnet fallback
# keeps the fires alive; revert to opus after the reset (attended note in BACKLOG).
# THE DRY-BOARD GUARD (2026-07-25, owner-prompted: no-op fires burned the weekly Opus meter).
# Skip the model call entirely when the board is PROVABLY dry — conservative: any doubt runs the fire.
# A counter caps consecutive skips at 11 (~1 real fire/hour keeps the heartbeat + backup duties).
SKIPCOUNT_F="tasks/.fire-skip-count"
skips=$(cat "$SKIPCOUNT_F" 2>/dev/null || echo 0)
dry=1
ls tasks/queue/*/* >/dev/null 2>&1 && dry=0
[ -n "$(ls tasks/running/ 2>/dev/null | grep -v '\.pid$')" ] && dry=0
for b in lane/m3 lane/m4 lane/e2-arsenal lane/perf; do
  [ "$(git rev-list --count origin/main..$b 2>/dev/null || echo 1)" != "0" ] && dry=0
done
[ -n "$(find tasks/done -type f -mmin -60 2>/dev/null | head -1)" ] && dry=0
head -1 STATUS.md 2>/dev/null | grep -q "lock ACTIVE" && dry=0
if [ "$dry" = "1" ] && [ "$skips" -lt 11 ]; then
  echo $((skips+1)) > "$SKIPCOUNT_F"
  echo "[fire-runner] $(date +%H:%M:%S) DRY BOARD — skip $((skips+1))/11, no model call" >> "$LOG"
  rmdir "$LOCKDIR" 2>/dev/null
  exit 0
fi
echo 0 > "$SKIPCOUNT_F"

FIRE_MODEL=${FIRE_MODEL:-claude-opus-5}
echo "[fire-runner] $(date +%H:%M:%S) FIRE START (model $FIRE_MODEL)" >> "$LOG"
"$CLAUDE_BIN" -p "$(cat scripts/fire.md)" \
  --model "$FIRE_MODEL" \
  >> "$LOG" 2>&1
RC=$?
echo "[fire-runner] $(date +%H:%M:%S) FIRE END rc=$RC" >> "$LOG"
# THE ALT FALLBACK (owner-authorized 2026-07-25: the brainstem tank, 97% headroom): a weekly-wall bounce retries once on the alt subscription.
if [ "$RC" != "0" ] && tail -4 "$LOG" | grep -qi "weekly limit"; then
  echo "[fire-runner] $(date +%H:%M:%S) WALL on primary — ALT FIRE (config ~/.claude-alt)" >> "$LOG"
  CLAUDE_CONFIG_DIR="$HOME/.claude-alt" "$CLAUDE_BIN" -p "$(cat scripts/fire.md)" --model "$FIRE_MODEL" >> "$LOG" 2>&1
  RC=$?
  echo "[fire-runner] $(date +%H:%M:%S) ALT FIRE END rc=$RC" >> "$LOG"
fi

# keep 14 days of logs
find logs -name 'fire-*.log' -mtime +14 -delete 2>/dev/null
exit 0
