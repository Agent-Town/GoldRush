// status-archive-supersession-guard — F-2577-1 (s2577)
//
// `status-archive-audit`'s same-session-rewrite exclusion is keyed on an `sNNNN` token, and an
// ATTENDED line-1 carries none. So the exclusion has TWO POPULATIONS and can only ever fire for
// one of them: both sides of an attended self-update parse to `null`, the `!== null` guards drop
// the pair through, and the run reports `snull destroyed snull's handoff line` -- an exclusion
// looking straight at two equal session ids and not firing. Diagnosed F-2576-2 (s2576) and left
// with no cure; re-derived and cured s2577.
//
// WHAT THIS GUARD DEFENDS, and every arm was proven by MANUFACTURING the defect on a scratch board:
//
//   1. the cure WORKS            -- an attended self-update is not reported as a destruction
//   2. the cure is NARROW        -- a genuine attended->attended destruction is STILL reported
//   3. the desk has TEETH        -- an update that DROPS a desk item is STILL a destruction
//   4. it refuses VACUITY        -- a line with nothing to test is not thereby proven superseded
//   5. hashes are PREFIX-matched -- an 8-char citation matches its own 9-char twin (F-1633-1)
//   6. the numbered path is UNTOUCHED
//   7. ORDERING                  -- ABRIDGED and TRANSIENT keep their more specific labels
//   8. the count is DECLARED even under --quiet (F-2208-1)
//
// 🚫 ARM 2 IS THE LOAD-BEARING ONE AND EXISTS SOLELY TO CATCH THE CURE THIS FIRE DECLINED.
// The obvious cure is to drop the two `!== null` guards so that `null === null` excludes. That
// passes arm 1 and silently blinds the instrument to every destruction of one attended session's
// handoff by a DIFFERENT attended session -- the permissive direction, in the population that now
// carries the drain load (F-1546-1). Arm 2 reds on it and nothing else does.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT = path.join(HERE, "status-archive-audit.mjs");

// A desk-bearing attended handoff line. Parameterised so each arm states exactly what it varies.
const attendedLine = ({ stamp, tail, ids = ["F-RPG-18", "F-RPG-10"], hash = "92137d813", desk = ids }) =>
  `Last updated: ${stamp} attended handoff, lock CLEARED — WORK LANDED at main ${hash} ` +
  `(${ids.join(", ")} on the desk). ${tail} ` +
  `🔺 **OWNER'S DESK — ${desk.length} awaiting a word.** ` +
  desk.map((d) => `🔺 **${d}** a ruling`).join(" · ");

const firelLine = (n, kind) =>
  kind === "lock"
    ? `Last updated: 2026-09-15T01:00Z ACTIVE (s${n} fire) — work in flight. F-X-1 at main abc12345.`
    : `Last updated: 2026-09-15T02:00Z s${n} handoff, lock CLEARED — landed. F-X-1 at main abc12345.`;

// Build a scratch board: an ordered list of line-1 values, each its own single-parent commit.
// `archive` decides whether each commit carries its predecessor's line forward as a bullet.
function board(lines, { archive = () => false } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "s2577-arc-"));
  const g = (...a) => execFileSync("git", ["-C", dir, ...a], { encoding: "utf8" });
  g("init", "-q", "-b", "main");
  g("config", "user.email", "t@t");
  g("config", "user.name", "t");
  let body = [];
  lines.forEach((line, i) => {
    if (i > 0 && archive(i)) body = [`- **archive:** ${lines[i - 1]}`, ...body];
    writeFileSync(path.join(dir, "STATUS.md"), [line, ...body].join("\n"));
    g("add", "STATUS.md");
    g("commit", "-q", "-m", `commit ${i}`);
  });
  return dir;
}

function audit(dir, args = []) {
  const r = spawnSync("node", [SUBJECT, ...args], {
    encoding: "utf8",
    env: { ...process.env, GR_REPO: dir },
    maxBuffer: 1 << 26,
    timeout: 240_000,
    killSignal: "SIGKILL",
  });
  // CONTROL (F-2215-1): a control whose failure mode is silence cannot be told from the silence it
  // measures. Assert the arm RAN before reading what it says.
  assert.ok((r.stdout ?? "").length > 0, "audit produced no stdout — the arm did not run");
  return { rc: r.status, out: r.stdout };
}

const clean = (dir, args) => { const r = audit(dir, args); return r.rc === 0 && /^CLEAN:/m.test(r.out); };

// ---------------------------------------------------------------------------------------------

test("1. an attended SELF-UPDATE is reported as SUPERSEDED, not as a destruction", () => {
  const dir = board([
    attendedLine({ stamp: "2026-09-15T13:10Z", tail: "deploy follows this handoff." }),
    attendedLine({ stamp: "2026-09-15T05:25Z", tail: "DEPLOYED + VERIFIED at 05:20Z; retry green." }),
  ]);
  try {
    const r = audit(dir);
    assert.equal(r.rc, 0, "an attended self-update must not red");
    assert.match(r.out, /^SUPERSEDED /m, "it must be named, not silently swallowed");
    assert.match(r.out, /CLEAN: 0 handoff line-1s/);
    assert.doesNotMatch(r.out, /destroyed/, "it is not a destruction");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("2. REVERSE CONTROL — a GENUINE attended→attended destruction is still reported LOST", () => {
  // Two unrelated attended sessions. The newer carries none of the older's findings, hash or desk.
  const dir = board([
    attendedLine({ stamp: "2026-09-14T09:00Z", tail: "the roads slice.", ids: ["F-AAA-1", "F-AAA-2"], hash: "1111aaaa2" }),
    attendedLine({ stamp: "2026-09-15T09:00Z", tail: "something else entirely.", ids: ["F-ZZZ-9"], hash: "9999zzzz0".replace(/z/g, "b") }),
  ]);
  try {
    const r = audit(dir);
    assert.equal(r.rc, 1, "a real attended destruction must still red");
    assert.match(r.out, /^DROPPED /m);
    assert.match(r.out, /LOST: 1 handoff line-1s/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("3. the DESK has teeth — an update that drops a desk item is still a destruction", () => {
  // Same session, same findings and hash in the BODY, but the newer desk loses F-RPG-10.
  const dir = board([
    attendedLine({ stamp: "2026-09-15T13:10Z", tail: "deploy follows.", desk: ["F-RPG-18", "F-RPG-10"] }),
    attendedLine({ stamp: "2026-09-15T05:25Z", tail: "deployed.", desk: ["F-RPG-18"] }),
  ]);
  try {
    const r = audit(dir);
    assert.equal(r.rc, 1, "a dropped desk item is a real loss — the owner's decision queue");
    assert.match(r.out, /^DROPPED /m);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("4. VACUITY REFUSED — a line with no ids and no hashes is not proven superseded (F-2217-1)", () => {
  const bare = (s) => `Last updated: ${s} attended handoff, lock CLEARED — a quiet day, nothing to cite.`;
  const dir = board([bare("2026-09-15T13:10Z"), bare("2026-09-15T05:25Z")]);
  try {
    const r = audit(dir);
    assert.equal(r.rc, 1, "with nothing to test, the set-tests are vacuously true and must not pass");
    assert.doesNotMatch(r.out, /SUPERSEDED/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("5. hashes match across ABBREVIATION WIDTHS (F-1633-1: this repo cites 8, 9 and 40)", () => {
  const dir = board([
    attendedLine({ stamp: "2026-09-15T13:10Z", tail: "deploy follows.", hash: "92137d813" }),
    attendedLine({ stamp: "2026-09-15T05:25Z", tail: "deployed.", hash: "92137d81" }),
  ]);
  try {
    assert.ok(clean(dir), "a 9-char citation must match its own 8-char twin");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("6. the NUMBERED cross-session path is untouched — a fire destroying a fire still reds", () => {
  const dir = board([firelLine(2570, "handoff"), firelLine(2571, "handoff")]);
  try {
    const r = audit(dir);
    assert.equal(r.rc, 1, "a numbered cross-session destruction must still red");
    assert.match(r.out, /s2571 destroyed s2570/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("7. ORDERING — an ABRIDGED pair keeps the more specific ABRIDGED label", () => {
  // The newer line archives a PREFIX of the older (>= PROBE_CHARS), which is ABRIDGED, not
  // SUPERSEDED. Placing the supersession arm above the abridged test reclassified exactly this.
  const older = attendedLine({ stamp: "2026-09-15T13:10Z", tail: "deploy follows this handoff, with a good deal of further detail so the prefix probe has something to bite on and the line comfortably exceeds the probe window." });
  const newer = attendedLine({ stamp: "2026-09-15T05:25Z", tail: "deployed." });
  const dir = mkdtempSync(path.join(tmpdir(), "s2577-abr-"));
  const g = (...a) => execFileSync("git", ["-C", dir, ...a], { encoding: "utf8" });
  try {
    g("init", "-q", "-b", "main"); g("config", "user.email", "t@t"); g("config", "user.name", "t");
    writeFileSync(path.join(dir, "STATUS.md"), older);
    g("add", "STATUS.md"); g("commit", "-q", "-m", "one");
    writeFileSync(path.join(dir, "STATUS.md"), [newer, `- **archive:** ${older.slice(0, 200)}`].join("\n"));
    g("add", "STATUS.md"); g("commit", "-q", "-m", "two");
    const r = audit(dir);
    assert.match(r.out, /^ABRIDGED /m, "ABRIDGED says the older line IS on the board, truncated — strictly more specific");
    assert.doesNotMatch(r.out, /SUPERSEDED/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("8. the count is DECLARED in the verdict even under --quiet (F-2208-1 / F-2278-1)", () => {
  const dir = board([
    attendedLine({ stamp: "2026-09-15T13:10Z", tail: "deploy follows this handoff." }),
    attendedLine({ stamp: "2026-09-15T05:25Z", tail: "DEPLOYED + VERIFIED." }),
  ]);
  try {
    const r = audit(dir, ["--quiet"]);
    assert.equal(r.rc, 0);
    assert.match(r.out, /1 attended self-updates superseded/,
      "--quiet may suppress the detail line, never the count — a judgement nobody is shown cannot be re-judged");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("9. the ORIGINAL same-session exclusion is NOT subsumed by the new arm", () => {
  // ⚠️ THIS ARM WAS DECORATION AS FIRST WRITTEN, and the teeth sweep is what caught it (s2226's
  // duty: a manufactured defect that reddens NOTHING marks an unreachable branch). It originally
  // claimed to prove the cure is "scoped to the attended pair" — but unscoping is already caught by
  // arm 6, because a fire's handoff routinely carries its predecessor's desk and findings forward
  // and therefore SATISFIES the supersession predicate. Arm 9 was asserting a property no defect
  // could violate.
  // Retargeted to the defect that DOES reach it: deleting the pre-existing same-session exclusion
  // on the theory that the new arm subsumes it. It does not — a numbered same-session rewrite is a
  // stamp refresh or self-amend, which is a different fact from a superseding rewrite, and the
  // older label is the more specific. Reds this arm ALONE.
  const dir = board([firelLine(2570, "lock"), firelLine(2570, "handoff")]);
  try {
    const r = audit(dir, ["--all"]);
    assert.equal(r.rc, 0);
    assert.match(r.out, /same-session \(stamp refresh or self-amend/);
    assert.doesNotMatch(r.out, /SUPERSEDED/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("10. the SUBJECT still carries the predicate this guard is named for", () => {
  // A structural check, so that deleting the arm breaks the battery rather than quietly restoring
  // the defect (F-1667-1: an un-annotated cure can undo itself).
  const src = readFileSync(SUBJECT, "utf8");
  const code = src.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
  assert.match(code, /lostSession === null && newSession === null && supersedes\(/,
    "the attended-pair scoping must be present IN CODE, not only in a comment");
  assert.match(code, /if \(beforeIds\.length === 0 && beforeHashes\.length === 0\) return false/,
    "the vacuity refusal must be present in code");
});
