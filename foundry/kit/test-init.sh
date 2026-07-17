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
for f in CLAUDE.md scripts/fire.md tasks/TEMPLATE-task-master.md reviews/TEMPLATE-review.md docs/TEMPLATE-specialist-queue.md docs/TEMPLATES-INDEX.md; do
  if grep -qE '<PROJECT( NAME)?>|<project>' "$TARGET/$f" 2>/dev/null; then
    fail "unsubstituted project token remains in $f"
  else
    pass "no project tokens left in $f"
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
