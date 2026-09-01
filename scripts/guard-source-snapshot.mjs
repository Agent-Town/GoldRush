#!/usr/bin/env node
/**
 * guard-source-snapshot.mjs — F-2420-1 (measured and cured s2420).
 *
 * Copy a directory's .mjs sources into a scratch dir, for fixtures that must run
 * a real guard from a throwaway tree.
 *
 * THE RACE THIS EXISTS FOR. readdirSync and the copies that follow are NOT
 * atomic, and several guards in `test:ledger-guards` write a transient .mjs into
 * the REAL scripts/ directory and delete it in their own finally{}, BY DESIGN —
 * drain-block-subject-divergence-guard (`tmp-s2262-shadow-<pid>-*`) and
 * drain-block-queue-nearmiss-guard (`tmp-s2390-shadow-<pid>-*`). That battery is
 * a bare `node --test` over 98 files, which parallelises across every CPU, so an
 * entry present in the listing can be gone before it is copied.
 *
 * MEASURED s2420 against desk-birth-gateless-row-guard.test.mjs, which carried
 * this loop twice inline: running it beside the two shadow-writers reproduced the
 * crash 10/10, failing arm 11 — a REVERSE CONTROL — with ENOENT naming a
 * `tmp-s2262-shadow-*` path. With this helper: 0/10, same command, same machine.
 * In the full 98-file battery it is intermittent (s2418 saw 1/3, s2419 0/2), so
 * neither figure is a rate; scheduling decides.
 *
 * IT IS A FALSE RED, NOT A FALSE GREEN — stated honestly and not inflated.
 * Nothing was ever certified wrongly. What earns it a cure is WHERE it lands:
 * F-1300-4 makes this battery the mandated LAST ACT of every ledger-writing fire,
 * and the arm it reddens is a reverse control. A red that recurs for a reason
 * everyone can dismiss is precisely how a reverse control is excused into
 * uselessness (F-1460-1, the `cross-engine` fate).
 *
 * WHY A DISCRIMINATOR AND NOT A SWALLOW. ENOENT on an entry that vanished
 * mid-copy is EXPECTED and skipped; every other error is RETHROWN; and the
 * caller's required subject is asserted present before returning. So it cannot
 * mask a missing dependency — proven s2420: omit any real dependency and the
 * spawned guard dies at module resolution (rc=1), which no arm's stderr
 * assertion accepts.
 *
 * DELIBERATELY NOT CURED BY SKIPPING `tmp-*`: 157 tracked files in scripts/ carry
 * that prefix as RETAINED EVIDENCE (F-1665-1), so a prefix filter is a far wider
 * change than the defect, aimed by a guess about which sources matter.
 *
 * EXTRACTED to a plain module rather than exported from the .test.mjs that needed
 * it, because `node:test` REGISTERS TESTS AT MODULE LOAD: a guard importing the
 * helper from that file would also run its twelve arms (the s2363 trap, whose
 * cure — scripts/collection-guard-subjects.mjs — is the precedent copied here).
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {string} srcDir   directory to snapshot (its .mjs, excluding .test.mjs)
 * @param {string} destDir  existing scratch directory to copy into
 * @param {string} required basename that MUST arrive, or this refuses
 * @returns {{copied: number, vanished: string[]}}
 */
export function copyGuardSources(srcDir, destDir, required) {
  if (!required) {
    throw new Error('copyGuardSources: a required subject basename must be named');
  }
  const vanished = [];
  let copied = 0;
  for (const f of fs.readdirSync(srcDir)) {
    if (!f.endsWith('.mjs') || f.endsWith('.test.mjs')) continue;
    try {
      fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
      copied++;
    } catch (e) {
      // Only a mid-copy vanish is expected. Anything else — EACCES, EISDIR, a
      // full disk — is a real failure and must stay LOUD.
      if (e.code !== 'ENOENT') throw e;
      vanished.push(f);
    }
  }
  if (!fs.existsSync(path.join(destDir, required))) {
    throw new Error(
      `copyGuardSources: the SUBJECT "${required}" never reached ${destDir} — ` +
      'this fixture would test nothing. (Skipped as vanished: ' +
      `${vanished.join(', ') || 'none'}.)`,
    );
  }
  return { copied, vanished };
}
