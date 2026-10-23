# s3309 — Archive audit needed its established 40-commit boundary

The fire initially invoked scripts/status-archive-audit.mjs without arguments. The tool announced an unbounded 7,241-commit historical walk and explained that legacy drops predate the archive law. Node 23.11.1 exhausted its 4 GB heap; status-archive-before.txt preserves the error. This was an invocation mistake, not a newly discovered product defect.

A duplicate retry on pinned Node 26.4.0 also omitted the limit. After reading the tool header, the fire stopped only that own child, PID 62424 under wrapper 61719, with SIGTERM. audit-stop.txt and status-archive-retry.json preserve its identity and termination. No factory process or test battery was stopped.

The correct established regression command is /Users/robin/.nvm/versions/node/v26.4.0/bin/node scripts/status-archive-audit.mjs --limit 40 --quiet. Its final receipt is status-archive-bounded.json and its output is status-archive-bounded.txt. No audit code, assertions, timeout or baseline changed. The full unmodified ledger battery also includes the bounded archive leg.
