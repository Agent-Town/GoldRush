
    require('node:child_process').spawnSync = () => ({ status: 1, signal: null, stdout: 'stdout-before-crash', stderr: 'stderr-before-crash' });
    require('node:module').syncBuiltinESMExports();
  