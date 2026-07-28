import { loadMetaProgress } from '../game/MetaProgress';
import { loadScores } from '../game/Scoreboard';
import {
  clearPlayerContractLaunch,
  DEFAULT_CONTRACT_ID,
  epochIsActive,
  listBoardContracts,
  listEpochs,
  loadEpoch,
  recordStagedContractLaunchClear,
  stagedCharterLaunchPresent,
  stagedPlayerContractLaunch,
  type ContractManifest,
} from './ContractFamilies';
import { browserResearchStorage, loadResearchState, scienceMeter } from './ResearchTree';

export type ContractUnlockStatus = { unlocked: boolean; condition: string; action?: string };

export function contractUnlockStatus(contract: ContractManifest): ContractUnlockStatus {
  const epochs = listEpochs().map(({ id }) => loadEpoch(id));
  const epoch = epochs.find((entry) => entry.contracts.some(({ id }) => id === contract.id));
  if (epoch && !epochIsActive(epoch.id)) {
    const predecessor = epochs.find((entry) => entry.successor === epoch.id);
    const action = `Awaits the ${epoch.displayName} era`;
    return {
      unlocked: false,
      condition: predecessor
        ? `The ${epoch.displayName} awaits — ${predecessor.megaproject.raiseActionText.replace(/^./, (letter) => letter.toLowerCase())}.`
        : action,
      action,
    };
  }

  const unlock = contract.boardRow.unlock;
  if (unlock === 'default') return { unlocked: true, condition: '' };

  const scores = loadScores();
  if (unlock === 'wave10OnClaim') {
    return {
      unlocked: scores.some((score) => contractIdOf(score.contractId) === DEFAULT_CONTRACT_ID && score.waves >= 10),
      condition: 'Reach wave 10 on The Claim',
    };
  }
  if (unlock === 'firstSecuredClaim') {
    return { unlocked: scores.some((score) => score.secured === true), condition: 'Secure a claim first' };
  }
  if (unlock === 'science-complete') {
    return { unlocked: scienceMeter(loadResearchState(browserResearchStorage())).complete, condition: 'Complete Frontier science first' };
  }
  if (unlock === 'science-complete+2-secured') {
    const securedContracts = new Set(scores.filter((score) => score.secured === true).map((score) => contractIdOf(score.contractId)));
    return {
      unlocked: scienceMeter(loadResearchState(browserResearchStorage())).complete && securedContracts.size >= 2,
      condition: "Secure two claims; bank the science — then he'll come out",
    };
  }
  if (unlock.startsWith('secured:')) {
    const requiredId = unlock.slice('secured:'.length);
    const required = listBoardContracts().find((entry) => entry.id === requiredId);
    return {
      unlocked: scores.some((score) => contractIdOf(score.contractId) === requiredId && score.secured === true),
      condition: `Secure ${required?.name ?? requiredId} first`,
    };
  }
  if (unlock === 'epoch-2-steamworks') {
    return { unlocked: epochIsActive('epoch-2-steamworks'), condition: 'Awaits the Steamworks era' };
  }
  if (unlock.startsWith('science')) {
    const required = Number.parseInt(unlock.match(/\d+/)?.[0] ?? '0', 10);
    const storage = browserStorage();
    const science = storage ? loadMetaProgress(storage).tracks.science : 0;
    return { unlocked: science >= required, condition: `Bank ${required} science first` };
  }
  return { unlocked: false, condition: 'Progress farther first' };
}

export function reverifyStagedContractLaunch(): void {
  recordStagedContractLaunchClear(null);
  const stagedId = stagedPlayerContractLaunch();
  if (!stagedId) return;
  const contract = listBoardContracts().find((entry) => entry.id === stagedId);
  const reason = !contract
    ? 'staged-contract-missing'
    : contractUnlockStatus(contract).unlocked
      ? null
      : 'staged-contract-locked';
  if (!reason) return;
  recordStagedContractLaunchClear({ reason, charterDocumentPresent: stagedCharterLaunchPresent() });
  clearPlayerContractLaunch();
}

function contractIdOf(id: string | undefined): string {
  return id?.trim() || DEFAULT_CONTRACT_ID;
}

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
