// s1662: scratch dev server on 5234 inside the gate worktree.
// The two specs never contact baseURL (zero `page.` calls — they boot their own
// vite in middlewareMode), so this exists ONLY to satisfy playwright's
// external-server-guard (F-1457-1). Scratch port keeps it off 5188 (Mistake #12).
import { spawn } from 'node:child_process';
const child = spawn('nice', ['-n', '19', 'npm', 'run', 'dev', '--', '--port', '5234', '--strictPort'], {
  cwd: '/Users/robin/Claude/Projects/Gold Rush/gate-s1662b',
  stdio: 'inherit',
});
child.on('exit', (c) => console.log('dev server exited', c));
