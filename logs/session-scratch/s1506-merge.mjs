import { execFileSync } from 'node:child_process';
const g = (...a) => execFileSync('git', a, { encoding: 'utf8' });
const msg = 'merge(f1501-4-manifest-plural): the Drill Yard says straw men — one irregular-plural entry at the render boundary, and a literal assertion the old self-referential test could not make';
console.log(g('merge', '--no-ff', '-m', msg, 'lane/c'));
console.log(g('log', '-1', '--format=%H'));
