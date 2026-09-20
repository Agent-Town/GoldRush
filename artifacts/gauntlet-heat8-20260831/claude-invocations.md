# Claude Code field invocations

CLI version: `2.1.223`. Before every spawn the driver copied the runner environment and deleted `CLAUDE_CONFIG_DIR` and `CLAUDECODE`.

The exact, unredacted argv for every invocation—including the complete charter and live view passed as the `-p` argument—is preserved verbatim on the `CLAUDE INVOCATION` line in each named log. The shell-equivalent shape was:

```text
env -u CLAUDE_CONFIG_DIR -u CLAUDECODE claude -p "<exact charter plus live view recorded in log>" --model <model> --allowedTools Read 'Bash(node scripts/gr-sim.mjs *)' --permission-mode dontAsk --safe-mode --output-format text --session-id <uuid>
```

## Fable 5

- Authoritative full-wall invocation: `claude-fable/the-claim/platform-attempt.log`.
- Exact result after 1,200 seconds: `Error: spawnSync claude ETIMEDOUT`; `code: ETIMEDOUT`; `status: 143`; stdout and stderr both empty.
- The simulator remained at its initial wave-0 view. No order, tape, or model text was produced.
- Two setup probes using the same exact flags but an earlier 330-second per-call cap are retained in `attempt-1.log` and `attempt-1b.log`; both ended with the same empty-output `spawnSync claude ETIMEDOUT` result. They are not counted as gameplay attempts.

## Opus 5

- Authoritative full-wall invocation: `claude-opus/the-claim/platform-attempt.log`.
- Exact result after 1,200 seconds: `Error: spawnSync claude ETIMEDOUT`; `code: ETIMEDOUT`; `status: 143`; stdout and stderr both empty.
- The simulator remained at its initial wave-0 view. No order, tape, or model text was produced.
- One setup probe with the earlier 330-second cap is retained in `attempt-1.log` and had the same result; it is not counted as a gameplay attempt.

Under the task's platform-wall rule, both Claude rigs are DNF for the field after their one full-duration encounter; retries on the other maps were not burned.
