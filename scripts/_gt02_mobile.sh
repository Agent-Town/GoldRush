#!/usr/bin/env bash
export GR_CAPTURE_EXTERNAL_SERVER=1
export GR_CAPTURE_BASE_URL=http://127.0.0.1:5188
cd "/Users/robin/Claude/Projects/Gold Rush"
npx playwright test e2e/gt-02-slope.spec.ts --project=mobile-chrome --workers=1 2>&1 | tail -24
