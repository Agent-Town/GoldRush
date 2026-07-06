#!/usr/bin/env bash
# Gold Rush factory dashboard — regenerates logs/dashboard.html (self-refreshing page).
# Deterministic, read-only, no AI. Run by com.goldrush.dashboard.plist every 60s.
# v2: queue-entry times + ages, in-flight elapsed, done durations (owner ask 2026-07-06).
set -u
ROOT="/Users/robin/Claude/Projects/Gold Rush"
cd "$ROOT" || exit 1
OUT="logs/dashboard.html"
mkdir -p logs

esc() { sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g'; }
NOW_EPOCH=$(date +%s)
mins_ago() { echo $(( (NOW_EPOCH - $1) / 60 )); }
stamp_to_epoch() { date -j -f '%Y%m%d-%H%M%S' "$1" +%s 2>/dev/null || echo 0; }

NOW=$(date '+%H:%M:%S'); TODAY=$(date '+%Y-%m-%d')
LOCK=$(head -1 STATUS.md | cut -c1-300 | esc)
RUNNER_STATE=$(pgrep -f "[l]ane-runner-v3.sh" >/dev/null 2>&1 && echo "ALIVE" || echo "DOWN")
FIRE_STATE=$(pgrep -f "claude -p # Gold Rush FIRE" >/dev/null 2>&1 && echo "FIRING NOW" || echo "between fires")

# --- Now building: slot--YYYYMMDD-HHMMSS-name markers -> elapsed ---
RUNNING=""
for m in tasks/running/*--*; do
  [ -e "$m" ] || continue
  base=$(basename "$m"); [ "${base##*.}" = "pid" ] && continue
  slot=${base%%--*}; rest=${base#*--}; stamp=$(echo "$rest" | cut -c1-15); name=${rest:16}
  se=$(stamp_to_epoch "$stamp")
  el=$([ "$se" -gt 0 ] && mins_ago "$se" || echo "?")
  RUNNING="$RUNNING$(printf '%-7s %-52s started %s   %s min in' "$slot" "${name%.md}" "$(echo "$stamp" | cut -c10-11):$(echo "$stamp" | cut -c12-13)" "$el")
"
done
[ -z "$RUNNING" ] && RUNNING="(all slots idle)"
RUNNING=$(printf '%s' "$RUNNING" | esc)

# --- Queues: entry time (file mtime) + age ---
QUEUES=""
for q in main lane-a lane-b lane-c lane-d art; do
  LINE=""
  for f in tasks/queue/$q/*.md; do
    [ -e "$f" ] || continue
    mt=$(stat -f %m "$f" 2>/dev/null || echo "$NOW_EPOCH")
    LINE="$LINE$(printf '  %-52s queued %s  (%s min waiting)' "$(basename "${f%.md}")" "$(date -r "$mt" +%H:%M)" "$(mins_ago "$mt")")
"
  done
  [ -z "$LINE" ] && LINE="  —
"
  QUEUES="$QUEUES$q:
$LINE"
done
QUEUES=$(printf '%s' "$QUEUES" | esc)

# --- Done: start stamp from filename, finish = mtime, duration ---
DONE_TAIL=""
for f in $(ls -t tasks/done/ 2>/dev/null | head -10); do
  stamp=$(echo "$f" | cut -c1-15); name=$(echo "$f" | cut -c17- | sed 's/\.md$//')
  se=$(stamp_to_epoch "$stamp"); mt=$(stat -f %m "tasks/done/$f" 2>/dev/null || echo 0)
  if [ "$se" -gt 0 ] && [ "$mt" -gt 0 ]; then
    dur=$(( (mt - se) / 60 ))
    DONE_TAIL="$DONE_TAIL$(printf '%-56s started %s  took %3s min' "$name" "$(echo "$stamp" | cut -c10-11):$(echo "$stamp" | cut -c12-13)" "$dur")
"
  else
    DONE_TAIL="$DONE_TAIL$name
"
  fi
done
DONE_TAIL=$(printf '%s' "$DONE_TAIL" | esc)

# --- Waiting to start: paused items + gated BACKLOG ladder, with tracked block-age ---
SEEN="logs/.blocked-seen"
touch "$SEEN"
BLOCKED=""
for f in tasks/queue-paused/*.md; do
  [ -e "$f" ] || continue
  mt=$(stat -f %m "$f" 2>/dev/null || echo "$NOW_EPOCH")
  BLOCKED="$BLOCKED$(printf '%-62s PAUSED (throttle/wall)  %4s min' "$(basename "${f%.md}")" "$(mins_ago "$mt")")
"
done
while IFS= read -r line; do
  txt=$(echo "$line" | sed 's/^[0-9b.]*\. *//; s/\*\*//g; s/^- *//' | cut -c1-100)
  h=$(echo "$txt" | shasum | cut -c1-10)
  first=$(grep "^$h " "$SEEN" 2>/dev/null | head -1 | awk '{print $2}')
  if [ -z "${first:-}" ]; then first=$NOW_EPOCH; echo "$h $first" >> "$SEEN"; fi
  BLOCKED="$BLOCKED$(printf '%s
    ⏳ blocked %s min (tracked since first sighting)' "$txt" "$(mins_ago "$first")")
"
done < <(grep -E 'GATE:|AUTHOR (after|from)' tasks/BACKLOG.md 2>/dev/null | grep -v '^#')
[ -z "$BLOCKED" ] && BLOCKED="(nothing blocked — everything startable is queued or running)"
BLOCKED=$(printf '%s' "$BLOCKED" | esc)

# --- Owner's desk: items blocking on Robin (OWNER: lines in BACKLOG.md) ---
OWNERS=""
while IFS= read -r line; do
  txt=$(echo "$line" | sed 's/^OWNER: *//' | cut -c1-105)
  h=$(echo "$txt" | shasum | cut -c1-10)
  first=$(grep "^$h " "$SEEN" 2>/dev/null | head -1 | awk '{print $2}')
  if [ -z "${first:-}" ]; then first=$NOW_EPOCH; echo "$h $first" >> "$SEEN"; fi
  OWNERS="$OWNERS$(printf '• %s   ⏳ %s min' "$txt" "$(mins_ago "$first")")
"
done < <(grep '^OWNER:' tasks/BACKLOG.md 2>/dev/null)
[ -z "$OWNERS" ] && OWNERS="(nothing waiting on you)"
OWNERS=$(printf '%s' "$OWNERS" | esc)

LANES=""
for b in lane/m3 lane/m4 lane/polish lane/perf lane/m6-r3a-apply save/w1-04-scatter save/demo-profiles-v1 save/m4-embodiment-voice-v1; do
  N=$(git log --oneline "main..$b" 2>/dev/null | wc -l | tr -d ' ')
  if [ "${N:-0}" != "0" ]; then
    AGE=$(git log -1 --format=%ct "$b" 2>/dev/null || echo "$NOW_EPOCH")
    SUBJ=$(git log "main..$b" --format='%s' 2>/dev/null | head -1 | cut -c1-80)
    LANES="$LANES$(printf '%-28s [%s commit(s), newest %s min ago]  %s' "$b" "$N" "$(mins_ago "$AGE")" "$SUBJ")
"
  fi
done
[ -z "$LANES" ] && LANES="(nothing waiting — all lane work merged)"
ARCH=$(git branch --list 'archive/*' 2>/dev/null | wc -l | tr -d ' ')
[ "${ARCH:-0}" != "0" ] && LANES="$LANES
(+ $ARCH archived salvage branch(es) — superseded by shipped re-lands; reference only, NOT waiting)"
LANES=$(printf '%s' "$LANES" | esc)

MERGES=$(git log --oneline -14 --format='%h  %cr — %s' | grep -viE 'lock ACTIVE|handoff|bookkeeping|lock CLEARED' | head -8 | cut -c1-120 | esc)
FAILED_TAIL=$(ls -t tasks/failed/ 2>/dev/null | head -3 | esc)
PENDING=$(ls assets/crafting-queue/pending/ 2>/dev/null | grep -c '\.json$')
ALERTS=$(grep 'ALERT' logs/health.log 2>/dev/null | tail -5 | cut -c1-130 | esc)
[ -z "$ALERTS" ] && ALERTS="(no alerts)"
FIRELOG=$(tail -3 "logs/fire-$(date +%Y%m%d).log" 2>/dev/null | cut -c1-130 | esc)

cat > "$OUT" <<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="30">
<title>Gold Rush — Factory Ledger</title>
<style>
  body { background:#f5e6c8; color:#2b2119; font-family:Georgia,'Iowan Old Style',serif; margin:24px auto; max-width:1040px; }
  h1 { font-size:26px; border-bottom:3px double #2b2119; padding-bottom:6px; }
  h1 small { font-size:13px; color:#6b5b46; float:right; margin-top:12px; }
  h2 { font-size:15px; text-transform:uppercase; letter-spacing:2px; color:#6b5b46; margin:22px 0 6px; }
  .card { background:#fdf6e3; border:1px solid #c9b892; border-radius:6px; padding:10px 14px; box-shadow:2px 2px 0 #c9b892; }
  pre { margin:0; font-family:'SF Mono',Menlo,monospace; font-size:12px; line-height:1.55; white-space:pre-wrap; word-break:break-word; }
  .row { display:flex; gap:14px; flex-wrap:wrap; }
  .row .card { flex:1; min-width:300px; }
  .ok { color:#1a6b4a; font-weight:bold; } .bad { color:#a03020; font-weight:bold; } .dim { color:#6b5b46; }
</style>
</head>
<body>
<h1>⛏ Gold Rush — Factory Ledger <small>refreshed $TODAY $NOW · auto-reloads every 30s</small></h1>

<div class="row">
  <div class="card"><h2 style="margin-top:0">Machines</h2><pre>
runner  <span class="$( [ "$RUNNER_STATE" = ALIVE ] && echo ok || echo bad )">$RUNNER_STATE</span>
fires   <span class="ok">$FIRE_STATE</span> (every 5 min)
pending crafting orders: $PENDING</pre></div>
  <div class="card"><h2 style="margin-top:0">Now building (Codex)</h2><pre>$RUNNING</pre></div>
</div>

<h2>Waiting to merge (branches ahead of main — drain/salvage list)</h2>
<div class="card"><pre>$LANES</pre></div>

<h2>Recently merged into the game</h2>
<div class="card"><pre>$MERGES</pre></div>

<h2>Queues — what's waiting, since when</h2>
<div class="card"><pre>$QUEUES</pre></div>

<h2>Waiting to start — blockers &amp; tracked block time</h2>
<div class="card"><pre>$BLOCKED</pre></div>

<h2>Owner's desk — waiting on Robin</h2>
<div class="card" style="border-color:#a03020"><pre>$OWNERS</pre></div>

<div class="row">
  <div class="card"><h2 style="margin-top:0">Recently finished (start → duration)</h2><pre>$DONE_TAIL</pre></div>
  <div class="card"><h2 style="margin-top:0">Watchdog alerts</h2><pre>$ALERTS</pre>
  <h2>Failed (tail)</h2><pre>${FAILED_TAIL:-"(none)"}</pre></div>
</div>

<h2>Orchestrator lock (STATUS.md line 1)</h2>
<div class="card"><pre class="dim">$LOCK</pre></div>

<h2>Fire log (tail)</h2>
<div class="card"><pre class="dim">$FIRELOG</pre></div>

<p class="dim" style="margin-top:18px;font-size:12px">Read-only ledger view. Sources: git, tasks/, logs/. Generated by scripts/dashboard-gen.sh — no AI, no writes.</p>
</body>
</html>
HTML

echo "[dashboard] $(date '+%F %T') regenerated" >> logs/health.log
