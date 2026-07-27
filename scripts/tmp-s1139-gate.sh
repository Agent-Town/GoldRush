#!/usr/bin/env bash
# s1139 scratch gate runner — external dev server on 5243 (5188 belongs to the lane runners).
export GR_CAPTURE_EXTERNAL_SERVER=1
export GR_CAPTURE_BASE_URL=http://127.0.0.1:5243
exec npx playwright test "$@" --workers=1 --reporter=list
