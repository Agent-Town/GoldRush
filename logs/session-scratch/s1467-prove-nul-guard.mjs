import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const target = 'reviews/f1465-1-nul-delimiters.md';
const NUL = String.fromCharCode(0);
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

const original = fs.readFileSync(target);
const originalSha = sha(original);
console.log('original sha256:', originalSha);

const runAudit = () => {
  try {
    const out = execFileSync('node', ['scripts/nul-audit.mjs'], { encoding: 'utf8' });
    return { rc: 0, out };
  } catch (e) {
    return { rc: e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
};

// 1. Baseline: must be clean right now.
const base = runAudit();
console.log('\n[1] BASELINE rc=' + base.rc + ' :: ' + base.out.trim().split('\n')[0]);
if (base.rc !== 0) throw new Error('baseline is not clean — aborting probe');

// 2. Manufacture the defect: append a raw NUL, exactly the s1466 shape.
fs.writeFileSync(target, Buffer.concat([original, Buffer.from('probe' + NUL + 'line\n', 'utf8')]));
const red = runAudit();
console.log('[2] WITH INJECTED NUL rc=' + red.rc + ' :: ' + red.out.trim().split('\n')[0]);

// 3. Restore and prove byte-identity.
fs.writeFileSync(target, original);
const restoredSha = sha(fs.readFileSync(target));
const after = runAudit();
console.log('[3] RESTORED rc=' + after.rc + ' :: ' + after.out.trim().split('\n')[0]);
console.log('    restored sha256:', restoredSha, restoredSha === originalSha ? '(BYTE-IDENTICAL)' : '(MISMATCH!)');

console.log('\nVERDICT:');
console.log('  guard detects the defect :', red.rc === 1 ? 'YES (rc=1)' : 'NO — rc=' + red.rc + ' — GUARD IS INERT');
console.log('  probe left no residue    :', restoredSha === originalSha ? 'YES' : 'NO');
if (red.rc !== 1 || restoredSha !== originalSha) process.exitCode = 1;
