#!/bin/bash
# is-main-2 locked batch (2026-09-26): run INSIDE scripts/attended/dlock.sh, once, back to back.
# The master's three locked gates exactly as it names them, then the ledger-door start-and-serve
# proof (serve.mjs loads vite in middleware mode, so it rides the same lock as test:stats).
# A chained gate stops at its first red leg (`&&`); when that happens every leg of that gate is
# then run on its own, in the same locked call, so each leg has a result (small-fixes-1's method).
set -u
export PATH=/opt/homebrew/bin:$PATH
cd /Users/robin/Claude/Projects/wt-im2 || exit 2
OUT=artifacts/is-main-2
stamp() { echo "[$(date -u +%FT%TZ)] load $(sysctl -n vm.loadavg | tr -d '{}') :: $*"; }
legs() { node -e "console.log(require('./package.json').scripts[process.argv[1]].split(' && ').join('\n'))" "$1"; }

stamp "lock held by pid $$; HEAD $(git rev-parse --short HEAD); node $(node --version)"

run_gate() { # name, envprefix, logfile
  local name=$1 envp=$2 log=$3 s rc
  s=$(date +%s)
  env $envp npm run "$name" > "$log" 2>&1; rc=$?
  stamp "$name rc=$rc $(( $(date +%s) - s ))s (log $log)"
  if [ $rc -ne 0 ]; then
    local i=0
    while IFS= read -r leg; do
      i=$((i + 1))
      s=$(date +%s)
      env $envp bash -c "$leg" > "${log%.log}.leg$i.log" 2>&1; local lrc=$?
      stamp "  leg $i rc=$lrc $(( $(date +%s) - s ))s :: ${leg:0:140}"
    done < <(legs "$name")
  fi
}

run_gate test:node-guards "GR_GUARD_NO_ARTIFACT=1" "$OUT/node-guards-battery.log"
run_gate test:ledger-guards "" "$OUT/ledger-guards.log"
run_gate test:stats "" "$OUT/test-stats.log"

s=$(date +%s)
node "$OUT/serve-start-proof.mjs" . > "$OUT/serve-start-proof.txt" 2>&1; rc=$?
stamp "serve-start-proof rc=$rc $(( $(date +%s) - s ))s"
stamp "batch done; the lock is released on exit"
