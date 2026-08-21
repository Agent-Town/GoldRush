#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(process.argv[2] ?? 'artifacts/f2135-canyon-census/epoch3-checkpoint.json');
const location = new URL('http://f2135-canyon-checkpoint.local/?debug');
globalThis.location = location;

const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { FakeStorage } = await vite.ssrLoadModule('/src/sim/FakeStorage.ts');
  const storage = new FakeStorage();
  globalThis.localStorage = storage;
  globalThis.window = { location, localStorage: storage };

  const [
    { activeEpoch, activateEpoch, listEpochs, loadEpoch },
    { MEGAPROJECT_STATE_KEY },
    { packActiveProfile },
  ] = await Promise.all([
    vite.ssrLoadModule('/src/meta/ContractFamilies.ts'),
    vite.ssrLoadModule('/src/meta/Megaproject.ts'),
    vite.ssrLoadModule('/src/game/ProfileTransfer.ts'),
  ]);

  packActiveProfile(storage); // Establish the real default profile before writing scoped progression.
  const activated = [activeEpoch().id];
  for (const next of listEpochs().filter((epoch) => epoch.order > activeEpoch().order && epoch.order <= 3)) {
    const current = activeEpoch();
    const saved = JSON.parse(storage.getItem(MEGAPROJECT_STATE_KEY) ?? '{"version":1,"projects":{}}');
    saved.projects[current.megaproject.id] = { ...saved.projects[current.megaproject.id], complete: true };
    storage.setItem(MEGAPROJECT_STATE_KEY, JSON.stringify(saved));
    if (!activateEpoch(next.id)) throw new Error(`Could not activate ${next.id} from ${current.id}.`);
    activated.push(next.id);
  }
  if (activeEpoch().id !== 'epoch-3-voltage') throw new Error(`Expected epoch-3-voltage, got ${activeEpoch().id}.`);

  const envelope = packActiveProfile(storage).envelope;
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(envelope, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ output, activated })}\n`);
} finally {
  await vite.close();
}
