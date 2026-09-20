import { createServer } from 'vite';
const location = new URL('http://probe.test/');
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const m = await vite.ssrLoadModule('/src/game/ProfileStorage.ts');
  console.log('PROFILE_DATA_KEYS size:', m.PROFILE_DATA_KEYS.size);
  console.log('first-boot in set:', m.PROFILE_DATA_KEYS.has(m.STORY_FIRST_BOOT_KEY), m.STORY_FIRST_BOOT_KEY);
  console.log([...m.PROFILE_DATA_KEYS].sort().join('\n'));
} catch (e) {
  console.log('THREW:', e.message);
} finally { await vite.close(); }
