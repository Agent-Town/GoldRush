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

echo "[fire-runner] $(date +%H:%M:%S) FIRE START (model claude-opus-4-8)" >> "$LOG"
"$CLAUDE_BIN" -p "$(cat scripts/fire.md)" \
  --model claude-opus-4-8 \
  >> "$LOG" 2>&1
RC=$?
echo "[fire-runner] $(date +%H:%M:%S) FIRE END rc=$RC" >> "$LOG"

# keep 14 days of logs
find logs -name 'fire-*.log' -mtime +14 -delete 2>/dev/null
exit 0
