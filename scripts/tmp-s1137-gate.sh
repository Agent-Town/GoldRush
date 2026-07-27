#!/usr/bin/env bash
# s1137 scratch gate runner — scratch port 5237, external server (Mistake #12)
export GR_CAPTURE_BASE_URL=http://127.0.0.1:5237
export GR_CAPTURE_EXTERNAL_SERVER=1
exec npx playwright test "$@" --workers=1 --reporter=list
