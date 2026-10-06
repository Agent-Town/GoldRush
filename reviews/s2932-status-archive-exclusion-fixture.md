# Status archive exclusion fixture — s2932

Verdict: READY-FOR-GATES. Complete closing ledger exit 0: 1,263/1,263 tests and all chained checks. Receipt: artifacts/s2932/ledger-result.json.

The mandatory fire ledger failed because arm 8 of scripts/status-archive-arg-guard.test.mjs required an excluded same-session rewrite in the latest 40 live STATUS commits. At d909a5d5a the live board lawfully contained none: the audit reported CLEAN, zero absent handoffs and zero exclusions. Both output variants were 392 bytes, so the output-size assertion failed.

The test now extends the existing temporary fixture with one unarchived s101 self-update and supplies that fixture through GR_REPO for both variants. All three assertions are unchanged. Live-board checks remain in arms 1 and 6, and the full battery retains its bounded live archive audit. No product change, audit-script change, gate relaxation or history edit.

| Evidence | Result |
| --- | --- |
| Initial complete ledger | 1,262 pass, one failure; 112.223 s |
| Unchanged isolated guard | 11/12; same 392/392-byte failure; 13.857 s |
| Corrected isolated guard | 12/12; zero failures; 8.849 s |
| Copied audit with its showAll listing disabled | Exact arm 8 fails; one selected test ran |
| Complete corrected ledger | See artifacts/s2932/ledger-result.json and report.md |

Classification: direct fire-side correction of its required handoff gate, against main d909a5d5a; only scripts/status-archive-arg-guard.test.mjs changes executable code (10 net lines). No lane merge or conflicts. F-2932-1 is recorded and cured in this commit set; no corrective dispatch remains. Test cleanup follows the existing temporary-fixture lifecycle.

Receipts: artifacts/s2932/first-ledger-guards.txt, status-archive-control.txt, status-archive-fixed.txt, status-archive-mutation.txt, status-audit-all.txt. The mutation replaces only if (showAll) with if (false) in a copied audit tool, never in main.
