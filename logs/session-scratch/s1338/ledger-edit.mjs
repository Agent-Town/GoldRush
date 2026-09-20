import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const L = fs.readFileSync(p, 'utf8').split('\n');
const i = 9; // 0-based index of BACKLOG line 10
if (!L[i].startsWith('🟡 **F-1337-1')) throw new Error('anchor moved: ' + L[i].slice(0, 60));

const closure = [
  ' ✅ **CLOSED-BY-REPAIR s1338 — `7abb7b27`. THE MECHANISM IS NOT STARVATION, AND THAT MATTERS, BECAUSE THIS ROW’S OWN GATE FORBADE THE FIX THAT WAS CORRECT.**',
  '🔬 **Diagnosed from control flow, then measured.** The failing predicate is `expect.poll(() => storyHintCount(...)).toBe(1)` at `:406` — *“Timeout 5000ms exceeded while waiting on the predicate”* is `expect.poll`’s own wording, and `:406`/`:421` were the only two polls in this test left at the **5000ms default** while every neighbour waiting on the same async game loop was given **8_000 or 12_000**.',
  '`storyHintCount` reads persisted `hintsSeen`; that key is written **only inside `StoryRuntime.show()`** (`src/story/StoryRuntime.ts:134`, `markStoryBeatSeen`), so the write is gated behind the story-card **queue**, whose constants are `CARD_MS = 6000` and `GAP_MS = 3000` (`src/story/StoryRuntime.ts:9-10`).',
  '➡️ **The wait therefore has a structural floor of residual-card + gap — up to 9s — and the deadline was set BELOW it.**',
  '📊 **Instrumented at a 30s horizon under the identical batch (3 encyclopedia specs, `--repeat-each=3`, both projects, `--workers=1`): elapsed = 5047 · 5064 · 5106 · 5024 ms, and 42/42 passed.** Every sample clears 5000 by only 24–106 ms — which is exactly why it read as a **coin flip** rather than a hard red: the true latency straddles the deadline by ~1%, and batch load supplies the jitter that decides each toss. (The companion poll at `:421` measured **3–7 ms** — by then the card has already shown, which is the same mechanism seen from the other side.)',
  '⚠️ **SO THE GATE’S PROHIBITION WAS AIMED AT A MECHANISM THAT WAS NOT THERE.** It read *“do NOT raise the 5000ms timeout … a timeout raise cannot fix a starvation bug; it only moves the rate.”* That is true **of starvation** — but this is not starvation, it is **a deadline provisioned under a known, deterministic scheduler floor**, and for that the timeout is the honest knob.',
  '✅ **Repaired to `12_000`** — derived from the mechanism (clears the 9s structural max) and matching the neighbouring polls, **not tuned until green**. **Cure measured at the denominator that measured the defect: `:381` 6/6 GREEN** (was 3/6). `tsc --noEmit` clean.',
  '💡 **THE CLASS: a finding’s GATE can encode a HYPOTHESIS about the mechanism, and then forbid the correct repair in that hypothesis’s name.** s1337 filed this honestly and refused to cure what it had not diagnosed — the right call, and F-1334-1’s law. But the prohibition it wrote to protect that caution was **itself unmeasured**, and a later fire obeying it literally would have hunted a starvation bug that does not exist. **A gate may state a precondition; when it also states a CONCLUSION about the cause, that conclusion is a finding like any other and inherits the duty to be measured.**',
].join(' ');

L[i] = L[i].replace(/^🟡/, '✅') + closure;

const fresh = [
  '🟡 **F-1338-1 (s1338, MEASURED — F-1286-2’S OWED REPAIR, CARRIED AS A STANDING INSTRUCTION SINCE s1286 AND RE-PUBLISHED VERBATIM s1337, IS A RESTATEMENT OF THE ASSERTION AND WOULD NOT FIX IT).**',
  'F-1286-2 closes with *“do not widen the wait — **await the named actor**”*.',
  '✓ **The finding itself is real and re-reproduced a third time this fire:** `e2e/en-02-e1-coverage.spec.ts:323` failed **1/6** in my batch, same signature as filed.',
  '✗ **But the prescribed cure does not engage the mechanism.** Read at source: `town-bark-card` is a **single persistent element** (`src/town/TownScene.ts:370`, created once in the field initialiser) whose `dataset.actorId` is overwritten at `:1519` with **`nearest.definition.id`**. There is no carousel of per-actor cards to select between — so *“await the named actor”*, i.e. a locator such as `[data-testid=town-bark-card][data-actor-id=tavernkeeper]`, waits on **the identical condition** the existing `toHaveAttribute` already auto-retries, on the identical default clock. **Same question, same deadline, same outcome.**',
  '🔍 **The real decoupling is upstream, and it is between two subsystems:** `approachTavern` (`e2e/en-02-e1-coverage.spec.ts:200-203`) waits for `activePrompt === "tavern"` — the **building** prompt — while the bark card keys off the nearest wandering **actor**. Reaching the tavern therefore does not imply the tavernkeeper is nearest, and a youngster passing through legitimately owns the card.',
  'ⓘ `__GR_TOWN_DIAGNOSTICS__.activeBark.actorId` is exposed (`src/town/TownScene.ts:160`, `:2216`), so a world-level wait **is** available — **but whether that is a fix or merely a longer wait turns on an unmeasured fact: is the occlusion transient (tavernkeeper stationary, youngster passing through) or steady-state?**',
  '**GATE: measure whether `activeBark.actorId` returns to `tavernkeeper` on its own after a youngster occludes it, and how long that takes. Only then choose between waiting on the world condition and making the approach deterministic.** This is a measurement, not an owner decision — any fire on an idle board can run it.',
  '⛔ **Not repaired this fire, deliberately — F-1334-1’s law: I could disprove the inherited cure but not yet prove a replacement.**',
  '💡 **THE CLASS (memory law *a cure written by someone who could not run it is untested*): a repair instruction attached to a CONFIRMED finding inherits that finding’s credibility without ever having been tested.** F-1286-2’s diagnosis was right, its rate was right, and it was re-verified at source twice — so every reader’s confidence kept attaching to the row as a whole. **The one clause nobody checked was the imperative sentence telling the next fire what to do**, and it is the only clause that was ever going to be executed.',
].join(' ');

L.splice(i + 1, 0, '', fresh);
fs.writeFileSync(p, L.join('\n'));
console.log('ledger rows written');
