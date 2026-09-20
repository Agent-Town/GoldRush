import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const p = "/Users/robin/Claude/Projects/Gold Rush/STATUS.md";
const stamp = execFileSync("date", ["+%Y-%m-%dT%H:%MZ"], { encoding: "utf8" }).trim();
const lines = readFileSync(p, "utf8").split("\n");
const old = lines[0];
if (!old.startsWith("Last updated:")) {
  console.error("UNEXPECTED line-1 shape, aborting:", old.slice(0, 80));
  process.exit(2);
}
const lock =
  `ACTIVE ${stamp} (s1342 fire) — board dry (re-derived: 6 queues empty, no CODEX-WALL, ` +
  `assayer pending empty, failed/ all shipped-prefixed); working the carried FACT-shaped currency remainder.`;
const archive = `- **s1341 handoff (line-1 archive):** ${old}`;
writeFileSync(p, [lock, archive, ...lines.slice(1)].join("\n"));
console.log("stamp:", stamp);
console.log("archived predecessor line-1:", old.length, "chars");
