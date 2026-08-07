# Process exits silently mid-stream while receiving an assistant reply (JSON mode)
**Environment:** macOS (Darwin 25.5.0, arm64) · node v26.4.0 · built from source at `0e0d233` (npm ci + npm run build; IPython runtime lazy-prep path) · isolated $HOME · provider openrouter, model deepseek/deepseek-v4-flash · headless via --mode json unless noted
**What happened:** A fresh session (after shutdown --force) ran 623 events including 7 successful IPython tool executions, then all processes exited during an assistant reply — the stream ends with a run of `message_update` events, no message_end, no error event, no non-zero exit surfaced to the launcher.
**Expected:** completed reply, or an error event before exit.
**Evidence:** full event stream retained (728,656 bytes).
