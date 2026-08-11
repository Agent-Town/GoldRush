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
# --- F-1651-1 (s1651, 2026-08-11): CODEX CLIENT FLOOR -------------------------------
# This runner dispatches with BARE `codex`, resolved from the PATH of whatever shell
# launched it. On 2026-08-11 it was restarted at 05:08:20 from a shell without nvm on
# its PATH, so bare `codex` resolved to Homebrew's 0.133.0 — below the 0.144.1 floor
# that knows gpt-5.6 ids — and the very next dispatch (ap15-1) died in 14 s with HTTP
# 400 "requires a newer version", AFTER its master had already been consumed into
# tasks/running/. The thirteen runs before it, same disk, were healthy at v0.145.0.
# So: resolve a client that MEETS the floor before consuming anything (which also
# SELF-HEALS a wrong-shell restart by falling through to nvm), and refuse loudly —
# leaving the master in its queue — when none exists.
# NEVER resolve by "highest node version": ~/.nvm/versions/node/v24.14.0/bin/codex is
# present but its vendored binary is ENOENT, so that rule picks a corpse whose failure
# is indistinguishable from a quota wall (F-1636-4).
CODEX_FLOOR="0.144.1"

codex_ver() {  # $1 = binary; echoes "x.y.z", or nothing if it cannot answer
  "$1" --version 2>/dev/null | sed -n 's/.*[^0-9.]\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\).*/\1/p' | head -1
}

codex_ver_ge() {  # $1 >= $2, dotted numeric — no `sort -V` dependency (BSD/macOS)
  awk -v a="$1" -v b="$2" 'BEGIN{
    n=split(a,x,"."); m=split(b,y,".");
    for(i=1;i<=3;i++){ xi=(i<=n)?x[i]+0:0; yi=(i<=m)?y[i]+0:0;
      if(xi>yi) exit 0; if(xi<yi) exit 1 }
    exit 0 }'
}

resolve_codex_bin() {  # echoes the first client meeting CODEX_FLOOR; rc 1 if none does
  local c v
  for c in $(command -v codex 2>/dev/null) "$HOME"/.nvm/versions/node/*/bin/codex; do
    [ -x "$c" ] || continue
    v=$(codex_ver "$c")
    [ -n "${v:-}" ] || continue
    if codex_ver_ge "$v" "$CODEX_FLOOR"; then printf '%s\n' "$c"; return 0; fi
  done
  return 1
}
# --- END F-1651-1 -------------------------------------------------------------------
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
    # s1402 / F-1402-1: the main lock lives on LINE 1 ONLY (§1.2 writes it, §4 clears it).
    # This gate used to read `head -2 | grep "ACTIVE 2"`, which was wrong in BOTH directions:
    #   FALSE-BLOCK   — §4 archives the replaced line-1 as a bullet on line 2, and a lock archive
    #                   reads "ACTIVE 2026-...", so every handoff satisfied this gate and the main
    #                   slot was skipped while nothing held it. Measured: continuously from s1393
    #                   (2026-08-02 14:42) to s1402, ~6h, with a cure sitting in tasks/queue/main.
    #   FALSE-RELEASE — the literal "ACTIVE 2" misses lock lines written "... (s1392 fire) ACTIVE —",
    #                   a form 31 of 58 measured lock states used. Those left main OPEN to dispatch
    #                   while a fire owned the tree — two writers on main, the Mistake #12 shape.
    #                   Never observed to fire (1 main-slot run in factory history, and that one
    #                   dispatched cleanly at a handoff boundary), but a main task is queued now.
    # Line-1 + "says ACTIVE, does not say lock CLEARED" scored 0 false-blocks / 0 false-releases
    # across 120 STATUS.md commits (logs/_s1402_predicate_compare.mjs). It also fails SAFE: a
    # handoff that forgot "lock CLEARED" would hold main, never open it.
    # Verified by fixture, both directions: scripts/main-lock-gate-guard.test.sh
    l1=$(head -1 "$ROOT/STATUS.md" 2>/dev/null || true)
    if [ "$slot" = "main" ] && [[ "$l1" == *ACTIVE* && "$l1" != *"lock CLEARED"* ]]; then
      continue  # a gate fire holds main — lanes keep running, main waits
    fi
    q="$ROOT/tasks/queue/$slot"
    f=$(ls "$q"/*.md 2>/dev/null | head -1)
    [ -z "${f:-}" ] && continue
    name=$(basename "$f")
    wd="$(dir_for_slot "$slot")"
    if [ -z "$wd" ] || [ ! -d "$wd" ]; then echo "[lane-runner-v3] $slot dir missing, skip $name"; continue; fi
    # BEGIN F-1522-1 LANE-SAFETY GUARD
    # F-1522-1: lane/a lost ee61f25ee when the next master's pre-flight reset the lane before
    # its undrained commit was gated. Safety belongs here, where every dispatch passes.
    # This is deliberately NOT a bare `main..HEAD` check: squash-merged lane commits remain
    # ahead forever, so refusing every ahead lane recreates F-1027-1's permanent brick.
    # lane-usable distinguishes those safe AHEAD-BUT-ABSORBED commits from actual HOLDS.
    # The bounded probe fails open; only a completed, exact HOLDS verdict may stop dispatch.
    if [ "$slot" != "main" ] && [ "$wd" != "$ROOT" ]; then
      lane_probe=$(
        cd "$ROOT" && /usr/bin/perl -e '
          $seconds = shift;
          $pid = fork;
          exit 125 unless defined $pid;
          if ($pid == 0) { setpgrp(0, 0); exec @ARGV or exit 126 }
          $SIG{ALRM} = sub { kill "TERM", -$pid; select undef, undef, undef, 0.2; kill "KILL", -$pid; exit 124 };
          alarm $seconds;
          waitpid $pid, 0;
          alarm 0;
          exit $? >> 8;
        ' 10 node scripts/lane-usable.mjs "$slot" 2>&1
      )
      lane_probe_rc=$?
      lane_verdict=$(printf '%s\n' "$lane_probe" | sed -n 's/^  => \([A-Z-]*\):.*/\1/p' | tail -1)
      if [ "$lane_probe_rc" -eq 2 ] && [ "$lane_verdict" = "HOLDS" ]; then
        lane_branch=$(printf '%s\n' "$lane_probe" | sed -n 's/^[^ ]*  \([^ ]*\)  ahead=.*/\1/p' | head -1)
        held_count=$(printf '%s\n' "$lane_probe" | sed -n '/^[[:space:]]*HELD /p' | wc -l | tr -d ' ')
        held_paths=()
        while IFS= read -r held_path; do
          [ -n "$held_path" ] && held_paths+=("$held_path")
        done < <(printf '%s\n' "$lane_probe" | sed -n 's/^[[:space:]]*HELD [^ ]*  \(.*\)  (.*)$/\1/p')

        # The outer instrument fails open so it cannot brick dispatch. Once HOLDS is proven,
        # this narrower instrument fails closed because only positive absorption clears it.
        residue_probe='' residue_probe_rc=125 residue_absorbed_count=0 residue_line_count=0
        deletion_probe='' deletion_probe_rc=125 deletion_path_count=0 deletion_numeric_count=0 deletion_count=0
        if [ -n "$lane_branch" ] && [ "$held_count" -gt 0 ] && [ "${#held_paths[@]}" -eq "$held_count" ]; then
          residue_probe=$(
            cd "$ROOT" && /usr/bin/perl -e '
              $seconds = shift;
              $pid = fork;
              exit 125 unless defined $pid;
              if ($pid == 0) { setpgrp(0, 0); exec @ARGV or exit 126 }
              $SIG{ALRM} = sub { kill "TERM", -$pid; select undef, undef, undef, 0.2; kill "KILL", -$pid; exit 124 };
              alarm $seconds;
              waitpid $pid, 0;
              alarm 0;
              exit $? >> 8;
            ' 10 node scripts/lane-absorbed-lines.mjs "$lane_branch" "${held_paths[@]}" 2>&1
          )
          residue_probe_rc=$?
          residue_absorbed_count=$(printf '%s\n' "$residue_probe" | awk '
            /: ABSORBED — all [1-9][0-9]* added line/ || /: ABSORBED \(token-level\)/ { n++ }
            END { print n+0 }
          ')
          residue_line_count=$(printf '%s\n' "$residue_probe" | sed '/^$/d' | wc -l | tr -d ' ')
          deletion_probe=$(
            cd "$ROOT" && /usr/bin/perl -e '
              $seconds = shift;
              $pid = fork;
              exit 125 unless defined $pid;
              if ($pid == 0) { setpgrp(0, 0); exec @ARGV or exit 126 }
              $SIG{ALRM} = sub { kill "TERM", -$pid; select undef, undef, undef, 0.2; kill "KILL", -$pid; exit 124 };
              alarm $seconds;
              waitpid $pid, 0;
              alarm 0;
              exit $? >> 8;
            ' 10 git diff --numstat "main...$lane_branch" -- "${held_paths[@]}" 2>&1
          )
          deletion_probe_rc=$?
          deletion_path_count=$(printf '%s\n' "$deletion_probe" | awk 'NF { n++ } END { print n+0 }')
          deletion_numeric_count=$(printf '%s\n' "$deletion_probe" | awk '$1 ~ /^[0-9]+$/ && $2 ~ /^[0-9]+$/ { n++ } END { print n+0 }')
          deletion_count=$(printf '%s\n' "$deletion_probe" | awk '$2 ~ /^[0-9]+$/ { n += $2 } END { print n+0 }')
        fi
        if [ "$residue_probe_rc" -eq 0 ] &&
           [ "$residue_absorbed_count" -eq "$held_count" ] &&
           [ "$residue_line_count" -eq "$held_count" ] &&
           [ "$deletion_probe_rc" -eq 0 ] &&
           [ "$deletion_path_count" -eq "$held_count" ] &&
           [ "$deletion_numeric_count" -eq "$held_count" ] &&
           [ "$deletion_count" -eq 0 ]; then
          echo "[lane-runner-v3] $slot: HOLDS paths fully absorbed by main — dispatching $name: ${held_paths[*]}"
        else
          echo "[lane-runner-v3] $slot: REFUSE $name — HOLDS undrained paths:"
          printf '%s\n' "$lane_probe" | sed -n '/^[[:space:]]*HELD /p'
          continue
        fi
      fi
    fi
    # END F-1522-1 LANE-SAFETY GUARD
    # F-1651-1: prove the implementer CAN serve before consuming the master. A dispatch
    # into an under-floor client destroys a queue slot in 14 s and leaves a rc1 corpse
    # that reads exactly like a task defect; refusing here loses nothing at all.
    if ! codex_bin=$(resolve_codex_bin); then
      echo "[lane-runner-v3] $slot: REFUSE $name — no codex client >= $CODEX_FLOOR on PATH or in ~/.nvm."
      echo "[lane-runner-v3]   master LEFT in queue (nothing consumed). Restart me from a shell where"
      echo "[lane-runner-v3]   \`codex --version\` >= $CODEX_FLOOR. See tasks/CODEX-WALL (F-1651-1)."
      continue
    fi
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
      cd "$wd" && "$codex_bin" exec -m "${cx_model:-gpt-5.6-sol}" -c model_reasoning_effort="${cx_effort:-medium}" "Do the task in the file at: $run" >"$log" 2>&1
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
            # F-1657-1 (s1657): `;` NOT `&&` between add and commit — see the long note on the
            # lane branch below. `git add` exits 1 merely ADVISORILY when an ignored path matches
            # its pathspec, having already staged everything legitimate, and the old `&&` then
            # threw the finished run's work on the floor.
            ( cd "$wd" && git add -A -- assets artifacts ; git commit -q -m "runner($slot): $name" -- assets artifacts ) >>"$log" 2>&1 || true
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
            # F-1657-1 (s1657, from F-1656-1): the separator below is `;` and MUST NOT become `&&`.
            # F-1656-1 recorded that this `git add` was "rejected" and "aborted", so the commit
            # never happened and 110 lines of finished work sat as STAGED-BUT-UNCOMMITTED dirt in
            # a lane the next refill would `reset --hard` (Mistake #2's precondition, reached by a
            # route every commit-derived instrument — ahead/behind, main..branch,
            # lane-freeze-classify — is structurally blind to, since a staged-only lane reads
            # ahead=0 USABLE). MEASURED s1657 on a scratch repo, and the diagnosis was WRONG in the
            # way that matters: the add does NOT abort. It stages every legitimate path correctly,
            # excludes the ignored one correctly, and THEN exits 1 purely to advise that an ignored
            # path matched its pathspec ("The following paths are ignored... hint: Use -f").
            # The pathspec was never the defect — the `&&` was. It threw away a completed add.
            #   ARM 1  add -A -- . ':(exclude).wrangler'      -> rc=1, file.txt STAGED
            #   ARM 5  add && commit (the old line)           -> rc=1, work stranded, HEAD unmoved
            #   ARM 6  add ;  commit (this line)              -> commit rc=0, index clean,
            #                                                    ignored path did NOT leak in
            # Decoupling is safe because `git commit -- <pathspec>` takes its content from the
            # WORKING TREE through its own pathspec (that is what F-1154-1 above bought), so the
            # commit can publish nothing the add would have withheld. The trailing `|| true` keeps
            # an empty "nothing to commit" harmless, exactly as before.
            # NOTE the two slots differ here: for ART, `$wd` is `worktrees/art`, which is gitignored
            # (.gitignore:15) and is NOT a git worktree, so its `.` pathspec is ignored in full and
            # this commit correctly stages nothing — that slot's output is untracked EVERY batch by
            # design (F-1045-1) and wants the salvage cure, not this one.
            ( cd "$wd" && git add -A -- . ':(exclude).wrangler' ':(exclude)logs/factory-usage.json' ':(exclude)logs/usage-history.jsonl' ; git commit -q -m "runner($slot): $name" -- . ':(exclude).wrangler' ':(exclude)logs/factory-usage.json' ':(exclude)logs/usage-history.jsonl' ) >>"$log" 2>&1 || true
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
    # F-1324-2 (s1325): consume the request ONLY when the op actually ran. Before this,
    # the mv below was unconditional, so a skipped refresh (lane BUSY) was filed into
    # tasks/done/ exactly like a success — s1323 read that done/ entry, believed lane-c
    # had been refreshed, and s1324 came within one `cp` of dispatching a task onto a tree
    # where its subject commit was ABSENT. A request queue that consumes work on failure
    # silently converts "not done yet" into "done".
    consume=1
    case "$op" in
      refresh-lane)
        wt="$ROOT/worktrees/$arg"
        if [ ! -d "$wt" ]; then
          # Never succeeds however often retried — consume it rather than spin every cycle.
          echo "[janitor] refresh IMPOSSIBLE for $arg (no worktree) — consuming request"
        elif [ -f "$ROOT/tasks/running/$arg.pid" ]; then
          echo "[janitor] skip refresh $arg (BUSY) — request KEPT for a later cycle"; consume=0
        elif ( cd "$wt" && git reset --hard main >/dev/null 2>&1 && git clean -fd >/dev/null 2>&1 ); then
          echo "[janitor] refreshed lane $arg"
        else
          echo "[janitor] refresh FAILED for $arg — request KEPT for a later cycle"; consume=0
        fi ;;
      clean-tests)
        rm -rf "$ROOT/test-results" "$ROOT/playwright-report" 2>/dev/null
        echo "[janitor] cleaned test artifacts" ;;
      *) echo "[janitor] REJECTED $(basename "$req"): unknown op \"$op\" (expected line1=op, line2=arg)"
         archive_prefix=janitor-REJECTED ;;
    esac
    if [ "$consume" = 1 ]; then
      mv "$req" "$ROOT/tasks/done/${archive_prefix:-janitor}-$(date +%s)-$(basename "$req")" 2>/dev/null; unset archive_prefix
    fi
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
  # NOTE: the .git/*.stale* + tmp_obj_* sweep ABOVE (the find immediately preceding this
  # epitaph) is deliberately LEFT ALONE — that is git's own scratch, not factory history.
  # s1345/F-1276-3: this note used to cite that sweep by LINE NUMBER. The number rotted three
  # times (116 -> 137 -> 152) because law-pointer-guard's denominator is the .md law surfaces,
  # and a pointer living inside a .sh is outside it. Cited by CONTENT now, so it cannot rot.
  sleep 15
done
