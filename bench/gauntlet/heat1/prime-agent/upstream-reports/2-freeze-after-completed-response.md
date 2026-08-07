# Session freezes permanently after a successfully completed model response (JSON mode)
**Environment:** macOS (Darwin 25.5.0, arm64) · node v26.4.0 · built from source at `0e0d233` (npm ci + npm run build; IPython runtime lazy-prep path) · isolated $HOME · provider openrouter, model deepseek/deepseek-v4-flash · headless via --mode json unless noted
**What happened:** Mid-session (real work in progress; ~1.86MB of events), the last emitted event is a COMPLETED assistant message — `"stopReason":"stop"` with full usage/cost — then the event stream stops entirely. Six processes (daemon/worker/kernel family) stayed alive and silent for 3+ hours. No error event, no further output.
**Expected:** the loop continues (tool execution / next turn) or an error surfaces.
**Evidence:** full JSON event stream retained; final event is a well-formed message_end with normal usage.
