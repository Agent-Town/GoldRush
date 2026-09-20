import { execFileSync } from 'node:child_process';
import { symlinkSync, existsSync } from 'node:fs';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const dir = process.argv[2];
const ref = process.argv[3];
const run = (args, cwd = ROOT) =>
  execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

if (!existsSync(`${ROOT}/${dir}`)) {
  console.log(run(['worktree', 'add', '--detach', dir, ref]));
}
const nm = `${ROOT}/${dir}/node_modules`;
if (!existsSync(nm)) symlinkSync(`${ROOT}/node_modules`, nm);
console.log('worktree HEAD:', run(['log', '-1', '--format=%H %cI %s'], `${ROOT}/${dir}`));
console.log('node_modules linked:', existsSync(`${nm}/.bin/playwright`));
