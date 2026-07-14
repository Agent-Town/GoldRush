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
  RMODEL=$(grep -m1 '^CODEX:' "$m" 2>/dev/null | sed -E 's/^CODEX: *model=([^ ]+) *effort=([^ ]+).*/[\1@\2]/')
  [ -z "$RMODEL" ] && RMODEL='[gpt-5.6-sol@medium·default]'
  RUNNING="$RUNNING$(printf '%-7s %-46s %s started %s   %s min in' "$slot" "${name%.md}" "$RMODEL" "$(echo "$stamp" | cut -c10-11):$(echo "$stamp" | cut -c12-13)" "$el")
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

# --- Done: real start/finish, model, and outcome for the last 24h ---
DONE_TAIL=""
for path in $(find tasks/done -type f -mtime -1 -print 2>/dev/null | sort -r); do
  f=$(basename "$path")
  stamp=$(echo "$f" | cut -c1-15); taskfile=$(echo "$f" | cut -c17-); name=${taskfile%.md}
  mt=$(stat -f %m "$path" 2>/dev/null || echo 0)
  if echo "$stamp" | grep -qE '^[0-9]{8}-[0-9]{6}$'; then
    se=$(stamp_to_epoch "$stamp"); start_hm="$(echo "$stamp" | cut -c10-11):$(echo "$stamp" | cut -c12-13)"
  else
    # janitor receipts etc. carry no timestamp prefix — show mtime, keep the full name
    se=0; name=${f%.md}; name=${name%.req}; start_hm=$(date -r "$mt" +%H:%M 2>/dev/null || echo '~')
  fi
  model=$(grep -m1 '^CODEX:' "$path" 2>/dev/null | sed -E 's/^CODEX: *model=([^ ]+) *effort=([^ ]+).*/\1@\2/')
  [ -z "$model" ] && model='gpt-5.6-sol@medium·default'
  duration='~'
  if [ "$se" -gt 0 ] && [ "$mt" -gt "$se" ]; then
    seconds=$((mt - se))
    duration="$(( (seconds + 59) / 60 )) min"
  fi
  runlog=$(find tasks/runs -name "$stamp-*-$taskfile.log" -print 2>/dev/null | head -1)
  if { [ "$duration" = '~' ] || [ "$duration" = '0 min' ]; } && [ -n "$runlog" ]; then
    log_mt=$(stat -f %m "$runlog" 2>/dev/null || echo 0)
    [ "$log_mt" -gt "$se" ] && duration="$(( (log_mt - se + 59) / 60 )) min"
    first=$(grep -m1 -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}' "$runlog" 2>/dev/null | tr 'T' ' ')
    last=$(grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}' "$runlog" 2>/dev/null | tail -1 | tr 'T' ' ')
    fe=$(date -j -f '%Y-%m-%d %H:%M:%S' "$first" +%s 2>/dev/null || echo 0)
    le=$(date -j -f '%Y-%m-%d %H:%M:%S' "$last" +%s 2>/dev/null || echo 0)
    [ "$duration" = '~' ] && [ "$le" -gt "$fe" ] && duration="$(( (le - fe + 59) / 60 )) min"
  fi
  failed=$(find tasks/failed -type f -name "*$name*.md" -print -quit 2>/dev/null)
  runner_commit=$(git log --all --format='%H' --fixed-strings --grep="runner(" --grep="$name.md" --all-match -1 2>/dev/null)
  merged=""
  committed=""
  if [ -n "$runner_commit" ]; then
    committed=$(git rev-parse --short "$runner_commit")
    if git merge-base --is-ancestor "$runner_commit" main 2>/dev/null; then
      merged="$committed"
    fi
  else
    # main-slot tasks have no runner commit: fall back to a slice-scoped subject on main
    merged=$(git log main --format='%h' -E --grep="^(feat|fix|art|drain)[:( ].*$name" -1 2>/dev/null)
    committed=$merged
  fi
  if [ -n "$failed" ]; then outcome='FAILED';
  elif [ -n "$merged" ]; then outcome="MERGED $merged";
  elif [ -n "$committed" ]; then outcome='done-moved awaiting drain';
  else outcome='NO-OP'; fi
  DONE_TAIL="$DONE_TAIL$(printf '%-42s · started %s · %7s · %-31s · %s' "$name" "$start_hm" "$duration" "$model" "$outcome")
"
done
[ -z "$DONE_TAIL" ] && DONE_TAIL="(no task runs finished in the last 24 hours)"
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
RETIRED=""
for b in lane/m3 lane/m4 lane/polish lane/perf lane/m6-r3a-apply save/w1-04-scatter save/demo-profiles-v1 save/m4-embodiment-voice-v1; do
  N=$(git log --oneline "main..$b" 2>/dev/null | wc -l | tr -d ' ')
  if [ "${N:-0}" != "0" ]; then
    AGE=$(git log -1 --format=%ct "$b" 2>/dev/null || echo "$NOW_EPOCH")
    SUBJ=$(git log "main..$b" --format='%s' 2>/dev/null | head -1 | cut -c1-80)
    # s334: show WHICH MODEL ran the job — resolve the task md from the commit subject, read its CODEX header (absent = the runner default).
    TASKMD=$(printf '%s' "$SUBJ" | grep -oE '[A-Za-z0-9_-]+\.md' | head -1)
    MODEL=""
    if [ -n "$TASKMD" ] && [ -f "tasks/$TASKMD" ]; then
      MODEL=$(grep -m1 '^CODEX:' "tasks/$TASKMD" 2>/dev/null | sed -E 's/^CODEX: *model=([^ ]+) *effort=([^ ]+).*/[\1@\2]/')
    fi
    [ -z "$MODEL" ] && case "$SUBJ" in runner*) MODEL='[gpt-5.6-sol@medium·default]';; *) MODEL='[attended/fire]';; esac
    CHERRY=$(git cherry main "$b" 2>/dev/null)
    if [ -n "$CHERRY" ] && ! printf '%s\n' "$CHERRY" | grep -q '^+'; then
      RETIRED="$RETIRED$(printf '%-28s MERGED, branch retirement pending' "$b")
"
    else
      LANES="$LANES$(printf '%-28s [%s commit(s), newest %s min ago]  %s  %s' "$b" "$N" "$(mins_ago "$AGE")" "$SUBJ" "$MODEL")
"
    fi
  fi
done
[ -z "$LANES" ] && LANES="(nothing waiting — all lane work merged)"
ARCH=$(git branch --list 'archive/*' 2>/dev/null | wc -l | tr -d ' ')
[ "${ARCH:-0}" != "0" ] && LANES="$LANES
(+ $ARCH archived salvage branch(es) — superseded by shipped re-lands; reference only, NOT waiting)"
LANES=$(printf '%s' "$LANES" | esc)

MERGES=$(git log -40 --format='%h  %cr — %s' | grep -E '— (feat|fix|art|drain)[:( ]' | grep -viE 'task:|queued|backlog|chore:' | head -8 | cut -c1-120 | esc)
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

<h2>What really happened (last 24h)</h2>
<div class="card"><pre>$DONE_TAIL</pre></div>

<div class="row">
  <div class="card"><h2 style="margin-top:0">Machines</h2><pre>
runner  <span class="$( [ "$RUNNER_STATE" = ALIVE ] && echo ok || echo bad )">$RUNNER_STATE</span>
fires   <span class="ok">$FIRE_STATE</span> (every 5 min)
pending crafting orders: $PENDING</pre></div>
  <div class="card"><h2 style="margin-top:0">Now building (Codex)</h2><pre>$RUNNING</pre></div>
</div>

<h2>Waiting to merge (branches ahead of main — drain/salvage list)</h2>
<div class="card"><pre>$LANES</pre></div>

<h2>Merged, branch retirement pending</h2>
<div class="card"><pre>${RETIRED:-"(none)"}</pre></div>

<h2>Recently merged into the game</h2>
<div class="card"><pre>$MERGES</pre></div>

<h2>Queues — what's waiting, since when</h2>
<div class="card"><pre>$QUEUES</pre></div>

<h2>Waiting to start — blockers &amp; tracked block time</h2>
<div class="card"><pre>$BLOCKED</pre></div>

<h2>Owner's desk — waiting on Robin</h2>
<div class="card" style="border-color:#a03020"><pre>$OWNERS</pre></div>

<div class="row">
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
