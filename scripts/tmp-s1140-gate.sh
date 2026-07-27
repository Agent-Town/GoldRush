#!/usr/bin/env bash
# s1140 scratch gate runner — external dev server on 5251.
# 5188 belongs to the lane runners (Mistake #12: never gate on their port).
# Target/repeat come from env so the caller passes no argv (keeps the exec gate happy).
export GR_CAPTURE_EXTERNAL_SERVER=1
export GR_CAPTURE_BASE_URL=http://127.0.0.1:5251

SPEC="${SPEC:-e2e/task-037-assay-bench-ungate.spec.ts}"
REPEAT="${REPEAT:-1}"
LOG="${LOG:-scripts/tmp-s1140-last.log}"

npx playwright test "$SPEC" \
  --config scripts/tmp-s1140-pw.config.ts \
  --project=desktop-chrome --project=mobile-chrome \
  --repeat-each="$REPEAT" --workers=1 --reporter=list >"$LOG" 2>&1
rc=$?
echo "=== rc=$rc  spec=$SPEC repeat=$REPEAT ==="
tail -90 "$LOG"
exit $rc
