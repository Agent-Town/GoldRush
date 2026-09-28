#!/bin/bash
# is-main-2: every changed tool run once THE WAY ITS CALLERS RUN IT, on the cured tree, by its real
# path (the symlink table runs each by both spellings; this file is about the callers' shapes).
# Each command is local and writes nothing tracked; the reason for each shape is its caller:
#   package.json legs, the drain skill (.claude/skills/drain/SKILL.md:31-32), the e2e and test
#   spawners, and the tools' own usage lines. serve.mjs is proved in the locked batch
#   (serve-start-proof.mjs) because it loads vite in middleware mode beside test:stats.
set -u
export PATH=/opt/homebrew/bin:$PATH
cd /Users/robin/Claude/Projects/wt-im2 || exit 2
SP=${IM2_SCRATCH:-$(mktemp -d)}
row() { # caller, command...
  local caller=$1; shift
  local s=$(date +%s) out rc
  out=$("$@" 2>&1); rc=$?
  printf '%s | rc %s | %s B | %ss | load %s | %s\n' "$*" "$rc" "${#out}" "$(( $(date +%s) - s ))" "$(sysctl -n vm.loadavg | awk '{print $2}')" "$caller"
  printf '%s\n' "$out" | tail -3 | sed 's/^/      > /' | cut -c1-200
}
echo "callers-way: $(git rev-parse --short HEAD) $(git status --short -- scripts server | wc -l | tr -d ' ') modified tool file(s) in the tree; node $(node --version); $(date -u +%FT%TZ)"
row "package.json test:ruling-propagation" npm run --silent test:ruling-propagation
row "package.json test:findings-state" npm run --silent test:findings-state
row "package.json test:blocker-panel" npm run --silent test:blocker-panel
row "fires and attended (default corpus)" node scripts/desk-state-audit.mjs
row "drain skill SKILL.md:31 (<base> HEAD)" node scripts/evidence-budget.mjs f99bb77f3 HEAD
row "its usage line (--plan, read-only)" node scripts/evidence-offload.mjs --plan --limit 5
row "drain skill SKILL.md:32 (a one-job battery, transcript in scratch)" node scripts/gate-battery.mjs --label is-main-2-probe --transcript "$SP/gate-battery-probe.txt" '[["node version","node","--version"]]'
row "terrain-contract-scope.test.mjs:12 (--check)" node scripts/terrain-contract-scope.mjs --check
row "e2e/e7-playbook-rows.spec.ts:169 (--all --sub-wave)" node scripts/e7-playbook-digest.mjs --all --sub-wave
row "its usage line (no --log/--tape, so nothing written)" node scripts/e4-motor-ride.mjs --contract e4-dust-flats --seed e4-dust-flats-01
row "perf-survey/sim.mjs:26 (a reel path)" node scripts/assay-replay-agent.mjs scripts/fixtures/assay/rob-the-claim-reel.json
row "package.json test:node-guards leg (imports ticker-stats)" node scripts/test-ticker-stats.mjs
echo "done $(date -u +%FT%TZ)"
