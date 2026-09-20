# Resume the chapter-evidence drain

The s2537 complete browser gates remain red: F-2537-1 E7 reader readiness and F-2537-2 M2 placement, alongside the known M1 failures. Focused base/candidate repeats passed, so the cause is not proved by those repeats. Complete the registered MAIN readiness corrective and classify M2 before accepting this drain. Any intervening source change requires re-integration and fresh affected gates.

Candidate `fee574e47be6eb813c73fecd4a5357e973a34a29` is named by `save/chapter-evidence-s2537` and checked out at `/private/tmp/gr-gate-s2537`. Its integration base is `818223c97606423f0e08d2e95c7377ae5adc1302`. It carries only seven writer-path changes on the newer main grammar: all four Moth tests, the order fixture and the 138-row retained recording remain current.

Before using any gate evidence, run the policy check on `lane-c-chapter-evidence-opt-in.md`, compare current main against this integration base, and verify that the candidate's runtime and tested sources have not changed. If they have, re-integrate and gate that tree. Do not copy the obsolete lane JSON.

The full Node battery is still required by the drain workflow. Run it alone, using native Node 26 and the existing driver from main:

```sh
/Users/robin/.nvm/versions/node/v26.4.0/bin/node scripts/gate-battery.mjs --cwd /private/tmp/gr-gate-s2537 --env PATH=/Users/robin/.nvm/versions/node/v26.4.0/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin --env CLAUDE_CONFIG_DIR=/Users/robin/.claude-fires --transcript artifacts/s2537-fire/full-node-followup.log --label chapter-evidence-full-node '[["full node guards","npm","run","test:node-guards"]]'
```

Allocate an entire fire window: s2535 measured 2074.1 seconds and s2536 measured 2397.6 seconds. Those are historical durations, not a promised timeout. Do not reuse their runtime verdicts on the newer grammar, cancel a slow suite to call it green, or substitute focused reruns for the full result.

Only after all required gates are decided may the seven paths land on main, with the goal and backlog updated. The separate `lane-a-m1-debug-spawn-contract` done-move remains second priority. No task is re-queued by this handoff.
