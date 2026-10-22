# s3288 — Archive verification scope

The unmodified ledger battery passed on Node 26.4.0: 1,263/1,263 tests, zero failures; final kit 83/83. Inputs and HEAD were unchanged throughout. See ledger-result.json.

An extra, unbounded status-archive-audit.mjs run used the shell default Node 23.11.1 and exhausted its approximately 4 GB heap before producing a verdict. No full-history pass or completed legacy-drop count is claimed. Its compound shell's final rc 0 came from git diff and is not the audit's exit code. The retained stdout, structured limitation receipt and launcher log preserve this failure.

The documented current regression command was then run on canonical Node 26.4.0 with its own exit captured: status-archive-audit.mjs --limit 40 --quiet returned 0, no permanently absent handoffs, 18 lock-time drops restored in the eventual handoff, and no abridgements. This also matches the bounded check already included in the green ledger battery. No audit implementation or history was changed; no unrelated factory corrective was opened.
