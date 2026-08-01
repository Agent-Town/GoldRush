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

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PROBE_CHARS = 120;
const REPO = process.env.GR_REPO ?? "/Users/robin/Claude/Projects/Gold Rush";
const argv = process.argv.slice(2);
const showAll = argv.includes("--all");
const limitIdx = argv.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : Infinity;
if (limitIdx >= 0 && !Number.isFinite(limit)) {
  console.error("--limit needs a number");
  process.exit(2);
}

const git = (args) =>
  execFileSync("git", ["-C", REPO, ...args], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

const commits = git(["log", "--format=%H", "--", "STATUS.md"]).trim().split("\n").filter(Boolean);

const blobOf = (sha) => {
  try {
    return git(["show", `${sha}:STATUS.md`]);
  } catch {
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
  rec.permanent =
    rec.lostSession === null ||
    !new RegExp(`s${rec.lostSession} handoff \\(line-1 archive`).test(headBlob);
  (rec.permanent ? drops : transient).push(rec);
}

for (const d of drops) {
  console.log(`DROPPED ${d.sha}  ${d.when}`);
  console.log(`  s${d.newSession} destroyed s${d.lostSession}'s ${d.kind} line (${d.lostChars} chars)`);
  console.log(`  commit: ${d.subject}`);
  console.log(`  lost  : ${d.lost}...`);
}
for (const a of abridged) {
  console.log(`ABRIDGED ${a.sha}  s${a.newSession} kept only a prefix of s${a.lostSession}'s ${a.kind} line`);
}
if (showAll) {
  for (const e of excluded) console.log(`ok-excluded ${e.sha}  ${e.why}  [${e.subject.slice(0, 70)}]`);
}

const verdict = drops.length === 0 ? "CLEAN" : "LOST";
console.log(
  `${verdict}: ${drops.length} handoff line-1s PERMANENTLY absent at HEAD ` +
    `(${transient.length} more were dropped at lock time but restored by the fire's own handoff ` +
    `commit -- normal, not a defect), ${abridged.length} abridged, ` +
    `${excluded.length} same-session rewrites excluded, of ${replacements} replacements ` +
    `across ${examined} STATUS.md commits`,
);
process.exit(drops.length === 0 ? 0 : 1);
