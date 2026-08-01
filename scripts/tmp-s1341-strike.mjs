// s1341 one-shot: annotate the two retained-verbatim ORIGINALS whose GATE sentences are discharged.
//
// PREFIX ONLY. The retained words are never edited, reordered or truncated -- the script asserts the
// original line survives byte-identical as a suffix. This is the convention already blessed at
// tasks/BACKLOG.md:354 ("🟡 **F-1288-3 — struck s1317, history only (see the CLOSED row above...)**").
//
// Why it matters: findings-state-guard reads only the first 90 chars for an F-ID, and the retention
// convention drops the F-ID from the retained original (it leads "**(s1287," not "**F-1287-1 ("), so
// these lines are invisible to the guard while leading 🟡 -- they read as OPEN work carrying a live
// GATE. Adding the ID plus "struck s1341" makes the guard see them, and see them as CLOSED.
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/Users/robin/Claude/Projects/Gold Rush/tasks/BACKLOG.md";

const STRIKES = [
  {
    findsLead: "🟡 **(s1287, MEASURED — THE SUITE-RED INVENTORY'S",
    prefix:
      "🟡 **F-1287-1 — struck s1341, history only: THE `GATE:` BELOW WAS DISCHARGED s1337 (rate measured 8/20 = 40%, cured `b15a9414`, 30/30 green) — see the CLOSED row immediately above. Retained under the Retention Law; do NOT action its GATE.** ORIGINAL, retained verbatim: ",
  },
  {
    findsLead: "🟡 **(s1286, OPEN — AN UNDOCUMENTED BATCH-LOAD FLAKE",
    prefix:
      "🟡 **F-1286-2 — struck s1341, history only: THE `GATE:` BELOW WAS DISCHARGED s1339 (both its options refuted; cured by a third mechanism, `reviews/f-1286-2-bark-determinism.md`) — see the CLOSED row immediately above. Retained under the Retention Law; do NOT action its GATE.** ORIGINAL, retained verbatim: ",
  },
];

const lines = readFileSync(PATH, "utf8").split("\n");

for (const { findsLead, prefix } of STRIKES) {
  const i = lines.findIndex((l) => l.startsWith(findsLead));
  if (i < 0) throw new Error(`no line starts with: ${findsLead.slice(0, 50)}`);
  if (lines[i].includes("struck s1341")) {
    console.log(`line ${i + 1}: already struck -- skipped`);
    continue;
  }

  const original = lines[i];
  const next = prefix + original;

  // The whole point: the retained words must survive untouched.
  if (!next.endsWith(original)) throw new Error("prefix would alter the retained text");
  if (!/struck s\d+/i.test(next.slice(0, 90))) {
    throw new Error(`"struck sNNN" must land inside the guard's 90-char subject window`);
  }
  const id = next.slice(0, 90).match(/\bF-\d+-\d+\b/);
  if (!id) throw new Error("F-ID must land inside the 90-char subject window");

  lines[i] = next;
  console.log(`line ${i + 1}: struck as history, id ${id[0]} now visible to the guard`);
}

writeFileSync(PATH, lines.join("\n"));
