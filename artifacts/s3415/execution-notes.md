# s3415 execution note — archive audit scope

The initial no-argument archive audit started an unbounded walk of 7,471 STATUS commits using ambient Node 23.11.1. Its own banner warned that the full historical walk includes known legacy omissions. It exited 134 with a V8 heap allocation failure. A later ownership-checked stop attempt found no matching live process and sent no signals. The output is preserved in status-archive-audit.txt.

The applicable regression command is `node scripts/status-archive-audit.mjs --limit 40 --quiet`; its separate output is status-archive-bounded.txt. The final ledger battery runs the bounded leg under the repository Node 26.4.0. This invocation error establishes no product defect and does not justify factory changes. Full closing ledger results remain in ledger-result.json.
