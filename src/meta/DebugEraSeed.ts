import { activeEpoch, activateEpoch, listEpochs, loadEpoch } from './ContractFamilies';
import { MEGAPROJECT_STATE_KEY } from './Megaproject';
import { loadResearchState, reconcileActiveEpoch, researchNodes, saveResearchState } from './ResearchTree';

export function seedDebugEraFromSearch(canvas: HTMLCanvasElement, search = window.location.search): number | null {
  if (__GR_RELEASE_E1__) return null;
  const params = new URLSearchParams(search);
  const era = Number(params.get('era'));
  if (!params.has('debug') || !Number.isInteger(era) || era < 1 || era > 10) return null;

  const target = listEpochs().find((epoch) => epoch.order === era);
  const current = activeEpoch();
  if (!target || !seedActivationReceipts(current.order, target.order)) return null;

  for (const epoch of listEpochs().filter((entry) => entry.order > current.order && entry.order <= target.order)) {
    if (!activateEpoch(epoch.id)) break;
  }

  const bundle = loadEpoch(target.id);
  const research = loadResearchState(localStorage, localStorage, {}, target.id);
  research.progress.tracks.science = Math.max(research.progress.tracks.science, bundle.scienceThreshold);
  research.taken = [...new Set([...research.taken, ...researchNodes(target.id).map((node) => node.id)])];
  saveResearchState(localStorage, research, localStorage);
  reconcileActiveEpoch(localStorage);
  if (!pinRuntimeEpoch(target.id)) return null;
  if (activeEpoch().id !== target.id) return null;
  canvas.dataset.seededEra = String(era);
  return era;
}

function pinRuntimeEpoch(epochId: string): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    params.set('epoch', epochId);
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params}${window.location.hash}`);
    return true;
  } catch {
    return false;
  }
}

function seedActivationReceipts(fromOrder: number, toOrder: number): boolean {
  if (fromOrder >= toOrder) return true;
  try {
    const saved = localStorage.getItem(MEGAPROJECT_STATE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : null;
    const projects: Record<string, unknown> =
      parsed && typeof parsed === 'object' && 'projects' in parsed && parsed.projects && typeof parsed.projects === 'object'
        ? { ...parsed.projects }
        : {};
    for (const epoch of listEpochs().filter((entry) => entry.order >= fromOrder && entry.order < toOrder)) {
      const id = loadEpoch(epoch.id).megaproject.id;
      const previous = projects[id];
      projects[id] = previous && typeof previous === 'object' ? { ...previous, complete: true } : { complete: true };
    }
    localStorage.setItem(MEGAPROJECT_STATE_KEY, JSON.stringify({ version: 1, projects }));
    return true;
  } catch {
    return false;
  }
}
