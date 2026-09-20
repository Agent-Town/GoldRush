// s1307 — register the f1304-2 deploy-alias-patience leaf as a sibling of the
// f1305-2 leaf, by targeted text insertion so the file's existing formatting
// (14-space nesting) is preserved and the diff stays one hunk.
import fs from 'node:fs';

const p = 'tasks/goals.json';
const raw = fs.readFileSync(p, 'utf8');

// Locate the f1305-2 leaf object: walk back to its opening brace, then brace-match forward.
const marker = raw.indexOf('"id": "f1305-2-console-watch-single-source"');
if (marker < 0) throw new Error('f1305-2 leaf not found');
const open = raw.lastIndexOf('{', marker);
let depth = 0, close = -1, inStr = false, esc = false;
for (let i = open; i < raw.length; i++) {
  const c = raw[i];
  if (esc) { esc = false; continue; }
  if (c === '\\') { esc = true; continue; }
  if (c === '"') { inStr = !inStr; continue; }
  if (inStr) continue;
  if (c === '{') depth++;
  else if (c === '}') { depth--; if (depth === 0) { close = i; break; } }
}
if (close < 0) throw new Error('brace match failed');

// Indentation of the leaf's opening line.
const lineStart = raw.lastIndexOf('\n', open) + 1;
const indent = raw.slice(lineStart, open);

const leaf = {
  id: 'f1304-2-deploy-alias-patience',
  title: "F-1304-2 corrective: widen scripts/deploy.sh's production-alias verification window (3 attempts / ~30s of sleep) to a parameterisable ~180s schedule so a slow Cloudflare alias promotion is no longer mis-reported as UNVERIFIED, and reword the final line so it stops asserting staleness it has not earned. Outcome strings and exit codes deliberately unchanged. Proven against the existing stub harness in scripts/test-deploy-contract.sh by a late-promotion case demonstrated to FAIL on the old window and PASS on the new one. The wrangler-deployment-list discriminator (NOT-YET-PROMOTED vs STALE) is deliberately OUT of scope as a design fork.",
  taskFile: 'lane-b-f1304-2-deploy-alias-patience.md',
  lane: 'lane-b',
  status: 'queued',
  authoredBy: 's1307 fire',
  authorNotes:
    "FIRE-AUTHORED from F-1304-2 with its premise re-measured by reading the code rather than inherited: scripts/deploy.sh:116 is 'for ATTEMPT in 1 2 3' with sleep 15 between, so total patience is ~30s, and s1304 proved by asking Cloudflare directly that the deploy had in fact succeeded. Two assumptions of my own were checked and one was WRONG: (a) I first reasoned that a lane runner could not test this because it cannot run a real deploy — false, scripts/test-deploy-contract.sh already stubs wrangler and drives deploy.sh end-to-end against a local alias server, so the seam exists and the master is gated on it; (b) the documented sibling-script class (a fix landing in deploy.sh but not deploy-site.sh for eight fires) does NOT apply — deploy-site.sh is 69 lines and has no alias-verification loop at all, verified by reading. The master names both findings so the runner does not re-derive them.",
};

const body = JSON.stringify(leaf, null, 2)
  .split('\n')
  .map((l, i) => (i === 0 ? l : indent + l))
  .join('\n');

const out = raw.slice(0, close + 1) + ',\n' + indent + body + raw.slice(close + 1);
JSON.parse(out); // validity gate before writing
fs.writeFileSync(p, out);
console.log('leaf f1304-2-deploy-alias-patience registered (status=queued, lane-b); JSON parses');
