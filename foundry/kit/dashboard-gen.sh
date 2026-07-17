#!/usr/bin/env bash
# Foundry Kit factory dashboard — regenerates <dashboard.out> (self-refreshing page).
# Deterministic, read-only, no AI. Generalized from the Gold Rush dashboard (constants ->
# foundry.config.json; queue slots and lane/save branches discovered, never hardcoded).
# Run manually or on a timer (launchd/cron). macOS BSD stat/date assumed, as the original.
set -u
ROOT="${FOUNDRY_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT" || exit 1
CFG="$ROOT/foundry.config.json"

NODE_BIN="${FOUNDRY_NODE_BIN:-}"
if [ -z "$NODE_BIN" ]; then
  for candidate in "$(command -v node 2>/dev/null || true)" /opt/homebrew/bin/node /usr/local/bin/node; do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then NODE_BIN="$candidate"; break; fi
  done
fi
[ -x "${NODE_BIN:-}" ] || { echo "[dashboard] node not found" >&2; exit 1; }

cfg() {
  local v
  v=$("$NODE_BIN" -e '
    const c = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    const v = process.argv[2].split(".").reduce((o, k) => (o == null ? o : o[k]), c);
    if (v == null) process.exit(1);
    process.stdout.write(String(v));
  ' "$CFG" "$1" 2>/dev/null) || v=""
  if [ -n "$v" ]; then printf '%s\n' "$v"; else printf '%s\n' "$2"; fi
}

NAME="$(cfg name 'Foundry')"
OUT="$(cfg dashboard.out logs/dashboard.html)"
GOALS_FILE="$(cfg dashboard.goalsFile tasks/goals.json)"
PENDING_DIR="$(cfg dashboard.pendingDir '')"
REFRESH="$(cfg dashboard.refreshSeconds 30)"
CADENCE="$(cfg fire.cadenceSeconds 300)"
DEF_MODEL_LABEL="$(cfg runner.defaultModel gpt-5.6-sol)@$(cfg runner.defaultEffort medium)·default"
GOAL_TREE_TMP="logs/.goal-tree.html"
HEALTH_LOG="$(cfg health.logFile logs/health.log)"
mkdir -p logs "$(dirname "$OUT")" "$(dirname "$HEALTH_LOG")"

esc() { sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g'; }
NOW_EPOCH=$(date +%s)
mins_ago() { echo $(( (NOW_EPOCH - $1) / 60 )); }
stamp_to_epoch() { date -j -f '%Y%m%d-%H%M%S' "$1" +%s 2>/dev/null || echo 0; }
# routing header on task masters: IMPLEMENTER: (kit) or CODEX: (legacy)
route_label() { grep -m1 -E '^(IMPLEMENTER|CODEX):' "$1" 2>/dev/null | sed -E 's/^[A-Z]+: *model=([^ ]+) *effort=([^ ]+).*/\1@\2/'; }

NOW=$(date '+%H:%M:%S'); TODAY=$(date '+%Y-%m-%d')
LOCK=$(head -1 STATUS.md 2>/dev/null | cut -c1-300 | esc)
RUNNER_STATE=$(pgrep -f "[l]ane-runner.sh" >/dev/null 2>&1 && echo "ALIVE" || echo "DOWN")
FIRE_STATE=$(pgrep -f "claude -p # $NAME FIRE" >/dev/null 2>&1 && echo "FIRING NOW" || echo "between fires")

# --- Now building: slot--YYYYMMDD-HHMMSS-name markers -> elapsed ---
RUNNING=""
for m in tasks/running/*--*; do
  [ -e "$m" ] || continue
  base=$(basename "$m"); [ "${base##*.}" = "pid" ] && continue
  slot=${base%%--*}; rest=${base#*--}; stamp=$(echo "$rest" | cut -c1-15); name=${rest:16}
  se=$(stamp_to_epoch "$stamp")
  el=$([ "$se" -gt 0 ] && mins_ago "$se" || echo "?")
  RMODEL=$(route_label "$m")
  [ -n "$RMODEL" ] && RMODEL="[$RMODEL]" || RMODEL="[$DEF_MODEL_LABEL]"
  RUNNING="$RUNNING$(printf '%-7s %-46s %s started %s   %s min in' "$slot" "${name%.md}" "$RMODEL" "$(echo "$stamp" | cut -c10-11):$(echo "$stamp" | cut -c12-13)" "$el")
"
done
[ -z "$RUNNING" ] && RUNNING="(all slots idle)"
RUNNING=$(printf '%s' "$RUNNING" | esc)

# --- Queues: discovered from tasks/queue/*/ (never a hardcoded slot list) ---
QUEUES=""
for qdir in tasks/queue/*/; do
  [ -d "$qdir" ] || continue
  q=$(basename "$qdir")
  LINE=""
  for f in "$qdir"*.md; do
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
[ -z "$QUEUES" ] && QUEUES="(no queue directories under tasks/queue/)"
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
  model=$(route_label "$path")
  [ -z "$model" ] && model="$DEF_MODEL_LABEL"
  duration='~'
  if [ "$se" -gt 0 ] && [ "$mt" -gt "$se" ]; then
    seconds=$((mt - se))
    duration="$(( (seconds + 59) / 60 )) min"
  fi
  runlog=$(find tasks/runs -name "$stamp-*-$taskfile.log" -print 2>/dev/null | head -1)
  if { [ "$duration" = '~' ] || [ "$duration" = '0 min' ]; } && [ -n "$runlog" ]; then
    log_mt=$(stat -f %m "$runlog" 2>/dev/null || echo 0)
    [ "$log_mt" -gt "$se" ] && duration="$(( (log_mt - se + 59) / 60 )) min"
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

# --- Owner's desk: items blocking on the owner (OWNER: lines in BACKLOG.md) ---
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

# --- Lanes ahead of main: lane/* and save/* branches DISCOVERED from refs ---
LANES=""
RETIRED=""
for b in $(git for-each-ref --format='%(refname:short)' 'refs/heads/lane/*' 'refs/heads/save/*' 2>/dev/null); do
  N=$(git log --oneline "main..$b" 2>/dev/null | wc -l | tr -d ' ')
  if [ "${N:-0}" != "0" ]; then
    AGE=$(git log -1 --format=%ct "$b" 2>/dev/null || echo "$NOW_EPOCH")
    SUBJ=$(git log "main..$b" --format='%s' 2>/dev/null | head -1 | cut -c1-80)
    # show WHICH MODEL ran the job — resolve the task md from the commit subject, read its routing header
    TASKMD=$(printf '%s' "$SUBJ" | grep -oE '[A-Za-z0-9_-]+\.md' | head -1)
    MODEL=""
    if [ -n "$TASKMD" ] && [ -f "tasks/$TASKMD" ]; then
      MODEL=$(route_label "tasks/$TASKMD")
      [ -n "$MODEL" ] && MODEL="[$MODEL]"
    fi
    [ -z "$MODEL" ] && case "$SUBJ" in runner*) MODEL="[$DEF_MODEL_LABEL]";; *) MODEL='[attended/fire]';; esac
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

MERGES=$(git log -40 --format='%h  %cr — %s' 2>/dev/null | grep -E '— (feat|fix|art|drain)[:( ]' | grep -viE 'task:|queued|backlog|chore:' | head -8 | cut -c1-120 | esc)
FAILED_TAIL=$(ls -t tasks/failed/ 2>/dev/null | head -3 | esc)
PENDING_LINE=""
if [ -n "$PENDING_DIR" ]; then
  PENDING=$(ls "$PENDING_DIR" 2>/dev/null | grep -c '\.json$')
  PENDING_LINE="pending orders: $PENDING"
fi
ALERTS=$(grep 'ALERT' "$HEALTH_LOG" 2>/dev/null | tail -5 | cut -c1-130 | esc)
[ -z "$ALERTS" ] && ALERTS="(no alerts)"
FIRELOG=$(tail -3 "$(cfg fire.logDir logs)/fire-$(date +%Y%m%d).log" 2>/dev/null | cut -c1-130 | esc)

# --- Goal tree: repo-authored plan + filesystem/git-derived leaf status ---
if [ -f "$GOALS_FILE" ]; then
  FOUNDRY_GOALS="$GOALS_FILE" "$NODE_BIN" <<'NODE' > "$GOAL_TREE_TMP" || exit 1
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const data = JSON.parse(fs.readFileSync(process.env.FOUNDRY_GOALS, 'utf8'));
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
(data.goals || []).forEach((goal, goalIndex) => {
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
if (!html) html = '<p style="padding:10px 14px">(goals file present but empty — add goals per the kit README)</p>';
process.stdout.write(html);
NODE
  GOAL_TREE=$(<"$GOAL_TREE_TMP")
else
  GOAL_TREE="<p style=\"padding:10px 14px\">(no $GOALS_FILE yet — every authored master registers its leaf there; see the kit README)</p>"
fi

cat > "$OUT" <<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="$REFRESH">
<title>$NAME — Factory Ledger</title>
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
<h1>⛏ $NAME — Factory Ledger <small>refreshed $TODAY $NOW · auto-reloads every ${REFRESH}s</small></h1>

<h2>The goal tree</h2>
<div class="card goal-tree" data-goal-tree>$GOAL_TREE</div>

<h2>What really happened (last 24h)</h2>
<div class="card"><pre>$DONE_TAIL</pre></div>

<div class="row">
  <div class="card"><h2 style="margin-top:0">Machines</h2><pre>
runner  <span class="$( [ "$RUNNER_STATE" = ALIVE ] && echo ok || echo bad )">$RUNNER_STATE</span>
fires   <span class="ok">$FIRE_STATE</span> (every $(( CADENCE / 60 )) min)
$PENDING_LINE</pre></div>
  <div class="card"><h2 style="margin-top:0">Now building</h2><pre>$RUNNING</pre></div>
</div>

<h2>Waiting to merge (branches ahead of main — drain/salvage list)</h2>
<div class="card"><pre>$LANES</pre></div>

<h2>Merged, branch retirement pending</h2>
<div class="card"><pre>${RETIRED:-"(none)"}</pre></div>

<h2>Recently merged</h2>
<div class="card"><pre>${MERGES:-"(none yet)"}</pre></div>

<h2>Queues — what's waiting, since when</h2>
<div class="card"><pre>$QUEUES</pre></div>

<h2>Waiting to start — blockers &amp; tracked block time</h2>
<div class="card"><pre>$BLOCKED</pre></div>

<h2>Owner's desk — waiting on the owner</h2>
<div class="card" style="border-color:#a03020"><pre>$OWNERS</pre></div>

<div class="row">
  <div class="card"><h2 style="margin-top:0">Watchdog alerts</h2><pre>$ALERTS</pre>
  <h2>Failed (tail)</h2><pre>${FAILED_TAIL:-"(none)"}</pre></div>
</div>

<h2>Orchestrator lock (STATUS.md line 1)</h2>
<div class="card"><pre class="dim">$LOCK</pre></div>

<h2>Fire log (tail)</h2>
<div class="card"><pre class="dim">${FIRELOG:-"(no fire log today)"}</pre></div>

<p class="dim" style="margin-top:18px;font-size:12px">Read-only ledger view. Sources: git, $GOALS_FILE, tasks/, logs/. Generated by scripts/dashboard-gen.sh — no AI, no writes.</p>
</body>
</html>
HTML

echo "[dashboard] $(date '+%F %T') regenerated" >> "$HEALTH_LOG"
