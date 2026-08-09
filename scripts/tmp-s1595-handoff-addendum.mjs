#!/usr/bin/env node
// s1595 — the handoff promised the battery result; write it. Insert BEFORE the
// desk segment so the desk header stays the last one on line 1.
import { readFileSync, writeFileSync } from 'node:fs'

const F = 'STATUS.md'
const lines = readFileSync(F, 'utf8').split('\n')

const ADD = `✅ **BATTERY RESULT (run AFTER the handoff commit per F-1300-4 — and it BIT, which is the point of the law): 145/145 node tests (16.7 s) + all chained leaves.** findings-state PASS (double-state 0) · blocker-panel PASS · ruling-propagation PASS (3 RULED, 31 refusals, 0 stale) · citations PASS (562 scanned) · status-archive **CLEAN** · attended-owed 1 open (attended-side, not a defect) · desk-birth PASS · nul-audit CLEAN. ⛔ **BUT desk-declaration went RED FIRST, on a defect I HAD JUST INTRODUCED — filed as \`F-1595-2\` and cured.** My \`F-1364-1\` banner pushed that row's own F-ID out of \`desk-declaration-guard\`'s 90-char declaring zone, silently **un-declaring a live desk item** (the AP-03/04/05 re-greenlight). **The house banner convention minted by F-1594-1 does this to ANY desk-item row it banners; s1594 escaped only because none of its four rows was a desk item.** ➡️ **Cured, and the fix should become the convention: restate the row's own key first, banner second** — \`🟡 **F-1364-1** ⛔ **CURED — …**\`. Re-ran clean: \`undeclared: 0 · PASS\`, then re-ran the 6 most exposed guard files (89/89). ⓘ **The guard SKIPs while an \`ACTIVE\` lock sits on line 1, so it is silent for a fire's whole working life and speaks only once the handoff lands — a fire that ran the battery only at its drain gate could not have seen this.** `

const marker = "🔺 **OWNER'S DESK"
const i = lines[0].indexOf(marker)
if (i < 0) { console.error('REFUSING: desk marker not found on line 1'); process.exit(2) }
lines[0] = lines[0].slice(0, i) + ADD + lines[0].slice(i)
writeFileSync(F, lines.join('\n'))
console.log('addendum inserted; line-1 now', lines[0].length, 'chars')
