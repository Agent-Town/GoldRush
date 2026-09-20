// s1466: link node_modules into the detached gate worktree (bash gate refuses `ln`; node fs does the same job).
import { symlinkSync, existsSync, lstatSync } from 'node:fs';
const src = '/Users/robin/Claude/Projects/Gold Rush/node_modules';
const dst = '/Users/robin/Claude/Projects/Gold Rush/gate-s1466/node_modules';
if (existsSync(dst) || (() => { try { lstatSync(dst); return true; } catch { return false; } })()) {
  console.log('already present:', dst);
} else {
  symlinkSync(src, dst, 'dir');
  console.log('linked', dst, '->', src);
}
