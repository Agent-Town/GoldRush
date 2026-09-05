import { loadMetaProgress } from '../game/MetaProgress';
import { activeProfile, loadProfileState, profileDataKey } from '../game/ProfileStorage';
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

export type ContractUnlockStatus = {
  unlocked: boolean;
  condition: string;
  action?: string;
  /** True only when the preview-only "Open every claim" control is what opened this card. */
  preview?: true;
  /** The real gate this card sits behind, kept so the board can stay honest while previewing. */
  lockedCondition?: string;
};

// ── PREVIEW-ONLY "OPEN EVERY CLAIM" (task `preview-unlock-all`, owner 2026-09-05 night:
// "how do we get them all playable for me to test? ... push hard while I sleep").
// The owner tests every era by hand on the full-board preview; 26 of the 42 board contracts sit
// behind `secured:` chains, science thresholds or the era gate, and grinding them is not a test.
// This flag opens them on a NON-RELEASE build only. `RELEASE_E1` folds to the literal `true` in an
// E1 build (vite `define`), so every branch below it — and the control that writes it — is dead
// code the bundler drops; the release bundle carries neither the flag nor its label.
// The `typeof` guard matches `ContractFamilies.ts:27`: node-side harnesses ssr-load this module
// with no `define` in scope.
const RELEASE_E1 = typeof __GR_RELEASE_E1__ !== 'undefined' && __GR_RELEASE_E1__;
/** Logical key. Stored per profile as `gr.profile.v2.<profileId>.gr.previewUnlockAll.v1`. */
export const PREVIEW_UNLOCK_ALL_KEY = 'gr.previewUnlockAll.v1';
export const PREVIEW_UNLOCK_ALL_CONDITION = 'Opened for testing';

// Never global, never a URL parameter: the same localStorage the unlock chain already reads
// (`loadScores`, the research registries, `gr.activeEpoch.v1`), namespaced to the ACTIVE profile
// exactly the way `tileStateKey` namespaces tile state (`ProfileStorage.ts:268`). A URL parameter
// would be shareable and would follow a link into someone else's save; a profile-scoped key
// cannot leave this browser profile.
function previewUnlockAllStorageKey(mintProfile: boolean): string | null {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    // A read must never mint a profile as a side effect; a click may (the player is present).
    if (!mintProfile && !loadProfileState(storage)) return null;
    return profileDataKey(activeProfile(storage).id, PREVIEW_UNLOCK_ALL_KEY);
  } catch {
    return null;
  }
}

/** Is the preview unlock on for the active profile? Always false in the E1 release build. */
export function previewUnlockAllActive(): boolean {
  if (RELEASE_E1) return false;
  try {
    const key = previewUnlockAllStorageKey(false);
    return !!key && globalThis.localStorage?.getItem(key) === '1';
  } catch {
    return false;
  }
}

/** Turn the preview unlock on or off for the active profile. Returns the resulting state. */
export function setPreviewUnlockAll(open: boolean): boolean {
  if (RELEASE_E1) return false;
  try {
    const key = previewUnlockAllStorageKey(true);
    if (!key) return false;
    if (open) globalThis.localStorage?.setItem(key, '1');
    else globalThis.localStorage?.removeItem(key);
  } catch {
    return false;
  }
  return previewUnlockAllActive();
}

/** Flip it. This is what the board's one control calls. */
export function togglePreviewUnlockAll(): boolean {
  return setPreviewUnlockAll(!previewUnlockAllActive());
}

export function contractUnlockStatus(contract: ContractManifest): ContractUnlockStatus {
  const status = resolveContractUnlock(contract);
  // MEASURED, not assumed: without this line the release bundle still carried the literal
  // "Opened for testing". `previewUnlockAllActive()` does minify to `function(){return!1}` in a
  // release build, but the minifier does not inline it into this caller, so the branch stayed
  // "live" and its string constant rode along. An explicit early return makes the rest of this
  // function unreachable at build time and the constant disappears with it.
  if (RELEASE_E1) return status;
  // The real predicate always runs first, so a card the player genuinely earned is never mislabelled
  // "testing" and the honest gate text survives for the board to show.
  if (status.unlocked || !previewUnlockAllActive()) return status;
  return { unlocked: true, condition: PREVIEW_UNLOCK_ALL_CONDITION, preview: true, lockedCondition: status.condition };
}

function resolveContractUnlock(contract: ContractManifest): ContractUnlockStatus {
  const epochs = listEpochs().map(({ id }) => loadEpoch(id));
  const epoch = epochs.find((entry) => entry.contracts.some(({ id }) => id === contract.id));
  if (epoch && !epochIsActive(epoch.id)) {
    const predecessor = epochs.find((entry) => entry.successor === epoch.id);
    const action = `Awaits the ${epoch.displayName} era`;
    return {
      unlocked: false,
      condition: predecessor
        ? `The ${epoch.displayName} awaits: ${predecessor.megaproject.raiseActionText.replace(/^./, (letter) => letter.toLowerCase())}.`
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
      condition: "Secure two claims; bank the science, then he'll come out",
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
