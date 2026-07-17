#!/bin/bash
# Foundry Kit lane runner — TRUE PARALLEL slots, one concurrent task PER SLOT, each in its
# own worktree, background jobs. Generalized from Gold Rush lane-runner-v3.sh AND repaired:
#   (a) a non-main slot whose worktree is absent FAILS that pickup loudly into
#       tasks/failed/NO-WORKTREE-* — it NEVER falls back to the repo root (the s130/s198
#       `git add -A` sweep family is structurally impossible here);
#   (b) lane auto-commits are path-scoped when the slot configures addPaths, and an
#       auto-commit whose working dir resolves to the repo root is REFUSED outright.
# Every divergence from the live original is documented in the kit's DIVERGENCES.md.
# Config: foundry.config.json (runner.*). Manual: bash scripts/lane-runner.sh [--dry-run]
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CFG="$ROOT/foundry.config.json"
SELF="$(basename "$0")"

# cfg <dot.path> <default> — scalars come back as-is; arrays come back one element per line.
cfg() {
  local v=""
  if command -v node >/dev/null 2>&1 && [ -f "$CFG" ]; then
    v=$(node -e '
      const c = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
      const v = process.argv[2].split(".").reduce((o, k) => (o == null ? o : o[k]), c);
      if (v == null) process.exit(1);
      process.stdout.write(Array.isArray(v) ? v.join("\n") : String(v));
    ' "$CFG" "$1" 2>/dev/null) || v=""
  fi
  if [ -n "$v" ]; then printf '%s\n' "$v"; else printf '%s\n' "$2"; fi
}

IMPL_BIN="$(cfg runner.implementerBin codex)"
DEF_MODEL="$(cfg runner.defaultModel gpt-5.6-sol)"
DEF_EFFORT="$(cfg runner.defaultEffort medium)"
POLL_SECONDS="$(cfg runner.pollSeconds 15)"
LOG_RETAIN_DAYS="$(cfg runner.logRetentionDays 3)"
LOCK_PATTERN="$(cfg runner.lockPattern 'ACTIVE 2')"
CLEAN_DIRS="$(cfg runner.cleanDirs 'test-results
playwright-report')"

dir_for_slot() {
  # CONVENTION: slot "main" -> repo root; any other slot -> worktrees/<slot> (create with:
  #   git worktree add worktrees/<slot> -b lane/<slot> && (cd worktrees/<slot> && <install deps>)
  # then tasks/queue/<slot>/ is picked up next cycle. Lanes are UNCAPPED.)
  # KIT REPAIR (a): there is NO fallback — callers must check the dir exists and fail the
  # pickup if it doesn't. A missing worktree must never resolve to anything runnable.
  if [ "$1" = "main" ]; then echo "$ROOT"; else echo "$ROOT/worktrees/$1"; fi
}

# routing header: "IMPLEMENTER: model=<m> effort=<e>" (kit form; legacy "CODEX:" accepted)
route_field() {  # route_field <taskfile> <field>
  grep -m1 -E '^(IMPLEMENTER|CODEX):' "$1" 2>/dev/null | sed -n "s/.*$2=\([^ ]*\).*/\1/p"
}

if [ "${1:-}" = "--dry-run" ]; then
  echo "[lane-runner] DRY-RUN — resolved config + planned pickups, nothing executed:"
  echo "  repo:         $ROOT"
  if [ -f "$CFG" ]; then echo "  config:       $CFG (found)"; else echo "  config:       $CFG (MISSING — baked defaults in use)"; fi
  echo "  implementer:  $IMPL_BIN (default $DEF_MODEL@$DEF_EFFORT)$(command -v "$IMPL_BIN" >/dev/null 2>&1 || echo '  [BIN NOT FOUND]')"
  echo "  poll:         every ${POLL_SECONDS}s · run logs kept $LOG_RETAIN_DAYS days · main-slot lock pattern: \"$LOCK_PATTERN\""
  echo "  slots (from tasks/queue/*/):"
  found_any=0
  for qdir in "$ROOT/tasks/queue"/*/; do
    [ -d "$qdir" ] || continue
    found_any=1
    slot=$(basename "$qdir")
    wd="$(dir_for_slot "$slot")"
    if [ -d "$wd" ]; then state="workdir OK: $wd"; else state="workdir MISSING: $wd — pickups would FAIL to tasks/failed/NO-WORKTREE-*"; fi
    first=$(ls "$qdir"*.md 2>/dev/null | head -1)
    scope=$(cfg "runner.slots.$slot.addPaths" '' | tr '\n' ' ')
    [ "$slot" = "main" ] && scope="(main never auto-commits)"
    [ -z "$scope" ] && scope="(git add -A within the worktree)"
    echo "    $slot: $state"
    echo "      queued: ${first:+$(basename "$first")}${first:-—}   auto-commit scope: $scope"
    if [ -n "$first" ] && [ -d "$wd" ]; then
      m=$(route_field "$first" model); e=$(route_field "$first" effort)
      echo "      would run: (cd $wd && $IMPL_BIN exec -m ${m:-$DEF_MODEL} -c model_reasoning_effort=${e:-$DEF_EFFORT} \"Do the task in the file at: <running-copy>\")"
    fi
  done
  [ "$found_any" = "0" ] && echo "    (no queue directories under tasks/queue/)"
  exit 0
fi

LOCKDIR="$ROOT/tasks/.runner.lock"
if ! mkdir "$LOCKDIR" 2>/dev/null; then
  # self-heal a stale lock — if no OTHER runner process exists, the lock is a corpse
  # (kill->relaunch race: a new instance exited on the dying old one's lock).
  others=$(pgrep -f "$SELF" | grep -v "^$$\$" | wc -l | tr -d ' ')
  if [ "$others" = "0" ]; then
    rmdir "$LOCKDIR" 2>/dev/null
    if ! mkdir "$LOCKDIR" 2>/dev/null; then
      echo "[lane-runner] lock respawn failed ($LOCKDIR)."; exit 1
    fi
    echo "[lane-runner] stale lock self-healed (no other runner process)"
  else
    echo "[lane-runner] another instance running ($LOCKDIR). Remove if stale."; exit 1
  fi
fi
cleanup() { rmdir "$LOCKDIR" 2>/dev/null; }
trap 'cleanup; echo "[lane-runner] stopped (background tasks finish on their own)"; exit 130' INT TERM
trap cleanup EXIT
mkdir -p "$ROOT/tasks/runs" "$ROOT/tasks/done" "$ROOT/tasks/failed" "$ROOT/tasks/running" "$ROOT/tasks/janitor"

echo "[lane-runner] watching $ROOT/tasks/queue — parallel slots — Ctrl+C to stop"
while true; do
  for qdir in "$ROOT/tasks/queue"/*/; do
    [ -d "$qdir" ] || continue
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
      echo "[lane-runner] $slot: stale run cleaned (crash salvaged to failed/)"
    fi
    if [ "$slot" = "main" ] && head -2 "$ROOT/STATUS.md" 2>/dev/null | grep -q "$LOCK_PATTERN"; then
      continue  # a gate fire holds main — lanes keep running, main waits
    fi
    q="$ROOT/tasks/queue/$slot"
    f=$(ls "$q"/*.md 2>/dev/null | head -1)
    [ -z "${f:-}" ] && continue
    name=$(basename "$f")
    wd="$(dir_for_slot "$slot")"
    # KIT REPAIR (a): missing worktree = FAILED PICKUP, loud, never a root fallback.
    if [ -z "$wd" ] || [ ! -d "$wd" ]; then
      mv "$f" "$ROOT/tasks/failed/NO-WORKTREE-$name"
      echo "[lane-runner] $(date +%H:%M:%S) ERROR $slot :: $name — workdir $wd is ABSENT; task moved to tasks/failed/NO-WORKTREE-$name. Create the worktree (see worktrees/README.md), then re-queue."
      continue
    fi
    stamp=$(date +%Y%m%d-%H%M%S)
    run="$ROOT/tasks/running/$slot--$stamp-$name"
    mv "$f" "$run"
    log="$ROOT/tasks/runs/$stamp-$slot-$name.log"
    echo "[lane-runner] $stamp START $slot :: $name (log: $log)"
    (
      # per-master model/effort routing — masters may carry an "IMPLEMENTER: model=<m> effort=<e>"
      # line (legacy "CODEX:" accepted); absent = the config defaults.
      rt_model=$(route_field "$run" model)
      rt_effort=$(route_field "$run" effort)
      cd "$wd" && "$IMPL_BIN" exec -m "${rt_model:-$DEF_MODEL}" -c model_reasoning_effort="${rt_effort:-$DEF_EFFORT}" "Do the task in the file at: $run" >"$log" 2>&1
      rc=$?
      if [ $rc -eq 0 ]; then
        # Persist LANE output to its branch so gate-fires can merge a committed branch
        # (uncommitted worktree output is unreachable to headless fires, and commit-to-branch
        # makes janitor reset --hard survivable — reflog-recoverable instead of lost).
        # The MAIN slot stays fire-path-scoped (NEVER auto-commit) per the gate protocol.
        if [ "$slot" != "main" ]; then
          if [ "$wd" = "$ROOT" ]; then
            # KIT REPAIR (b): unreachable by construction (repair (a) failed the pickup),
            # kept as a belt-and-braces refusal — the repo root is NEVER swept.
            echo "[lane-runner] REFUSED auto-commit for $slot: workdir is repo root" >>"$log"
          else
            scoped=$(cfg "runner.slots.$slot.addPaths" '')
            if [ -n "$scoped" ]; then
              add_args=()
              while IFS= read -r p; do [ -n "$p" ] && add_args+=("$p"); done <<EOF_PATHS
$scoped
EOF_PATHS
              ( cd "$wd" && git add -A -- "${add_args[@]}" && git commit -q -m "runner($slot): $name" ) >>"$log" 2>&1 || true
            else
              ( cd "$wd" && git add -A && git commit -q -m "runner($slot): $name" ) >>"$log" 2>&1 || true
            fi
          fi
        fi
        mv "$run" "$ROOT/tasks/done/$stamp-$name"
      else
        mv "$run" "$ROOT/tasks/failed/rc$rc-$stamp-$name"
      fi
      rm -f "$ROOT/tasks/running/$slot.pid"
      echo "[lane-runner] $(date +%H:%M:%S) DONE rc=$rc $slot :: $name"
    ) &
    echo $! > "$pidfile"
  done
  # JANITOR REQUESTS: sandboxed sessions that cannot delete drop WHITELISTED request files
  # in tasks/janitor/ (line1=op, line2=arg); only these two ops exist — nothing from the
  # file is ever executed as code.
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
        while IFS= read -r d; do
          case "$d" in ''|/*|*..*) continue ;; esac  # relative, no traversal
          rm -rf "${ROOT:?}/$d" 2>/dev/null
        done <<EOF_CLEAN
$CLEAN_DIRS
EOF_CLEAN
        echo "[janitor] cleaned test artifacts" ;;
      *) echo "[janitor] unknown op in $(basename "$req") — ignored" ;;
    esac
    mv "$req" "$ROOT/tasks/done/janitor-$(date +%s)-$(basename "$req")" 2>/dev/null
  done
  find "$ROOT/.git" -maxdepth 2 \( -name '*.stale*' -o -name 'tmp_obj_*' \) -type f -delete 2>/dev/null
  find "$ROOT/tasks/runs" -name '*.log' -mtime +"$LOG_RETAIN_DAYS" -delete 2>/dev/null
  sleep "$POLL_SECONDS"
done
