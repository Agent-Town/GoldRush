// F-2587-1 (s2587) — THE ABRIDGED ARM MUST SAY WHETHER ANYTHING WAS ACTUALLY LOST.
//
// `status-archive-audit.mjs` classifies a line-1 replacement ABRIDGED when the first PROBE_CHARS of
// the older line survive in the child blob but the FULL line does not. That predicate is a PREFIX
// test, and a prefix survives an EXTENSION exactly as it survives a TRUNCATION -- so the label
// ("kept only a prefix", glossed in the subject as "the older line is on the board in truncated
// form") asserts a truncation the test cannot establish.
//
// MEASURED s2587 on the live board: the only ABRIDGED entry in a --limit 40 walk, `71b4bcaa`, grew
// its line from 904 -> 4646 chars, lost ZERO load-bearing tokens and gained SIX. Nothing was
// truncated. The remedy an unqualified "kept only a prefix" implies -- restore the missing tail --
// would have rolled back the F-2586-2 desk recovery, taking three OPEN owner items off the board.
//
// WHAT THIS GUARD DEFENDS, and deliberately not more:
//   · the declaration EXISTS on every abridged entry, in BOTH states (F-2208-1);
//   · the two states are DISTINGUISHABLE and name different owed acts;
//   · the verdict comes from the file's own `supersedes()` and is not a second implementation;
//   · the arm is NOT reclassified or reordered -- s2577 chose its position by measurement;
//   · the --quiet GATE leg stays byte-identical, so this cannot move the battery's stdout.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Anchored to this file, never to process.cwd() (F-2220-1): a cwd-rooted corpus narrows silently
// from a subdirectory and still prints an affirmative verdict.
const HERE = dirname(fileURLToPath(import.meta.url));
const SUBJECT = join(HERE, "status-archive-audit.mjs");
const SRC = readFileSync(SUBJECT, "utf8");

const git = (cwd, args) => execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 << 20 });

// Build a scratch repo whose ONLY line-1 replacement is an in-place EXTENSION: the older line's
// prefix survives, the full line does not, and every load-bearing token is carried forward.
// That is the live shape, manufactured.
function boardWithExtension({ truncateInstead = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "s2587-abridged-"));
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["config", "user.email", "t@t"]);
  git(dir, ["config", "user.name", "t"]);
  const older =
    "Last updated: 2026-09-16T01:40Z attended handoff, lock CLEARED — a first line with real " +
    "content carrying F-1111-1 and deadbeef12 so the token test has something to chew on. " +
    "🔺 **OWNER'S DESK — 1 awaiting a word.** 🔺 **F-1111-1** the one item.";
  writeFileSync(join(dir, "STATUS.md"), older + "\n- **filler bullet:** body\n");
  git(dir, ["add", "STATUS.md"]);
  git(dir, ["commit", "-q", "-m", "seed"]);

  // The child keeps the older line's PREFIX and replaces the rest.
  // PROBE_CHARS is 120, so both shapes must leave the first 120 chars intact and the FULL line not.
  const head = older.slice(0, 120);
  // ⚠️ THE EXTENSION MUST BE A **MID-LINE INSERTION**, NOT AN APPEND, AND THIS COST AN ITERATION:
  // a pure append leaves the older line WHOLLY CONTAINED in the child, so `childBlob.includes(before)`
  // short-circuits at :207 as "properly archived, verbatim" and the ABRIDGED arm is never reached --
  // the fixture went green-adjacent while testing nothing. The live case (`71b4bcaa`) inserts into
  // the MIDDLE (s2586 raised a desk count 4 -> 7 and added a note), which is what breaks containment.
  const SPLIT = "🔺 **OWNER'S DESK";
  const newer = truncateInstead
    // TRUNCATION: prefix survives, the desk and its finding id are GONE.
    ? head + " — the tail was cut away and nothing replaced it."
    // EXTENSION: prefix survives, every token survives, more is added, and the insertion sits
    // mid-line so the older line is NOT contained whole.
    : older.replace(
        SPLIT,
        "INSERTED BY THE RECOVERY: F-2222-2, cafebabe99, carried back not re-opened. " + SPLIT,
      );
  // The fixture must actually produce the shape it claims, or every arm below measures nothing.
  assert.ok(!newer.includes(older), "fixture is not ABRIDGED-shaped: the older line is contained whole");
  assert.ok(newer.includes(head), "fixture is not ABRIDGED-shaped: the first 120 chars did not survive");
  writeFileSync(join(dir, "STATUS.md"), newer + "\n- **filler bullet:** body\n");
  git(dir, ["add", "STATUS.md"]);
  git(dir, ["commit", "-q", "-m", "s0002: replace line-1"]);
  return dir;
}

function run(subjectPath, dir, args) {
  const r = spawnSync("node", [subjectPath, ...args], {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, GR_REPO: dir },
    maxBuffer: 64 << 20,
    timeout: 240_000,
    killSignal: "SIGKILL",
  });
  return { rc: r.status, out: r.stdout ?? "", err: r.stderr ?? "" };
}

// Manufacture a variant of the subject on a scratch copy, asserting the edit MATCHED (F-2477-1:
// a variant that did not apply is a construction refusal, not evidence about the defect).
function variantOf(find, replace) {
  assert.ok(SRC.includes(find), "variant anchor not found in the subject: " + find.slice(0, 60));
  const dir = mkdtempSync(join(tmpdir(), "s2587-variant-"));
  const p = join(dir, "status-archive-audit.mjs"); // .mjs is load-bearing: node keys ESM on the extension
  writeFileSync(p, SRC.replace(find, replace));
  return p;
}

test("arm 1: the live-shape board really is classified ABRIDGED (the fixture reaches the arm)", () => {
  const dir = boardWithExtension();
  const r = run(SUBJECT, dir, ["--limit", "40"]);
  assert.ok(r.out.length > 0, "control: the subject produced nothing, so nothing below means anything");
  assert.match(r.out, /ABRIDGED /, "fixture did not reach the ABRIDGED arm:\n" + r.out);
  rmSync(dir, { recursive: true, force: true });
});

test("arm 2: an EXTENSION is declared as losing nothing", () => {
  const dir = boardWithExtension();
  const r = run(SUBJECT, dir, ["--limit", "40"]);
  assert.match(r.out, /NOTHING WAS LOST/, "extension was not declared lossless:\n" + r.out);
  assert.doesNotMatch(r.out, /content IS missing/);
  rmSync(dir, { recursive: true, force: true });
});

test("arm 3: a real TRUNCATION is declared as losing content — the two states differ", () => {
  const dir = boardWithExtension({ truncateInstead: true });
  const r = run(SUBJECT, dir, ["--limit", "40"]);
  assert.match(r.out, /ABRIDGED /, "truncation fixture did not reach the arm:\n" + r.out);
  assert.match(r.out, /content IS missing/, "truncation was not declared lossy:\n" + r.out);
  assert.doesNotMatch(r.out, /NOTHING WAS LOST/);
  rmSync(dir, { recursive: true, force: true });
});

test("arm 4: the declaration is present in BOTH states, never only on the bad one (F-2208-1)", () => {
  for (const truncateInstead of [false, true]) {
    const dir = boardWithExtension({ truncateInstead });
    const r = run(SUBJECT, dir, ["--limit", "40"]);
    const lines = r.out.split("\n");
    const i = lines.findIndex((l) => l.startsWith("ABRIDGED "));
    assert.ok(i >= 0, "no ABRIDGED line for truncateInstead=" + truncateInstead);
    assert.match(
      lines[i + 1] ?? "",
      /NOTHING WAS LOST|content IS missing/,
      "no declaration beneath the ABRIDGED line for truncateInstead=" + truncateInstead,
    );
    rmSync(dir, { recursive: true, force: true });
  }
});

test("arm 5: the arm still CLASSIFIES abridged — it declares, it does not reclassify or clear", () => {
  const dir = boardWithExtension();
  const r = run(SUBJECT, dir, ["--limit", "40"]);
  assert.match(r.out, /ABRIDGED /, "the ABRIDGED label was dropped");
  assert.doesNotMatch(r.out, /^SUPERSEDED /m, "the extension was reclassified rather than declared");
  assert.match(r.out, /1 abridged/, "the summary no longer counts it as abridged:\n" + r.out);
  rmSync(dir, { recursive: true, force: true });
});

test("arm 6: exit code is untouched — an abridgement never redded and still must not", () => {
  for (const truncateInstead of [false, true]) {
    const dir = boardWithExtension({ truncateInstead });
    assert.equal(run(SUBJECT, dir, ["--limit", "40"]).rc, 0);
    rmSync(dir, { recursive: true, force: true });
  }
});

test("arm 7: the --quiet GATE leg stays silent about abridgements (battery stdout unmoved)", () => {
  const dir = boardWithExtension();
  const r = run(SUBJECT, dir, ["--limit", "40", "--quiet"]);
  assert.ok(r.out.length > 0, "control: --quiet produced nothing at all");
  assert.doesNotMatch(r.out, /NOTHING WAS LOST/, "the declaration leaked into the quiet gate leg");
  assert.doesNotMatch(r.out, /^ABRIDGED /m);
  assert.match(r.out, /1 abridged/, "the quiet summary must still carry the count");
  rmSync(dir, { recursive: true, force: true });
});

test("arm 8: the verdict comes from the file's own supersedes(), not a second implementation", () => {
  // F-1261-1: one implementation of a predicate per repo. If someone re-derives the token test
  // inside the ABRIDGED arm, the two copies drift exactly as the four session-id copies did.
  const stripped = SRC.replace(/^\s*\/\/.*$/gm, ""); // comments quote code; judge the CALL, not the mention
  assert.match(stripped, /rec\.tokensPreserved\s*=\s*supersedes\(/, "the arm no longer calls supersedes()");
  const defs = [...stripped.matchAll(/const supersedes\s*=/g)];
  assert.equal(defs.length, 1, "supersedes() is defined " + defs.length + " times; there must be exactly one");
});

test("arm 9: TEETH — a variant that drops the declaration reds arms 2/3/4", () => {
  const p = variantOf("    rec.tokensPreserved = supersedes(before, after);\n", "");
  const dir = boardWithExtension();
  const r = run(p, dir, ["--limit", "40"]);
  assert.ok(r.out.length > 0, "control: the variant produced nothing — construction refusal, not evidence");
  // With the field never set it is falsy, so the arm declares the LOSSY state for a lossless pair:
  // precisely the wrong answer, and arm 2 is what catches it.
  assert.match(r.out, /content IS missing/, "the defect variant did not produce the wrong verdict");
  rmSync(dir, { recursive: true, force: true });
  rmSync(dirname(p), { recursive: true, force: true });
});

test("arm 10: REVERSE CONTROL — declaring unconditionally 'nothing was lost' reds arm 3", () => {
  // The tempting over-general cure: assume every abridgement is benign because the live one was.
  // That is the permissive direction and would blind the instrument to a real truncation.
  const p = variantOf("rec.tokensPreserved = supersedes(before, after);", "rec.tokensPreserved = true;");
  const dir = boardWithExtension({ truncateInstead: true });
  const r = run(p, dir, ["--limit", "40"]);
  assert.ok(r.out.length > 0, "control: the variant produced nothing");
  assert.match(r.out, /NOTHING WAS LOST/, "the over-general variant did not mislabel a real truncation");
  rmSync(dir, { recursive: true, force: true });
  rmSync(dirname(p), { recursive: true, force: true });
});

test("arm 11: REVERSE CONTROL — reclassifying abridged as superseded reds arm 5", () => {
  // s2577 ordered the supersession arm BELOW this one by measurement, because ABRIDGED says
  // something strictly more specific. Moving it would answer a narrower question with a broader
  // label and lose information -- this arm exists to catch a future fire "simplifying" that away.
  const p = variantOf(
    "    rec.tokensPreserved = supersedes(before, after);\n    abridged.push(rec);",
    "    rec.tokensPreserved = supersedes(before, after);\n    if (rec.tokensPreserved) { superseded.push(rec); continue; }\n    abridged.push(rec);",
  );
  const dir = boardWithExtension();
  const r = run(p, dir, ["--limit", "40"]);
  assert.ok(r.out.length > 0, "control: the variant produced nothing");
  assert.match(r.out, /^SUPERSEDED /m, "the reclassifying variant did not reclassify");
  assert.doesNotMatch(r.out, /^ABRIDGED /m);
  rmSync(dir, { recursive: true, force: true });
  rmSync(dirname(p), { recursive: true, force: true });
});
