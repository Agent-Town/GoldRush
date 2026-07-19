#!/usr/bin/env bash
# Gold Rush factory dashboard — regenerates logs/dashboard.html (self-refreshing page).
# Deterministic, read-only, no AI. Run by com.goldrush.dashboard.plist every 60s.
# v2: queue-entry times + ages, in-flight elapsed, done durations (owner ask 2026-07-06).
set -u
ROOT="${GOLD_RUSH_ROOT:-/Users/robin/Claude/Projects/Gold Rush}"
cd "$ROOT" || exit 1
OUT="${GOLD_RUSH_DASHBOARD_OUT:-logs/dashboard.html}"
GOAL_TREE_TMP="${GOLD_RUSH_GOAL_TREE_TMP:-logs/.goal-tree.html}"
HEALTH_LOG="${GOLD_RUSH_HEALTH_LOG:-logs/health.log}"
NODE_BIN="${GOLD_RUSH_NODE_BIN:-}"
if [ -z "$NODE_BIN" ]; then
  for candidate in "$(command -v node 2>/dev/null || true)" /opt/homebrew/bin/node /usr/local/bin/node; do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then NODE_BIN="$candidate"; break; fi
  done
fi
[ -x "${NODE_BIN:-}" ] || { echo "[dashboard] node not found" >&2; exit 1; }
mkdir -p logs "$(dirname "$OUT")" "$(dirname "$GOAL_TREE_TMP")" "$(dirname "$HEALTH_LOG")"

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
    elif git log main --format='%h' --fixed-strings --grep="$committed" -1 2>/dev/null | grep -q .; then
      # grafted drains aren't ancestors, but drain commits cite the lane hash
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


# --- All-time task statistics (owner-requested 2026-07-19: token + duration fun stats) ---
STATS_TABLE=""
TOT_RUNS=0; TOT_TOK=0; TOT_MIN=0
STATS_TMP=$(mktemp)
for f in tasks/runs/*.log; do
  [ -e "$f" ] || continue
  base=$(basename "$f" .md.log); base=${base%.log}
  ts=$(echo "$base" | grep -oE '^[0-9]{8}-[0-9]{6}') || true
  start_epoch=""
  [ -n "$ts" ] && start_epoch=$(date -j -f "%Y%m%d-%H%M%S" "$ts" +%s 2>/dev/null || true)
  end_epoch=$(stat -f %m "$f" 2>/dev/null || echo "")
  mins=""
  if [ -n "$start_epoch" ] && [ -n "$end_epoch" ] && [ "$end_epoch" -ge "$start_epoch" ]; then
    mins=$(( (end_epoch - start_epoch) / 60 ))
  fi
  tok=$(grep -A1 "tokens used" "$f" 2>/dev/null | tail -1 | tr -d ', ' | grep -E '^[0-9]+$' || echo "")
  name=$(echo "$base" | sed 's/^[0-9]\{8\}-[0-9]\{6\}-//' | cut -c1-46)
  TOT_RUNS=$((TOT_RUNS+1))
  [ -n "$tok" ] && TOT_TOK=$((TOT_TOK+tok))
  [ -n "$mins" ] && TOT_MIN=$((TOT_MIN+mins))
  printf '%s|%s|%s\n' "${tok:-0}" "${mins:-0}" "$name" >> "$STATS_TMP"
done
TOP_TOK=$(sort -t'|' -k1 -rn "$STATS_TMP" | head -8 | awk -F'|' '{printf "  %-48s %10'"'"'d tok  %5d min\n", $3, $1, $2}')
TOP_MIN=$(sort -t'|' -k2 -rn "$STATS_TMP" | head -8 | awk -F'|' '{printf "  %-48s %10'"'"'d tok  %5d min\n", $3, $1, $2}')
rm -f "$STATS_TMP"
STATS_TABLE=$(printf 'ALL-TIME: %d task runs · %d hours %d min of implementer time · %'"'"'d tokens consumed (codex-reported)\n\nTHE HUNGRIEST (tokens):\n%s\n\nTHE LONGEST (wall clock):\n%s' "$TOT_RUNS" $((TOT_MIN/60)) $((TOT_MIN%60)) "$TOT_TOK" "$TOP_TOK" "$TOP_MIN")
STATS_TABLE=$(printf '%s' "$STATS_TABLE" | esc)

FACTORY_BLOCK=$(node -e '
try { const a=require("./logs/factory-usage.json"); const M=n=>(n/1e6).toFixed(1)+"M";
console.log(`THE WHOLE FACTORY (census ${a.stamped}):`);
console.log(`  attended (Fable):        ${String(a.attended.files).padStart(5)} sessions   fresh-in ${M(a.attended.in).padStart(9)}   out ${M(a.attended.out)}`);
console.log(`  fires (headless):        ${String(a.fires.files).padStart(5)} sessions*  fresh-in ${M(a.fires.in).padStart(9)}   out ${M(a.fires.out)}   *older fires undercounted`);
console.log(`  codex (Sol+runner):      ${String(a.codexGR.files).padStart(5)} sessions   fresh-in ${M(a.codexGR.in).padStart(9)}   out ${M(a.codexGR.out)}   (+${(a.codexGR.cached/1e9).toFixed(1)}B cached reads)`);
const ti=a.attended.in+a.fires.in+a.codexGR.in, to=a.attended.out+a.fires.out+a.codexGR.out;
console.log(`  TOTAL:                   fresh-in ${M(ti)} · out ${M(to)} — refresh: node scripts/factory-usage-census.mjs`);
} catch(e) { console.log("(factory census not yet run: node scripts/factory-usage-census.mjs)"); }' 2>/dev/null)
STATS_TABLE="$STATS_TABLE

$(printf '%s' "$FACTORY_BLOCK" | esc)"


# --- Waiting to start: paused items + gated BACKLOG ladder, with tracked block-age ---
SEEN="${GOLD_RUSH_BLOCKED_SEEN:-logs/.blocked-seen}"
mkdir -p "$(dirname "$SEEN")"
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
ALERTS=$(grep 'ALERT' "$HEALTH_LOG" 2>/dev/null | tail -5 | cut -c1-130 | esc)
[ -z "$ALERTS" ] && ALERTS="(no alerts)"
FIRELOG=$(tail -3 "logs/fire-$(date +%Y%m%d).log" 2>/dev/null | cut -c1-130 | esc)

# --- Goal tree: repo-authored plan + filesystem/git-derived leaf status ---
"$NODE_BIN" <<'NODE' > "$GOAL_TREE_TMP" || exit 1
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const data = JSON.parse(fs.readFileSync('tasks/goals.json', 'utf8'));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const filesUnder = (dir) => fs.existsSync(dir)
  ? fs.readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => path.basename(entry.name))
  : [];
const doneFiles = filesUnder('tasks/done');
const runningFiles = filesUnder('tasks/running');
const queuedFiles = filesUnder('tasks/queue');
const matches = (files, taskFile) => files.some((file) => file === taskFile || file.endsWith(`-${taskFile}`));
const ancestry = new Map();
const isMerged = (hash) => {
  if (!hash) return false;
  if (!ancestry.has(hash)) {
    ancestry.set(hash, spawnSync('git', ['merge-base', '--is-ancestor', hash, 'main']).status === 0);
  }
  return ancestry.get(hash);
};
const resolvedStatus = (task) => {
  if (task.status === 'verified-by-owner') return task.status;
  const hasDoneReceipt = !task.taskFile || matches(doneFiles, task.taskFile);
  if (task.mergeHash && hasDoneReceipt && isMerged(task.mergeHash)) return 'merged';
  if (task.taskFile && matches(runningFiles, task.taskFile)) return 'building';
  if (task.taskFile && matches(queuedFiles, task.taskFile)) return 'queued';
  return task.status === 'merged' ? 'planned' : task.status;
};
const done = (status) => status === 'merged' || status === 'verified-by-owner';
const label = (status) => ({
  planned: 'planned', queued: 'queued', building: 'building', merged: 'merged',
  'verified-by-owner': 'owner verified',
})[status];

let html = '';
data.goals.forEach((goal, goalIndex) => {
  const allTasks = goal.subgoals.flatMap((subgoal) => subgoal.tasks);
  const goalDone = allTasks.filter((task) => done(resolvedStatus(task))).length;
  html += `<details class="goal"${goalIndex === 0 ? ' open' : ''}><summary><span>${escapeHtml(goal.title)}</span><strong>${goalDone}/${allTasks.length}</strong></summary>`;
  for (const subgoal of goal.subgoals) {
    const statuses = subgoal.tasks.map(resolvedStatus);
    const completed = statuses.filter(done).length;
    html += `<details class="subgoal"><summary><span>${escapeHtml(subgoal.title)}</span><span class="progress-copy">${completed}/${subgoal.tasks.length}</span><progress aria-label="${escapeHtml(subgoal.title)} progress" max="${subgoal.tasks.length}" value="${completed}"></progress></summary><ul>`;
    subgoal.tasks.forEach((task, index) => {
      const status = statuses[index];
      const hash = task.mergeHash && isMerged(task.mergeHash) ? `<code title="ancestry verified on main">${escapeHtml(task.mergeHash.slice(0, 8))}</code>` : '';
      html += `<li data-task-id="${escapeHtml(task.id)}" data-status="${status}"><span>${escapeHtml(task.title)}</span><span class="leaf-meta"><span class="status status-${status}">${label(status)}</span>${hash}</span></li>`;
    });
    html += '</ul></details>';
  }
  html += '</details>';
});
process.stdout.write(html);
NODE
GOAL_TREE=$(<"$GOAL_TREE_TMP")

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
  .goal-tree { padding:0; overflow:hidden; }
  details summary { cursor:pointer; }
  .goal > summary { display:flex; justify-content:space-between; gap:16px; padding:12px 14px; background:#e8d5a8; font-size:17px; }
  .goal + .goal { border-top:1px solid #c9b892; }
  .goal > summary strong { color:#5b8a8a; font-size:14px; }
  .subgoal { margin:8px 14px; border-left:3px solid #8b7d3c; padding-left:10px; }
  .subgoal > summary { display:grid; grid-template-columns:minmax(180px,1fr) auto minmax(120px,220px); align-items:center; gap:10px; padding:5px 0; }
  .progress-copy { color:#6b5b46; font-size:12px; }
  progress { width:100%; height:10px; accent-color:#5b8a8a; }
  .subgoal ul { list-style:none; margin:4px 0 10px; padding:0; }
  .subgoal li { display:flex; justify-content:space-between; gap:12px; padding:5px 8px; border-top:1px dotted #d8c8a5; font-size:13px; }
  .leaf-meta { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .leaf-meta code { color:#6b5b46; font-size:11px; }
  .status { min-width:78px; text-align:center; border:1px solid #c9b892; border-radius:3px; padding:1px 5px; font:11px 'SF Mono',Menlo,monospace; }
  .status-merged, .status-verified-by-owner { color:#1a6b4a; border-color:#5b8a8a; background:#edf5ed; }
  .status-building { color:#7b5317; border-color:#c4883a; background:#fff1c9; }
  .status-queued { color:#315d66; border-color:#5b8a8a; background:#e6f2f2; }
  .status-planned { color:#6b5b46; background:#f5ead3; }
  @media (max-width:650px) {
    body { margin:12px; }
    .subgoal > summary { grid-template-columns:1fr auto; }
    .subgoal progress { grid-column:1 / -1; }
    .subgoal li { align-items:flex-start; flex-direction:column; }
    .leaf-meta { width:100%; justify-content:space-between; }
  }
</style>
</head>
<body>
<h1>⛏ Gold Rush — Factory Ledger <small>refreshed $TODAY $NOW · auto-reloads every 30s</small></h1>

<h2>The goal tree</h2>
<div class="card goal-tree" data-goal-tree>$GOAL_TREE</div>

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

<h2>All-time task statistics</h2>
<pre>$STATS_TABLE</pre>
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

<p class="dim" style="margin-top:18px;font-size:12px">Read-only ledger view. Sources: git, tasks/goals.json, tasks/, logs/. Generated by scripts/dashboard-gen.sh — no AI, no writes.</p>
</body>
</html>
HTML

echo "[dashboard] $(date '+%F %T') regenerated" >> "$HEALTH_LOG"
