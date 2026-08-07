#!/bin/bash
# F-1522-1 — dispatch must refuse only a positively identified HOLDS lane.
# The test extracts the real runner block and drives it against disposable Git worktrees.
set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUNNER="$REPO_ROOT/scripts/lane-runner-v3.sh"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/gold-rush-lane-dispatch.XXXXXX")"
BLOCK="$TMP/dispatch-guard.sh"
trap 'rm -rf "$TMP"' EXIT

[ -r "$RUNNER" ] || { echo "MISUSE: cannot read $RUNNER"; exit 2; }

awk '
  /# BEGIN F-1522-1 LANE-SAFETY GUARD/ { copying = 1 }
  copying { print; if (/^    # END F-1522-1 LANE-SAFETY GUARD/) exit }
' "$RUNNER" > "$BLOCK"

new_fixture() { # new_fixture <name>
  local root="$TMP/$1"
  mkdir -p "$root/scripts" "$root/tasks/queue/lane-a" "$root/tasks/running" "$root/worktrees"
  git -C "$root" init -q -b main
  git -C "$root" config user.name fixture
  git -C "$root" config user.email fixture@example.com
  cp "$REPO_ROOT/scripts/lane-usable.mjs" "$REPO_ROOT/scripts/lane-residue.mjs" \
    "$REPO_ROOT/scripts/lane-absorbed-lines.mjs" "$root/scripts/"
  printf 'base\n' > "$root/base.txt"
  git -C "$root" add base.txt scripts
  git -C "$root" commit -qm base
  git -C "$root" worktree add -q -b lane/a "$root/worktrees/lane-a" main
  printf 'fixture master\n' > "$root/tasks/queue/lane-a/master.md"
  echo "$root"
}

verdict_for() {
  (cd "$1" && node scripts/lane-usable.mjs lane-a 2>&1 || true) |
    sed -n 's/^  => \([A-Z-]*\):.*/\1/p' | tail -1
}

dispatch_once() {
  local ROOT="$1" slot=lane-a wd="$1/worktrees/lane-a"
  local f="$1/tasks/queue/lane-a/master.md" name=master.md
  local run="$1/tasks/running/master.md"
  for dispatch_attempt in 1; do
    . "$BLOCK"
    mv "$f" "$run"
  done
}

fail=0
pass() { echo "PASS($1): $2"; }
fail() { echo "FAIL($1): $2"; fail=1; }

holds_root="$(new_fixture holds)"
printf 'main has never absorbed this\n' > "$holds_root/worktrees/lane-a/held-path.txt"
git -C "$holds_root/worktrees/lane-a" add held-path.txt
git -C "$holds_root/worktrees/lane-a" commit -qm held
holds_verdict="$(verdict_for "$holds_root")"
holds_out="$(dispatch_once "$holds_root")"
if [ "$holds_verdict" = HOLDS ] &&
   [ -f "$holds_root/tasks/queue/lane-a/master.md" ] &&
   [ ! -e "$holds_root/tasks/running/master.md" ] &&
   grep -Fq 'held-path.txt' <<< "$holds_out"; then
  pass REFUSES-HOLDS 'queue file stayed queued and held-path.txt was logged'
else
  fail REFUSES-HOLDS "verdict=$holds_verdict; queue=$(test -e "$holds_root/tasks/queue/lane-a/master.md" && echo kept || echo moved); output=${holds_out:-<empty>}"
fi

fully_absorbed_root="$(new_fixture fully-absorbed)"
printf 'base\nlane contribution\n' > "$fully_absorbed_root/worktrees/lane-a/base.txt"
git -C "$fully_absorbed_root/worktrees/lane-a" add base.txt
git -C "$fully_absorbed_root/worktrees/lane-a" commit -qm lane-contribution
printf 'base\nlane contribution\nmain moved further\n' > "$fully_absorbed_root/base.txt"
git -C "$fully_absorbed_root" add base.txt
git -C "$fully_absorbed_root" commit -qm main-superset
fully_absorbed_verdict="$(verdict_for "$fully_absorbed_root")"
fully_absorbed_out="$(dispatch_once "$fully_absorbed_root")"
if [ "$fully_absorbed_verdict" = HOLDS ] &&
   [ -f "$fully_absorbed_root/tasks/running/master.md" ] &&
   grep -Fq 'base.txt' <<< "$fully_absorbed_out"; then
  pass DISPATCHES-HOLDS-BUT-FULLY-ABSORBED 'BOTH-MOVED path with zero residue dispatched and was logged'
else
  fail DISPATCHES-HOLDS-BUT-FULLY-ABSORBED "verdict=$fully_absorbed_verdict; queue=$(test -e "$fully_absorbed_root/tasks/queue/lane-a/master.md" && echo kept || echo moved); output=${fully_absorbed_out:-<empty>}"
fi

real_residue_root="$(new_fixture real-residue)"
printf 'base\nlane residue main never saw\n' > "$real_residue_root/worktrees/lane-a/base.txt"
git -C "$real_residue_root/worktrees/lane-a" add base.txt
git -C "$real_residue_root/worktrees/lane-a" commit -qm real-residue
real_residue_verdict="$(verdict_for "$real_residue_root")"
real_residue_out="$(dispatch_once "$real_residue_root")"
deletion_residue_root="$(new_fixture deletion-residue)"
printf 'base\ndelete me\n' > "$deletion_residue_root/base.txt"
git -C "$deletion_residue_root" add base.txt
git -C "$deletion_residue_root" commit -qm main-line-to-preserve
git -C "$deletion_residue_root/worktrees/lane-a" reset --hard main >/dev/null
printf 'base\nalready on main\n' > "$deletion_residue_root/worktrees/lane-a/base.txt"
git -C "$deletion_residue_root/worktrees/lane-a" add base.txt
git -C "$deletion_residue_root/worktrees/lane-a" commit -qm mixed-residue
printf 'base\ndelete me\nalready on main\nmain moved further\n' > "$deletion_residue_root/base.txt"
git -C "$deletion_residue_root" add base.txt
git -C "$deletion_residue_root" commit -qm main-superset-keeps-deletion
deletion_residue_out="$(dispatch_once "$deletion_residue_root")"
if [ "$real_residue_verdict" = HOLDS ] &&
   [ -f "$real_residue_root/tasks/queue/lane-a/master.md" ] &&
   [ ! -e "$real_residue_root/tasks/running/master.md" ] &&
   [ -f "$deletion_residue_root/tasks/queue/lane-a/master.md" ] &&
   [ ! -e "$deletion_residue_root/tasks/running/master.md" ]; then
  pass REFUSES-HOLDS-WITH-REAL-RESIDUE 'queue file stayed queued for unseen additions and mixed add/delete residue'
else
  fail REFUSES-HOLDS-WITH-REAL-RESIDUE "verdict=$real_residue_verdict; addition-queue=$(test -e "$real_residue_root/tasks/queue/lane-a/master.md" && echo kept || echo moved); deletion-queue=$(test -e "$deletion_residue_root/tasks/queue/lane-a/master.md" && echo kept || echo moved); output=${real_residue_out:-<empty>} ${deletion_residue_out:-<empty>}"
fi

residue_probe_failure_root="$(new_fixture residue-probe-failure)"
printf 'base\nlane residue main never saw\n' > "$residue_probe_failure_root/worktrees/lane-a/base.txt"
git -C "$residue_probe_failure_root/worktrees/lane-a" add base.txt
git -C "$residue_probe_failure_root/worktrees/lane-a" commit -qm real-residue
mv "$residue_probe_failure_root/scripts/lane-absorbed-lines.mjs" \
  "$residue_probe_failure_root/scripts/lane-absorbed-lines.mjs.off"
residue_probe_failure_verdict="$(verdict_for "$residue_probe_failure_root")"
residue_probe_failure_out="$(dispatch_once "$residue_probe_failure_root")"
if [ "$residue_probe_failure_verdict" = HOLDS ] &&
   [ -f "$residue_probe_failure_root/tasks/queue/lane-a/master.md" ] &&
   [ ! -e "$residue_probe_failure_root/tasks/running/master.md" ]; then
  pass REFUSES-ON-RESIDUE-PROBE-FAILURE 'inner probe failure kept the queue file queued'
else
  fail REFUSES-ON-RESIDUE-PROBE-FAILURE "verdict=$residue_probe_failure_verdict; queue=$(test -e "$residue_probe_failure_root/tasks/queue/lane-a/master.md" && echo kept || echo moved); output=${residue_probe_failure_out:-<empty>}"
fi

absorbed_root="$(new_fixture absorbed)"
printf 'byte-identical on both branches\n' > "$absorbed_root/worktrees/lane-a/absorbed.txt"
git -C "$absorbed_root/worktrees/lane-a" add absorbed.txt
git -C "$absorbed_root/worktrees/lane-a" commit -qm lane-copy
printf 'byte-identical on both branches\n' > "$absorbed_root/absorbed.txt"
git -C "$absorbed_root" add absorbed.txt
git -C "$absorbed_root" commit -qm main-copy
absorbed_verdict="$(verdict_for "$absorbed_root")"
dispatch_once "$absorbed_root" >/dev/null
if [ "$absorbed_verdict" = AHEAD-BUT-ABSORBED ] &&
   [ -f "$absorbed_root/tasks/running/master.md" ]; then
  pass DISPATCHES-AHEAD-BUT-ABSORBED 'safe squash-dupe shape dispatched'
else
  fail DISPATCHES-AHEAD-BUT-ABSORBED "verdict=$absorbed_verdict; master did not dispatch"
fi

usable_root="$(new_fixture usable)"
usable_verdict="$(verdict_for "$usable_root")"
dispatch_once "$usable_root" >/dev/null
if [ "$usable_verdict" = USABLE ] && [ -f "$usable_root/tasks/running/master.md" ]; then
  pass DISPATCHES-USABLE 'clean ahead=0 lane dispatched'
else
  fail DISPATCHES-USABLE "verdict=$usable_verdict; master did not dispatch"
fi

dirty_root="$(new_fixture dirty)"
printf 'tracked dirt\n' > "$dirty_root/worktrees/lane-a/base.txt"
dirty_verdict="$(verdict_for "$dirty_root")"
dispatch_once "$dirty_root" >/dev/null
if [ "$dirty_verdict" = DIRTY ] && [ -f "$dirty_root/tasks/running/master.md" ]; then
  pass DISPATCHES-DIRTY-RC2 'DIRTY shares rc=2 but is not HOLDS'
else
  fail DISPATCHES-DIRTY-RC2 "verdict=$dirty_verdict; master did not dispatch"
fi

fail_open_root="$(new_fixture fail-open)"
mv "$fail_open_root/scripts/lane-usable.mjs" "$fail_open_root/scripts/lane-usable.mjs.off"
dispatch_once "$fail_open_root" >/dev/null
if [ -f "$fail_open_root/tasks/running/master.md" ]; then
  pass DISPATCHES-PROBE-FAIL-OPEN 'missing probe dispatched'
else
  fail DISPATCHES-PROBE-FAIL-OPEN 'missing probe stalled dispatch'
fi

[ "$fail" -eq 0 ] || exit 1
