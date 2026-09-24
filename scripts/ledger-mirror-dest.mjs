#!/usr/bin/env node
/**
 * ledger-mirror-dest.mjs — THE ONE PLACE LB-01's DESTINATION IS DECIDED.
 *
 * WHY THIS EXISTS (F-2668-2's remaining half, owner ruling 2026-09-24 item 15,
 * verbatim: "keep the mirror out of the public tree and point the duty at the
 * private archive"; and F-2671-1's deliberately-banked observation)
 * ---------------------------------------------------------------------------
 * Three tools measured or wrote the SAME directory and each decided where it
 * was on its own:
 *
 *   scripts/ledger-backup-pull.mjs      DEFAULT_DEST = ../artifacts/ledger-backups/,
 *                                       OVERRIDABLE by LEDGER_BACKUP_DEST
 *   scripts/ledger-mirror-freshness.mjs MIRROR_DIR   = ../artifacts/ledger-backups/,
 *                                       overridable by NOTHING
 *   scripts/ledger-mirror-exposure.mjs  DEFAULT_DIR  = ../artifacts/ledger-backups/,
 *                                       overridable by --dir
 *
 * s2671 wrote that divergence down rather than curing it, because its cure was
 * gated on one thing: "a destination re-homed by environment rather than by
 * editing the anchor would leave the guard auditing the abandoned path and
 * calling a healthy mirror stale". The re-home below turns that from a
 * hypothetical into the live case, so the divergence is cured first, here, by
 * making the question unaskable: there is now ONE resolver and three importers.
 *
 * WHERE IT POINTS, AND WHY IT IS NOT IN THE REPO
 * ---------------------------------------------
 * `~/.goldrush/ledger-backups/` — outside the public working tree entirely.
 * Not merely gitignored: F-2661-1's hazard is that a `git add` + commit + push
 * of county standings into a PUBLIC origin is a one-way door (force-push is
 * deny-listed, F-2353-2), and a .gitignore line is one `git add -f`, one rule
 * edit, or one `git clean -x` away from not protecting anything. A path that is
 * not under the repo root cannot be committed to it by accident at all.
 *
 * `~/.goldrush/` is the established private-local home on this machine (0700,
 * it already holds `rotation-salt` — RT-01's secret — and the .env.local
 * backup), so this adds no new trust assumption.
 *
 * ANCHORED TO homedir(), NEVER TO process.cwd() (F-2220-1 / F-2221-1): a
 * caller's directory must not be able to swap the corpus. The old anchor was
 * import.meta.url, which had the same property; homedir() keeps it.
 *
 * THE OVERRIDE, AND WHY IT MUST ANNOUNCE ITSELF
 * --------------------------------------------
 * LEDGER_BACKUP_DEST stays honoured — the three ledger test files drive their
 * fixtures with it — but an env-narrowed corpus that PRINTS like the default
 * one is F-2220-1 rebuilt in a new place. So the resolver returns the
 * PROVENANCE alongside the path, and every caller declares both on stdout,
 * always, including the happy path (F-2208-1).
 *
 * A RELATIVE override is REFUSED rather than resolved against cwd: "resolve it
 * against the caller's directory" is exactly the defect this file exists to
 * prevent, and a silent resolution would reintroduce it through the one door
 * left open.
 */

import { homedir } from 'node:os';
import path from 'node:path';

export const ENV_VAR = 'LEDGER_BACKUP_DEST';

/** The destination when nothing overrides it. Private, outside any repo. */
export const DEFAULT_MIRROR_DIR = path.join(homedir(), '.goldrush', 'ledger-backups');

/**
 * @returns {{ dir: string, provenance: 'default' | 'environment' }}
 * @throws if the environment override is set but not an absolute path.
 */
export function resolveMirrorDest(env = process.env) {
  const override = env[ENV_VAR];
  if (override === undefined || override === '') {
    return { dir: DEFAULT_MIRROR_DIR, provenance: 'default' };
  }
  if (!path.isAbsolute(override)) {
    throw new Error(
      `${ENV_VAR} must be an ABSOLUTE path (got ${JSON.stringify(override)}). ` +
      `A relative destination would resolve against the caller's cwd, which is the ` +
      `exact corpus-swap this resolver exists to prevent (F-2220-1).`,
    );
  }
  return { dir: override, provenance: 'environment' };
}

/** The one-line declaration every caller prints, so a narrowed corpus can never look like the default. */
export function destLine(dest = resolveMirrorDest()) {
  return dest.provenance === 'environment'
    ? `destination : ${dest.dir}  (from ${ENV_VAR} — NOT the default)`
    : `destination : ${dest.dir}  (default: private, outside the public repo)`;
}

if (process.argv[1] && process.argv[1].endsWith('ledger-mirror-dest.mjs')) {
  const dest = resolveMirrorDest();
  console.log(destLine(dest));
  console.log(dest.dir);
}
