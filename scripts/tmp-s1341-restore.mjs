// s1341 one-shot: restore handoff line-1s that a successor fire's LOCK commit dropped and no
// later commit put back. Sources the ORIGINAL BYTES from git -- nothing is retyped.
//
// Each entry: the lock commit that dropped it (its parent holds the original as line-1) and the
// session whose handoff was lost. Insertion point is that session's own `lock (line-1 archive)`
// bullet, since the board's convention is <handoff bullet> immediately above <lock bullet>.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const REPO = "/Users/robin/Claude/Projects/Gold Rush";

const LOSSES = [
  { session: 1339, droppedBy: "f2380ccc", note: "s1340's lock commit; s1340 then DIED without ever writing a handoff" },
  { session: 1337, droppedBy: "8e68f689", note: "s1338's lock commit; s1338 completed but never restored it" },
  { session: 1278, droppedBy: "9b46df4d", note: "s1279's lock commit; s1279 completed but never restored it" },
];

const path = `${REPO}/STATUS.md`;
let lines = readFileSync(path, "utf8").split("\n");

for (const { session, droppedBy, note } of LOSSES) {
  if (lines.some((l) => l.includes(`s${session} handoff (line-1 archive`))) {
    console.log(`s${session}: already on the board -- skipped`);
    continue;
  }

  const original = execFileSync("git", ["-C", REPO, "show", `${droppedBy}^:STATUS.md`], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  }).split("\n")[0];

  if (!original.includes(`s${session} handoff`)) {
    throw new Error(`s${session}: ${droppedBy}^ line-1 is not that handoff -- got: ${original.slice(0, 120)}`);
  }

  const anchor = lines.findIndex((l) => l.startsWith(`- **s${session} lock (line-1 archive`));
  if (anchor < 0) throw new Error(`s${session}: no lock bullet to anchor against`);

  lines.splice(
    anchor,
    0,
    `- **s${session} handoff (line-1 archive — RESTORED s1341 from commit ${droppedBy}^; ${note}, F-1341-1):** ${original}`,
  );
  console.log(`s${session}: RESTORED ${original.length} chars above its lock bullet (line ${anchor + 1})`);
}

writeFileSync(path, lines.join("\n"));
