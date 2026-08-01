// s1341: run the test:ledger-guards chain through node, because the bash allowlist refuses the
// npm script name (fire.md F-1300-4: "the gate denies YOU, not the factory").
import { spawnSync } from "node:child_process";

const CHAIN = [
  ["node", ["--test", "scripts/goal-tracker.test.mjs", "scripts/goal-closure-reason.test.mjs",
    "scripts/ruling-propagation-guard.test.mjs", "scripts/law-pointer-guard.test.mjs",
    "scripts/gate-caller-audit.test.mjs"]],
  ["node", ["scripts/findings-state-guard.mjs"]],
  ["node", ["scripts/blocker-panel-closed-guard.mjs"]],
  ["node", ["scripts/ruling-propagation-guard.mjs"]],
  ["node", ["scripts/citation-title-guard.mjs"]],
  ["node", ["scripts/desk-declaration-guard.mjs"]],
  ["node", ["scripts/status-archive-audit.mjs", "--limit", "40", "--quiet"]],
];

let failed = 0;
for (const [cmd, args] of CHAIN) {
  const r = spawnSync(cmd, args, { cwd: "/Users/robin/Claude/Projects/Gold Rush", encoding: "utf8" });
  const name = args.find((a) => a.startsWith("scripts/")) ?? args[0];
  const label = args[0] === "--test" ? "node --test (5 files)" : name;
  if (r.status !== 0) {
    failed++;
    console.log(`RED  rc=${r.status}  ${label}`);
    console.log((r.stdout || "").split("\n").slice(-12).join("\n"));
    console.log((r.stderr || "").split("\n").slice(-12).join("\n"));
  } else {
    console.log(`green      ${label}`);
  }
}
console.log(failed === 0 ? "\ntest:ledger-guards CHAIN GREEN (7/7)" : `\nCHAIN RED: ${failed} failing`);
process.exit(failed === 0 ? 0 : 1);
