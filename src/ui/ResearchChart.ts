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
          <section class="research-chart__epoch" data-testid="research-next-epoch" aria-label="Steamworks awaits the town">
            <span>Steamworks</span>
            <strong>awaits the town</strong>
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
      <h3>${escapeHtml(branch.label)}</h3>
      <div class="research-chart__nodes">
        ${RESEARCH_NODES.filter((node) => node.branch === branch.id)
          .map((node) => renderNode(node, state, frontier, selectedPath, pinnedPath))
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
  return `
    <button
      class="research-chart__node"
      type="button"
      data-testid="research-chart-node-${escapeHtml(node.id)}"
      data-research-node="${escapeHtml(node.id)}"
      data-research-state="${status}"
      data-selected-path="${selected}"
      data-pinned-path="${onPinnedPath}"
      data-pinned-target="${pinned}"
      ${node.requires?.length ? 'data-has-requires="true"' : ''}
      aria-pressed="${selected}"
    >
      <span class="research-chart__state">${stateLabel(status)}</span>
      <strong>${escapeHtml(node.name)}</strong>
      <span>${escapeHtml(node.effect)}</span>
      ${requires ? `<em>Requires ${escapeHtml(requires)}</em>` : ''}
      ${status === 'taken' ? '<b>Elder mark</b>' : ''}
      ${pinned ? '<b data-testid="research-chart-pin-mark">survey pin</b>' : ''}
    </button>
  `;
}

function renderSelection(state: ResearchState, selected?: ResearchNode): string {
  if (!selected) {
    return `
      <aside class="research-chart__selection" data-testid="research-chart-selection">
        <h3>Survey Route</h3>
        <p>${state.pinnedTarget ? 'Pinned route held in the town ledger.' : 'No route pinned.'}</p>
      </aside>
    `;
  }
  const distance = researchDistance(state, selected.id);
  const path = researchPathIds(selected.id);
  const pinned = state.pinnedTarget === selected.id;
  return `
    <aside class="research-chart__selection" data-testid="research-chart-selection">
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
  if (status === 'taken') return 'taken';
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
