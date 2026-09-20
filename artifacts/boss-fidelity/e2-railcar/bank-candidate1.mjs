import { copyFile, cp, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const bank = path.join(root, 'artifacts/boss-fidelity/e2-railcar/candidate1');
await mkdir(bank, { recursive: true });
await rename(path.join(root, 'artifacts/boss-fidelity/e2-railcar/after'), path.join(bank, 'after')).catch(error => { if (error.code !== 'ENOENT') throw error; });
for (const name of ['focused-check-final.jsonl', 'focused-check-final.err', 'existing-presentation-tests.log', 'after-capture.log', 'typecheck-final.log']) {
  await copyFile(path.join(root, 'artifacts/boss-fidelity/e2-railcar', name), path.join(bank, name));
}
for (const relative of ['artifacts/wire-railcar-3d', 'artifacts/fix-e2-railcar-read', 'artifacts/railcar-reference-art', 'test-results']) {
  await cp(path.join(root, relative), path.join(bank, 'adjacent-evidence', relative), { recursive: true });
}
// These three output paths were clean before this batch. Restore only the exact
// tracked bytes that the unchanged tests wrote, after retaining their run evidence.
const scopes = ['artifacts/wire-railcar-3d', 'artifacts/fix-e2-railcar-read', 'artifacts/railcar-reference-art'];
const changed = execFileSync('git', ['diff', '--name-only', '-z', '--', ...scopes]).toString().split('\0').filter(Boolean);
for (const relative of changed) await writeFile(path.join(root, relative), execFileSync('git', ['show', `HEAD:${relative}`], { maxBuffer: 32 * 1024 * 1024 }));
for (const name of ['renderer-counts-desktop-chrome.json', 'renderer-counts-mobile-chrome.json']) {
  await copyFile(path.join(root, 'artifacts/wire-railcar-3d', name), path.join(bank, `original-${name}`));
}
await writeFile(path.join(bank, 'bank.json'), JSON.stringify({ restoredTrackedPaths: changed }, null, 2));
console.log(`Banked candidate1 and restored ${changed.length} tracked test outputs.`);
