# PI and Prime Agent are separate riders

## PI

- Historical contract: `goldrush-gauntlet/PROTOCOL.md:11` invokes `pi -p --provider openrouter --model deepseek/deepseek-v4-flash` from an isolated HOME.
- Historical notebook headers: `memories/pi__deepseek-v4-flash/NOTEBOOK.md` name `harness: pi`, with 1–20 second setup-to-first-output receipts.
- Current executable: `@mariozechner/pi-coding-agent` 0.73.1, whose package manifest exposes bin `pi`; installed heat-locally at `/tmp/heat9-pi-install`.
- Heat 9 stack: PI 0.73.1, `gpt-5.6-sol`, Codex streaming shim, notebook `memories/pi__gpt-5.6-sol-codex-shim/` (new clean family; `pi__gpt-5.6-sol` is contaminated by Prime headers and is not used).

## Prime Agent

- Heat 4 receipt: `artifacts/gauntlet-heat4-20260824/heat4-note.md` records Prime Agent 0.8.0 and its dedicated socket `/tmp/heat4-prime-agent.sock`.
- Historical notebook headers: `memories/prime__gpt-5.6-sol-codex/NOTEBOOK.md` name `harness: prime-agent 0.7.0`.
- Heat 8 receipt: `artifacts/gauntlet-heat8-20260831/heat8-note.md` records the ridden row as `Prime Agent 0.8.0`; the driver mapped its misleading `pi` key to the `prime-agent` executable.
- Heat 9 stack: Prime Agent 0.8.0, `gpt-5.6-sol`, Codex streaming shim, notebook `memories/prime__gpt-5.6-sol-codex/`.

The heat-6 through heat-8 masters wrote `pi (Prime Agent)`. Their actual ride artifacts and notebook generation headers show that only Prime Agent rode. Heat 9 never aliases either name, executable, notebook, charter, or matrix row.
