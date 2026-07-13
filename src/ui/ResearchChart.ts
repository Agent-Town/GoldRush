import {
  continuedStudyBonuses,
  frontierNodes,
  pinnedResearchPath,
  researchBranches,
  researchDistance,
  researchNodeById,
  researchNodes,
  researchPathIds,
  savedEpochMegaprojectBuildStarted,
  scienceMeter,
  SKY_ROCKET_BATTERY_NODE_ID,
  type ResearchNode,
  type ResearchState,
} from '../meta/ResearchTree';
import {
  activeEpochId,
  epochIsActive,
  epochMegaprojectComplete,
  loadEpoch,
  type EpochResearchBranch,
  type ResearchIconKey,
} from '../meta/ContractFamilies';

export type { ResearchIconKey } from '../meta/ContractFamilies';

export const RESEARCH_ICON_REGISTRY: Record<ResearchIconKey, { url: string; label: string }> = {
  'ui.upgrade.icon.panning': { url: new URL('../../assets/processed/icon-panning.png', import.meta.url).href, label: 'gold pan' },
  'ui.upgrade.icon.prospecting': {
    url: new URL('../../assets/processed/icon-prospecting.png', import.meta.url).href,
    label: 'prospecting glass',
  },
  'ui.upgrade.icon.beacon': { url: new URL('../../assets/processed/icon-beacon.png', import.meta.url).href, label: 'beacon' },
  'ui.upgrade.icon.blast': { url: new URL('../../assets/processed/icon-blast.png', import.meta.url).href, label: 'rocket burst' },
  'ui.upgrade.icon.firerate': { url: new URL('../../assets/processed/icon-firerate.png', import.meta.url).href, label: 'spark cadence' },
  'ui.upgrade.icon.gold': { url: new URL('../../assets/processed/icon-gold.png', import.meta.url).href, label: 'gold ledger' },
  'ui.upgrade.icon.mend': { url: new URL('../../assets/processed/icon-mend.png', import.meta.url).href, label: 'bench work' },
  'ui.upgrade.icon.mobility': { url: new URL('../../assets/processed/icon-mobility.png', import.meta.url).href, label: 'rush route' },
  'ui.upgrade.icon.range': { url: new URL('../../assets/processed/icon-range.png', import.meta.url).href, label: 'survey range' },
  'ui.upgrade.icon.volley': { url: new URL('../../assets/processed/icon-volley.png', import.meta.url).href, label: 'volley rig' },
  'bld.sentry_beacon': { url: new URL('../../assets/processed/bld-sentry-beacon.png', import.meta.url).href, label: 'sentry beacon' },
  'bld.sluice_works': { url: new URL('../../assets/processed/bld-sluice-works.png', import.meta.url).href, label: 'sluice works' },
  'char.prospector_agent.portrait': {
    url: new URL('../../assets/processed/char-prospector-portrait.png', import.meta.url).href,
    label: 'the Prospector',
  },
  'node.gold_seam': { url: new URL('../../assets/processed/node-gold-seam.png', import.meta.url).href, label: 'gold seam' },
  'ui.e2.boiler_lance': { url: new URL('../../assets/processed/icons-e2-r0c0.png', import.meta.url).href, label: 'boiler lance' },
  'ui.e2.pressure_mortar': { url: new URL('../../assets/processed/icons-e2-r0c1.png', import.meta.url).href, label: 'pressure mortar' },
  'ui.e2.iron_wall': { url: new URL('../../assets/processed/icons-e2-r0c2.png', import.meta.url).href, label: 'iron wall' },
  'ui.e2.boiler_battery': { url: new URL('../../assets/processed/icons-e2-r0c3.png', import.meta.url).href, label: 'boiler battery' },
  'ui.e2.pressure': { url: new URL('../../assets/processed/icons-e2-r0c4.png', import.meta.url).href, label: 'pressure gauge' },
  'ui.e2.pressure_card': { url: new URL('../../assets/processed/icons-e2-r0c5.png', import.meta.url).href, label: 'pressure card' },
  'ui.e2.rail_card': { url: new URL('../../assets/processed/icons-e2-r0c6.png', import.meta.url).href, label: 'rail card' },
  'ui.e2.iron_card': { url: new URL('../../assets/processed/icons-e2-r0c7.png', import.meta.url).href, label: 'iron card' },
};

export const RESEARCH_NODE_ICON_KEYS = Object.values(researchNodeById).reduce(
  (icons, node) => {
    icons[node.id] = node.iconKey;
    return icons;
  },
  {} as Record<string, ResearchIconKey>,
);

export const RESEARCH_UNLOCK_REVEALS: Record<string, { name: string; line: string }> = {
  assay_grading: {
    name: 'Assay Grading',
    line: 'Seam cards add stockpile room and carry more offer weight.',
  },
  mother_lode_survey: {
    name: 'Mother Lode Survey',
    line: 'Long claims start building toward better seam returns.',
  },
  sluice_accounting: {
    name: 'Sluice Accounting',
    line: 'Sluice card families move one economy step closer.',
  },
  claim_map_table: {
    name: 'Claim Map Table',
    line: 'Map picks start remembering better seams.',
  },
  pact_ledger: {
    name: 'Rich Seam Pact',
    line: 'Seams can pay +18 gold, with a slower panning rhythm.',
  },
  chain_spark_primer: {
    name: 'Chain Spark Arc',
    line: 'Your rigs and beacons fire 12% faster.',
  },
  beacon_cadence: {
    name: 'Beacon Handoff',
    line: 'Beacons fire 18% faster and rigs fire 6% faster.',
  },
  brass_coil_standards: {
    name: 'Brass Coil Standards',
    line: 'Arsenal mastery moves toward wider spark pressure rings.',
  },
  powder_math: {
    name: 'Powder Math',
    line: 'Blast mastery moves toward the Frontier radius cap.',
  },
  sky_rocket_battery: {
    name: 'Sky-Rocket Battery',
    line: 'Captured Baron science: the Sky-Rocket Battery is marked in the Steamworks arsenal.',
  },
  rush_pattern: {
    name: 'Rush Pattern',
    line: 'Rare rush offers move closer for the wave-30 wall.',
  },
  second_order_slot: {
    name: 'Second Order Slot',
    line: 'The Assay bench can hold 2 pending orders.',
  },
  refined_assay: {
    name: 'Tier 2 Orders',
    line: 'New orders carry the 20% higher assay ceiling.',
  },
  pattern_library: {
    name: 'Pattern Library',
    line: 'Approved inventions can enter run offers, capped at 2 per offer.',
  },
  agent_schooling: {
    name: 'Agent Schooling',
    line: 'Late-run offers can add 1 Prospector policy slot for that run.',
  },
  prospector_lessons: {
    name: 'Prospector Lessons',
    line: 'A future permanent Prospector policy slot is marked in the ledger.',
  },
  line_survey: { name: 'Line Survey', line: 'Pylon-span routes are marked for the Canyon Works.' },
  looped_grid: { name: 'Looped Grid', line: 'A second current path is marked against cut lines.' },
  lamp_districts: { name: 'Lamp Districts', line: 'Warm-light districts are entered in the night ledger.' },
  brownout_ledger: { name: 'Brown-Out Ledger', line: 'The town can account for what stays lit and armed.' },
  rimline_conductors: { name: 'Rimline Conductors', line: 'Long spans are marked to carry current across the gorge.' },
  arc_caster: { name: 'Arc Caster', line: 'The arc-caster family is marked in the Voltage arsenal.' },
  quickened_contacts: { name: 'Quickened Contacts', line: 'A faster Voltage cadence is entered in the arsenal ledger.' },
  arc_turret: { name: 'Arc Turret', line: 'The capacitor-fed turret tier is marked for fabrication.' },
  coil_fence: { name: 'Coil Fence', line: 'The guarded copper fence tier is marked for the claim.' },
  drain_mast_science: { name: 'Drain-Mast Science', line: 'The Crawler medal still guards these captured diagrams.' },
  copper_parts: { name: 'Copper Parts', line: 'Coils, contacts, and insulators enter the parts ledger.' },
  capacitor_crate: { name: 'Capacitor Crate', line: 'The stored-current crate family is marked for fabrication.' },
  tram_receipts: { name: 'Tram Receipts', line: 'Powered tram routes gain a place in the haul ledger.' },
  exchange_patterns: { name: 'Exchange Patterns', line: 'Six patched lines enter the town pattern book.' },
  canyon_dispatch: { name: 'Canyon Dispatch', line: 'The Canyon Works route book is ready for a future run.' },
};

export type ResearchChartOptions = {
  readonly?: boolean;
  eras?: readonly ResearchState[];
};

export function renderResearchChart(state: ResearchState, selectedId?: string, options: ResearchChartOptions = {}): string {
  const epochId = state.epochId ?? activeEpochId();
  const epoch = loadEpoch(epochId);
  const readonly = options.readonly === true;
  const nodes = researchNodes(epochId);
  const nodesById = Object.fromEntries(nodes.map((node) => [node.id, node])) as Record<string, ResearchNode>;
  const selected = selectedId ? nodesById[selectedId] : undefined;
  const selectedPath = new Set(selected ? researchPathIds(selected.id, epochId) : []);
  const pinnedPath = new Set(pinnedResearchPath(state));
  const meter = scienceMeter(state, savedEpochMegaprojectBuildStarted(epochId) ? 'building' : 'awaiting-town');
  const frontier = new Set(frontierNodes(state).map((node) => node.id));
  return `
    <div class="research-chart" data-testid="research-chart" data-research-readonly="${readonly}">
      ${renderEraRow(options.eras ?? [state], epochId)}
      <header class="research-chart__header">
        <div>
          <p class="research-ledger__eyebrow">The Elder's Survey Chart</p>
          <h2>Research Ledger</h2>
        </div>
        <p class="research-chart__meter" data-testid="science-meter">${escapeHtml(meter.text)}${
          meter.bankedText ? ` <span data-testid="science-banked">${escapeHtml(meter.bankedText)}</span>` : ''
        }</p>
      </header>
      <div class="research-chart__body">
        <div class="research-chart__branches" data-testid="research-chart-branches">
          ${researchBranches(epochId)
            .map((branch) => renderBranch(branch, nodes, nodesById, state, frontier, selectedPath, pinnedPath, readonly))
            .join('')}
          ${readonly ? '' : renderNextEpoch(epoch)}
        </div>
        ${renderSelection(state, selected, nodesById, readonly)}
      </div>
      ${frontier.size === 0 ? renderContinuedStudy(state) : ''}
    </div>
  `;
}

function renderBranch(
  branch: EpochResearchBranch,
  nodes: readonly ResearchNode[],
  nodesById: Record<string, ResearchNode>,
  state: ResearchState,
  frontier: Set<string>,
  selectedPath: Set<string>,
  pinnedPath: Set<string>,
  readonly: boolean,
): string {
  return `
    <section class="research-chart__branch" data-research-branch="${escapeHtml(branch.id)}">
      <h3>${renderIcon(branch.iconKey, 'research-chart__branch-icon', `research-branch-icon-${branch.id}`)}<span>${escapeHtml(
        branch.label,
      )}</span></h3>
      <div class="research-chart__nodes">
        ${nodes
          .filter((node) => node.branch === branch.id)
          .map((node) => `${renderSurveyLine(node)}${renderNode(node, nodesById, state, frontier, selectedPath, pinnedPath, readonly)}`)
          .join('')}
      </div>
    </section>
  `;
}

function renderNode(
  node: ResearchNode,
  nodesById: Record<string, ResearchNode>,
  state: ResearchState,
  frontier: Set<string>,
  selectedPath: Set<string>,
  pinnedPath: Set<string>,
  readonly: boolean,
): string {
  const status = nodeStatus(node, state, frontier);
  const selected = selectedPath.has(node.id);
  const pinned = state.pinnedTarget === node.id;
  const onPinnedPath = pinnedPath.has(node.id);
  const requires = node.requires?.map((id) => nodesById[id]?.name ?? id).join(', ');
  const lockedReason = researchLockedReason(node, state, status);
  const iconKey = researchIconKeyForNode(node);
  return `
    <button
      class="research-chart__node"
      type="button"
      data-testid="research-chart-node-${escapeHtml(node.id)}"
      data-research-node="${escapeHtml(node.id)}"
      data-research-state="${status}"
      data-research-icon-key="${escapeHtml(iconKey)}"
      data-selected-path="${selected}"
      data-pinned-path="${onPinnedPath}"
      data-pinned-target="${pinned}"
      ${node.requires?.length ? 'data-has-requires="true"' : ''}
      ${node.requires?.length ? `data-research-requires="${escapeHtml(node.requires.join(' '))}"` : ''}
      aria-pressed="${selected}"
      ${readonly ? 'disabled aria-disabled="true"' : ''}
    >
      <span class="research-chart__node-topline">
        ${renderIcon(iconKey, 'research-chart__node-icon', `research-chart-icon-${node.id}`)}
        <span class="research-chart__state">${stateLabel(status)}</span>
      </span>
      <strong>${escapeHtml(node.name)}</strong>
      <span class="research-chart__effect">${escapeHtml(node.effect)}</span>
      ${lockedReason ? `<em data-testid="research-lock-${escapeHtml(node.id)}">${escapeHtml(lockedReason)}</em>` : ''}
      ${requires ? `<em>Requires ${escapeHtml(requires)}</em>` : ''}
      ${status === 'taken' ? '<b class="research-chart__stamp">SURVEYED</b>' : ''}
      ${pinned ? '<b class="research-chart__pin" data-testid="research-chart-pin-mark">survey pin</b>' : ''}
    </button>
  `;
}

function renderEraRow(eras: readonly ResearchState[], selectedEpochId: string): string {
  if (eras.length < 2) return '';
  const active = activeEpochId();
  return `
    <nav class="research-chart__eras" data-testid="research-era-row" aria-label="Research eras">
      ${eras
        .map((era) => {
          const id = era.epochId ?? active;
          const selected = id === selectedEpochId;
          const name = loadEpoch(id).displayName;
          const label = `${name.startsWith('The ') ? name : `The ${name}`} — ${id === active ? 'active' : 'complete ✓'}`;
          return `<button class="gr-start-menu__small-button" type="button" data-research-era="${escapeHtml(id)}" data-testid="research-era-${escapeHtml(
            id,
          )}" aria-pressed="${selected}">${escapeHtml(label)}</button>`;
        })
        .join('')}
    </nav>
  `;
}

export function researchIconKeyForNode(node: Pick<ResearchNode, 'iconKey'>): ResearchIconKey {
  return node.iconKey;
}

export function researchRevealForNode(node: ResearchNode): { name: string; line: string } {
  return RESEARCH_UNLOCK_REVEALS[node.id] ?? { name: node.name, line: node.effect };
}

function renderNextEpoch(epoch: ReturnType<typeof loadEpoch>): string {
  if (!epoch.successor) return '';
  const successor = loadEpoch(epoch.successor);
  const active = epochIsActive(successor.id);
  const ready = !active && epochMegaprojectComplete(epoch);
  const state = active ? 'active' : ready ? 'ready' : 'locked';
  const status = active ? 'active in town' : ready ? epoch.megaproject.raiseActionText : 'awaits the town';
  return `
    <section class="research-chart__epoch" data-testid="research-next-epoch" data-epoch-id="${escapeHtml(
      successor.id,
    )}" data-epoch-state="${state}" aria-label="${escapeHtml(`${successor.displayName} ${status}`)}">
      <span>${escapeHtml(successor.displayName)}</span>
      <strong>${escapeHtml(status)}</strong>
    </section>
  `;
}

function renderSelection(
  state: ResearchState,
  selected: ResearchNode | undefined,
  nodesById: Record<string, ResearchNode>,
  readonly: boolean,
): string {
  if (readonly) {
    return `
      <aside class="research-chart__selection" data-testid="research-chart-selection" data-pinned-route="false">
        <p class="research-chart__selection-kicker">Completed era</p>
        <h3>Survey kept</h3>
        <p>This chart is read-only. Its science still serves the town.</p>
      </aside>
    `;
  }
  if (!selected) {
    return `
      <aside class="research-chart__selection" data-testid="research-chart-selection" data-pinned-route="${state.pinnedTarget ? 'true' : 'false'}">
        <p class="research-chart__selection-kicker">Pinned route</p>
        <h3>Survey Route</h3>
        <p>${state.pinnedTarget ? 'Pinned route held in the town ledger.' : 'No route pinned.'}</p>
      </aside>
    `;
  }
  const distance = researchDistance(state, selected.id);
  const path = researchPathIds(selected.id, state.epochId ?? activeEpochId());
  const pinned = state.pinnedTarget === selected.id;
  return `
    <aside class="research-chart__selection" data-testid="research-chart-selection" data-pinned-route="${pinned ? 'true' : 'false'}">
      <p class="research-chart__selection-kicker">Survey Route</p>
      <h3>${escapeHtml(selected.name)}</h3>
      <p>${escapeHtml(selected.description)}</p>
      <strong data-testid="research-chart-distance">${distance === 0 ? 'already marked' : `${distance} ${distance === 1 ? 'pick' : 'picks'} away`}</strong>
      <ol>
        ${path
          .map((id) => `<li data-path-id="${escapeHtml(id)}">${escapeHtml(nodesById[id]?.name ?? id)}</li>`)
          .join('')}
      </ol>
      <button class="gr-start-menu__small-button" type="button" data-research-pin="${pinned ? '' : escapeHtml(selected.id)}" data-testid="research-chart-pin">
        ${pinned ? 'Clear pin' : 'Pin route'}
      </button>
    </aside>
  `;
}

function renderSurveyLine(node: ResearchNode): string {
  if (!node.requires?.length) return '';
  return `<span class="research-chart__survey-line" data-survey-line="${escapeHtml(node.id)}" data-survey-from="${escapeHtml(
    node.requires.join(' '),
  )}" aria-hidden="true"></span>`;
}

function renderIcon(key: ResearchIconKey, className: string, testId: string): string {
  const icon = RESEARCH_ICON_REGISTRY[key];
  return `<span class="${className}" data-testid="${escapeHtml(testId)}" data-research-icon-key="${escapeHtml(
    key,
  )}" data-asset-state="ready" aria-label="${escapeHtml(icon.label)}" role="img" style="background-image:url('${escapeHtml(icon.url)}')"></span>`;
}

function renderContinuedStudy(state: ResearchState): string {
  const continued = continuedStudyBonuses(state);
  return `
    <section class="research-chart__continued" data-testid="continued-study-stack">
      <h3>Continued Study</h3>
      <p>Seam Yield +${Math.round(continued.seamYieldMult * 100)}% · Turret Damage +${Math.round(
        continued.turretDamageMult * 100,
      )}% · Stockpile Ledger +${continued.stockpileCapBonus}</p>
    </section>
  `;
}

function nodeStatus(node: ResearchNode, state: ResearchState, frontier: Set<string>): 'taken' | 'available' | 'locked' {
  if (state.taken.includes(node.id)) return 'taken';
  return frontier.has(node.id) ? 'available' : 'locked';
}

function researchLockedReason(node: ResearchNode, state: ResearchState, status: 'taken' | 'available' | 'locked'): string {
  if (status !== 'locked' || node.id !== SKY_ROCKET_BATTERY_NODE_ID || state.unlocks?.rocketCartCaptured) return '';
  return 'The Baron still holds this science.';
}

function stateLabel(status: 'taken' | 'available' | 'locked'): string {
  if (status === 'taken') return 'surveyed';
  if (status === 'available') return 'available';
  return 'locked';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    if (char === '"') return '&quot;';
    return '&#39;';
  });
}
