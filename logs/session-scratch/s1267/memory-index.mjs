import { readFileSync, writeFileSync } from 'node:fs';

const p = '/Users/robin/.claude-fires/projects/-Users-robin-Claude-Projects-Gold-Rush/memory/MEMORY.md';
const lines = readFileSync(p, 'utf8').split('\n');
const i = lines.findIndex((l) => l.includes('fire-shell-and-lane-shell-are-not-the-same-instrument.md'));
if (i < 0) throw new Error('anchor not found');

// The old entry's own claim ("same command + worktree") is the thing s1267 showed was never
// measured — correct it in place, then add the general lesson beneath it.
lines[i] = '- [**SHELL is part of the instrument**](fire-shell-and-lane-shell-are-not-the-same-instrument.md) — now n=24 both sides: lane 0/24, fire 22/24; serial agrees, and the fire runs 6 workers SLOWER than 1';
lines.splice(i + 1, 0, '- [**"eliminated variables" = hypotheses**](eliminated-variables-list-is-hypotheses-until-crossed.md) — five fires quoted "working directory eliminated"; nobody had ever changed the cwd');
writeFileSync(p, lines.join('\n'));
console.log('index updated at line ' + (i + 1));
