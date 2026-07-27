#!/bin/sh
set -u

tmp_dir=$(mktemp -d "${TMPDIR:-/tmp}/gr-f-1147-bisect.XXXXXX") || exit 125
trap 'rm -rf "$tmp_dir"' EXIT

if ! npm run build >"$tmp_dir/build.log" 2>&1; then
  tail -40 "$tmp_dir/build.log"
  exit 125
fi

npx playwright test e2e/m2-04-gold-stealing.spec.ts \
  -g "palisade line" \
  --project=desktop-chrome \
  --workers=1 \
  --reporter=line >"$tmp_dir/playwright.log" 2>&1
test_rc=$?
cat "$tmp_dir/playwright.log"

if [ "$test_rc" -eq 0 ]; then
  exit 0
fi

if grep -q "Expected: < 20" "$tmp_dir/playwright.log"; then
  exit 1
fi

exit 125
