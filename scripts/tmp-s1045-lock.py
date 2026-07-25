import io

P = "/Users/robin/Claude/Projects/Gold Rush/STATUS.md"
with io.open(P, encoding="utf-8") as f:
    lines = f.read().split("\n")

old = lines[0]
rest = lines[1:]

new1 = (
    "ACTIVE 2026-07-25T14:02Z (s1045 fire) - triage: lane-c ED-04 run live, "
    "all queues empty; verifying F-1044-2 (e10 art in no commit) and refilling an idle lane"
)
archive = "- **s1044 handoff (line-1 archive):** " + old

out = [new1, "", archive] + rest
with io.open(P, "w", encoding="utf-8") as f:
    f.write("\n".join(out))
print("ok")
