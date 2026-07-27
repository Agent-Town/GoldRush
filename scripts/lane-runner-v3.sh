#!/bin/bash
# Gold Rush lane runner v3 — TRUE PARALLEL slots (v2 was serial: codex exec blocked the loop).
# One concurrent task PER SLOT (up to 5 at once), each in its own worktree, background jobs.
# Keeps v2's fixes: single-instance mkdir lock, failed/ dir, working Ctrl+C, janitor.
# Swap protocol: wait for current v2 task DONE -> Ctrl+C v2 -> start v3.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCKDIR="$ROOT/tasks/.runner.lock"
if ! mkdir "$LOCKDIR" 2>/dev/null; then
  # s284: self-heal a stale lock — if no OTHER runner process exists, the lock is a corpse
  # (kill→relaunch race, 2026-07-10 incident: new instance exited on the dying old one's lock).
  others=$(pgrep -f "lane-runner-v3.sh" | grep -v "^$$\$" | wc -l | tr -d ' ')
  if [ "$others" = "0" ]; then
    rmdir "$LOCKDIR" 2>/dev/null
    if ! mkdir "$LOCKDIR" 2>/dev/null; then
      echo "[lane-runner-v3] lock respawn failed ($LOCKDIR)."; exit 1
    fi
    echo "[lane-runner-v3] stale lock self-healed (no other runner process)"
  else
    echo "[lane-runner-v3] another instance running ($LOCKDIR). Remove if stale."; exit 1
  fi
fi
cleanup() { rmdir "$LOCKDIR" 2>/dev/null; }
trap 'cleanup; echo "[lane-runner-v3] stopped (background tasks finish on their own)"; exit 130' INT TERM
trap cleanup EXIT
mkdir -p "$ROOT/tasks/runs" "$ROOT/tasks/done" "$ROOT/tasks/failed" "$ROOT/tasks/running"
dir_for_slot() {
  # CONVENTION: slot "main" -> repo root; any other slot -> worktrees/<slot> (create with:
  #   git worktree add worktrees/<slot> -b lane/<slot> && (cd worktrees/<slot> && npm install)
  # then mkdir tasks/queue/<slot> — the runner picks it up next cycle. Lanes are UNCAPPED.)
  if [ "$1" = "main" ]; then echo "$ROOT"; else echo "$ROOT/worktrees/$1"; fi
}
echo "[lane-runner-v3] watching $ROOT/tasks/queue — parallel slots — Ctrl+C to stop"
while true; do
  for qdir in "$ROOT/tasks/queue"/*/; do
    slot=$(basename "$qdir")
    pidfile="$ROOT/tasks/running/$slot.pid"
    if [ -f "$pidfile" ]; then
      pid=$(cat "$pidfile" 2>/dev/null)
      if [ -n "${pid:-}" ] && kill -0 "$pid" 2>/dev/null; then continue; fi
      # stale pid: crashed mid-task -> salvage to failed/
      for r in "$ROOT/tasks/running/$slot--"*.md; do
        [ -e "$r" ] && mv "$r" "$ROOT/tasks/failed/CRASHED-$(basename "$r")"
      done
      rm -f "$pidfile"
      echo "[lane-runner-v3] $slot: stale run cleaned (crash salvaged to failed/)"
    fi
    if [ "$slot" = "main" ] && head -2 "$ROOT/STATUS.md" 2>/dev/null | grep -q "ACTIVE 2"; then
      continue  # a gate fire holds main (v2 rule restored) — lanes keep running, main waits
    fi
    q="$ROOT/tasks/queue/$slot"
    f=$(ls "$q"/*.md 2>/dev/null | head -1)
    [ -z "${f:-}" ] && continue
    name=$(basename "$f")
    wd="$(dir_for_slot "$slot")"
    if [ -z "$wd" ] || [ ! -d "$wd" ]; then echo "[lane-runner-v3] $slot dir missing, skip $name"; continue; fi
    stamp=$(date +%Y%m%d-%H%M%S)
    run="$ROOT/tasks/running/$slot--$stamp-$name"
    mv "$f" "$run"
    log="$ROOT/tasks/runs/$stamp-$slot-$name.log"
    echo "[lane-runner-v3] $stamp START $slot :: $name (log: $log)"
    (
      # s283 (owner-authorized 2026-07-10): per-master model/effort routing — masters may carry
      # a "CODEX: model=<m> effort=<e>" line; absent = terra@medium (sol@ultra is REQUESTED, never ambient).
      cx_model=$(grep -m1 '^CODEX:' "$run" 2>/dev/null | sed -n 's/.*model=\([^ ]*\).*/\1/p')
      cx_effort=$(grep -m1 '^CODEX:' "$run" 2>/dev/null | sed -n 's/.*effort=\([^ ]*\).*/\1/p')
      # default gpt-5.6-sol@medium (owner ruling 2026-07-10: Sol over Terra, mid effort for normal tasks; CLI 0.144.1 knows 5.6 ids)
      cd "$wd" && codex exec -m "${cx_model:-gpt-5.6-sol}" -c model_reasoning_effort="${cx_effort:-medium}" "Do the task in the file at: $run" >"$log" 2>&1
      rc=$?
      if [ $rc -eq 0 ]; then
        # s76 ROOT-CAUSE FIX: persist LANE output to its branch so gate-fires can merge a
        # committed branch (before this, lane work sat uncommitted in the worktree and no
        # headless fire could reach it — the multi-fire lane-drain deadlock). Lanes only:
        # the MAIN slot stays fire-path-scoped (NEVER -A) per the gate protocol, so it is
        # deliberately excluded. Commit-to-branch also makes janitor reset --hard survivable
        # (work becomes reflog-recoverable instead of lost) — LANE-SAFETY improvement.
        if [ "$slot" != "main" ]; then
          if [ "$wd" = "$ROOT" ]; then
            # s283 (owner-authorized 2026-07-10): a slot resolving to repo ROOT (art, when
            # worktrees/art is absent) must NEVER `add -A` — five sweep incidents (bfadfc2,
            # ff46a53, ...). Scope to the surfaces art tasks legitimately write.
            # F-1154-1 (s1154): the `add` above was ALREADY correctly scoped — the leak was the
            # bare `git commit` after it, which publishes the whole STAGED INDEX regardless of
            # what was just added. c7601082 shipped 75 files outside this pathspec, including
            # .wrangler/tmp bundles and logs/session-scratch/s1126-*, s1134-* staged DAYS earlier
            # by departed fires. Giving the commit its own pathspec makes it structurally unable
            # to publish anything this slot is not allowed to write.
            ( cd "$wd" && git add -A -- assets artifacts && git commit -q -m "runner($slot): $name" -- assets artifacts ) >>"$log" 2>&1 || true
          else
            # F-1108-2 / F-1109-3 (fixed s1109): a bare `add -A` swept live scratch into lane
            # commits, so a run that truthfully reported "no repo change" still moved its branch
            # 1 ahead — and that debris commit then STOPs the NEXT task on the lane, because a
            # pre-flight cannot tell debris from content and correctly refuses to guess. It cost
            # rf-37 a second 49k-token run (s1108) and forced s1109 to land the plaza lift
            # path-scoped out of a 24-file / 10,824-insertion commit holding 2 files of content.
            # These three paths are NEVER authored by a lane task — .wrangler is wrangler's own
            # bundle scratch and the two logs are the runner's own accounting, owned by main —
            # so excluding them cannot lose lane work, which is the property that matters here
            # (this commit exists per s76 precisely so lane output is never lost).
            # Measured on the live tree: 18 debris entries -> 0, content unaffected.
            # F-1154-1 (s1154): same pathspec now given to the COMMIT, not just the add — a bare
            # commit here would publish a stale index exactly as the art branch above did. This
            # branch never exhibited it (its excludes kept the index clean), so this is the class
            # fix, not an incident fix.
            ( cd "$wd" && git add -A -- . ':(exclude).wrangler' ':(exclude)logs/factory-usage.json' ':(exclude)logs/usage-history.jsonl' && git commit -q -m "runner($slot): $name" -- . ':(exclude).wrangler' ':(exclude)logs/factory-usage.json' ':(exclude)logs/usage-history.jsonl' ) >>"$log" 2>&1 || true
          fi
        fi
        mv "$run" "$ROOT/tasks/done/$stamp-$name"
      else
        mv "$run" "$ROOT/tasks/failed/rc$rc-$stamp-$name"
      fi
      rm -f "$ROOT/tasks/running/$slot.pid"
      echo "[lane-runner-v3] $(date +%H:%M:%S) DONE rc=$rc $slot :: $name"
    ) &
    echo $! > "$pidfile"
  done
  # JANITOR REQUESTS (s9an): sandbox fires cannot delete on the mount. They drop
  # WHITELISTED request files in tasks/janitor/ (line1=op, line2=arg); only these
  # two ops exist — nothing from the file is ever executed as code.
  for req in "$ROOT/tasks/janitor"/*.req; do
    [ -e "$req" ] || continue
    op=$(head -1 "$req"); arg=$(sed -n 2p "$req")
    case "$op" in
      refresh-lane)
        wt="$ROOT/worktrees/$arg"
        if [ -d "$wt" ] && [ ! -f "$ROOT/tasks/running/$arg.pid" ]; then
          ( cd "$wt" && git reset --hard main >/dev/null 2>&1 && git clean -fd >/dev/null 2>&1 ) \
            && echo "[janitor] refreshed lane $arg" || echo "[janitor] refresh FAILED for $arg"
        else echo "[janitor] skip refresh $arg (busy or missing)"; fi ;;
      clean-tests)
        rm -rf "$ROOT/test-results" "$ROOT/playwright-report" 2>/dev/null
        echo "[janitor] cleaned test artifacts" ;;
      *) echo "[janitor] unknown op in $(basename "$req") — ignored" ;;
    esac
    mv "$req" "$ROOT/tasks/done/janitor-$(date +%s)-$(basename "$req")" 2>/dev/null
  done
  find "$ROOT/.git" -maxdepth 2 \( -name '*.stale*' -o -name 'tmp_obj_*' \) -type f -delete 2>/dev/null
  # s1033 / F-1028-3: the retention-window prune that stood here is REMOVED, permanently.
  # It was: find "$ROOT/tasks/runs" -name '*.log' -mtime +3 -delete 2>/dev/null
  # CLAUDE.md §4.10b (THE RETENTION LAW, owner 2026-07-25): "We have to stop the pruning, our
  # history is our strength." This line was not hypothetical harm — s1031 measured a named
  # casualty: the run 20260721-110240-lane-a-lane-town-variants-e8 (886,731 tokens, 29 min),
  # still present in logs/task-stats.jsonl and already deleted from tasks/runs/, which had
  # silently vanished from the owner's ALL-TIME dashboard figures.
  # DO NOT RESTORE IT. Disk pressure is F-1027-2 on the owner's desk ("tails" or "gzip" —
  # compaction of TRACKED files is lawful; deletion of untracked history is not).
  # NOTE: line 116's .git/*.stale* sweep is deliberately LEFT ALONE — that is git's own scratch,
  # not factory history.
  sleep 15
done
