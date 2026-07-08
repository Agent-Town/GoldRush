#!/usr/bin/env bash
# s140 scratch gate runner (external vite on 5231) — temp, retire post-fire
set -uo pipefail
cd "$(dirname "$0")/.."
export GR_CAPTURE_EXTERNAL_SERVER=1
export GR_CAPTURE_BASE_URL=http://127.0.0.1:5231
npx playwright test "$@" --workers=1
echo "PW_EXIT=$?"
