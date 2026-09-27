// Read-only control instrumentation: retain nested runner output before its scratch cleanup.
const cp = require('node:child_process');
const fs = require('node:fs');
const original = cp.spawnSync;
cp.spawnSync = function (command, args, options) {
  const run = original.apply(this, arguments);
  if (args?.includes('--test-reporter=spec') && options?.env?.TMPDIR) {
    fs.appendFileSync(process.env.CAMPAIGN_SWEEP_CAPTURE, JSON.stringify({
      command, args, cwd: options.cwd, status: run.status, signal: run.signal,
      error: run.error?.message, stdout: run.stdout, stderr: run.stderr,
      scratch: options.env.TMPDIR, entries: fs.readdirSync(options.env.TMPDIR),
    }) + '\n');
  }
  return run;
};
require('node:module').syncBuiltinESMExports();
