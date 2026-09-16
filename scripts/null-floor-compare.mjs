// THE NULL-FLOOR COMPARISON, EXTRACTED FROM `null-floor-anchors.mjs` SO IT CAN BE EXERCISED
// WITHOUT PAYING THE 315-SECOND SIM (F-2589-1, measured s2589).
//
// WHY THIS FILE EXISTS. `--check` used to count THREE unlike things into one number and report
// them all as "null-floor differences": a floor that MOVED (the sim's determinism changed — a real
// gameplay alarm), a `schema`/`policy` mismatch (the pin is not comparable at all), and an
// `eraStamp` mismatch (the pin is simply OLDER than the tree). The third is not a difference about
// floors, and on `main` it is GUARANTEED: `eraStamp` is `git merge-base HEAD main`, which on main
// IS `HEAD`, so the commit that lands a regenerated pin invalidates that pin's own stamp. Measured
// over the artifact's whole history: 58 of 58 pinned stamps differ from their own landing commit —
// the check has never once been able to exit 0 on main, and could not (a commit cannot contain its
// own hash, the F-1384-1 shape).
//
// So the classification is by KIND, not by count:
//   NOT-COMPARABLE (schema/policy)  -> 2, "could not answer"  (the repo's own convention)
//   FLOORS-MOVED                    -> 1, "answered, and the answer refuses" — the real alarm
//   MATCH                           -> 0, and the provenance difference is DECLARED, not counted
//
// The provenance line prints on EVERY verdict including the happy path (F-2208-1): a declaration
// that appears only on failure re-creates the ambiguity it removes, and on a LANE the stamp is
// genuinely informative (there `merge-base` is the stable branch point, so a differing stamp means
// the floors were minted under a different era and a match across it is real news).

export const OUTCOME_FIELDS = ['secured', 'waves', 'timeMs', 'gold', 'kills', 'eventLogHash'];

// A mismatch here means the two artifacts are not answers to the same question, so no floor
// comparison between them means anything. Refuse rather than report a drift count.
export const COMPARABILITY_FIELDS = ['schema', 'policy'];

// A mismatch here says only WHEN the pin was taken. Never a floor difference.
export const PROVENANCE_FIELDS = ['eraStamp'];

export function classifyNullFloors(pinned, derived) {
  const incomparable = [];
  for (const field of COMPARABILITY_FIELDS) {
    if (pinned?.[field] === derived?.[field]) continue;
    incomparable.push({ field, pinned: pinned?.[field], derived: derived?.[field] });
  }

  const provenance = [];
  for (const field of PROVENANCE_FIELDS) {
    provenance.push({
      field,
      pinned: pinned?.[field],
      derived: derived?.[field],
      same: pinned?.[field] === derived?.[field],
    });
  }

  const floorLines = [];
  let total = 0;
  let matched = 0;
  const pinnedFloors = pinned?.floors ?? {};
  const derivedFloors = derived?.floors ?? {};
  const contracts = new Set([...Object.keys(pinnedFloors), ...Object.keys(derivedFloors)]);
  for (const contract of [...contracts].sort()) {
    const seeds = new Set([
      ...Object.keys(pinnedFloors[contract] ?? {}),
      ...Object.keys(derivedFloors[contract] ?? {}),
    ]);
    for (const seed of [...seeds].sort()) {
      total += 1;
      const before = pinnedFloors[contract]?.[seed];
      const after = derivedFloors[contract]?.[seed];
      if (before === undefined || after === undefined) {
        floorLines.push(`${contract}/${seed}: pinned=${before === undefined ? '<missing>' : JSON.stringify(before)} derived=${after === undefined ? '<missing>' : JSON.stringify(after)}`);
        continue;
      }
      let pairMoved = false;
      for (const field of OUTCOME_FIELDS) {
        if (before[field] === after[field]) continue;
        floorLines.push(`${contract}/${seed} ${field}: pinned=${JSON.stringify(before[field])} derived=${JSON.stringify(after[field])}`);
        pairMoved = true;
      }
      if (!pairMoved) matched += 1;
    }
  }

  const floorDrift = floorLines.length;
  const verdict = incomparable.length > 0
    ? 'not-comparable'
    : floorDrift > 0 ? 'floors-moved' : 'match';

  return { verdict, incomparable, provenance, floorLines, floorDrift, total, matched };
}

export function exitCodeFor(result) {
  if (result.verdict === 'not-comparable') return 2;
  if (result.verdict === 'floors-moved') return 1;
  return 0;
}

// Renders the verdict to the two channels. `write(stream, text)` is injected so the guard can
// capture both without spawning, and the CLI passes its real streams.
export function reportNullFloors(result, { label, seconds, out, err }) {
  const where = label ? ` ${label}` : '';
  const took = seconds === undefined ? '' : ` (${seconds}s)`;

  // ALWAYS, including the happy path (F-2208-1).
  for (const p of result.provenance) {
    out(p.same
      ? `${p.field}: pinned and tree agree at ${JSON.stringify(p.pinned)}.\n`
      : `${p.field}: pin taken at ${JSON.stringify(p.pinned)}, this tree is ${JSON.stringify(p.derived)} — PROVENANCE ONLY, not a floor difference.\n`);
  }

  if (result.verdict === 'not-comparable') {
    for (const item of result.incomparable) {
      err(`${item.field}: pinned=${JSON.stringify(item.pinned)} derived=${JSON.stringify(item.derived)}\n`);
    }
    // The refusal reaches STDOUT too: a caller that classifies stdout reads an empty string as
    // silence (F-2211-1).
    out(`NOT COMPARABLE${where} — the pin answers a different question; no floor verdict was reached${took}.\n`);
    return;
  }

  if (result.verdict === 'floors-moved') {
    for (const line of result.floorLines) err(`${line}\n`);
    err(`${result.floorDrift} null-floor difference${result.floorDrift === 1 ? '' : 's'} found${took}.\n`);
    out(`${result.matched} of ${result.total} null floors match${where}; ${result.total - result.matched} moved${took}.\n`);
    return;
  }

  out(`${result.matched} of ${result.total} null floors match${where}${took}.\n`);
}
