import { readFileSync, writeFileSync } from "node:fs";
const p = "/Users/robin/Claude/Projects/Gold Rush/STATUS.md";
const src = readFileSync(p, "utf8");
const bad = "`\\`L${snapshot.agent?.permissionLevel ?? 0}\\``";
const good = "`L${snapshot.agent?.permissionLevel ?? 0}`";
if (!src.includes(bad)) {
  console.error("target not found — aborting, file untouched");
  process.exit(2);
}
const out = src.split(bad).join(good);
writeFileSync(p, out);
console.log("replaced", (src.length - out.length) / 4, "occurrence(s)");
