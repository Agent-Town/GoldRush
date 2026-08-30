// The em-dash guard's src subject set, extracted so both the guard and its meta-guard can read
// the SAME selector. Deliberately a plain module rather than an export from the .test.mjs:
// node:test registers tests at module load, so importing the guard to reuse a function would
// also RUN it (the s2363 lesson, paid for once already in this repo).
//
// F-2371-1 (s2371): this used to select with the git pathspec `src/**/*.ts`, copied verbatim
// out of the master's PROSE. Git's default pathspec matching is wildmatch WITHOUT WM_PATHNAME,
// so `*` already crosses `/` and the literal slash between `**` and `*` becomes a REQUIREMENT:
// the pattern matched only paths with two or more slashes after `src`, and every file sitting
// directly at `src/<name>.ts` was never a subject. Measured on main: the glob returned 271
// where the true tracked set is 273, silently omitting `src/main.ts` and `src/vite-env.d.ts`.
// The declared scan space was TRUE over the glob and short of the law, and because the
// denominator came from the narrowed selection it could never have reported the narrowing.
//
// So the selector asks git for the directory and filters by extension here: self-extending,
// no pattern to get wrong, and it cannot miss a depth.
import { execFileSync } from 'node:child_process';

export const SRC_EXCEPTIONS = new Set([
  'src/game/SaveSlots.ts', // Structural: NAME_RULE permits existing profile names containing em dashes.
  'src/story/ceremonyPostscripts.ts', // Structural: parses existing "Ceremony postscript — T(n)" headings.
  'src/world/SteamPlume.ts', // GLSL template comments are player-invisible but remain inside a JS string token.
  'src/world/Water.ts', // GLSL template comments are player-invisible but remain inside a JS string token.
  'src/sim/HeadlessContractSim.ts', // Agent/machine-facing verdict reasons pending an owner ruling.
  'src/sim/SeatedLockstepSim.ts', // Agent/machine-facing notices and errors pending an owner ruling.
  'src/sim/SeatOrders.ts', // Agent/machine-facing validation copy pending an owner ruling.
  'src/agent/MechanicsManifest.ts', // Agent-facing manifest copy pending an owner ruling.
]);

/** Every tracked TypeScript file under src/, at any depth. */
export function trackedSrcTs(root) {
  return execFileSync('git', ['ls-files', '-z', '--', 'src'], { cwd: root, maxBuffer: 64 << 20 })
    .toString()
    .split('\0')
    .filter(Boolean)
    .filter((file) => file.endsWith('.ts'));
}

/**
 * The guard's subject set plus the numbers it declares. `all` is the law's true denominator, so
 * `scanned.length + skipped === all.length` holds by construction and a reader can tell a real
 * zero from a zero over a corpus that excluded everything (F-2208-1).
 */
export function srcScanSpace(root) {
  const all = trackedSrcTs(root);
  // An empty subject set is the shape of good news in every instrument on this board, and a
  // `for` loop over nothing registers no assertions and reports success (F-2217-1). This repo
  // tracks hundreds of src TS files, so empty here means the selector broke or the root is
  // wrong — never a clean tree. Refuse rather than certify.
  if (all.length === 0) {
    throw new Error(
      `no-emdash scan space: ZERO tracked src TypeScript files under ${root} — the selector or the root is wrong, not the tree. Refusing to certify an empty corpus.`,
    );
  }
  const scanned = all.filter((file) => !SRC_EXCEPTIONS.has(file));
  return { all, scanned, skipped: all.length - scanned.length };
}
