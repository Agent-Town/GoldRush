import {
  RESEARCH_NODES,
  continuedStudyBonuses,
  frontierNodes,
  pinnedResearchPath,
  researchDistance,
  researchNodeById,
  researchPathIds,
  savedStampMillBuildStarted,
  scienceMeter,
  type ResearchBranch,
  type ResearchNode,
  type ResearchState,
} from '../meta/ResearchTree';
import { epochIsActive } from '../meta/ContractFamilies';

export type ResearchIconKey =
  | 'ui.upgrade.icon.panning'
  | 'ui.upgrade.icon.prospecting'
  | 'ui.upgrade.icon.beacon'
  | 'ui.upgrade.icon.blast'
  | 'ui.upgrade.icon.firerate'
  | 'ui.upgrade.icon.gold'
  | 'ui.upgrade.icon.mend'
  | 'ui.upgrade.icon.mobility'
  | 'ui.upgrade.icon.range'
  | 'ui.upgrade.icon.volley'
  | 'bld.sentry_beacon'
  | 'bld.sluice_works'
  | 'char.prospector_agent.portrait'
  | 'node.gold_seam';

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
};

const BRANCH_ICON_KEYS: Record<ResearchBranch, ResearchIconKey> = {
  'Prospecting Works': 'bld.sluice_works',
  'Arsenal Works': 'bld.sentry_beacon',
  'Assay Works': 'char.prospector_agent.portrait',
};

export const RESEARCH_NODE_ICON_KEYS: Record<string, ResearchIconKey> = {
  assay_grading: 'ui.upgrade.icon.prospecting',
  mother_lode_survey: 'node.gold_seam',
  sluice_accounting: 'bld.sluice_works',
  claim_map_table: 'ui.upgrade.icon.panning',
  pact_ledger: 'ui.upgrade.icon.prospecting',
  chain_spark_primer: 'ui.upgrade.icon.volley',
  beacon_cadence: 'ui.upgrade.icon.beacon',
  brass_coil_standards: 'bld.sentry_beacon',
  powder_math: 'ui.upgrade.icon.blast',
  sky_rocket_battery: 'ui.upgrade.icon.volley',
  rush_pattern: 'ui.upgrade.icon.mobility',
  second_order_slot: 'ui.upgrade.icon.mend',
  refined_assay: 'ui.upgrade.icon.prospecting',
  pattern_library: 'ui.upgrade.icon.range',
  agent_schooling: 'ui.upgrade.icon.beacon',
  prospector_lessons: 'char.prospector_agent.portrait',
};

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
    line: 'The Steamworks arsenal gains a three-rocket festival battery.',
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
};

const BRANCHES: Array<{ id: ResearchBranch; label: string }> = [
  { id: 'Prospecting Works', label: 'mining economy' },
  { id: 'Arsenal Works', label: 'arsenal' },
  { id: 'Assay Works', label: 'crafting & agent' },
];

export function renderResearchChart(state: ResearchState, selectedId?: string): string {
  const selected = selectedId ? researchNodeById[selectedId] : undefined;
  const selectedPath = new Set(selected ? researchPathIds(selected.id) : []);
  const pinnedPath = new Set(pinnedResearchPath(state));
  const meter = scienceMeter(state, savedStampMillBuildStarted() ? 'building' : 'awaiting-town');
  const frontier = new Set(frontierNodes(state).map((node) => node.id));
  const steamworksActive = epochIsActive('epoch-2-steamworks');
  return `
    <div class="research-chart" data-testid="research-chart">
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
          ${BRANCHES.map((branch) => renderBranch(branch, state, frontier, selectedPath, pinnedPath)).join('')}
          <section class="research-chart__epoch" data-testid="research-next-epoch" data-epoch-id="epoch-2-steamworks" data-epoch-state="${
            steamworksActive ? 'active' : 'locked'
          }" aria-label="${steamworksActive ? 'Steamworks active in town' : 'Steamworks awaits the town'}">
            <span>Steamworks</span>
            <strong>${steamworksActive ? 'active in town' : 'awaits the town'}</strong>
          </section>
        </div>
        ${renderSelection(state, selected)}
      </div>
      ${frontier.size === 0 ? renderContinuedStudy(state) : ''}
    </div>
  `;
}

function renderBranch(
  branch: { id: ResearchBranch; label: string },
  state: ResearchState,
  frontier: Set<string>,
  selectedPath: Set<string>,
  pinnedPath: Set<string>,
): string {
  return `
    <section class="research-chart__branch" data-research-branch="${escapeHtml(branch.id)}">
      <h3>${renderIcon(BRANCH_ICON_KEYS[branch.id], 'research-chart__branch-icon', `research-branch-icon-${branch.id}`)}<span>${escapeHtml(
        branch.label,
      )}</span></h3>
      <div class="research-chart__nodes">
        ${RESEARCH_NODES.filter((node) => node.branch === branch.id)
          .map((node) => `${renderSurveyLine(node)}${renderNode(node, state, frontier, selectedPath, pinnedPath)}`)
          .join('')}
      </div>
    </section>
  `;
}

function renderNode(
  node: ResearchNode,
  state: ResearchState,
  frontier: Set<string>,
  selectedPath: Set<string>,
  pinnedPath: Set<string>,
): string {
  const status = nodeStatus(node, state, frontier);
  const selected = selectedPath.has(node.id);
  const pinned = state.pinnedTarget === node.id;
  const onPinnedPath = pinnedPath.has(node.id);
  const requires = node.requires?.map((id) => researchNodeById[id]?.name ?? id).join(', ');
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
    >
      <span class="research-chart__node-topline">
        ${renderIcon(iconKey, 'research-chart__node-icon', `research-chart-icon-${node.id}`)}
        <span class="research-chart__state">${stateLabel(status)}</span>
      </span>
      <strong>${escapeHtml(node.name)}</strong>
      <span class="research-chart__effect">${escapeHtml(node.effect)}</span>
      ${requires ? `<em>Requires ${escapeHtml(requires)}</em>` : ''}
      ${status === 'taken' ? '<b class="research-chart__stamp">SURVEYED</b>' : ''}
      ${pinned ? '<b class="research-chart__pin" data-testid="research-chart-pin-mark">survey pin</b>' : ''}
    </button>
  `;
}

export function researchIconKeyForNode(node: Pick<ResearchNode, 'id' | 'branch'>): ResearchIconKey {
  return RESEARCH_NODE_ICON_KEYS[node.id] ?? BRANCH_ICON_KEYS[node.branch];
}

export function researchRevealForNode(node: ResearchNode): { name: string; line: string } {
  return RESEARCH_UNLOCK_REVEALS[node.id] ?? { name: node.name, line: node.effect };
}

function renderSelection(state: ResearchState, selected?: ResearchNode): string {
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
  const path = researchPathIds(selected.id);
  const pinned = state.pinnedTarget === selected.id;
  return `
    <aside class="research-chart__selection" data-testid="research-chart-selection" data-pinned-route="${pinned ? 'true' : 'false'}">
      <p class="research-chart__selection-kicker">Survey Route</p>
      <h3>${escapeHtml(selected.name)}</h3>
      <p>${escapeHtml(selected.description)}</p>
      <strong data-testid="research-chart-distance">${distance === 0 ? 'already marked' : `${distance} ${distance === 1 ? 'pick' : 'picks'} away`}</strong>
      <ol>
        ${path
          .map((id) => `<li data-path-id="${escapeHtml(id)}">${escapeHtml(researchNodeById[id]?.name ?? id)}</li>`)
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
