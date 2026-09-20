// s1318 — flip the f1316-1 goal leaf to shipped with the 40-hex merge hash (Goal Registration Law).
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/goals.json';
const raw = readFileSync(path, 'utf8');
const doc = JSON.parse(raw);

const walk = (node, out = []) => {
  for (const child of [...(node.subgoals ?? []), ...(node.tasks ?? [])]) {
    out.push(child);
    walk(child, out);
  }
  return out;
};
const nodes = walk({ subgoals: doc.goals ?? [] });
const leaf = nodes.find((n) => n.id === 'f1316-1-float-text-legibility');
if (!leaf) throw new Error('leaf f1316-1-float-text-legibility not found');
console.log('before:', leaf.status, leaf.mergeHash ?? '(no hash)');

leaf.status = 'shipped';
leaf.mergeHash = 'b1dc3306b73bb8c49ed591b069622c878ac3e6ef';
leaf.closureReason = [
  's1318 drain: ACCEPT, merged b1dc3306.',
  'Upgrade sentences now fit the sign — the "the ya" fragment is gone and both merged-tree screenshots show the complete string.',
  "s1316's pre-declared REJECT bar was NOT triggered: lastFloatText.text appears only as a waitForFunction predicate, while every certifying assertion is on measured raster geometry (renderedWidthPx / canvasWidthPx / fontPx), verified at source to come from a real measureText on the drawing context.",
  'Gates on the merged tree: tsc clean; build green; own spec 2/2 desktop+390; adjacent (grep-derived, incl. lane-crossing-armed which the runner missed) 38 passed / 4 failed with all 4 fingerprinted pre-existing by reverting the slice source and reproducing them on main; plain-boot 14/14 zero console errors; node-guards 204/204.',
  'Two risks I raised were refuted by measurement: the deleted clearRect is safe (same-value canvas.width assignment clears — 1831 inked px to 0), and the runner’s 203 guard count was the signature of an incomplete list (s1316’s derived 204 was right).',
  'Filed F-1318-1 NON-BLOCKING: the 32px font floor leaves exactly two characters of copy headroom before the defect silently returns (measured: 44 chars fit at 33px; 46 chars bottom out at 32px and overflow 753.56px into a 748px budget), and the new spec asserts one hard-coded string, so it certifies today’s copy rather than the renderer’s contract.',
  'Review: reviews/f1316-1-float-text-legibility.md',
].join(' ');

writeFileSync(path, `${JSON.stringify(doc, null, 2)}\n`);
JSON.parse(readFileSync(path, 'utf8'));
console.log('after :', leaf.status, leaf.mergeHash, `(${leaf.mergeHash.length} hex)`);
console.log('goals.json re-parsed OK');
