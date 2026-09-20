import fs from 'node:fs';
import cp from 'node:child_process';
import crypto from 'node:crypto';

const P = 'src/systems/Vfx.ts';
const orig = fs.readFileSync(P);
const h0 = crypto.createHash('sha256').update(orig).digest('hex');

const run = () => {
  try {
    cp.execSync(
      'npx playwright test e2e/vfx-float-legibility.spec.ts --workers=1 --project=desktop-chrome --reporter=line',
      { encoding: 'utf8', timeout: 300000, stdio: 'pipe' },
    );
    return 0;
  } catch {
    return 1;
  }
};

// MUTATION: truncate silently instead of appending the ellipsis.
// The primary assertion (renderedWidthPx <= budget) is a theorem and cannot notice this.
// The NEW assertion (renderedText ends with the ellipsis) must.
const src = orig.toString();
const needle = 'renderedText = `${fitted.join(\'\').trimEnd()}…`;';
const replacement = "renderedText = fitted.join('').trimEnd();";
if (!src.includes(needle)) {
  console.log('MUTATION DID NOT APPLY — needle absent');
  process.exit(1);
}
fs.writeFileSync(P, src.replace(needle, replacement));
console.log('MUTATION (ellipsis removed):', run() !== 0 ? 'RED - guard has teeth' : 'GREEN - NO TEETH');

fs.writeFileSync(P, orig);
const h1 = crypto.createHash('sha256').update(fs.readFileSync(P)).digest('hex');
console.log('restored byte-exact:', h0 === h1, h0.slice(0, 16));
console.log('RESTORED:', run() === 0 ? 'GREEN' : 'RED');
