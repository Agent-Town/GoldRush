#!/usr/bin/env bash
# THE FOUNDRY KIT — self-test. Scaffolds a factory into a temp dir and asserts the whole
# contract: tree, template instantiation, plist paths, config validity, script syntax,
# both runners' --dry-run, and the never-overwrite refusal. Exits nonzero on any failure.
# Run: bash foundry/kit/test-init.sh
set -u
KIT="$(cd "$(dirname "$0")" && pwd)"
FAILS=0
PASSES=0
pass() { PASSES=$((PASSES + 1)); echo "  ok: $*"; }
fail() { FAILS=$((FAILS + 1)); echo "  FAIL: $*" >&2; }
assert_file() { [ -f "$1" ] && pass "file $1" || fail "missing file $1"; }
assert_dir()  { [ -d "$1" ] && pass "dir  $1" || fail "missing dir $1"; }
assert_grep() { grep -q "$1" "$2" 2>/dev/null && pass "$2 contains '$1'" || fail "$2 lacks '$1'"; }

command -v node >/dev/null 2>&1 || { echo "FATAL: node required for the kit self-test" >&2; exit 1; }

TMP=$(mktemp -d /tmp/foundry-kit-test.XXXXXX) || exit 1
trap 'rm -rf "$TMP"' EXIT
TARGET="$TMP/newgame"

echo "== 1. kit scripts parse (bash -n) =="
for s in fire-runner.sh lane-runner.sh dashboard-gen.sh health-watch.sh test-init.sh; do
  bash -n "$KIT/$s" 2>/dev/null && pass "bash -n $s" || fail "bash -n $s"
done

echo "== 2. init scaffolds a fresh target =="
if node "$KIT/init.mjs" "$TARGET" "Test Game" > "$TMP/init.out" 2>&1; then
  pass "init.mjs exited 0"
else
  fail "init.mjs exited nonzero: $(cat "$TMP/init.out")"
  echo "ABORT: nothing to assert against." >&2
  exit 1
fi

echo "== 3. directory tree =="
for d in tasks/queue/main tasks/queue/lane-a tasks/queue/lane-b tasks/queue/lane-c \
         tasks/queue/lane-d tasks/queue/art tasks/done tasks/failed tasks/runs \
         tasks/running tasks/janitor reviews specs docs logs worktrees scripts .claude; do
  assert_dir "$TARGET/$d"
done

echo "== 4. every 09-template instantiated + seeds + scripts present =="
for f in CLAUDE.md AGENTS.md STATUS.md README.md foundry.config.json \
         tasks/BACKLOG.md tasks/goals.json tasks/TEMPLATE-task-master.md \
         reviews/TEMPLATE-review.md docs/TEMPLATE-specialist-queue.md docs/TEMPLATES-INDEX.md \
         worktrees/README.md .claude/settings.json \
         scripts/fire.md scripts/fire-runner.sh scripts/lane-runner.sh \
         scripts/dashboard-gen.sh scripts/health-watch.sh scripts/com.test-game.fire.plist; do
  assert_file "$TARGET/$f"
done
for s in fire-runner.sh lane-runner.sh dashboard-gen.sh health-watch.sh; do
  [ -x "$TARGET/scripts/$s" ] && pass "executable scripts/$s" || fail "scripts/$s not executable"
done

echo "== 5. name/path substitution =="
assert_grep "Test Game" "$TARGET/CLAUDE.md"
assert_grep "Test Game" "$TARGET/scripts/fire.md"
assert_grep "Test Game" "$TARGET/tasks/BACKLOG.md"
# The leftover-token set is DERIVED from init.mjs's own instantiate() body, never
# hand-listed beside it. F-2306-1: the hand-list knew 3 of the 4 tokens the
# substituter replaces, and the one it missed (<date>) was the most common in the
# corpus — 8 occurrences across 3 templates vs 4 for all three it knew. Dropping
# the <date> substitution shipped 8 raw tokens into CLAUDE.md, scripts/fire.md and
# docs/TEMPLATE-specialist-queue.md while this section printed a perfect green,
# byte-identical to a correct scaffold on stdout, stderr AND rc.
# DERIVED (catches tokens ADDED to the substituter) UNIONED WITH A CONTRACT FLOOR
# (catches tokens REMOVED from it). Both halves are load-bearing and one alone is
# worse than useless: a set derived ONLY from instantiate() is defeated by the very
# edit it must catch — dropping a replaceAll also drops it from the check — which is
# how the first draft of this cure went green on BOTH defect arms, including the one
# the hand-list it replaced had caught. The floor is the independent anchor.
TOKFILE="$TMP/subst-tokens.txt"
if node -e '
  const fs = require("fs");
  const FLOOR = ["<PROJECT NAME>", "<PROJECT>", "<project>", "<date>"];
  const src = fs.readFileSync(process.argv[1], "utf8");
  const body = src.match(/function instantiate\([\s\S]*?\n\}/);
  if (!body) { console.error("instantiate() not found in init.mjs"); process.exit(2); }
  const derived = [...body[0].matchAll(/\.replaceAll\(\x27([^\x27]+)\x27/g)].map((m) => m[1]);
  if (!derived.length) { console.error("instantiate() replaces no tokens"); process.exit(2); }
  const missing = FLOOR.filter((t) => !derived.includes(t));
  if (missing.length) {
    console.error("init.mjs no longer substitutes contract token(s): " + missing.join(" "));
    process.exit(2);
  }
  process.stdout.write([...new Set([...derived, ...FLOOR])].join("\n") + "\n");
' "$KIT/init.mjs" > "$TOKFILE" 2>"$TMP/subst-tokens.err"; then
  TOKCOUNT=$(grep -c . "$TOKFILE" 2>/dev/null || echo 0)
else
  TOKCOUNT=0
fi
# Declared ALWAYS, including the happy path: "0 leftover tokens" read off an empty
# token set is the same false green one level up, and only this line separates them.
if [ "$TOKCOUNT" -ge 1 ]; then
  pass "derived $TOKCOUNT substitution token(s) from init.mjs instantiate() [DERIVED, not hand-listed]"
else
  fail "cannot derive substitution tokens from init.mjs — the leftover-token check would be vacuous: $(cat "$TMP/subst-tokens.err" 2>/dev/null)"
fi
for f in CLAUDE.md scripts/fire.md tasks/TEMPLATE-task-master.md reviews/TEMPLATE-review.md docs/TEMPLATE-specialist-queue.md docs/TEMPLATES-INDEX.md; do
  if [ ! -f "$TARGET/$f" ]; then
    fail "leftover-token check cannot read $f — the file is missing"
  elif [ "$TOKCOUNT" -lt 1 ]; then
    fail "leftover-token check VACUOUS for $f — no token set was derived"
  elif LEFT=$(grep -Fo -f "$TOKFILE" "$TARGET/$f" 2>/dev/null | sort -u | tr '\n' ' '); [ -n "$LEFT" ]; then
    fail "unsubstituted token(s) remain in $f: $LEFT"
  else
    pass "no unsubstituted tokens in $f (checked $TOKCOUNT derived token(s))"
  fi
done

echo "== 6. plist paths + label + cadence =="
PLIST="$TARGET/scripts/com.test-game.fire.plist"
assert_grep "<string>com.test-game.fire</string>" "$PLIST"
assert_grep "<string>$TARGET/scripts/fire-runner.sh</string>" "$PLIST"
assert_grep "<string>$TARGET</string>" "$PLIST"
assert_grep "<integer>300</integer>" "$PLIST"
if command -v plutil >/dev/null 2>&1; then
  plutil -lint "$PLIST" >/dev/null 2>&1 && pass "plutil -lint plist" || fail "plist fails plutil -lint"
fi

echo "== 7. config is valid JSON with the contract fields =="
if node -e '
  const c = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
  const need = (cond, msg) => { if (!cond) { console.error(msg); process.exit(1); } };
  need(c.name === "Test Game", "bad name");
  need(c.slug === "test-game", "bad slug");
  need(c.repoPath === process.argv[2], "bad repoPath");
  need(c.fire && c.fire.model && c.fire.cadenceSeconds === 300 && c.fire.protocol === "scripts/fire.md", "bad fire block");
  need(c.runner && c.runner.implementerBin && c.runner.slots && c.runner.slots.main, "bad runner block");
  need(Array.isArray(c.runner.slots.art.addPaths), "art addPaths missing");
  need(c.dashboard && c.dashboard.goalsFile, "bad dashboard block");
' "$TARGET/foundry.config.json" "$TARGET"; then
  pass "foundry.config.json contract"
else
  fail "foundry.config.json contract"
fi
node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' "$TARGET/.claude/settings.json" 2>/dev/null \
  && pass ".claude/settings.json valid JSON" || fail ".claude/settings.json invalid JSON"

echo "== 8. scaffolded shell scripts parse (bash -n) =="
for s in "$TARGET"/scripts/*.sh; do
  bash -n "$s" 2>/dev/null && pass "bash -n $(basename "$s")" || fail "bash -n $(basename "$s")"
done

echo "== 9. fire-runner --dry-run: exit 0, plans only, no side effects =="
if OUT=$(bash "$TARGET/scripts/fire-runner.sh" --dry-run 2>&1); then
  pass "fire-runner --dry-run exit 0"
  echo "$OUT" | grep -q "DRY-RUN" && pass "fire-runner prints DRY-RUN" || fail "fire-runner missing DRY-RUN marker"
  echo "$OUT" | grep -q "model:      claude-opus-4-8" && pass "fire-runner reads model from config" || fail "fire-runner did not read config model"
  echo "$OUT" | grep -q "protocol:   scripts/fire.md (found)" && pass "fire-runner sees protocol file" || fail "fire-runner protocol not found"
  [ ! -d "$TARGET/tasks/.fire.lock" ] && pass "no lock taken" || fail "dry-run took the fire lock"
  [ ! -f "$TARGET/logs/fire-$(date +%Y%m%d).log" ] && pass "no log written" || fail "dry-run wrote a fire log"
else
  fail "fire-runner --dry-run exited nonzero: $OUT"
fi

echo "== 10. lane-runner --dry-run: exit 0, flags missing worktrees, no side effects =="
echo "# probe task" > "$TARGET/tasks/queue/lane-a/probe.md"
if OUT=$(bash "$TARGET/scripts/lane-runner.sh" --dry-run 2>&1); then
  pass "lane-runner --dry-run exit 0"
  echo "$OUT" | grep -q "DRY-RUN" && pass "lane-runner prints DRY-RUN" || fail "lane-runner missing DRY-RUN marker"
  echo "$OUT" | grep -q "lane-a: workdir MISSING" && pass "missing worktree flagged for lane-a" || fail "missing worktree not flagged"
  echo "$OUT" | grep -q "main: workdir OK" && pass "main workdir resolves to root" || fail "main workdir not OK"
  [ -f "$TARGET/tasks/queue/lane-a/probe.md" ] && pass "dry-run left the queue untouched" || fail "dry-run moved a queued task"
  [ ! -d "$TARGET/tasks/.runner.lock" ] && pass "no runner lock taken" || fail "dry-run took the runner lock"
else
  fail "lane-runner --dry-run exited nonzero: $OUT"
fi
rm -f "$TARGET/tasks/queue/lane-a/probe.md"

echo "== 11. idempotency: re-run refuses loudly, overwrites nothing =="
BEFORE=$(cat "$TARGET/CLAUDE.md")
if node "$KIT/init.mjs" "$TARGET" "Test Game" > "$TMP/rerun.out" 2>&1; then
  fail "re-run on existing dir exited 0 (must refuse)"
else
  pass "re-run exited nonzero"
fi
grep -q "REFUSED" "$TMP/rerun.out" && pass "refusal is loud (REFUSED)" || fail "no REFUSED message on re-run"
[ "$BEFORE" = "$(cat "$TARGET/CLAUDE.md")" ] && pass "existing files untouched" || fail "re-run modified an existing file"

echo ""
echo "RESULT: $PASSES passed, $FAILS failed"
[ "$FAILS" -eq 0 ] || exit 1
exit 0
