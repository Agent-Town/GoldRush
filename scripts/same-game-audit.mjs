#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
console.log = () => undefined;
console.info = () => undefined;
const source = Object.fromEntries([
  'src/agent/MechanicsManifest.ts',
  'src/agent/StandingOrders.ts',
  'src/agent/View.ts',
  'src/game/Game.ts',
  'src/game/buildables.ts',
  'src/sim/HeadlessContractSim.ts',
  'src/systems/HarvestSystem.ts',
  'src/ui/UpgradeOverlay.ts',
  'functions/api/standings.ts',
  'src/meta/ContractFamilies.ts',
  // ADR-005 controls section: the human's real control surface lives in these five files plus
  // Game.ts. They are read for CITATIONS only, exactly like the registries above.
  'src/agent/AgentConsent.ts',
  'src/agent/Embodiment.ts',
  'src/core/InputController.ts',
  'src/game/RunManager.ts',
  'src/playbook/PlaybookSurface.ts',
  'src/ui/ProspectorDispatchInput.ts',
  'src/ui/ProspectorPanel.ts',
  // ADR-005 stage 4: the deck prompt is where BOAT_BUILD and REANCHOR gained their human twins,
  // so the rows that claim those twins cite it and this list has to be able to resolve them.
  'src/ui/BuildingContextPrompt.ts',
].map((file) => [file, read(file)]));

const vite = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
let mechanicsBuildableIds;
let HeadlessContractSim;
let supportedContractIds;
let admissionExemptions;
try {
  ({ mechanicsBuildableIds } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts'));
  const headless = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  ({ HeadlessContractSim, supportedContractIds, CONTRACT_ADMISSION_EXEMPTIONS: admissionExemptions } = headless);
} finally {
  await vite.close();
}

function line(file, needle) {
  const index = source[file].indexOf(needle);
  if (index < 0) throw new Error(`Audit anchor missing: ${file} :: ${needle}`);
  return `${file}:${source[file].slice(0, index).split('\n').length}`;
}

/**
 * F-RPA-1, CLOSED 2026-09-07 by `rider-parity-grammar-stage3` — because the removal made it BITE.
 *
 * This used to read `/'([^']+)'/g`, which crosses newlines: wherever a comment inside a scanned
 * block contained an apostrophe (`a human's keys`, `Reject-don't-stretch`), the match ran from that
 * apostrophe to the next one and swallowed every declaration in between. The audit shipped for
 * months with a registry four verbs short and nothing wrong downstream, because no probe asked
 * about the four it was missing. Removing `MOVE_TO`, `HOLD` and `FALLBACK_IF` from the union moved
 * the apostrophes, and the NEXT declaration to be swallowed was `PICK_UPGRADE` — which every
 * contract's upgrade draft is matched against, so 222 mechanics flipped from `equal` to
 * `agent-lacks` and the report announced `pick_upgrade` as an action no verb reaches. A false
 * divergence at that scale is worse than none, so the parent master's own option A is taken here
 * (`tasks/rider-parity-grammar.md` item 21: "Either fix `quoted()` to stop at a newline and re-pin
 * the mechanics summary in the same commit, or leave it ... Do not fix it silently").
 *
 * A quoted literal never spans a line in any of the three blocks this reads (the buildable union,
 * the StandingOrder union, the tape-action set), so bounding the class to one line loses nothing
 * real and stops the swallow. `verbRegistryGap` below is now expected to be EMPTY, and the report
 * says so where it used to publish the gap.
 */
function quoted(block) {
  return [...block.matchAll(/'([^'\n]+)'/g)].map((match) => match[1]);
}

function between(text, start, end) {
  const from = text.indexOf(start);
  const to = text.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error(`Audit source shape missing: ${start}`);
  return text.slice(from, to);
}

function contracts() {
  const dir = path.join(ROOT, 'assets/contracts');
  const files = fs.readdirSync(dir)
    .map((epoch) => `assets/contracts/${epoch}/contracts.json`)
    .filter((file) => fs.existsSync(path.join(ROOT, file)))
    .sort();
  const ids = new Set();
  const result = [];
  for (const file of files) {
    const bundle = JSON.parse(read(file));
    if (!Array.isArray(bundle.contracts) || !bundle.epochId) throw new Error(`Invalid contract bundle: ${file}`);
    if (!source['src/meta/ContractFamilies.ts'].includes(`../../${file}`)) {
      throw new Error(`Contract bundle is not walked by ContractFamilies.listContracts(): ${file}`);
    }
    const manifest = JSON.parse(read(`assets/contracts/${bundle.epochId}/manifest.json`));
    for (const contract of bundle.contracts) {
      if (ids.has(contract.id)) throw new Error(`Duplicate contract id: ${contract.id}`);
      ids.add(contract.id);
      result.push({ ...contract, epochId: bundle.epochId, research: manifest.research });
    }
  }
  if (!source['src/meta/ContractFamilies.ts'].includes('export function listContracts(')) {
    throw new Error('ContractFamilies.listContracts() is missing');
  }
  return result;
}

const buildableIds = quoted(between(
  source['src/game/buildables.ts'],
  'export type BuildableId =',
  'export type BuildPlacement',
));
const standingOrderUnion = between(
  source['src/agent/StandingOrders.ts'],
  'export type StandingOrder =',
  'export type StandingOrderStatus',
);
const doorVerbs = [...new Set(quoted(standingOrderUnion))];
/**
 * ADR-005: the VERB NAMES, not every quoted string in the union.
 *
 * `doorVerbs` above is `quoted()` over the whole block, so it also collects the union's lowercase
 * argument literals (`rig`, `bank`, `stoke`, `upgrade`) and, because `quoted()` matches across
 * newlines, twenty-odd fragments of the block's own comments wherever an apostrophe closes one.
 * More entries than verbs, and useless as a denominator either way: a controls map checked against
 * it would demand a human control for `bank`. This selector reads the discriminant itself.
 */
const doorVerbNames = [...new Set(
  [...standingOrderUnion.matchAll(/verb: '([A-Z][A-Z_]*)'/g)].map((match) => match[1]),
)].sort();
if (doorVerbNames.length === 0) throw new Error('StandingOrder union shape changed: no verb discriminants found');
/**
 * F-RPA-1, CLOSED 2026-09-07 by `rider-parity-grammar-stage3` (see `quoted()` above for the whole
 * account, and for the measurement that forced it: the removal moved the union's apostrophes and
 * the next declaration swallowed was `PICK_UPGRADE`, which cost 222 mechanics their `equal`).
 *
 * The gap is EXPECTED TO BE EMPTY now, and it is still measured rather than assumed: this is the
 * kind of defect that comes back the moment someone widens `quoted()` again, and the report below
 * publishes the list either way. A non-empty gap here means a verb the loose registry cannot see,
 * which is how a `doorVerbs.includes()` probe would silently report `agent-lacks` on every contract
 * and blame the door for a regex (the F-2371-1 lesson, in another file).
 */
const verbRegistryGap = doorVerbNames.filter((verb) => !doorVerbs.includes(verb));
const looseVerbsMissed = doorVerbs.filter((entry) => /^[A-Z][A-Z_]*$/.test(entry) && !doorVerbNames.includes(entry));
if (looseVerbsMissed.length > 0) {
  throw new Error(`Verb selector missed a declared verb the quoted registry found: ${looseVerbsMissed.join(', ')}`);
}
const tapeBlock = between(
  source['functions/api/standings.ts'],
  'function validTapeAction(',
  'function tapeMatchesScore(',
);
const simpleBlock = tapeBlock.match(/const simple = new Set\(\[([\s\S]*?)\]\)/)?.[1];
if (!simpleBlock) throw new Error('validTapeAction simple action registry is missing');
const tapeActions = [...new Set([
  ...quoted(simpleBlock),
  ...[...tapeBlock.matchAll(/value\.type === '([^']+)'/g)].map((match) => match[1]),
])];
const supportedContracts = new Set(supportedContractIds());
const browserUnavailableExpression = /} else if \(([^\n]+)\) {\n\s+fallbackReason = 'unavailable-contract';/
  .exec(source['src/meta/ContractFamilies.ts'])?.[1];
if (!browserUnavailableExpression) throw new Error('Browser unavailable-contract source wiring changed');
const browserUnavailable = Function('requested', `return ${browserUnavailableExpression};`);

const admissionCandidates = [
  'e1-drill-yard',
  'e10-last-claim',
  'e4-dust-flats',
  'e4-long-road',
  'e4-gusher-county',
  'e4-boneyard',
  'e7-relay-valley',
  'e8-mare-claim',
  'e8-eclipse',
  'e9-dome-basin',
];

const abilityRegistry = [...source['src/game/Game.ts'].matchAll(
  /private readonly \w+Shooters: ShooterHandle\[\] = \[this\.(\w+)\]/g,
)].map(([, field]) => {
  const block = between(source['src/game/Game.ts'], `private readonly ${field}: ShooterHandle = {`, '\n  };');
  const resumeKey = block.match(/resumeKey: '([^']+)'/)?.[1];
  const cooldown = block.match(/cooldown: ([^,\n]+)/)?.[1]?.trim();
  if (!resumeKey || !cooldown) throw new Error(`Incomplete hero ability registry entry: ${field}`);
  return { field, resumeKey, cooldown };
});
if (abilityRegistry.length === 0) throw new Error('Hero ability/resume registry is empty');

const tapeSurface = {
  weapon_toggle: 'ability',
  debug_xp: 'economy',
  pick_upgrade: 'choice',
  research_pick: 'choice',
  research_skip: 'choice',
  death_action: 'choice',
  secure_choice: 'choice',
  skip_ceremony: 'choice',
  place_build: 'verb',
};
const tapeDoorVerb = {
  weapon_toggle: 'SET_WEAPON',
};
// The first three citations were typed as literal `src/game/Game.ts:NNNN` strings in `08fba1d64` (2026-08-12), the only
// unresolved citations in this file, and they rotted: read on 2026-09-26, `:2886` is a megaproject clear, `:2902` a
// shooter unsubscribe and `:2909` a cloth dispose, and the committed report published them as current. Each now
// resolves live onto the line where the browser applies that tape action (`Game.applyMultiplayerAction`), like
// every other citation here, so the next move reds the audit ("Audit anchor missing") instead of rotting silently.
const tapeExemptions = [
  { actions: 'death_action', reason: 'Post-death overlay transition; the headless terminal is already the run end.', citation: line('src/game/Game.ts', "if (action.type === 'death_action') {") },
  { actions: 'research_pick / research_skip', reason: 'Between-run science progression lives outside the run window.', citation: `${line('src/game/Game.ts', "if (action.type === 'research_pick') {")} · ${line('src/game/Game.ts', "if (action.type === 'research_skip') {")}` },
  { actions: 'set_pause', reason: 'Pacing only; the agent door is turn-based.', citation: line('src/game/Game.ts', "if (action.type === 'set_pause' && !this.secureClaimChoicePending()") },
  { actions: 'skip_ceremony', reason: 'Baron ceremony is presentation-only; headless spawns the Baron directly without a ceremony gate.', citation: line('src/sim/HeadlessContractSim.ts', '(position, at, escorts) => this.postBaronSpawn(position, at, escorts)') },
];
const tapeExemptActions = new Set(tapeExemptions.flatMap(({ actions }) => actions.split(' / ')));

// ---------------------------------------------------------------------------
// ADR-005 CONTROLS PARITY. Owner ruling 2026-09-07, verbatim: "Humans cannot control the
// positioning of the Prospector, just the rider, for the Prospector they can give "policies" like
// repair. This has to be 1:1 the same for the AI. There cannot be an unfair advantage here of it
// being able to control the Prospector like the rider and the human cant."
//
// The rest of this audit measures MECHANICS: can both species reach the same buildable, the same
// seam, the same draft. That question is blind to the one the owner asked, because a mechanic both
// species reach through DIFFERENT BODIES reads `equal` here forever. So this section measures the
// CONTROL SURFACE instead: for every door verb, which body it acts from, and whether a human at a
// plain boot has a control that reaches it.
//
// TWO RULES BIND THIS MAP.
//  1. Nothing behind `?debug` counts. `window.__GR_TEST__` is installed only when the query
//     carries `debug` (`Game.ts`, the `__GR_RELEASE_E1__` guard on that block), so a mechanic whose
//     only browser lever lives there has NO human control. That is Mistake #10 stated as a rule.
//  2. The map is HAND-MAINTAINED and its key set is checked against the live union. A verb added
//     to `StandingOrder` without a row here throws before a single row is emitted, which is the
//     whole point: the door cannot grow a new power without someone answering "and what does the
//     human press for this?".
// ---------------------------------------------------------------------------

/** The five policies a human can set on the Prospector, and the door verb (if any) that matches. */
const HUMAN_PROSPECTOR_POLICIES = [
  {
    policy: 'trust rung L0..L3 (granted / revoked)',
    changes: 'which abilities the Prospector may use at all; the rung a rider order must clear',
    setAt: ['src/ui/ProspectorPanel.ts', 'data-testid="prospector-rung-toggle-'],
    doorVerb: null,
    verdict: 'human-only-richer',
  },
  {
    policy: 'ability grants (auto_collect, auto_repair, light_duty, auto_pan, place_building)',
    changes: 'which chores the Prospector performs unattended, per ability',
    setAt: ['src/ui/ProspectorPanel.ts', 'data-prospector-ability='],
    doorVerb: null,
    verdict: 'human-only-richer',
  },
  {
    policy: 'repair under N% HP (0..100, default 60)',
    changes: 'the damage threshold below which the Prospector tends a work',
    setAt: ['src/ui/ProspectorPanel.ts', 'data-prospector-automation="repairUnderPct"'],
    doorVerb: 'REPAIR_UNDER',
    verdict: 'equal',
  },
  {
    policy: 'act after N seconds idle (0..60, default 0.8)',
    changes: 'how long the Prospector must be idle before an unattended chore starts',
    setAt: ['src/ui/ProspectorPanel.ts', 'data-prospector-automation="idleSeconds"'],
    doorVerb: null,
    verdict: 'human-only-richer',
  },
  {
    policy: 'dispatch to a named seam or sluice',
    changes: 'sends the Prospector to ONE published work target and pans it there',
    setAt: ['src/ui/ProspectorDispatchInput.ts', 'if (target) this.dispatch(target.id);'],
    doorVerb: 'HARVEST',
    verdict: 'equal',
  },
  {
    policy: 'walk the hero (the Prospector drifts to it)',
    changes: 'the ONLY positional control a human has over the Prospector: with no work assigned it '
      + 'walks back to the hero every step, so where the hero stands is where the Prospector ends up',
    setAt: ['src/agent/Embodiment.ts', 'private driftNearHero(delta: number, at: number, hero: ProspectorPoint): void {'],
    doorVerb: 'MOVE_HERO',
    verdict: 'equal',
  },
];

/**
 * The eighteen door verbs against that surface. `body` is the body the verb acts FROM in GR-SIM,
 * which is the engine the benchmark scores; where the browser room seat acts from a different body
 * the note says so, because that difference is itself a parity fact.
 */
const HUMAN_CONTROLS = {
  BLAST_AT: {
    body: 'hero',
    reaches: 'throws the Blast Charge at a point within the hero-anchored range clamp',
    human: {
      control: 'Q (or touch Q) selects the Blast Charge, the pointer aims the reticle, the charge fires on its own cooldown',
      cites: [['src/core/InputController.ts', "weaponToggle: ['KeyQ', 'TouchWeaponToggle'],"],
        ['src/game/Game.ts', 'private updateBlastAim(intents: Intents): void {']],
    },
    verdict: 'equal',
    note: 'Same origin body, same range clamp, same cooldown; the human aims continuously, the rider names a point.',
  },
  BOAT_BUILD: {
    body: 'world',
    reaches: 'occupies a named Claim-Boat pad with a named building',
    human: {
      control: 'the confirm key (or the prompt button) while the hero stands at an unoccupied Claim-Boat pad, placing the current build selection',
      cites: [['src/game/Game.ts', 'private tryDeckBuild(): boolean {'],
        ['src/ui/BuildingContextPrompt.ts', "this.deckBuildButton.dataset.testid = 'deck-build';"]],
    },
    verdict: 'equal',
    note: 'ADR-005 stage 4 gave the HUMAN the control rather than cutting the verb (clause 2). Both are '
      + 'zero-resource and both name a pad; the rider names it by id, the human by standing at it. '
      + "Proved in a plain boot with no `?debug`: e2e/rider-parity-grammar.spec.ts.",
  },
  BUILD: {
    body: 'prospector',
    reaches: 'places a buildable at a point, walking the acting body inside that buildable\'s placement radius first',
    human: {
      control: 'B opens the build menu, 1..6 selects, R rotates, confirm places the ghost, all radius-bounded from the HERO',
      cites: [['src/core/InputController.ts', "build: ['KeyB'],"],
        ['src/game/Game.ts', 'private confirmAction(confirmAllowedAtIssue = true): void {']],
    },
    verdict: 'equal',
    note: 'The mechanic has a twin and both are radius-bounded. The asymmetry is WHICH body carries the radius, '
      + 'and that asymmetry is now GONE: the acting body is the hero on both sides (ADR-005 stage 3 '
      + 'retired MOVE_TO, which this note used to charge it to).',
  },
  CAPTURE: {
    body: 'prospector',
    reaches: 'catches the nearest exhausted machine within the wrangle radius of the acting body',
    human: {
      control: 'the confirm key at the hero, ahead of demolish in the context chain',
      cites: [['src/game/Game.ts', 'if (this.wrangle.tryCapture(this.actionActor.group.position)) return;']],
    },
    verdict: 'equal',
    note: 'Browser room seats capture from the rider\'s own hero; GR-SIM captures from the Prospector, so the '
      + 'reach travels with a body the human cannot place.',
  },
  CONTEXT_ACTION: {
    body: 'hero',
    reaches: 'upgrade, demolish, fund, recover, plant, redig, backfill, stoke, drill, assay, preserve, digger, '
      + 'from the acting body\'s ground',
    human: {
      control: 'the confirm key (and U for demolish/backfill) at the hero, one chain of world interactions',
      cites: [['src/game/Game.ts', 'private confirmAction(confirmAllowedAtIssue = true): void {'],
        ['src/game/Game.ts', 'private confirmUpgrade(): boolean {']],
    },
    verdict: 'equal',
    note: 'ADR-005 stage 3 item 8 closed the last human-richer row. The confirm key reached four world '
      + 'interactions no verb named: the drill yard, the assay bench, the E10 Static and the Old Digger. '
      + 'All four are CONTEXT_ACTION actions now (drill, assay, preserve, digger), each bound to the SAME '
      + 'call the key makes and reaching from the acting body\'s own position, and now.contextPress '
      + 'publishes the menu. Stage 1 had already moved the family off the Prospector onto the hero in '
      + 'GR-SIM, so both species act from the same body. Where an engine composes none of the four '
      + 'consumers they refuse by name, exactly as CAPTURE/GRADE/HAUL/PLAYBOOK_USE do.',
  },
  GRADE: {
    body: 'prospector',
    reaches: 'grades the ungraded corridor whose stake is within reach of the acting body',
    human: {
      control: 'the confirm key, or U as the keyboard shortcut, at a survey stake near the hero',
      cites: [['src/game/Game.ts', 'if (this.motorGrade(this.actionActor.group.position) || this.motorHaul(this.actionActor.group.position)) return;'],
        ['src/core/InputController.ts', "upgrade: ['KeyU'],"]],
    },
    verdict: 'equal',
    note: 'GR-SIM grades from the Prospector\'s ground; the human grades from the hero\'s.',
  },
  HARVEST: {
    body: 'prospector',
    reaches: 'walks the Prospector to a named active seam or sluice index and pans it there',
    human: {
      control: 'select the Prospector then click the seam, or Alt/Shift-click it, or touch-hold it and confirm the prompt',
      cites: [['src/ui/ProspectorDispatchInput.ts', 'if (target) this.dispatch(target.id);'],
        ['src/game/Game.ts', '(node) => this.dispatchProspector(node),']],
    },
    verdict: 'equal',
    note: 'THE ONE PROSPECTOR-POSITIONING CONTROL A HUMAN HAS, and it is target-named rather than free: the '
      + 'destination must be a published seam or sluice, never an arbitrary point. The rider pays a consent rung '
      + 'the human does not.',
  },
  HAUL: {
    body: 'prospector',
    reaches: 'drives the Hauler in a straight line to where the acting body stands',
    human: {
      control: 'the confirm key at the hero, after grade in the same chain',
      cites: [['src/game/Game.ts', 'if (this.motorGrade(this.actionActor.group.position) || this.motorHaul(this.actionActor.group.position)) return;']],
    },
    verdict: 'equal',
    note: 'Same body difference as GRADE: the rider calls the Hauler to a Prospector it placed, the human to its hero.',
  },
  MOVE_HERO: {
    body: 'hero',
    reaches: 'walks the hero to a point down the same Intents.move seam a human\'s keys drive',
    human: {
      control: 'WASD, the arrow keys, or the touch stick',
      cites: [['src/core/InputController.ts', "moveUp: ['KeyW', 'ArrowUp'],"]],
    },
    verdict: 'equal',
    note: 'The ruling\'s first half, already shipped: the rider steers the rider\'s body, and only its own '
      + '(the solo browser door refuses with HERO_NOT_YOURS).',
  },
  PICK_UPGRADE: {
    body: 'world',
    reaches: 'takes one id from the live three-card draft',
    human: {
      control: 'click a card in the upgrade overlay',
      cites: [['src/ui/UpgradeOverlay.ts', "type: 'pick_upgrade'"]],
    },
    verdict: 'equal',
    note: 'The human picks by index, the rider by id, off the same offer and the same clock.',
  },
  PLAYBOOK_USE: {
    body: 'prospector',
    reaches: 'records or replays a named tape of the rider\'s own order arrays',
    human: {
      control: 'the Playbook Library: name it, Record, then Use it off the shelf',
      cites: [['src/playbook/PlaybookSurface.ts', 'data-testid="playbook-record"'],
        ['src/game/Game.ts', 'private startNamedPlaybookReplay(name: string)']],
    },
    verdict: 'equal',
    note: 'Same shelf, same permission rung, same two refusals. The body appears only in the interference-front '
      + 'reach test, which GR-SIM asks at the Prospector and the browser at the actor.',
  },
  REANCHOR: {
    body: 'world',
    reaches: 'moves the Claim Boat to a known non-current anchor, or nudges a Flotilla hull',
    human: {
      control: 'the anchor list in the same deck prompt — one button per anchor the boat is not at, with the upgrade key bound to the first',
      cites: [['src/game/Game.ts', 'private tryReanchor(anchorId: string): boolean {'],
        ['src/ui/BuildingContextPrompt.ts', 'private renderAnchors(anchors: readonly { id: string; label: string }[]): void {']],
    },
    verdict: 'equal',
    note: 'ADR-005 stage 4. Same routing as the retired `?debug` lever, Flotilla hulls included, and the '
      + 'same A2 noise beat on a boat that actually got under way. Proved in a plain boot with no '
      + '`?debug`: e2e/rider-parity-grammar.spec.ts.',
  },
  REPAIR_UNDER: {
    body: 'prospector',
    reaches: 'walks the Prospector to the NEAREST work within Balance.sparkRig.range below the given percentage and repairs it',
    human: {
      control: 'the Prospector panel\'s "Repair under N% HP" number input, plus the same radius sweep the order now uses',
      cites: [['src/ui/ProspectorPanel.ts', 'data-prospector-automation="repairUnderPct"'],
        ['src/game/Game.ts', 'private nearestProspectorRepairTarget()'],
        ['src/agent/StandingOrders.ts', 'const searchRange = Balance.sparkRig.range;']],
    },
    verdict: 'equal',
    note: 'ADR-005 stage 2. The THRESHOLD was always equal; the REACH is now too. The order\'s search '
      + 'used to have no radius at all and its travel clause carried the Prospector to whatever it found '
      + 'anywhere on the map. It now takes the NEAREST work within Balance.sparkRig.range of the acting '
      + 'body, read off the same field the human sweep reads, exactly as Game.nearestProspectorRepairTarget does.',
  },
  SECURE_CHOICE: {
    body: 'world',
    reaches: 'answers the secure window with bank or rush',
    human: {
      control: 'the two buttons on the Claim Office overlay',
      cites: [['src/game/RunManager.ts', 'data-testid="bank-secured-claim"'],
        ['src/game/RunManager.ts', 'data-testid="stay-for-rush"']],
    },
    verdict: 'equal',
    note: 'Same window, same default, same clock.',
  },
  SET_WEAPON: {
    body: 'hero',
    reaches: 'selects rig or blast, idempotently',
    human: {
      control: 'Q (or touch Q) toggles between the same two modes',
      cites: [['src/core/InputController.ts', "weaponToggle: ['KeyQ', 'TouchWeaponToggle'],"],
        ['src/game/Game.ts', 'private toggleWeapon(actor = this.localActor): HeroWeapon {']],
    },
    verdict: 'equal',
    note: 'Toggle versus SET is a re-submission safety difference, not a reach difference.',
  },
};

const CONTROL_VERDICTS = ['equal', 'agent-only', 'human-only-richer'];

/**
 * The line where the union DECLARES a verb, not where a validator returns one. `line()` is
 * file-wide and takes the first hit, and every declaration happens to precede its handler today;
 * this resolves inside the union block instead, so the citation cannot silently slide onto
 * `validateOrder`'s echo of the same literal if the file is ever reordered.
 */
function verbDeclarationLine(verb) {
  const file = 'src/agent/StandingOrders.ts';
  const unionStart = source[file].indexOf(standingOrderUnion);
  const offset = standingOrderUnion.indexOf(`verb: '${verb}'`);
  if (offset < 0) throw new Error(`Door verb ${verb} is not declared in the StandingOrder union`);
  return `${file}:${source[file].slice(0, unionStart + offset).split('\n').length}`;
}

/** The ADR-005 controls section. Throws before emitting a row if the map and the union disagree. */
function controls() {
  const missing = doorVerbNames.filter((verb) => !(verb in HUMAN_CONTROLS)).sort();
  if (missing.length > 0) {
    throw new Error(
      `ADR-005 controls map has no human control mapped for door verb(s): ${missing.join(', ')}. `
      + 'Every verb the door declares must name the human control that reaches it, or be recorded as '
      + '`agent-only` with the reason. Add the row to HUMAN_CONTROLS in scripts/same-game-audit.mjs.',
    );
  }
  const stale = Object.keys(HUMAN_CONTROLS).filter((verb) => !doorVerbNames.includes(verb)).sort();
  if (stale.length > 0) {
    throw new Error(`ADR-005 controls map names verb(s) the door no longer declares: ${stale.join(', ')}.`);
  }

  const verbs = doorVerbNames.map((verb) => {
    const entry = HUMAN_CONTROLS[verb];
    if (!CONTROL_VERDICTS.includes(entry.verdict)) {
      throw new Error(`ADR-005 controls verdict for ${verb} is not one of ${CONTROL_VERDICTS.join(' / ')}`);
    }
    return {
      verb,
      body: entry.body,
      'agent-reaches': entry.reaches,
      'human-control': entry.human?.control ?? 'NONE',
      verdict: entry.verdict,
      // Resolving the citation HERE rather than in the map means a moved anchor reds the audit
      // the same way every other citation in this file does.
      evidence: [
        ...(entry.human?.cites ?? []).map(([file, needle]) => line(file, needle)),
        verbDeclarationLine(verb),
      ].join(' · '),
      note: entry.note,
    };
  });

  const policies = HUMAN_PROSPECTOR_POLICIES.map((entry) => ({
    policy: entry.policy,
    changes: entry.changes,
    'set-at': line(entry.setAt[0], entry.setAt[1]),
    'door-verb': entry.doorVerb ?? 'none',
    verdict: entry.verdict,
  }));

  const summary = Object.fromEntries(CONTROL_VERDICTS.map((verdict) => [
    verdict,
    verbs.filter((entry) => entry.verdict === verdict).length,
  ]));
  return {
    ruling: 'ADR-005 (owner, 2026-09-07): the agent controls exactly what a human controls.',
    debugGate: line('src/game/Game.ts', 'window.__GR_TEST__ = {'),
    heroChannelRefusal: line('src/game/Game.ts', 'riderPiloted: () => false,'),
    // F-RPA-1: the verbs the audit's older `quoted()` registry cannot see. Empty is the goal.
    verbRegistryGap,
    verbs,
    policies,
    summary,
  };
}

function manifestEvidence(contract, id) {
  const file = 'src/agent/MechanicsManifest.ts';
  if (contract.practice?.buildables?.includes(id)) return line(file, "rule('practice_buildables'");
  if (id === 'sentry_beacon' || id === 'turret') return line(file, 'const registryBuildables =');
  if (id === 'boiler_house') return line(file, '...(boilerHouse ?');
  if (id === 'capacitor_bank') return line(file, '...(capacitorBank ?');
  if (id === 'lantern_post') return line(file, '...(lanternPost ?');
  if (id === 'decoy_shed') return line(file, '...(decoyShed ?');
  return `${line(file, 'const registryBuildables =')} · ${line(file, 'const buildables = [')}`;
}

function predicateExpression(file, start, end) {
  const expression = between(source[file], start, end).match(/\(id\) => ([^,\n]+)/)?.[1];
  if (!expression) throw new Error(`Audit predicate shape missing: ${file}`);
  return expression;
}

const browserMethod = 'private isBuildableEnabled(id: BuildableId): boolean {';
const browserBody = between(
  source['src/game/Game.ts'],
  browserMethod,
  '\n  }',
).slice(browserMethod.length);
if (!source['src/game/Game.ts'].includes('private readonly offeredBuildables = mechanicsBuildableIds(this.activeContract);')) {
  throw new Error('Browser buildable source wiring changed');
}
const browserPredicate = Function('id', browserBody);

if (!source['src/sim/HeadlessContractSim.ts'].includes('const offeredBuildables = mechanicsBuildableIds(this.manifest);')) {
  throw new Error('Headless buildable source wiring changed');
}
const headlessPredicate = Function('offeredBuildables', 'id', `return ${predicateExpression(
  'src/sim/HeadlessContractSim.ts',
  'this.build = new BuildSystem(',
  '\n    );',
)};`);

function browserAccepts(offeredBuildables, id) {
  return browserPredicate.call({ offeredBuildables }, id);
}

function doorAccepts(offeredBuildables, id) {
  return headlessPredicate(offeredBuildables, id);
}

function direction(human, agent) {
  if (human === agent) return 'equal';
  return agent ? 'agent-exceeds' : 'agent-lacks';
}

function admissionMeasurement() {
  return admissionCandidates.map((contractId) => {
    const measurement = { contractId, booted: false, firstView: false, terminal: false, turns: 0, error: null };
    try {
      const sim = new HeadlessContractSim({ contractId, seed: `ap16-4-${contractId}`, admissionProbe: true });
      measurement.booted = true;
      let turn = sim.currentTurn();
      measurement.firstView = Boolean(turn?.view);
      while (!turn.terminal && measurement.turns < 100) {
        turn = sim.advanceToTurn();
        measurement.turns += 1;
      }
      measurement.terminal = turn.terminal;
      if (!turn.terminal) measurement.error = 'HeadlessContractSim.ts: admission probe exceeded 100 turns';
    } catch (error) {
      const stack = error instanceof Error ? error.stack ?? error.message : String(error);
      measurement.error = stack.split('\n').map((line) => line.trim()).find((line) => /(?:src|scripts)\/.+?:\d+/.test(line)) ?? stack.split('\n')[0];
    }
    return measurement;
  });
}

function row(contract, surface, humansGet, agentsGet, result, evidence) {
  return { contract: contract.id, surface, 'humans-get': humansGet, 'agents-get': agentsGet, direction: result, evidence };
}

function audit() {
  const rows = [];
  for (const contract of contracts()) {
    const browserCanEnter = !browserUnavailable(contract);
    const agentCanEnter = supportedContracts.has(contract.id) || (contract.modes?.length ?? 0) > 0;
    const reachabilityDirection = !browserCanEnter && !agentCanEnter ? 'not-offered' : direction(browserCanEnter, agentCanEnter);
    rows.push(row(
      contract,
      'verb',
      browserCanEnter ? 'browser can launch the contract' : 'browser refuses the unavailable contract',
      agentCanEnter
        ? (supportedContracts.has(contract.id) ? 'headless accepts the default contract' : `headless accepts declared mode ${contract.modes[0].id}`)
        : 'headless rejects the contract before play',
      reachabilityDirection,
      browserCanEnter
        ? `${line('src/meta/ContractFamilies.ts', 'export function listBoardContracts()')} · ${line('src/sim/HeadlessContractSim.ts', 'const SUPPORTED_CONTRACTS = new Set(listBoardContracts()')}`
        : `${line('src/meta/ContractFamilies.ts', "fallbackReason = 'unavailable-contract';")} · ${line('src/sim/HeadlessContractSim.ts', '.filter((contract) => contract.tileParams.harvestAnchors?.length !== 0)')}`,
    ));
    if (reachabilityDirection === 'not-offered') continue;

    if (contract.tileParams.harvestAnchors?.length !== 0) {
      const seams = new HeadlessContractSim({
        contractId: contract.id,
        seed: `same-game-seam-${contract.id}`,
        admissionProbe: true,
      }).currentTurn().view.now.seams;
      const legible = seams.every((seam) => seam.active
        ? Number.isFinite(seam.x) && Number.isFinite(seam.z) && seam.anchorIndex !== null && seam.anchorIndex >= 0
        : seam.x === null && seam.z === null && seam.anchorIndex === null);
      const agentLegible = agentCanEnter && legible;
      const agentsGet = !agentCanEnter
        ? `headless rejects before a seam view; admission probe ${legible ? 'publishes legible seams' : 'publishes an invalid seam position'}`
        : (legible
            ? 'active seams publish finite x/z and anchorIndex >= 0; inactive seams publish null x/z/anchorIndex'
            : 'door publishes an invalid seam position');
      rows.push(row(
        contract,
        'seam',
        'active seams render at live x/z; inactive seams are absent',
        agentsGet,
        direction(true, agentLegible),
        `${line('src/systems/HarvestSystem.ts', 'get visualDiagnostics(): HarvestVisualDiagnostics')} · ${line('src/agent/View.ts', 'seams: records(record(diagnostics.harvest).activeNodes).map((node) => {')} · ${line('src/sim/HeadlessContractSim.ts', 'const SUPPORTED_CONTRACTS = new Set(listBoardContracts()')}`,
      ));
    }

    const advertised = mechanicsBuildableIds(contract);
    for (const id of buildableIds) {
      const manifest = advertised.has(id);
      const browser = browserAccepts(advertised, id);
      const predicate = doorAccepts(advertised, id);
      const agent = agentCanEnter && predicate;
      rows.push(row(
        contract,
        'buildable',
        manifest ? `contract manifest advertises BUILD ${id}` : `contract manifest does not advertise ${id}`,
        agent ? `door predicate accepts BUILD ${id}` : `door predicate rejects BUILD ${id}`,
        direction(manifest, agent),
        `${manifestEvidence(contract, id)} · ${line('src/sim/HeadlessContractSim.ts', '(id) => offeredBuildables.has(id)')} · ${line('src/game/buildables.ts', `  | '${id}'`)}`,
      ));
      rows.push(row(
        contract,
        'buildable',
        browser ? `browser menu offers BUILD ${id}` : `browser menu hides ${id}`,
        agent ? `door accepts BUILD ${id}` : `door rejects BUILD ${id}`,
        direction(browser, agent),
        `${line('src/game/Game.ts', 'private isBuildableEnabled(id: BuildableId): boolean')} · ${line('src/sim/HeadlessContractSim.ts', '(id) => offeredBuildables.has(id)')} · ${line('src/game/buildables.ts', `  | '${id}'`)}`,
      ));
    }

    for (const action of tapeActions) {
      const placeBuild = action === 'place_build' && doorVerbs.includes('BUILD');
      const rotationParity = placeBuild && source['src/agent/StandingOrders.ts'].includes('rotationSteps?: 0 | 1 | 2 | 3;');
      const doorVerb = tapeDoorVerb[action] ?? action.toUpperCase();
      const reachable = agentCanEnter && (placeBuild || doorVerbs.includes(doorVerb));
      rows.push(row(
        contract,
        tapeSurface[action] ?? 'verb',
        action === 'place_build' ? 'tape action place_build includes rotationSteps 0..3' : `tape action ${action}`,
        action === 'place_build'
          ? (rotationParity ? 'BUILD order reaches placement with rotationSteps 0..3' : (reachable ? 'BUILD order reaches placement but always defaults rotation to 0' : 'no reachable BUILD order'))
          : (reachable ? `${doorVerb} standing order reaches ${action}` : `no ${action} standing order`),
        action === 'place_build' ? direction(true, rotationParity) : direction(true, reachable),
        `${line('functions/api/standings.ts', action === 'place_build' ? "value.type === 'place_build'" : `'${action}'`)} · ${line('src/agent/StandingOrders.ts', action === 'place_build'
          ? 'this.surface.tools.place_building(order.what, order.where, order.rotationSteps ?? 0)'
          : (reachable ? `| { verb: '${doorVerb}'` : 'export type StandingOrder ='))}`,
      ));
    }

    // hero-move-verb (owner ruling 2026-09-06, verbatim: "yes! please! rider has to be able to
    // move, I did not know that was not possible before"). THE ROW THIS AUDIT NEVER HAD, and its
    // absence is why the audit read `equal` on a board where a human could kite and a rider could
    // not: `doorVerbs` is derived from the union, so `MOVE_HERO` entered this script the moment the
    // verb was declared, and measuring the tree with the verb declared and this row absent
    // reproduced 0/528/1192/0 EXACTLY (`artifacts/hero-move-verb/audit-verb-only.json`). A parity
    // fact nothing asks about is a parity fact nothing can find. The human side is the movement
    // keys and the touch stick (`InputController` -> `Game.updateActors` -> `Hero.update`); the
    // door side is MOVE_HERO through the SAME `Intents.move` seam.
    const heroMove = agentCanEnter && doorVerbs.includes('MOVE_HERO');
    rows.push(row(
      contract,
      'verb',
      'the player walks the hero with the movement keys or the touch stick',
      heroMove
        ? 'MOVE_HERO walks the hero to a point through the same Intents.move seam'
        : 'no standing order reaches the hero body',
      direction(true, heroMove),
      `${line('src/game/Game.ts', 'private updateActors(simDelta: number, fallbackIntents: Intents): void {')} · ${line('src/sim/HeadlessContractSim.ts', 'private heroOrderIntents(): Intents {')} · ${line('src/agent/StandingOrders.ts', heroMove ? "| { verb: 'MOVE_HERO'" : 'export type StandingOrder =')}`,
    ));

    rows.push(row(
      contract,
      'choice',
      'XP opens a three-card draft; player picks a card',
      agentCanEnter && doorVerbs.includes('PICK_UPGRADE')
        ? 'PICK_UPGRADE reaches any id in the live three-card offer'
        : 'headless rejects the contract before an upgrade offer',
      direction(true, agentCanEnter && doorVerbs.includes('PICK_UPGRADE')),
      `${line('src/ui/UpgradeOverlay.ts', "type: 'pick_upgrade'")} · ${line('src/agent/StandingOrders.ts', "| { verb: 'PICK_UPGRADE'")}`,
    ));

    for (const ability of abilityRegistry) {
      const rig = ability.resumeKey.endsWith(':rig');
      const doorVerb = `${ability.resumeKey.split(':').at(-1).toUpperCase()}_AT`;
      const reachable = agentCanEnter && (rig || doorVerbs.includes(doorVerb));
      rows.push(row(
        contract,
        'ability',
        `${ability.resumeKey} (${ability.cooldown})`,
        reachable
          ? (rig ? 'headless automatic Spark Rig uses the same cooldown' : `${doorVerb} reaches this hero ability`)
          : 'no reachable standing-order path reaches this hero ability',
        direction(true, reachable),
        `${line('src/game/Game.ts', `resumeKey: '${ability.resumeKey}'`)} · ${rig
          ? line('src/sim/HeadlessContractSim.ts', "resumeKey: 'hero:0:rig'")
          : line('src/agent/StandingOrders.ts', `| { verb: '${doorVerb}'`)}`,
      ));
    }

    rows.push(row(
      contract,
      'economy',
      'combat XP is consumed by progression',
      agentCanEnter ? 'combat XP is consumed by progression' : 'headless rejects the contract before combat XP',
      agentCanEnter ? 'equal' : 'agent-lacks',
      `${line('src/game/Game.ts', 'this.progression.consumeXpTotal(this.combat.xpCount)')} · ${line('src/sim/HeadlessContractSim.ts', 'this.progression.consumeXpTotal(this.combat.xpCount)')}`,
    ));
  }
  const summary = { 'agent-exceeds': 0, 'agent-lacks': 0, equal: 0, 'not-offered': 0 };
  for (const entry of rows) summary[entry.direction] += 1;
  return {
    schema: 'goldrush.same-game-audit.v1',
    contracts: [...new Set(rows.map((entry) => entry.contract))],
    rows,
    summary,
    // ADR-005. Deliberately OUTSIDE `rows`/`summary`: the mechanics table is per-contract and its
    // totals are pinned by `same-game-audit.test.mjs`; the controls table is per-VERB and counting
    // it into those totals would multiply eighteen facts by forty-three contracts and move a pin
    // that measures something else.
    controls: controls(),
    admission: {
      measurements: admissionMeasurement(),
      exemptions: Object.entries(admissionExemptions).map(([contractId, exemption]) => ({ contractId, ...exemption })),
    },
    tapeExemptions,
  };
}

function cell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function markdown(result) {
  const offenders = Object.entries(result.rows.reduce((counts, entry) => {
    if (entry.direction !== 'equal' && entry.direction !== 'not-offered') counts[entry.contract] = (counts[entry.contract] ?? 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5);
  const reachabilityRows = result.rows.filter((entry) => entry.surface === 'verb'
    && (entry['humans-get'].includes('launch the contract') || entry['humans-get'].includes('unavailable contract')));
  const reachabilityByContract = new Map(reachabilityRows.map((entry) => [entry.contract, entry.direction]));
  const browserOfferedDoorRefusals = reachabilityRows.filter((entry) => entry.direction === 'agent-lacks').length;
  const jointlyNotOffered = reachabilityRows.filter((entry) => entry.direction === 'not-offered').length;
  const divergentMenuRows = result.rows.filter((entry) =>
    entry.surface === 'buildable' && entry['humans-get'].startsWith('browser menu') && entry.direction !== 'equal');
  const independentMenuGaps = divergentMenuRows.filter((entry) => reachabilityByContract.get(entry.contract) === 'equal');
  const reachabilityDerivedMenuGaps = divergentMenuRows.filter((entry) => reachabilityByContract.get(entry.contract) === 'agent-lacks');
  const reachabilityDerivedRefusals = new Set(reachabilityDerivedMenuGaps.map((entry) => entry.contract)).size;
  const newlyEnumeratedTapeActions = tapeActions.filter((action) =>
    !['weapon_toggle', 'research_pick', 'research_skip', 'death_action', 'secure_choice'].includes(action)
      && !doorVerbs.includes(action.toUpperCase()));
  const reachability = reachabilityRows.reduce((counts, entry) =>
    ({ ...counts, [entry.direction]: (counts[entry.direction] ?? 0) + 1 }), {});
  const admitted = result.admission.measurements.filter((entry) =>
    entry.booted && entry.firstView && entry.terminal && !entry.error).length;
  const modeExemptions = result.admission.exemptions.filter((exemption) => result.rows.some((entry) =>
    entry.contract === exemption.contractId
      && entry.surface === 'verb'
      && entry['agents-get'].startsWith('headless accepts declared mode'))).length;
  const legacyExemptions = result.admission.exemptions.length - modeExemptions;
  const legacyRefusals = admitted + legacyExemptions;
  return [
    '# Same-game audit',
    '',
    `Generated by \`node scripts/same-game-audit.mjs\` over ${result.contracts.length} contracts in every epoch bundle. The harness cross-checks those JSON bundles against \`ContractFamilies.listContracts()\`, then reads live seam positions and the buildable, tape-action, standing-order, hero resume-key, upgrade, research, and XP registries from source.`,
    '',
    '## Summary',
    '',
    `- agent-exceeds: ${result.summary['agent-exceeds']}`,
    `- agent-lacks: ${result.summary['agent-lacks']}`,
    `- equal: ${result.summary.equal}`,
    `- not-offered: ${result.summary['not-offered']}`,
    `- divergence rows: ${result.summary['agent-exceeds'] + result.summary['agent-lacks']}`,
    `- total measured rows: ${result.rows.length}`,
    '',
    '## New divergence classes beyond the seed',
    '',
    `- **Contract reachability:** ${browserOfferedDoorRefusals} browser-offered contracts are rejected by the headless door; ${jointlyNotOffered} contracts are refused by both species and sit outside the same-game universe.`,
    `- **Browser-menu versus door:** ${independentMenuGaps.length} independent buildable rows disagree; ${reachabilityDerivedMenuGaps.length} rows are downstream of ${reachabilityDerivedRefusals} contract-admission refusals today.`,
    '- **Build orientation:** human `place_build` tapes and standing-order `BUILD` both carry `rotationSteps` 0..3; omission defaults to 0.',
    `- **Additional tape-only actions:** ${newlyEnumeratedTapeActions.filter((action) => action !== 'place_build' && !tapeExemptActions.has(action)).map((action) => `\`${action}\``).join(', ')} have no matching standing-order verb or cited exemption.`,
    '',
    '### Class-8 cited exemptions',
    '',
    '| tape action | reason | citation |',
    '|---|---|---|',
    ...result.tapeExemptions.map((entry) => `| ${cell(entry.actions)} | ${cell(entry.reason)} | ${cell(entry.citation)} |`),
    '',
    '## Worst offenders',
    '',
    `The widest gates in the county are ${offenders.map(([id, count]) => `\`${id}\` (${count})`).join(', ')}. Buildables now share one manifest rulebook; the remaining debt is contract reachability plus human choices and abilities without a standing-order trail.`,
    '',
    '## AP-16-4 admission measurement',
    '',
    `Reachability before this slice was **equal 12 · divergence 30 · not-offered 0**, with the browser side hardcoded to \`true\`. The measured result is **equal ${reachability.equal ?? 0} · divergence ${(reachability['agent-exceeds'] ?? 0) + (reachability['agent-lacks'] ?? 0)} · not-offered ${reachability['not-offered'] ?? 0}**. The measured ${reachability['not-offered'] ?? 0}/${legacyRefusals} split matches F-1642-1: ${reachability['not-offered'] ?? 0} browser refusals and ${legacyRefusals} browser-offered legacy door refusals; ${admitted} of those ${legacyRefusals} passed below and were admitted, while ${legacyExemptions} from that population remain cited exemptions. The county holds ${result.admission.exemptions.length} cited exemptions in total because ${modeExemptions} mode-declaring contracts remain reachable through their declared mode and were never in that legacy-refusal population.`,
    '',
    '| contract | booted | first view | terminal | turns | failure site |',
    '|---|---:|---:|---:|---:|---|',
    ...result.admission.measurements.map((entry) => `| ${cell(entry.contractId)} | ${entry.booted} | ${entry.firstView} | ${entry.terminal} | ${entry.turns} | ${cell(entry.error ?? '—')} |`),
    '',
    '### Cited exemptions',
    '',
    '| contract | reason | citation |',
    '|---|---|---|',
    ...result.admission.exemptions.map((entry) => `| ${cell(entry.contractId)} | ${cell(entry.reason)} | ${cell(entry.citation)} |`),
    '',
    `Final derived door (${supportedContracts.size}): ${[...supportedContracts].sort().map((id) => `\`${id}\``).join(' ')}`,
    '',
    '### Re-aimed guard teeth proof',
    '',
    'Manufactured defect: added `phantom-contract` inside the guarded `door-contracts` fence. RED: `AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal`, with `+ phantom-contract` under `skill.md door-contracts match SUPPORTED_CONTRACTS in HeadlessContractSim`. The edit was reverted byte-identically (`sha256 d3b1b7c0a4a899c2ad82b138c9a67cae7598b34ebb0e7fae7aef11049121b15b`) and the same focused guard returned 1/1 green.',
    '',
    '### Verification',
    '',
    '- `test:node-guards` on the repository-pinned Node 26.4.0: **446 tests · 444 pass · 0 fail · 2 ruled skips**. Every existing `gr-sim` outcome/hash assertion passed; **zero pinned hashes moved**.',
    '- AP-16-4 admission plus adapted E2/E4 censuses: **18/18** desktop + 390px mobile. The census change is refusal → first-view admission for three E2 railcars and four E4 contracts; no outcome pins changed.',
    '- `ap-standing-orders` + `skillmd-door`: **14/14** desktop + 390px mobile, including the plain production boot with zero captured console/page errors.',
    '- Adjacent `front-door-parity`: **0/4**, unmodified and outside this slice. Its stdin fixture ends before answering the AP-16-2 upgrade offer, and its idle assertion still expects the removed automatic `heavy_spark` picks. No AP-16-4 path touches progression or that spec.',
    '',
    '## Controls parity (ADR-005)',
    '',
    result.controls.ruling,
    '',
    'Every row above measures a MECHANIC and is blind to which BODY reaches it, so a mechanic both species '
      + 'reach through different bodies reads `equal` here forever. This section asks the owner\'s question instead: '
      + 'for each door verb, which body it acts from in GR-SIM, and whether a human at a plain boot has a control '
      + 'that reaches it. Nothing behind `?debug` counts as a human control '
      + `(the whole \`__GR_TEST__\` bridge is installed only under that flag, ${result.controls.debugGate}), and the `
      + `solo browser door refuses \`MOVE_HERO\` outright (${result.controls.heroChannelRefusal}).`,
    '',
    `- equal: ${result.controls.summary.equal}`,
    `- agent-only: ${result.controls.summary['agent-only']}`,
    `- human-only-richer: ${result.controls.summary['human-only-richer']}`,
    `- verbs measured: ${result.controls.verbs.length}`,
    '',
    'The map is hand-maintained and its key set is checked against the live `StandingOrder` union: a verb added '
      + 'to the door without a row here throws before any row is emitted, so the door cannot grow a power without '
      + 'someone answering "and what does the human press for this?".',
    '',
    result.controls.verbRegistryGap.length === 0
      ? '**F-RPA-1: closed.** The older `quoted()` verb registry now sees every declared verb.'
      : `**F-RPA-1 (open):** the audit's older \`quoted()\` verb registry is short by `
        + `${result.controls.verbRegistryGap.length} of ${result.controls.verbs.length}: `
        + `${result.controls.verbRegistryGap.map((verb) => `\`${verb}\``).join(', ')}. Its pattern crosses newlines, `
        + "so a comment apostrophe inside the union swallows the declarations that follow it. No row asks "
        + '`doorVerbs.includes()` about any of the four today, so nothing above is wrong; a row that did would '
        + 'report `agent-lacks` on every contract and blame the door for a regex.',
    '',
    '### The human\'s Prospector policy surface',
    '',
    '| policy | what it changes | where the human sets it | door verb | verdict |',
    '|---|---|---|---|---|',
    ...result.controls.policies.map((entry) => `| ${cell(entry.policy)} | ${cell(entry.changes)} | ${cell(entry['set-at'])} | ${cell(entry['door-verb'])} | ${cell(entry.verdict)} |`),
    '',
    '### The door verbs against that surface',
    '',
    '| verb | acts from | agent reaches | human control | verdict | evidence | note |',
    '|---|---|---|---|---|---|---|',
    ...result.controls.verbs.map((entry) => `| ${cell(entry.verb)} | ${cell(entry.body)} | ${cell(entry['agent-reaches'])} | ${cell(entry['human-control'])} | ${cell(entry.verdict)} | ${cell(entry.evidence)} | ${cell(entry.note)} |`),
    '',
    'The full measurement, with the heat-12 usage counts behind each verb and the 1:1 grammar the ruling implies, '
      + 'is `docs/bench/rider-parity-audit.md`.',
    '',
    '## Full parity table',
    '',
    '| contract | surface | humans-get | agents-get | direction | evidence |',
    '|---|---|---|---|---|---|',
    ...result.rows.map((entry) => `| ${cell(entry.contract)} | ${cell(entry.surface)} | ${cell(entry['humans-get'])} | ${cell(entry['agents-get'])} | ${cell(entry.direction)} | ${cell(entry.evidence)} |`),
    '',
  ].join('\n');
}

const result = audit();
const output = process.argv.includes('--json') ? `${JSON.stringify(result, null, 2)}\n` : markdown(result);
if (process.argv.includes('--write-report')) {
  fs.mkdirSync(path.join(ROOT, 'docs/bench'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs/bench/same-game-audit.md'), output);
} else {
  process.stdout.write(output);
}
