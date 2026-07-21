import io
p = "STATUS.md"
with io.open(p, encoding="utf-8") as f:
    lines = f.read().split("\n")
old_line1 = lines[0]
new_line1 = ("ACTIVE 2026-07-22T01:08Z (s851 fire) — CODEX-WALL hold: probe codex once "
    "(expect gated as s810-s850); board dry re-verify; anti-spam CLOSED (01:08<02:06) → no re-send; bookkeeping.")
archive = "- **s850 handoff (line-1 archive):** " + old_line1
# find first bullet line to insert archive after line 0
rest = lines[1:]
out = [new_line1, archive] + rest
with io.open(p, "w", encoding="utf-8") as f:
    f.write("\n".join(out))
print("OK line1 replaced")
