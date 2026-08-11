import fs from 'node:fs';

const L = fs.readFileSync('STATUS.md', 'utf8').split('\n');
if (!L[0].startsWith('Last updated: 2026-08-11T12:01Z s1655 handoff')) throw new Error('line-1 is not my handoff');

const stamp = process.argv[2];
if (!/^2026-\d\d-\d\dT\d\d:\d\dZ$/.test(stamp || '')) throw new Error('pass a date-derived stamp');

// 1. restamp
L[0] = L[0].replace('Last updated: 2026-08-11T12:01Z', `Last updated: ${stamp}`);

// 2. the closing battery found two reds — both attended-side surfaces, both cured. Insert the
//    account before the desk segment, and correct the desk itself (F-1166-1 was RULED this morning).
const battery = [
  '🔒 **(4) MY CLOSING `test:ledger-guards` RUN WENT rc=1 — TWICE — AND THAT IS THE s1301 LAW WORKING, NOT A LAPSE: 163/165, and BOTH reds were surfaces attended\'s 11:46 commit had moved while I worked. I cured both rather than handing a red board on (F-1460-1: a red nobody investigates is worse than no test).**',
  '🎯 **F-1655-3 — A GUARD DEFECT, AND ITS REMEDY TEXT WOULD HAVE MADE A CORRECT FILE WRONG.** `banked-master-preflight-guard` named `art-jumper-rotation-regen.md` and said *"retro-fit the FACTORY-CHURN EXCEPTION"*. But that master\'s line 3 reads *"You are Codex in the ART slot… **No git pre-flight**"* and the predicate was a bare `/PRE-FLIGHT/i` substring test — **a disclaimer read as a declaration.** The ART slot has no git worktree at all (§2E ART-SLOT LAW), so the demanded paragraph is a category error for it. **When a guard tells you to edit someone else\'s correct file, read the predicate before you obey it.** ⚠️ **The obvious narrowing was measured and REJECTED:** line-start matching drops the art master **and** `lane-e3-fairground-socket.md` (a real banked lane master whose pre-flight is a `## PRE-FLIGHT` heading) — 5→3, one false positive removed and one real subject lost, the F-1539-2 vacuity trap inside the guard whose own header warns of it. Cure scopes the **negation**; denominator **4 checked / 1 excluded**, e3 retained. Predicate exported and **every arm proved by manufacturing it**, including that the OLD predicate still matches the disclaimer *"else this proves nothing"*, and that an affirmative pre-flight without the cure is still an offender. 6/6, existing file, no new gate topology.',
  '📌 **F-1655-4 — AN OWNER RULING HAD NOT REACHED THE LEAF\'S REFUSAL.** `ruling-propagation-guard` flagged `vp-02e-jumper-8way-activation` citing **F-1166-1**, which the owner **RULED (b)** this morning (*"this is not too much to do, lets fix things when we can"*). Attended executed it well — leaf `superseded`, both successors authored — but the leaf kept `blockClass:"owner-fork"` + a `blockedReason` citing the answered question, so a fire would have refused **the very work the owner had just greenlit**. Both keys retired into `note_s1655` with the prior text **preserved verbatim** (nothing deleted). Guard now: **0 stale**. 💡 *An owner ruling lands on every surface the question had — and the leaf\'s reason was a fourth surface nobody was watching.*',
].join(' ');

const deskOld = L[0].indexOf('🔺 **OWNER\u2019S DESK');
const deskAlt = L[0].indexOf("🔺 **OWNER'S DESK");
const cut = deskOld >= 0 ? deskOld : deskAlt;
if (cut < 0) throw new Error('desk segment not found on line 1');

const desk = [
  "🔺 **OWNER'S DESK — 18 awaiting a word (was 19; F-1166-1 LEAVES IT, you ruled it this morning).**",
  '🔺 **F-1653-2** · 🔺 **F-1648-1** · 🔺 **F-1640-1** · 🔺 **F-1637-2** · 🔺 **F-1625-4** · 🔺 **F-1617-1** · 🔺 **F-DOOR-6** · 🔺 **F-1608-2** · 🔺 **F-1193-3** · 🔺 **F-1501-3** · 🔺 **F-1601-1** · 🔺 **F-1510-1** · 🔺 **F-E2S-3** · 🔺 **F-1536-2** · 🔺 **F-1591-1** · 🔺 **F-1507-1** · 🔺 **F-E2S-4** · 🔺 **F-1101-1**',
  '— carried from s1654 and re-verified with `desk-state-audit --status` against the line-1 I inherited (**CLOSED=0 · OPEN=0 · BOTH=0 · OPEN-DESK-ONLY=19 · UNRECORDED=0**).',
  '⚠️ **F-1166-1 IS NOT A SILENT DROP — its closure record is F-1655-4 in `tasks/BACKLOG.md`.** Note that `desk-state-audit` scored it OPEN-DESK-ONLY *after* your ruling had landed, because the ruling sits in a 📜 rulings row whose 90-char subject zone belongs to the row, not to F-1166-1 — its documented subject-first rule, blind by construction here. **It was the ruling-propagation guard, not the desk audit, that caught it.**',
  '**Neither of my four findings adds to your desk:** F-1655-1 is factory-ops with its cure dispatched, F-1655-2 is explicitly gate-side, and F-1655-3/-4 were cured this fire.',
].join(' ');

L[0] = L[0].slice(0, cut) + battery + ' ' + desk;
fs.writeFileSync('STATUS.md', L.join('\n'));
console.log('OK — handoff updated; line-1 now', L[0].length, 'chars');
