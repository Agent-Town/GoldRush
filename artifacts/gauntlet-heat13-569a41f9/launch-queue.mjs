// Detach the queue into its OWN process group (macOS has no setsid), so that a harness-side kill of
// the operator's foreground/background shell cannot take the ride queue with it. Heat 12 lost the
// e3-moth-season ride at 90 s to exactly that (booked DNF-transport, re-ridden).
import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
const out = openSync(new URL('./queue2.log', import.meta.url).pathname, 'a');
const child = spawn('./run-queue.sh', process.argv.slice(2), { cwd: new URL('.', import.meta.url).pathname, detached: true, stdio: ['ignore', out, out] });
child.unref();
process.stdout.write(`queue pgid ${child.pid}\n`);
