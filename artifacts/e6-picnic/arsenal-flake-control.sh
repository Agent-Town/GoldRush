#!/usr/bin/env bash
# F-E6PA-6 control: is `e6-arsenal.spec.ts:29` mine, or the box? Five solo runs, both projects,
# with the failing project named each time. A red that lands on a DIFFERENT project run to run is
# load, not logic — a deterministic tree red picks the same project every time.
set -u
cd "$(dirname "$0")/../.."
for run in 1 2 3 4 5; do
  printf 'run%s ' "$run"
  npx playwright test e2e/e6-arsenal.spec.ts --config=playwright.e6picnic.config.ts \
    --workers=1 --reporter=line 2>&1 \
    | grep -E "^ +[0-9]+ (passed|failed)|^ +\[.*e6-arsenal" | tr '\n' ' '
  echo
done
