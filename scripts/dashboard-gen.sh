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
DONE_TAIL=$(python3 - <<'PYDONE'
import os, glob, re, subprocess, time, json
rows=[]
now=time.time()
def sh(*a):
    try: return subprocess.check_output(list(a), text=True, stderr=subprocess.DEVNULL).strip()
    except: return ''
# THE RETENTION LAW (owner 2026-07-25): mirror every run log into the tracked archive before any pruner can reach it.
os.makedirs('logs/runs-archive', exist_ok=True)
for _p in glob.glob('tasks/runs/*.log'):
    _d='logs/runs-archive/'+os.path.basename(_p)
    if not os.path.exists(_d):
        import shutil; shutil.copy2(_p,_d)
# durable ledger: absorb any run log not yet recorded (runner prunes logs at +3d — the ledger keeps them forever)
# s1028 fix (F-1027-3): 'json' was NOT imported at this point, so every dedupe read raised NameError into a
# bare 'except: pass' and 'seen' was always empty — the ledger re-appended EVERY log on EVERY 60s regen
# (6,603 rows for 49 real runs, +48 lines/minute). Three defects fixed together:
#   1. json is imported at the top of this block, and the per-line except is narrowed to (ValueError,
#      KeyError) so a future programming error surfaces instead of silently disabling dedupe.
#   2. the key is stamp|lane|task, not stamp alone — 5 stamps own 2-4 sibling logs (lanes start in the same
#      second), and a stamp-only key would permanently drop the siblings once dedupe actually worked.
#   3. the ledger is UPSERTED, not appended: a live run writes tokens=0 rows once a minute, so skip-if-seen
#      would freeze every run at tokens=0 forever. Best row per key wins, ranked by (tokens, minutes).
# Rows whose logs the runner has pruned are carried forward untouched — that is the ledger's whole purpose.
LEDGER='logs/task-stats.jsonl'
ledger_rows={}   # NOT 'rows' — that name belongs to the dashboard's Done-section list built below.
def _key(r): return '%s|%s|%s' % (r['stamp'], r['lane'], r['task'])
def _rank(r): return (r.get('tokens', 0), r.get('minutes', 0))
def _absorb(r):
    k=_key(r)
    if k not in ledger_rows or _rank(r) > _rank(ledger_rows[k]): ledger_rows[k]=r
try:
    for line in open(LEDGER):
        line=line.strip()
        if not line: continue
        try: _absorb(json.loads(line))
        except (ValueError, KeyError, TypeError): continue
except FileNotFoundError: pass
for path in sorted(glob.glob('tasks/runs/*.log'), key=os.path.getmtime):
    f0=os.path.basename(path); m0=re.match(r'(\d{8}-\d{6})-(lane-[a-z]+|art|main)-(.+)\.md\.log$', f0)
    if not m0: continue
    t0=''
    try: t0=open(path,errors='ignore').read()
    except: pass
    mm0=re.findall(r'tokens used\n([\d,]+)',t0)
    mt0=os.path.getmtime(path)
    try: se0=time.mktime(time.strptime(m0.group(1),'%Y%m%d-%H%M%S'))
    except: se0=mt0
    _absorb({'stamp':m0.group(1),'lane':m0.group(2),'task':m0.group(3),'tokens':int(mm0[-1].replace(',','')) if mm0 else 0,'minutes':int((mt0-se0)/60)})
_tmp=LEDGER+'.tmp'
with open(_tmp,'w') as led:
    for k in sorted(ledger_rows, key=lambda k:(ledger_rows[k]['stamp'], ledger_rows[k]['lane'], ledger_rows[k]['task'])):
        led.write(json.dumps(ledger_rows[k])+'\n')
os.replace(_tmp, LEDGER)
import json
for path in sorted(glob.glob('tasks/runs/*.log'), key=os.path.getmtime, reverse=True):
    mt=os.path.getmtime(path)
    if now-mt>86400: continue
    f=os.path.basename(path)
    m=re.match(r'(\d{8}-\d{6})-(lane-[a-z]+|art|main)-(.+)\.md\.log$', f)
    if not m: continue
    stamp,lane,name=m.groups()
    try: se=time.mktime(time.strptime(stamp,'%Y%m%d-%H%M%S'))
    except: se=mt
    dur=int((mt-se)/60)
    taskfile=name+'.md'
    outcome='done-moved'
    hit=sh('git','log','origin/main','--format=%h','-1','--fixed-strings','--grep',taskfile)
    if not hit:
        human=name.replace('lane-','').replace('-',' ')
        hit=sh('git','log','origin/main','--format=%h','-1','-E','--grep',r'^(feat|fix|art|drain|release)[:(].*'+re.escape(human))
    shipped=glob.glob(f'tasks/failed/shipped-*-{name}-SHIPPED-*')
    rc=os.path.exists(f'tasks/failed/rc1-{stamp}-{taskfile}')
    tail=''
    try: tail=open(path,errors='ignore').read()[-600:]
    except: pass
    if hit: outcome=f'MERGED {hit}'
    elif shipped: outcome='MERGED '+shipped[0].rsplit('-',1)[-1][:8]
    elif rc: outcome='FAILED (rc marker)'
    elif 'STOP' in tail or 'no changes' in tail.lower() or 'nothing to commit' in tail.lower(): outcome='STOP/NO-OP (guard)'
    elif os.path.exists(f'tasks/running/{stamp[:15]}') or glob.glob(f'tasks/running/*{taskfile}'): outcome='RUNNING'
    rows.append(f"{name[:42]:42} · {lane:6} · started {stamp[9:11]}:{stamp[11:13]} · {dur:4d} min · {outcome}")
print('\n'.join(rows) if rows else '(no task runs in the last 24 hours)')
PYDONE
)
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
TOP_MIN=$(sort -t'|' -k2 -rn "$STATS_TMP" | head -8 | awk -F'|' '{tag=($1==0)?"  (zombie/no-op — not a real run)":""; printf "  %-48s %10'"'"'d tok  %5d min%s\n", $3, $1, $2, tag}')
rm -f "$STATS_TMP"
STATS_TABLE=$(printf 'ALL-TIME: %d task runs · %d hours %d min of implementer time · %'"'"'d tokens consumed (codex-reported)\n\nTHE HUNGRIEST (tokens):\n%s\n\nTHE LONGEST (wall clock):\n%s' "$TOT_RUNS" $((TOT_MIN/60)) $((TOT_MIN%60)) "$TOT_TOK" "$TOP_TOK" "$TOP_MIN")
STATS_TABLE=$(printf '%s' "$STATS_TABLE" | esc)

# auto-refresh the census in the background when stale (>6h); render the last stamp meanwhile
# s1028 (F-1028-1): this line used to re-resolve NODE_BIN as "$(command -v node || true)", throwing away the
# validated interpreter picked at the top of this script. Under launchd the PATH carries no node, so it fell
# through to the nvm glob and took whichever version sorted FIRST — an old one that cannot read ESM. Keep the
# interpreter chosen (and [ -x ]-checked) at lines 11-17.
if [ -e logs/factory-usage.json ]; then
  age_min=$(( ( $(date +%s) - $(stat -f %m logs/factory-usage.json) ) / 60 ))
  if [ "$age_min" -gt 360 ] && ! pgrep -f factory-usage-census >/dev/null 2>&1; then
    nohup "$NODE_BIN" scripts/factory-usage-census.mjs >> logs/.census-refresh.log 2>&1 &
  fi
fi
FACTORY_BLOCK=$("$NODE_BIN" -e '
try { const a=require("./logs/factory-usage.json"); const M=n=>(n/1e6).toFixed(1)+"M";
console.log(`THE WHOLE FACTORY (census ${a.stamped}):`);
console.log(`  attended (Fable):        ${String(a.attended.files).padStart(5)} sessions   fresh-in ${M(a.attended.in).padStart(9)}   out ${M(a.attended.out)}`);
console.log(`  fires (headless):        ${String(a.fires.files).padStart(5)} sessions*  fresh-in ${M(a.fires.in).padStart(9)}   out ${M(a.fires.out)}   *older fires undercounted`);
console.log(`  codex (Sol+runner):      ${String(a.codexGR.files).padStart(5)} sessions   fresh-in ${M(a.codexGR.in).padStart(9)}   out ${M(a.codexGR.out)}   (+${(a.codexGR.cached/1e9).toFixed(1)}B cached reads)`);
const age=Math.round((Date.now()-new Date(a.stamped).getTime())/36e5);
const ti=a.attended.in+a.fires.in+a.codexGR.in, to=a.attended.out+a.fires.out+a.codexGR.out;
console.log(`  TOTAL:                   fresh-in ${M(ti)} · out ${M(to)}   (census age ${age}h — auto-refreshes >6h)`);
try { const h=require("fs").readFileSync("logs/usage-history.jsonl","utf8").trim().split("\n").slice(-5).map(l=>JSON.parse(l));
if (h.length>1) { console.log("  THE BURN (last stamps, out-tokens):");
for (const r of h) console.log(`    ${r.t}  attended ${M(r.att_out)} · fires ${M(r.fire_out)} · codex ${M(r.cdx_out)}`); } } catch {}
} catch(e) { console.log("(factory census not yet run: node scripts/factory-usage-census.mjs)"); }' 2>/dev/null)
FACTORY_HTML=$(printf '%s' "$FACTORY_BLOCK" | esc)


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
# s1028 (F-1028-1): this used to pipe ESM source into node on STDIN, where node applies module-syntax
# detection only on recent versions — on the interpreter launchd actually got, every regen died with
# "Cannot use import statement outside a module", and the trailing "|| exit 1" then killed the WHOLE
# script before logs/dashboard.html was written. The board froze at 07:02 and no one was told, because a
# stale HTML file looks exactly like a fresh one. Now: run from a real .mjs (ESM on every node version),
# and a goal-tree failure degrades to a visible placeholder instead of taking the entire board down.
GOAL_TREE_SRC="${GOAL_TREE_TMP%.html}.mjs"
cat > "$GOAL_TREE_SRC" <<'NODE'
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
if ! GOAL_TREE_ERR=$("$NODE_BIN" "$GOAL_TREE_SRC" 2>&1 > "$GOAL_TREE_TMP"); then
  printf '<pre>(goal tree unavailable — %s)</pre>\n' "$(printf '%s' "$GOAL_TREE_ERR" | tail -2 | esc)" > "$GOAL_TREE_TMP"
  echo "[dashboard] goal tree failed: $GOAL_TREE_ERR" >&2
fi
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
<h2>The whole factory — every arm's lifetime tokens</h2>
<div class="card"><pre>$FACTORY_HTML</pre></div>
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
