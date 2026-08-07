# (pi upstream, inherited by prime-agent) -p print mode dies silently when stdin is closed
**Environment:** pi 0.84.0 (npm install) AND prime-agent from source at `0e0d233`; macOS Darwin 25.5.0 arm64; node v26.4.0.
**Minimal repro (controlled A/B, same moment, same env):**
```sh
nohup pi -p --provider openrouter --model deepseek/deepseek-v4-flash "Reply exactly: OK-A" > a.log 2>&1 &   # stdin: closed
nohup pi -p ... "Reply exactly: OK-B" < /dev/null > b.log 2>&1 &                                            # stdin: /dev/null
# a.log: 0 bytes, process gone, no error. b.log: "OK-B".
```
**Note:** intermittent in the wild — two earlier closed-stdin launches completed full multi-minute sessions; the A/B above reproduced the failure deterministically in our environment. Docs say print mode "reads piped stdin"; a closed (not piped) stdin appears to be the unhandled case.
**Expected:** closed stdin treated as EOF (as /dev/null is), or a fatal error printed.
