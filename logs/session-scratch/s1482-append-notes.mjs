// F-1397-3 cure shape: APPEND a correction note; never edit the cited lines, which would rot
// every citation quoting them. Both targets are SHIPPED masters.
import fs from 'node:fs';

const NOTE_F1397 = `

---

**CORRECTION APPENDED s1482 (F-1398-1 — do not edit the lines above; citations quote them).**
The commands at \`:38\` and \`:61\` name \`e2e/release-build.spec.ts\` without naming a config, so they
run under the DEFAULT harness — and \`playwright.config.ts\` \`testIgnore\`s that spec (it sits in the
\`claimedByAnotherConfig\` array, landed \`395bc04be\` 2026-07-31, the F-1296-3 cure). Measured s1482:
\`npx playwright test e2e/release-build.spec.ts --list\` prints **"No tests found" / "Total: 0 tests in
0 files"** and exits rc=1. It fails loudly rather than falsely green, so nothing shipped on a false
pass — the cost was a runner cycle spent diagnosing a harness error. This master postdates
\`395bc04be\` by two days, so it was wrong when written; that is why it is not grandfathered.
**The correct invocation names the owning config:**
\`npx playwright test --config playwright.release.config.ts --workers=1\` (or \`npm run test:release\`).
Guarded since s1482 by \`scripts/claimed-spec-harness-guard.mjs\`.
`;

const NOTE_F1305 = `

---

**CORRECTION APPENDED s1482 (F-1398-1 — do not edit the lines above; citations quote them).**
The SELF-CHECK at \`:45\` orders "the 15 migrated specs green-or-fingerprint-matched", and
\`e2e/release-build.spec.ts\` is one of those 15 (named at \`:25\` as the densest, 9 \`watchErrors(\`
occurrences). Under the DEFAULT harness that spec collects **zero tests**: \`playwright.config.ts\`
\`testIgnore\`s it via \`claimedByAnotherConfig\` (landed \`395bc04be\` 2026-07-31T21:34, the F-1296-3
cure) — and this master was authored \`4aff1a7c6\` 2026-08-01T00:23, **under three hours later**, so
the instruction was already impossible when written. Measured s1482:
\`npx playwright test e2e/release-build.spec.ts --list\` -> "No tests found" / "Total: 0 tests in 0
files", rc=1. The cited red lines \`:160/:107/:165/:199/:393\` therefore cannot be reproduced under
the default config at all; they are reachable only via the owning config,
\`playwright.release.config.ts\` (\`npm run test:release\`).
Guarded since s1482 by \`scripts/claimed-spec-harness-guard.mjs\`.
`;

for (const [f, note] of [
  ['tasks/f1397-1-e1-release-door-drill-yard.md', NOTE_F1397],
  ['tasks/lane-a-f1305-2-console-watch-single-source.md', NOTE_F1305],
]) {
  const before = fs.readFileSync(f, 'utf8');
  if (before.includes('CORRECTION APPENDED s1482')) {
    console.log('already appended, skipping:', f);
    continue;
  }
  fs.writeFileSync(f, before.replace(/\s*$/, '') + note);
  console.log('appended to', f, '(', before.length, '->', fs.statSync(f).size, 'bytes )');
}
