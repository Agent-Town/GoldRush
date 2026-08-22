/**
 * law-surfaces.mjs — THE law-surface list, in ONE place, because two copies of a
 * hand-maintained list is a defect with a delay fuse.
 *
 * WHY THIS FILE EXISTS (s2199, F-2199-1):
 * `law-pointer-guard.mjs` has carried this list since it was written, and s2197
 * (F-2197-1) hardened it: the list is CLOSED and hand-maintained, so a law surface
 * added to the repo is invisible until someone edits it -- and that guard now NAMES
 * what it did not scan, every run, so the boundary is visible rather than a prose
 * "KNOWN GAP" only its author sees.
 *
 * s2199 needed the same list in `gate-caller-audit.mjs`, to answer a different
 * question: a law surface is a CALLER. The tempting move was to paste the six paths
 * into the audit. That is precisely the defect s2198 refused one fire earlier -- it
 * landed its instruments arm "reusing its existing SURFACES and resolveCited rather
 * than minting a second hand-maintained law-surface list, which would have
 * re-committed the exact defect s2197 cured one fire earlier". A second copy does not
 * fail loudly when it drifts; it fails by QUIETLY ANSWERING ABOUT FIVE SURFACES while
 * its reader believes it answered about six, and the boundary declaration s2197 built
 * would still print a confident census of the wrong set.
 *
 * `law-pointer-guard.mjs` runs at import (top-level console.log + process.exit), so it
 * cannot be imported for its constant. Hence a data-only module: no side effects, no
 * exit codes, nothing to run. Both readers import it, so adding a law surface is one
 * edit and both instruments learn it in the same commit.
 *
 * TO ADD A LAW SURFACE: add it here. Never widen by pattern -- see the STATUS.md
 * exclusion in law-pointer-guard.mjs NOT_SCANNED for why a pattern would red forever
 * and be excused into uselessness inside a week (F-1460-1, the `cross-engine` fate).
 */

/** The closed, hand-maintained set of files that carry binding law. */
export const LAW_SURFACES = [
  'CLAUDE.md',
  'AGENTS.md',
  'scripts/fire.md',
  '.claude/skills/drain/SKILL.md',
  '.claude/skills/author-task/SKILL.md',
  '.claude/skills/playtest-intake/SKILL.md',
];
