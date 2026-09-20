# Trestle browser attribution

Candidate engine `9582fb444b805f2a16b85b3720834fd7d12091e8cf48a96a6862c45b1afcad80`, exact base `ddfb210f5` / engine `e993b9ec062d5d02e2b503c2edf42ab8bf600c9074381e01d8634a4758b03d7b`. The base runner restored every changed tracked production byte and then restored the candidate byte-for-byte; [receipt](base-registry.json). Existing specs and assertions are untouched.

The first 44-test own/pack/registry round records **32 pass, 5 skip, 7 fail**. Both Trestle gameplay runs pass, as do applicable brightness/collision, fort routing, simulation parity and disposal checks. The separate Trestle census round passes **4/4**. Shared loading/repeat probes pass **8/8 and 2/2** on their existing generic fixtures.

Six failures reproduce on the exact base, in both browser projects:

| Existing assertion | Candidate and exact-base fingerprint | Owner |
| --- | --- | --- |
| `terrain3d-registry.spec.ts:217` | Expected 32,768 triangles, received 51,200 | Registry census maintenance via Claude; the assertion reaches the previously enlarged Twin Banks terrain before Trestle |
| `terrain3d-registry.spec.ts:281` | Expected `painted-underlay-alpha-rim`, received `opaque-sculpt-edge` | Registry/terrain boundary owner via Claude |
| `terrain3d-registry.spec.ts:362` | Expected invalid-byte state `failed`, received `lite` | Runtime-tier/registry fixture owner via Claude |

The remaining candidate failure is the registry's generic one-window timing assertion at line 463 on phone: **12.80 ms > 11.96 ms** (1.15 × 10.40 ms). The exact-base phone run passes. The exact-base desktop run instead fails the same assertion at **26.90 ms > 22.885 ms** (1.15 × 19.90 ms), while the initial candidate desktop passes. This establishes sensitivity in the shared timing test, but is **not** claimed as an exact viewport reproduction of the candidate failure. The isolated candidate retry passes desktop again but fails phone at **678.10 ms > 37.03 ms** (1.15 × 32.20 ms). This extreme sample is retained. The second exact-base timing round fails desktop at the same line (340.30 ms > 296.815 ms), and phone times out at 180 s in the existing Begin-button helper (line 85). [Second base receipt](base-budget-repeat.json). The shared timing gate remains **HELD by the registry/performance-gate owner via Claude**. The original phone threshold failure is not reproduced with the same viewport fingerprint; the later base phone timeout is a different failure, not an attribution shortcut. The dedicated Trestle actual-source/GLB four-run comparisons are separately retained and satisfy +15% for both pooled and comparable fast-mode medians; unmatched slow samples are disclosed, not discarded.

Raw logs and failure screenshots stay under `_raw/run-3/e2-trestle-own-and-pack`, `_raw/run-3/e2-trestle-base-registry` and the named retry folder. No protected assertion was weakened.

During the second base round, a read-only [host snapshot](host-during-registry-retry.json) records load averages 37.80 / 38.90 / 25.97 and 86% system-wide free-memory percentage. That is context for timing variability, not proof of which external process caused any particular frame. The desktop base timing is now 340.30 ms > 296.815 ms (1.15 × 258.10 ms).

Final named task/citation/gate-caller guards pass 3/3, and relevant render guards pass 34/34. The task simultaneously requests `--changed-since` and reserves the full node battery for the drain; the current runner unconditionally invokes that battery in changed-since mode. The named subset is recorded in [node-gates.json](node-gates.json), not presented as a full changed-since pass. Further generic timing repeats were stopped after both source arms showed severe timing failures under elevated host load. No production code was changed after the passing dedicated four-run Trestle measurements.
