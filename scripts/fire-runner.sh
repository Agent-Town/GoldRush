#!/bin/bash
# Gold Rush fire runner — invoked by launchd every 5 min (StartInterval 300, com.goldrush.fire.plist).
# Runs one headless Claude Code fire with the protocol in scripts/fire.md; the model is FIRE_MODEL below (default claude-opus-5 — that default is the truth, not this comment).
# Single-instance guarded: a tick landing on a live fire exits silently, so a NEW fire begins only once the previous one ends — and the dry-board guard below suppresses ticks too, so the launchd interval is the FLOOR and not the cadence. RE-MEASURED s2632 over 1404 inter-FIRE-START gaps on the 34 days that guard was active: min 5m01s, median 35m15s, p90 84m51s, 39.6% at or over 50 min (was: measured s1358 over 58 gaps, min 5.3 min, median 22.8 min — RESTATED not deleted, the sequence is the finding). Logs to logs/fire-YYYYMMDD.log. Manual run: bash scripts/fire-runner.sh
set -u
REPO="/Users/robin/Claude/Projects/Gold Rush"
LOCKDIR="$REPO/tasks/.fire.lock"
cd "$REPO" || exit 1
mkdir -p logs
LOG="logs/fire-$(date +%Y%m%d).log"

# FIRE AUTH (owner-minted subscription token, 2026-08-05): launchd cannot unlock the keychain
# the interactive CLI uses, so headless fires authenticate via CLAUDE_CODE_OAUTH_TOKEN from
# .env.local (chmod 600; same file deploy.sh already sources for CF). Never echo values here.
if [ -f "$REPO/.env.local" ]; then set -a; . "$REPO/.env.local"; set +a; fi

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
# F-1536-1 (s1536): resolve the lanes from git, NEVER from a hardcoded list. The old
# list (lane/m3 lane/m4 lane/e2-arsenal lane/perf) outlived the lanes it named; m3/m4
# sit permanently ahead of main as absorbed-but-never-fast-forwarded dupes, so this
# loop forced dry=0 on every tick and the skip below was unreachable for 7 days.
# Fail OPEN in both doubt cases (helper missing, or no lane worktree resolved):
# "any doubt runs the fire" is this guard's stated philosophy.
if [ -r scripts/lane-branches.sh ]; then
  . scripts/lane-branches.sh
  LANE_BRANCHES="$(lane_branches)"
  if [ -z "$LANE_BRANCHES" ]; then
    dry=0
  else
    for b in $LANE_BRANCHES; do
      [ "$(git rev-list --count "origin/main..$b" 2>/dev/null || echo 1)" != "0" ] && dry=0
    done
  fi
else
  dry=0
fi
[ -n "$(find tasks/done -type f -mmin -60 2>/dev/null | head -1)" ] && dry=0
# F-2632-1 (s2632): the literal in the next line is DEAD, and leaving it dead is DELIBERATE.
# DO NOT "repair" it without the ruling on desk F-2632-2 — the naive fix is the destructive act.
# A §1.2 lock line reads `ACTIVE <stamp> (sNNNN fire) — <intent>` and carries no "lock ACTIVE",
# so this grep misses ~96.5% of real lock line-1s on two independent denominators (18/500 and
# 33/1017 matched). It is the THIRD member of the class lane-runner-v3.sh cured at F-1402-1 and
# health-watch.sh at F-1659-2, and it was never brought along.
# WHY NOT FIX IT: the single-instance LOCKDIR above makes a tick exit silently while a fire is
# live, so this line is reachable only on a DRY board, in two states — a STRANDED line-1 (where a
# working predicate buys prompt takeover; the delay costs bookkeeping only, nothing is starved) and
# a LIVE fire past the 50-min stale-lock reap (where a working predicate boots a SECOND fire
# alongside it: measured 207 of 5383 runs, 3.8%, outran that window). So the dead literal PREVENTS
# the concurrency hazard and merely DELAYS the takeover. The surgical answer is the house predicate
# AND `! fire_proc` (health-watch.sh:52), but that is boot policy on the owner's metered budget and
# this guard is owner-prompted for that very reason — his call. Full derivation: F-2632-1.
head -1 STATUS.md 2>/dev/null | grep -qE '^ACTIVE|lock ACTIVE| ACTIVE \(s[0-9]+ fire\)' && dry=0   # F-2632-2 (owner 2026-09-19 "housekeeping ok"): all three lock line-1 shapes, not the literal that matched 3.6% of real locks since 2026-08-05
if [ "$dry" = "1" ] && [ "$skips" -lt 11 ]; then
  echo $((skips+1)) > "$SKIPCOUNT_F"
  echo "[fire-runner] $(date +%H:%M:%S) DRY BOARD — skip $((skips+1))/11, no model call" >> "$LOG"
  rmdir "$LOCKDIR" 2>/dev/null
  exit 0
fi
echo 0 > "$SKIPCOUNT_F"

FIRE_MODEL=${FIRE_MODEL:-claude-opus-5}
# FIRE ENGINE SWITCH (owner 2026-08-12, verbatim: "could we switch the fires to be GPT 5.6 Sol
# xhigh instead of Opus? The Anthropic subscription is running low and will only be replenished
# on Saturday.") — engine 'codex' rides the owner's OpenAI subscription via the codex CLI
# (model gpt-5.6-sol + xhigh from ~/.codex/config.toml). CLAUDE_CONFIG_DIR stays exported by
# launchd, so the fire-shell playwright serialization (F-1270-1) holds for either engine.
# REVERT SATURDAY: set FIRE_ENGINE=claude here or in the plist (the claude path below is intact).
# SWITCHED AGAIN 2026-09-04 (owner, verbatim: "Switch fires to Codex, we are going out of subscription very quickly."): default is codex until the owner says otherwise.
# SWITCHED BACK 2026-09-14 (owner, verbatim: "You can use the fires for that but don't use the ChatGPT
# subscription, only the Anthropic subscription."): default is claude — the primary fire config is
# ~/.claude-fires (launchd), the weekly-wall bounce is ~/.claude-alt; both are the owner's Anthropic
# account. The codex path below stays intact for a future owner word; tasks/CODEX-WALL (same date)
# keeps every lane queue empty so the idle Codex lane-runner has nothing to pick up.
FIRE_ENGINE=${FIRE_ENGINE:-claude}
if [ "$FIRE_ENGINE" = "codex" ]; then
  # Resolution PROBES, never trusts paths (F-1635-3 dual-install met again 2026-08-12, twice in
  # one hour): launchd's PATH finds an orphaned homebrew 0.133; nvm-v24's wrapper is half-installed
  # (native binary ENOENT); nvm-v23 carries the real 0.147+. A candidate qualifies only if
  # --version RUNS and reports >= CODEX_MIN (Sol's server floor). None qualify -> claude fallthrough.
  # F-CLI-1 (owner decision 3, 2026-09-05): the floor is now Astra's, not Sol's — gpt-6-astra (the
  # ~/.codex config model since 2026-09-05) is refused by anything older with a 400 "requires a newer
  # version of Codex", which is exactly how every fire from ~06:00 to 10:15 that day died (rc=1).
  CODEX_BIN=""; CODEX_MIN="0.153.0"
  for c in $(ls -1d "$HOME"/.nvm/versions/node/*/bin/codex 2>/dev/null | sort -rV) "$(command -v codex || true)" /opt/homebrew/bin/codex /usr/local/bin/codex; do
    { [ -n "$c" ] && [ -x "$c" ]; } || continue
    v=$("$c" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    [ -n "$v" ] && [ "$(printf '%s\n%s\n' "$CODEX_MIN" "$v" | sort -V | head -1)" = "$CODEX_MIN" ] && CODEX_BIN="$c" && break
  done
  if [ -n "$CODEX_BIN" ]; then
    echo "[fire-runner] $(date +%H:%M:%S) FIRE START (engine codex, model from ~/.codex config)" >> "$LOG"
    "$CODEX_BIN" exec --sandbox danger-full-access --skip-git-repo-check "$(cat scripts/fire.md)" >> "$LOG" 2>&1
    RC=$?
    echo "[fire-runner] $(date +%H:%M:%S) FIRE END rc=$RC (codex; ALT fallback is claude-only, skipped)" >> "$LOG"
    exit 0
  fi
  echo "[fire-runner] $(date +%H:%M:%S) codex binary missing — falling through to claude engine" >> "$LOG"
fi
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

# s1033 / F-1028-3: the 14-day fire-log prune REMOVED per CLAUDE.md §4.10b (THE RETENTION LAW,
# owner 2026-07-25: "We have to stop the pruning, our history is our strength").
# It was: find logs -name 'fire-*.log' -mtime +14 -delete 2>/dev/null
# This is the third and last of the three prunes §4.10b names as owed removal (lane-runner
# v2:77, v3:117, and this one) — all three removed in the s1033 fire.
# Fire logs are the factory's own memory of what each fire decided: exactly the untracked
# history the law protects. DO NOT RESTORE. Disk pressure is F-1027-2, on the owner's desk.
exit 0
