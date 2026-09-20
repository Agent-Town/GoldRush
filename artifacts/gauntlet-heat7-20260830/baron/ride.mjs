import { readFile } from 'node:fs/promises';

const baseline = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-c/artifacts/baron-era3-20260829/rider.mjs';
const source = (await readFile(baseline, 'utf8'))
  .replace("const ROOT = new URL('.', import.meta.url);", "const ROOT = new URL('file:///Users/robin/Claude/Projects/Gold%20Rush/worktrees/lane-c/artifacts/gauntlet-heat7-20260830/baron/');")
  .replace("const ARENA = '/Users/robin/Claude/Projects/Gold Rush';", "const ARENA = '/tmp/heat7-81caa695';");

await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
