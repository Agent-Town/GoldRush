#!/usr/bin/env node
// F-1341-1 instrument: when a fire takes the lock, does it PRESERVE the handoff line-1 it replaces?
//
// §4 of scripts/fire.md orders: when you rewrite line-1, move the previous line-1 down to a
// `- **s<N> ... (line-1 archive):**` bullet. That step is done by hand every fire, so it can be
// silently skipped -- and when it is, the dropped handoff (its priorities, its finding-carry list)
// disappears from the live board while remaining in git. No existing guard reads for it.
//
// NOT every line-1 replacement is a violation. Three shapes are ORDERED by the protocol and must
// not be counted:
//   * STAMP REFRESH  -- §2 tells a fire to refresh its own ACTIVE stamp after each drain.
//   * SELF-AMEND     -- a fire correcting its own handoff/lock line (same session number).
//   * (both above are identified by the s-number in the replaced line matching the replacing commit)
// The violation class is narrow: session N's line replaces session M's line where M != N and the
// replaced line is LOST. That is a predecessor's words destroyed by a successor.
//
// Truncated archival is detected separately: if the first PROBE_CHARS of the predecessor survive
// but the full line does not, the commit ABRIDGED rather than DROPPED -- reported, not counted as
// a loss, because the pointer to git remains legible.
//
// Exit 0 = no cross-session drops. Exit 1 = at least one. Exit 2 = misuse.
//   --limit N   cap how many STATUS.md commits to walk (default: all)
//   --all       also list the ordered/self shapes that were excluded, for audit of the exclusion
//   --quiet     suppress the ADVISORY listings (abridged / ok-excluded). The DROPPED blocks and
//               the verdict line ALWAYS print -- see the F-2278-1 note below.
//
// F-2278-1 (s2278): this file is leg 10 of `test:ledger-guards`, invoked BARE, and it had NO
// .test.mjs anywhere in the repo. Its argument parsing was `argv.includes(...)` per flag, so every
// UNRECOGNISED option was silently swallowed -- which contradicted the "Exit 2 = misuse" contract
// two lines up, in the permissive direction, in a gate.
//
// MEASURED s2278 against the live board:
//   `--limit 40 --quiet` (THE BATTERY LEG since s1341)  rc=0, 252 B  }  BYTE-IDENTICAL.
//   `--limit 40`                                        rc=0, 252 B  }  `--quiet` was never
//   `--limit 40 --strict`                               rc=0, 252 B  }  implemented at all.
// So the battery's own command line asserted a behaviour this tool did not have, and a future
// fire's tightening flag (`--strict`) would have been swallowed the same silent way. That is
// F-2209-1's class -- a misparsed flag invisible to the suite -- with no suite to be invisible to.
//
// The sharpest arm is a TYPO of the BOUNDING flag, and its harm is NOT the one I first wrote down.
// `--lmit 40` left `limit = Infinity`, silently un-bounding the walk to all ~4,600 STATUS.md
// commits. I priced that as wall-clock (~5 min against ~2 s) and it is worse than that: MEASURED,
// the unbounded walk FLIPS THE GATE'S VERDICT — rc=1, 352 lines, `LOST: 81 handoff line-1s
// PERMANENTLY absent at HEAD`. Those 81 are the legacy debt s2224 already measured and excused
// (all HISTORICAL, newest 2026-07-27, from before §4's archive law had teeth, invisible to the
// 40-commit regression window BY CONSTRUCTION). So one mistyped character turns leg 10 of
// `test:ledger-guards` from green to a four-minute RED over known-excused history — and a guard
// that reds on legacy debt is the guard that gets excused into uselessness (F-1460-1).
// A bound a typo can silently remove is not a bound.
//
// CURE: recognise the option set explicitly and REFUSE anything else with 2 = "could not answer"
// -- the convention drain-block-check, dry-board-probe, master-shipped-classifier and
// review-evidence-audit already carry. The refusal reaches STDOUT as well as stderr (F-2211-1: a
// caller that classifies stdout reads an empty string as silence).
//
// `--quiet` is implemented rather than merely accepted, because the battery has passed it since
// s1341 and the intent is legible. It suppresses ADVISORY chatter ONLY. It deliberately does NOT
// suppress the DROPPED blocks: a gate that reds while withholding what it found is worse than a
// chatty one, and that reverse control is arm 7 of the guard.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PROBE_CHARS = 120;
const REPO = process.env.GR_REPO ?? "/Users/robin/Claude/Projects/Gold Rush";
const argv = process.argv.slice(2);

// Refuse on BOTH channels: the battery reads rc, a human reads stdout, and F-2211-1's lesson is
// that an stdout-classifying caller cannot tell an empty string from a clean answer.
const refuse = (msg) => {
  console.log(`REFUSING (misuse): ${msg}`);
  console.error(`REFUSING (misuse): ${msg}`);
  process.exit(2);
};

const KNOWN = new Set(["--all", "--quiet", "--limit"]);
let showAll = false;
let quiet = false;
let limit = Infinity;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!KNOWN.has(a)) refuse(`unrecognised option ${JSON.stringify(a)} — known options are --all, --quiet, --limit N`);
  if (a === "--all") showAll = true;
  else if (a === "--quiet") quiet = true;
  else {
    // Consume the value, so `--limit 40` never leaves `40` looking like an unknown option.
    limit = Number(argv[++i]);
    if (!Number.isFinite(limit)) refuse("--limit needs a number");
    // A non-positive limit walks ZERO commits and still prints an affirmative CLEAN at rc=0 --
    // F-2217-1's polarity (an empty corpus wearing the shape of good news), reachable by a typo.
    if (limit <= 0) refuse(`--limit ${limit} would examine no commits at all, and CLEAN over an empty corpus is not an answer`);
  }
}

const git = (args) =>
  execFileSync("git", ["-C", REPO, ...args], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

const commits = git(["log", "--format=%H", "--", "STATUS.md"]).trim().split("\n").filter(Boolean);

// A null here is LAWFUL and routine: the parent of the commit that first created STATUS.md has
// no such blob, so `git show` legitimately fails. The count is therefore DIAGNOSTIC, never a
// refusal trigger on its own -- it exists so that the `examined === 0` refusal below can name
// WHICH route emptied the corpus (F-2218-1: a swallow that is counted and named can no longer
// empty a subject set in silence).
let blobFailures = 0;
const blobOf = (sha) => {
  try {
    return git(["show", `${sha}:STATUS.md`]);
  } catch {
    blobFailures += 1;
    return null;
  }
};

// The session that OWNS a line-1: "ACTIVE ... (s1340 fire)" or "Last updated: ... s1339 handoff".
const sessionOf = (line) => {
  // The owning session is named in the HEAD of the line ("ACTIVE <stamp> (s1340 fire) --" /
  // "Last updated: <stamp> s1339 handoff, lock CLEARED --"). Bodies quote OTHER sessions freely
  // ("I ran s1338's gate"), so scanning the whole line mis-attributes ownership; scan the head and
  // take whichever pattern appears earliest. Both punctuations occur: "(s1340 fire)" and
  // "s1252 fire, lock ACTIVE".
  const head = line.slice(0, 200);
  let best = null;
  for (const re of [/\bs(\d+) fire\b/, /\bs(\d+) handoff\b/]) {
    const m = head.match(re);
    if (m && (best === null || m.index < best.index)) best = { index: m.index, n: Number(m[1]) };
  }
  return best ? best.n : null;
};

// F-2577-1 — the SUPERSESSION predicate for an attended self-update. Mechanical and set-based, so
// it states a fact rather than a resemblance. `before` is superseded by `after` when every
// load-bearing token survives: finding ids, commit hashes, and the desk's finding ids.
const FINDING_ID = /\bF-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*\b/g;
const HASH = /\b[0-9a-f]{8,40}\b/g;
const DESK = /OWNER.{0,2}S? DESK/i;

// Hashes are cited at mixed widths in this repo (8, 9, full 40 -- F-1633-1), so membership must be
// PREFIX-tolerant in both directions or a 9-char citation never matches its own 8-char twin.
const hashCovered = (needle, hay) => hay.some((h) => h.startsWith(needle) || needle.startsWith(h));

const deskOf = (line) => {
  const all = [...line.matchAll(new RegExp(DESK.source, "gi"))];
  return all.length ? line.slice(all[all.length - 1].index) : null;
};

const supersedes = (before, after) => {
  const beforeIds = [...new Set(before.match(FINDING_ID) ?? [])];
  const beforeHashes = [...new Set(before.match(HASH) ?? [])];
  // POSITIVE EVIDENCE REQUIRED (F-2217-1): with nothing to test, the set-tests below are vacuously
  // true. A line offering no ids and no hashes is not thereby proven superseded.
  if (beforeIds.length === 0 && beforeHashes.length === 0) return false;

  const afterIds = new Set(after.match(FINDING_ID) ?? []);
  if (!beforeIds.every((id) => afterIds.has(id))) return false;

  const afterHashes = [...new Set(after.match(HASH) ?? [])];
  if (!beforeHashes.every((h) => hashCovered(h, afterHashes))) return false;

  // The desk is the OWNER'S decision queue and is the one thing whose loss is never cosmetic
  // (F-2576-1 watched a merge take it down). If the older line carried a desk, the newer must carry
  // one too, and must still name every finding the older desk named.
  const beforeDesk = deskOf(before);
  if (beforeDesk !== null) {
    const afterDesk = deskOf(after);
    if (afterDesk === null) return false;
    const deskIds = new Set(afterDesk.match(FINDING_ID) ?? []);
    if (!(beforeDesk.match(FINDING_ID) ?? []).every((id) => deskIds.has(id))) return false;
  }
  return true;
};

// Permanence is judged against the LIVE BOARD (working tree), not HEAD: the next fire reads the
// file on disk, and a restore that is staged-but-uncommitted is already legible to it. Reading HEAD
// here would also make the instrument untestable, since manufacturing the defect to prove the
// guard has teeth would require committing it.
let headBlob;
try {
  headBlob = readFileSync(`${REPO}/STATUS.md`, "utf8");
} catch {
  console.error("STATUS.md unreadable on disk");
  process.exit(2);
}

const drops = [];
const transient = [];
const abridged = [];
const excluded = [];
const superseded = [];
let replacements = 0;
let examined = 0;

for (const sha of commits) {
  if (examined >= limit) break;
  const parents = git(["log", "-1", "--format=%P", sha]).trim().split(/\s+/).filter(Boolean);
  if (parents.length !== 1) continue; // merges/roots: line-1 lineage is ambiguous
  const parentBlob = blobOf(parents[0]);
  const childBlob = blobOf(sha);
  if (parentBlob === null || childBlob === null) continue;
  examined++;

  const before = parentBlob.slice(0, parentBlob.indexOf("\n"));
  const after = childBlob.slice(0, childBlob.indexOf("\n"));
  if (before === after) continue;
  replacements++;

  if (childBlob.includes(before)) continue; // properly archived, verbatim

  const subject = git(["log", "-1", "--format=%s", sha]).trim();
  const when = git(["log", "-1", "--format=%cI", sha]).trim();
  const lostSession = sessionOf(before);
  const newSession = sessionOf(after) ?? sessionOf(subject);
  const rec = {
    sha: sha.slice(0, 8),
    when,
    subject,
    lostSession,
    newSession,
    lost: before.slice(0, PROBE_CHARS),
    lostChars: before.length,
    kind: /handoff/.test(before) ? "handoff" : "lock",
  };

  // Ordered shapes: same session rewriting its own line (stamp refresh / self-amend).
  if (lostSession !== null && newSession !== null && lostSession === newSession) {
    excluded.push({ ...rec, why: "same-session (stamp refresh or self-amend -- ordered by §2/§4)" });
    continue;
  }

  // F-2577-1 (s2577) — THE EXCLUSION ABOVE IS KEYED ON AN `sNNNN` TOKEN, AND AN ATTENDED LINE
  // CARRIES NONE, SO IT HAS TWO POPULATIONS AND CAN ONLY EVER FIRE FOR ONE OF THEM. Both sides of
  // an attended self-update parse to `null`, the `!== null` guards drop the pair through, and the
  // run reports `snull destroyed snull's handoff line` -- an exclusion looking straight at two
  // equal session ids and not firing. Diagnosed F-2576-2 (s2576), re-derived s2577.
  //
  // 🚫 THE OBVIOUS CURE IS THE DANGEROUS ONE AND IS DELIBERATELY NOT TAKEN: dropping the two
  // `!== null` guards so that `null === null` excludes would also suppress a genuine destruction of
  // one attended session's handoff by a DIFFERENT attended session on a different day. That is the
  // permissive direction -- it would blind the instrument to a whole population to silence a false
  // alarm in it -- and attended sessions now carry the drain load (F-1546-1), so that population is
  // the BUSY one. This arm therefore DECLARES AND DOES NOT CLEAR (the F-2366-1 restraint): the
  // event is still reported, on its own line, under its own name, so a reader can re-judge it.
  //
  // The predicate is MECHANICAL, not a similarity threshold: the newer line SUPERSEDES the older
  // when it preserves every load-bearing token the older carried -- every finding id, every commit
  // hash, and every finding id named in the older line's OWNER'S DESK segment. That is exactly the
  // check s2576 and s2577 each ran BY HAND before clearing the live instance, and on that instance
  // the two lines differ by four tokens: the stamp, and the words "deploy this handoff" which the
  // newer replaces with the deploy's actual outcome.
  //
  // ⚠️ IT REQUIRES POSITIVE EVIDENCE AND REFUSES TO PASS VACUOUSLY (F-2217-1): a line carrying no
  // ids and no hashes at all offers nothing to test, so the three set-tests would be vacuously true
  // over an empty subject set. Such a pair stays a DROP.
  //
  // ⓘ ORDERED DELIBERATELY LAST, AND THE ORDER WAS CHOSEN BY MEASUREMENT RATHER THAN BY TASTE.
  // Placed before the ABRIDGED test it reclassified `869f6cbc`, a pre-existing ABRIDGED entry;
  // placed before the permanence split it reclassified `0180b013`, a pre-existing TRANSIENT. Both
  // of those classes are already correct and already benign, and both say something STRICTLY MORE
  // specific than "superseded" -- ABRIDGED says the older line is on the board in truncated form,
  // TRANSIENT says it was dropped at lock time and restored by the fire's own handoff commit.
  // Answering a narrower question with a broader label loses information. This arm therefore sits
  // below both, and touches ONLY the pairs that would otherwise be reported PERMANENTLY LOST --
  // which is exactly the defect and nothing else.
  if (childBlob.includes(before.slice(0, PROBE_CHARS))) {
    abridged.push(rec);
    continue;
  }
  // CRITICAL DISTINCTION (learned the hard way s1341): a drop at LOCK time is normally TRANSIENT.
  // Fires archive the predecessor's handoff in their own HANDOFF commit, not in their lock commit,
  // so the line is missing from the tree for the duration of the fire and then restored. Only a
  // fire that DIES (or forgets) leaves it permanently gone. Comparing parent->child alone counts
  // every healthy fire as a loss -- 27 flagged, 24 of them already back on the board.
  // Permanence is judged by LEGIBILITY ON THE BOARD, not byte-identity. Later fires compact old
  // archive bullets (lawful -- git keeps every version), so requiring the full original string
  // verbatim at HEAD falsely condemns bullets that are present and readable: s1250's bullet is
  // right there on the board, but 11,612 chars of it are not byte-identical any more. The question
  // the next fire actually asks is "is my predecessor's handoff on the board at all?"
  // ⚠️ DO NOT RE-HARDCODE THE WORD "handoff" HERE (F-1690-2, s1690). This predicate used to read
  // `s<N> handoff \(line-1 archive`, which silently assumed every line-1 worth archiving is a
  // HANDOFF line. It is not: a fire that DIES mid-work leaves a LOCK line as its last line-1, and
  // its successor must archive THAT. This script already knows the difference -- it records
  // `kind` at :178 and prints "destroyed s<N>'s lock line" at :235 -- so the old predicate
  // contradicted the script's own output, demanding a "handoff" bullet for a fire that never
  // wrote one. Measured s1690: s1689 reached FIRE END rc=0 mid-drain, s1690 archived its lock
  // line honestly as `- **s1689 lock line (line-1 archive -- ...)`, and this guard reported it
  // PERMANENTLY LOST. 🚫 The remedy the red implies -- relabel the bullet "handoff" -- would
  // write a FALSEHOOD onto the board (that s1689 produced a handoff it never wrote) to satisfy a
  // string match. A guard whose remedy is to corrupt a correct file is the guard that is wrong.
  // The session number and the `(line-1 archive` phrase still bind; only the NOUN is free, which
  // is what keeps this from being a loosening -- an unarchived line still reds.
  // F-2088-2 (s2088): an UNNUMBERED line-1 must be judged by the same LEGIBILITY standard as a
  // numbered one, not condemned for lacking a session number. `lostSession === null` used to
  // short-circuit straight to permanent, so an ATTENDED line-1 -- which carries "(attended)" and
  // no `s<N>` -- could NEVER be exonerated however correctly it had been archived. Measured s2088:
  // `1cb47bdc^`'s line was present at HEAD *verbatim*, carried by a textbook bullet
  // (`- **attended lock line (line-1 archive, RESTORED s2087 from \`1cb47bdc^\`):**`), and was still
  // counted PERMANENTLY absent. That is the exact trap the F-1690-2 block above names: the remedy
  // the red implied was to invent an `s<N>` for a session that never had one, i.e. to write a
  // falsehood onto the board to satisfy a string match. As attended sessions took over the drain
  // load (F-1546-1), this arm reds on ordinary healthy behaviour -- the road to an excused guard.
  // The numbered path is UNCHANGED, so this cannot loosen it; the null path now requires POSITIVE
  // evidence (the lost text readable at HEAD) rather than assuming loss from a missing number.
  rec.permanent =
    rec.lostSession === null
      ? !headBlob.includes(rec.lost)
      : !new RegExp(`s${rec.lostSession} [^(]*\\(line-1 archive`).test(headBlob);
  if (rec.permanent && lostSession === null && newSession === null && supersedes(before, after)) {
    superseded.push(rec);
    continue;
  }
  (rec.permanent ? drops : transient).push(rec);
}

for (const d of drops) {
  console.log(`DROPPED ${d.sha}  ${d.when}`);
  console.log(`  s${d.newSession} destroyed s${d.lostSession}'s ${d.kind} line (${d.lostChars} chars)`);
  console.log(`  commit: ${d.subject}`);
  console.log(`  lost  : ${d.lost}...`);
}
// ADVISORY listings — the only thing --quiet suppresses. The DROPPED blocks above and the verdict
// line below always print, however quiet the caller asked for (F-2278-1).
if (!quiet) {
  for (const a of abridged) {
    console.log(`ABRIDGED ${a.sha}  s${a.newSession} kept only a prefix of s${a.lostSession}'s ${a.kind} line`);
  }
  // F-2577-1: reported, never silent. An attended self-update is a real event that this run has
  // judged rather than suppressed, and naming it is what lets a reader overturn the judgement.
  for (const s of superseded) {
    console.log(
      `SUPERSEDED ${s.sha}  an attended session replaced its own ${s.kind} line ` +
        `(${s.lostChars} chars); the newer line preserves every finding id, commit hash and desk ` +
        `item the older carried -- not a destruction`,
    );
    console.log(`  commit: ${s.subject}`);
  }
  if (showAll) {
    for (const e of excluded) console.log(`ok-excluded ${e.sha}  ${e.why}  [${e.subject.slice(0, 70)}]`);
  }
}

// F-2337-1 — THE DENOMINATOR WAS DECLARED AND NOTHING READ IT.
//
// `examined` has been printed since s2224 ("across N STATUS.md commits"), and the verdict below
// branches on `drops.length` ALONE. So when the walk examines NOTHING, `drops` is empty for the
// most trivial of reasons and the tool prints an affirmative CLEAN at rc=0 -- a universal claim
// ("0 handoff line-1s PERMANENTLY absent") about a corpus it never read. That is precisely the
// polarity F-2278-1 named ONE ROUTE of, 200 lines up, in its own words: "CLEAN over an empty
// corpus is not an answer". It guarded the `--limit <= 0` typo and left every other route open.
//
// MEASURED s2337, ground truth = a scratch board carrying ONE REAL DROP, control asserting its
// own validity first (F-2215-1: arm A produced 460 B and read LOST rc=1, so the harness was real):
//   (a) STATUS.md on disk but absent from history  -> CLEAN rc=0, examined=0
//   (b) only a ROOT commit touches STATUS.md       -> CLEAN rc=0, examined=0
//   (c) THE SAME REAL-DROP REPO with `git show` transiently failing -> CLEAN rc=0, examined=0
// Arm (c) is the inversion that earns this cure: same repo, same binary, the verdict flips from
// LOST rc=1 to CLEAN rc=0 because the instrument went blind, and the reverse control (a genuinely
// clean board) is byte-length identical at 249 B with the same rc and the same verdict word.
//
// IS THE EMPTY STATE LAWFUL HERE? No -- and that question is what decides whether a declaration
// deserves a REFUSAL or merely a printed number (s2336's rule, applied rather than assumed).
// Checked before building this, because a refusal with no lawful-state analysis is worse than
// decoration -- it blocks the factory (F-1460-1, the `cross-engine` fate):
//   · the battery leg `--limit 40 --quiet` reads examined=40 on the live board;
//   · `--limit N` cannot manufacture this -- the loop breaks on `examined >= limit`, so it walks
//     PAST merges and unreadable blobs until it has N examinable commits. Measured on the live
//     board: --limit 1/2/5/40 -> examined 1/2/5/40. A small limit is safe by construction;
//   · the existing fixture (`status-archive-arg-guard.test.mjs`) reads examined=1.
// So examined===0 is unreachable in every lawful invocation, and refusing cannot red real work.
//
// 2 = "could not answer", against 1 = "answered, and the answer refuses" -- the convention
// drain-block-check, dry-board-probe, master-shipped-classifier, review-evidence-audit and
// nul-audit already carry. The route is a STRING for F-2212-1's reason, and it discriminates
// because the three name DIFFERENT owed acts: a wrong GR_REPO, a board too young to audit, and
// an instrument that could not read the blobs it found.
if (examined === 0) {
  const route =
    commits.length === 0
      ? "no-history"
      : blobFailures > 0
        ? "blobs-unreadable"
        : "nothing-examinable";
  const why = {
    "no-history": `${REPO} has no STATUS.md history at all (is GR_REPO pointing at the right tree?)`,
    "blobs-unreadable": `${commits.length} STATUS.md commit(s) found but ${blobFailures} blob read(s) failed -- git could not be read, so this is instrument failure, not a clean board`,
    "nothing-examinable": `${commits.length} STATUS.md commit(s) found but none has exactly one parent -- no line-1 transition is unambiguous`,
  }[route];
  // Both channels, and on STDOUT even under --quiet: the battery reads rc, a human reads stdout,
  // and per F-2211-1 an stdout-classifying caller reads an empty string as silence.
  const banner = `⛔ CANNOT VERIFY (${route}): examined 0 STATUS.md commits -- ${why}`;
  console.log(banner);
  console.log("  CLEAN here would be a claim about a corpus this run never read.");
  console.error(banner);
  process.exit(2);
}

const verdict = drops.length === 0 ? "CLEAN" : "LOST";
console.log(
  `${verdict}: ${drops.length} handoff line-1s PERMANENTLY absent at HEAD ` +
    `(${transient.length} more were dropped at lock time but restored by the fire's own handoff ` +
    `commit -- normal, not a defect), ${abridged.length} abridged, ` +
    `${excluded.length} same-session rewrites excluded, ` +
    `${superseded.length} attended self-updates superseded, of ${replacements} replacements ` +
    `across ${examined} STATUS.md commits`,
);
process.exit(drops.length === 0 ? 0 : 1);
