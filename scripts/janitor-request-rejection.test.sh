#!/bin/bash
# F-1424-2 — the janitor queue must distinguish accepted work from rejected input.
#
# This test extracts and runs the REAL janitor block from lane-runner-v3.sh. A copy
# of the dispatch logic would stay green while the runner regressed.
set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUNNER="$REPO_ROOT/scripts/lane-runner-v3.sh"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/gold-rush-janitor-rejection.XXXXXX")"
BLOCK="$TMP/janitor-block.sh"
trap 'rm -rf "$TMP"' EXIT

[ -r "$RUNNER" ] || { echo "MISUSE: cannot read $RUNNER"; exit 2; }

awk '
  /^  # JANITOR REQUESTS / { copying = 1 }
  copying { original = $0; sub(/^  /, ""); print; if (original == "  done") exit }
' "$RUNNER" > "$BLOCK"
grep -q 'case "$op" in' "$BLOCK" && grep -q 'tasks/done/' "$BLOCK" || {
  echo "MISUSE: could not extract the janitor block from $RUNNER"
  exit 2
}

new_fixture() { # new_fixture <name> <lane> [busy]
  local root="$TMP/$1" lane="$2"
  mkdir -p "$root/tasks/janitor" "$root/tasks/done" "$root/tasks/running" "$root/worktrees/$lane"
  git -C "$root/worktrees/$lane" init -q -b main
  git -C "$root/worktrees/$lane" -c user.name=fixture -c user.email=fixture@example.com \
    commit -qm fixture --allow-empty
  [ "${3:-}" = busy ] && : > "$root/tasks/running/$lane.pid"
  echo "$root"
}

fail=0
check() { # check <description> <command...>
  local desc="$1"
  shift
  if ! "$@"; then
    echo "FAIL: $desc"
    fail=1
  fi
}

# A valid refresh keeps the historical success filename exactly.
success_root="$(new_fixture success lane-c)"
printf 'refresh-lane\nlane-c\n' > "$success_root/tasks/janitor/success.req"
success_out="$(ROOT="$success_root" bash "$BLOCK")"
success_files=("$success_root"/tasks/done/janitor-[0-9]*-success.req)
rejected_success_files=("$success_root"/tasks/done/janitor-REJECTED-*-success.req)
check "well-formed refresh was consumed" test ! -e "$success_root/tasks/janitor/success.req"
check "well-formed refresh kept janitor-<epoch>-<name>" test -f "${success_files[0]}"
check "well-formed refresh has no rejection marker" test ! -e "${rejected_success_files[0]}"

# Both malformed shapes seen in history must be visibly rejected.
rejected_root="$(new_fixture rejected lane-c)"
printf 'op: refresh-lane\nlane: lane-c\n' > "$rejected_root/tasks/janitor/yaml.req"
printf 'refresh-lane lane-c\n' > "$rejected_root/tasks/janitor/one-line.req"
printf 'refresh-lane\nlane-c\n' > "$rejected_root/tasks/janitor/z-valid.req"
rejected_out="$(ROOT="$rejected_root" bash "$BLOCK")"
check "YAML-ish request was filed as REJECTED" test -f "$rejected_root/tasks/done/janitor-REJECTED-"*-yaml.req
check "single-line request was filed as REJECTED" test -f "$rejected_root/tasks/done/janitor-REJECTED-"*-one-line.req
check "YAML-ish request has no success filename" test ! -e "$rejected_root/tasks/done/janitor-"[0-9]*-yaml.req
check "single-line request has no success filename" test ! -e "$rejected_root/tasks/done/janitor-"[0-9]*-one-line.req
check "a valid request after rejections keeps the success filename" test -f "$rejected_root/tasks/done/janitor-"[0-9]*-z-valid.req
check "a valid request after rejections does not inherit REJECTED" test ! -e "$rejected_root/tasks/done/janitor-REJECTED-"*-z-valid.req
check "YAML-ish rejection quotes the offending first line" grep -Fq '"op: refresh-lane"' <<< "$rejected_out"
check "single-line rejection quotes the offending first line" grep -Fq '"refresh-lane lane-c"' <<< "$rejected_out"
check "rejection output states the two-line contract" grep -Fq 'line1=op, line2=arg' <<< "$rejected_out"

# BUSY is retryable, so F-1324-2 still keeps it in the live queue.
busy_root="$(new_fixture busy lane-b busy)"
printf 'refresh-lane\nlane-b\n' > "$busy_root/tasks/janitor/busy.req"
busy_out="$(ROOT="$busy_root" bash "$BLOCK")"
check "BUSY request remains queued" test -f "$busy_root/tasks/janitor/busy.req"
busy_done=("$busy_root"/tasks/done/*)
check "BUSY request was not archived" test ! -e "${busy_done[0]}"
check "BUSY output says the request was kept" grep -Fq 'request KEPT for a later cycle' <<< "$busy_out"

if [ "$fail" -eq 0 ]; then
  echo "PASS(a): well-formed refresh kept janitor-<epoch>-<name> with no rejection marker"
  echo "PASS(b): both malformed historical shapes were visibly filed as janitor-REJECTED"
  echo "PASS(c): BUSY refresh remained in tasks/janitor with no archive"
  exit 0
fi
echo "janitor request handling is WRONG — see failures above"
exit 1
