/** F-E10S4-2: rewrite the Ember Shore dependency row's description in place, format preserved. */
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'assets/contracts/epoch-10-deepsky/contracts.json';
const next = [
  'BOTH CONSUMERS LANDED AND THE CLAIM IS EARNED: the squall phase machine in both engines',
  '(E10S-2, src/systems/E10SquallScheduler.ts, now.squall) and the warmth meter, STOKE action,',
  'gutter terminal, doubled mote pressure and secure latch in both engines (E10S-3,',
  'src/systems/E10PreserveSystem.ts, now.emberShore.preserve); E10S-4 added the harvestAnchors,',
  'the bench seeds, two losing null-floor rows and the public-verb prover, so the map is admitted.',
  'F-E10S4-2 CURED 2026-09-07: twist.emberShore is OUT of DECLARED_INERT_PATHS and the validator',
  'now ACCEPTS removing this row, measured rather than assumed',
  '(artifacts/engine-correctives-batch/probe-inert-retire.mjs run with the row deleted: 42',
  'contracts load and parseContractDescriptor returns ok=true with no reasons). THE ROW SURVIVES',
  "FOR A NEW, SMALLER REASON: scripts/e10-preserve-consumer.test.mjs:455 pins it as a landed row",
  "naming its slice, and that guard sat outside the curing task's firewall. Retiring it is now",
  "one ledger line plus that guard's own retirement.",
].join(' ');
if (next.length > 1024) throw new Error(`description is ${next.length} chars; the validator caps it at 1024`);
if (next.includes('—')) throw new Error('em dash in a contract human-text field (no-emdash-guard)');

const text = readFileSync(file, 'utf8');
const pattern = /("dep": "ember-shore-preserve-consumers", "status": "landed", "landedBy": "E10S-3", "description": ")[^"]*(")/;
if (!pattern.test(text)) throw new Error('the Ember Shore dependency row is not where this script expects it');
writeFileSync(file, text.replace(pattern, (_match, head, tail) => head + JSON.stringify(next).slice(1, -1) + tail));
console.log(`description rewritten, ${next.length} chars`);
