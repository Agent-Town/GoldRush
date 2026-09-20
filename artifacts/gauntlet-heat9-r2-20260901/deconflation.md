# PI and Prime Agent are separate riders

## PI

- Carried-forward identity receipt from Heat 9: `@mariozechner/pi-coding-agent` 0.73.1, executable `pi`, historical protocol `pi -p`.
- R2 executable: heat-local `/tmp/heat9-r2-pi-install/node_modules/.bin/pi`; isolated state `/tmp/heat9-r2-pi-state`.
- Stack: `gpt-5.6-sol` through provider `heat9-shim`, Codex streaming shim, notebook `memories/pi__gpt-5.6-sol-codex-shim/`.
- Health receipt: isolated model list resolved 128K context / 16.4K max output / thinking yes; completion returned `PI_OK`.

## Prime Agent

- Carried-forward identity receipt from Heat 9/Heat 4: `prime-agent` 0.8.0 from Prime Intellect.
- R2 executable: installed global `prime-agent`, but with heat-only socket `/tmp/heat9-r2-prime-agent.sock` and isolated state `/tmp/heat9-r2-prime-state`.
- Stack: `gpt-5.6-sol` through provider `heat9-shim`, Codex streaming shim, notebook `memories/prime__gpt-5.6-sol-codex/`.
- Health receipt: isolated model list resolved 128K context / 16.4K max output / thinking yes; completion returned `PRIME_OK`.

Heat 6 through Heat 8 wrote `pi (Prime Agent)`, but Heat 8's driver invoked `prime-agent`; only Prime rode. R2 never aliases the names, executables, state directories, sockets, charters, notebooks, matrix rows, submissions, or commons commits.

