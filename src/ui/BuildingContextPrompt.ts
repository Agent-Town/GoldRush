import type { DemolishCandidate, UpgradeCandidate } from '../systems/BuildSystem';
import type { BuildableId } from '../game/buildables';

export type MegaprojectFundCandidate = {
  title: string;
  stage: number;
  cost: number;
  line: string;
};

/**
 * A10 (`specs/agent-play/door-completion-sheet.md:26`) — the Old Canal's decision stake, offered
 * the way the megaproject site is: a world context prompt with no building under it.
 *
 * IT NEEDS TWO BUTTONS OF ITS OWN rather than borrowing the upgrade/demolish pair, because the
 * borrowed pair would make `demolish-confirm` perform a re-dig on this one map — a testid that
 * lies is worse than two more elements. The keys are the ones the game already has: the confirm
 * key re-digs, the upgrade key demolishes, both named in the labels below.
 */
export type CanalDecisionCandidate = {
  /** The authored stake id, so a spec can assert WHICH ground is being offered. */
  segmentId: string;
  title: string;
  line: string;
};

/**
 * ADR-005 stage 4 (`docs/bench/rider-parity-audit.md` §3a change 4; owner ruling 2026-09-07) — THE
 * DECK, offered to the PLAYER.
 *
 * `BOAT_BUILD` and `REANCHOR` reached a real E5 mechanic whose only browser lever was
 * `__GR_TEST__.placeBoatBuilding` / `__GR_TEST__.reanchorClaimBoat`, installed only under `?debug`.
 * A plain-boot human could not build on the deck or move the anchor AT ALL, so the two verbs were
 * `agent-only`: the audit's clearest case of Mistake #10 in its original form. ADR-005 clause 2's
 * remedy for a thin human surface is to THICKEN IT, never to cut the verb — a mechanic an epoch is
 * built on does not leave the door because the browser forgot to offer it.
 *
 * So the deck rides the prompt every other world interaction rides, on the keys the game already
 * has: the confirm key places the selected buildable on the pad the hero is standing at, and the
 * anchors are a LIST, one button each, with the upgrade key bound to the first of them. Nothing is
 * spent — `ClaimBoat.placeBuilding` and `ClaimBoat.reanchor` take no resource, which is exactly what
 * `public/skill.md` already claimed of the two verbs ("Both mirror the player's zero-resource
 * actions"). That sentence was false when it was written; this is what makes it true.
 */
export type DeckContextCandidate = {
  /** The pad the hero is standing at, so a spec can assert WHICH pad is being offered. */
  padId: string | null;
  /** What the confirm key will place there — the player's own current build selection. */
  buildingId: BuildableId;
  buildingName: string;
  /** Every anchor the boat is not currently at. Empty means "nowhere else to go". */
  anchors: readonly { id: string; label: string }[];
  title: string;
  line: string;
};

export class BuildingContextPrompt {
  private contentKey = '';
  private readonly compactScreen = matchMedia('(pointer: coarse) and (max-height: 600px), (max-width: 760px) and (max-height: 600px)');
  private readonly root = document.createElement('details');
  private readonly summary = document.createElement('summary');
  private readonly body = document.createElement('div');
  private readonly icon = document.createElement('span');
  private readonly title = document.createElement('span');
  private readonly loss = document.createElement('span');
  private readonly upgradeButton = document.createElement('button');
  private readonly fundButton = document.createElement('button');
  private readonly demolishButton = document.createElement('button');
  private readonly canalRedigButton = document.createElement('button');
  private readonly canalDemolishButton = document.createElement('button');
  private readonly deckBuildButton = document.createElement('button');
  /** One button per anchor the boat is not at — the LIST the master asks for, not a toggle. */
  private readonly deckAnchorRow = document.createElement('div');
  private onReanchor: (anchorId: string) => void = () => {};

  constructor(
    parent: HTMLElement,
    onUpgrade: () => void,
    onDemolish: () => void,
    onFund: () => void,
    onCanalRedig: () => void = () => {},
    onCanalDemolish: () => void = () => {},
    onDeckBuild: () => void = () => {},
    onReanchor: (anchorId: string) => void = () => {},
  ) {
    this.root.className = 'building-context-prompt';
    this.root.dataset.testid = 'building-context-prompt';
    this.root.setAttribute('role', 'status');
    this.root.setAttribute('aria-live', 'polite');
    this.root.hidden = true;
    this.root.open = true;
    this.summary.dataset.testid = 'building-context-toggle';
    this.summary.addEventListener('keydown', (event) => {
      if (event.code === 'Enter' || event.code === 'Space') event.stopPropagation();
    });
    this.body.className = 'building-context-prompt__body';
    this.icon.className = 'building-context-prompt__icon';
    this.icon.setAttribute('aria-hidden', 'true');
    this.title.className = 'building-context-prompt__title';
    this.loss.className = 'building-context-prompt__loss';
    this.upgradeButton.className = 'building-context-prompt__button building-context-prompt__button--upgrade';
    this.upgradeButton.type = 'button';
    this.upgradeButton.dataset.testid = 'upgrade-confirm';
    this.upgradeButton.addEventListener('click', () => {
      onUpgrade();
      this.upgradeButton.blur();
    });
    this.fundButton.className = 'building-context-prompt__button building-context-prompt__button--fund';
    this.fundButton.type = 'button';
    this.fundButton.dataset.testid = 'stamp-site-fund';
    this.fundButton.hidden = true;
    this.fundButton.addEventListener('click', () => {
      onFund();
      this.fundButton.blur();
    });
    this.demolishButton.className = 'building-context-prompt__button building-context-prompt__button--demolish';
    this.demolishButton.type = 'button';
    this.demolishButton.dataset.testid = 'demolish-confirm';
    this.demolishButton.addEventListener('click', () => {
      onDemolish();
      this.demolishButton.blur();
    });
    for (const [button, testid, handler] of [
      [this.canalRedigButton, 'canal-redig', onCanalRedig],
      [this.canalDemolishButton, 'canal-demolish', onCanalDemolish],
    ] as const) {
      button.className = `building-context-prompt__button building-context-prompt__button--${testid}`;
      button.type = 'button';
      button.dataset.testid = testid;
      button.hidden = true;
      button.addEventListener('click', () => {
        handler();
        button.blur();
      });
    }
    this.deckBuildButton.className = 'building-context-prompt__button building-context-prompt__button--deck-build';
    this.deckBuildButton.type = 'button';
    this.deckBuildButton.dataset.testid = 'deck-build';
    this.deckBuildButton.hidden = true;
    this.deckBuildButton.addEventListener('click', () => {
      onDeckBuild();
      this.deckBuildButton.blur();
    });
    this.deckAnchorRow.className = 'building-context-prompt__anchors';
    this.deckAnchorRow.dataset.testid = 'deck-anchors';
    this.deckAnchorRow.hidden = true;
    this.onReanchor = onReanchor;
    this.summary.append(this.icon, this.title);
    this.root.append(this.summary, this.body);
    this.body.append(
      this.upgradeButton,
      this.fundButton,
      this.demolishButton,
      this.canalRedigButton,
      this.canalDemolishButton,
      this.deckBuildButton,
      this.deckAnchorRow,
      this.loss,
    );
    parent.append(this.root);
  }

  update(
    demolish: DemolishCandidate | null,
    upgrade: UpgradeCandidate | null,
    enterEnabled: boolean,
    fund: MegaprojectFundCandidate | null = null,
    canal: CanalDecisionCandidate | null = null,
    deck: DeckContextCandidate | null = null,
  ): void {
    const contentKey = deck
      ? `deck:${deck.padId}:${deck.buildingId}:${deck.anchors.map((anchor) => anchor.id).join(',')}:${enterEnabled}`
      : canal
      ? `canal:${canal.segmentId}:${canal.title}:${canal.line}:${enterEnabled}`
      : fund
      ? `fund:${fund.title}:${fund.stage}:${fund.cost}:${fund.line}:${enterEnabled}`
      : demolish
        ? `building:${demolish.id}:${demolish.index}:${demolish.invested}:${demolish.refund}:${upgrade?.tier ?? 0}:${upgrade?.cost ?? 0}:${upgrade?.canUpgrade ?? false}:${upgrade?.reason ?? 'none'}:${enterEnabled}`
        : 'hidden';
    if (contentKey === this.contentKey) { this.syncGroup(); return; }
    this.contentKey = contentKey;
    this.root.hidden = demolish === null && fund === null && canal === null && deck === null;
    if (this.root.hidden) {
      this.root.name = '';
      return;
    }
    const kind = deck ? 'deck' : 'building';
    if (kind !== this.root.dataset.kind) this.root.open = !deck;
    this.root.dataset.kind = kind;
    this.syncGroup();
    // ADR-005 stage 4. THE DECK OUTRANKS EVERY OTHER CANDIDATE for the same reason A10 does: a
    // Claim-Boat pad is a place on a hull, and no work can stand on it for the branches below to
    // describe (`Game.confirmAction` refuses an ordinary build outright while a deepwater claim is
    // live). Offered in ordinary play, no build mode, no `?debug` — Mistake #10's answer to "where
    // does the PLAYER see this, in a plain boot?".
    if (deck) {
      this.icon.textContent = 'D';
      this.title.textContent = deck.title;
      this.loss.textContent = deck.line;
      this.upgradeButton.hidden = true;
      this.demolishButton.hidden = true;
      this.fundButton.hidden = true;
      this.canalRedigButton.hidden = true;
      this.canalDemolishButton.hidden = true;
      this.deckBuildButton.hidden = deck.padId === null;
      setButtonLabel(this.deckBuildButton, `Build ${deck.buildingName} · ${deck.padId}`, enterEnabled ? 'Enter' : undefined);
      this.renderAnchors(deck.anchors);
      return;
    }
    this.deckBuildButton.hidden = true;
    this.deckAnchorRow.hidden = true;
    this.deckAnchorRow.replaceChildren();
    // A10 OUTRANKS EVERY OTHER CANDIDATE, and it can do so safely: an undecided canal band takes
    // no foundation, so there is never a building at a stake for the branches below to describe.
    if (canal) {
      this.icon.textContent = 'C';
      this.title.textContent = canal.title;
      this.loss.textContent = canal.line;
      this.upgradeButton.hidden = true;
      this.demolishButton.hidden = true;
      this.fundButton.hidden = true;
      this.canalRedigButton.hidden = false;
      this.canalDemolishButton.hidden = false;
      setButtonLabel(this.canalRedigButton, 'Re-dig: the water comes back', enterEnabled ? 'Enter' : undefined);
      setButtonLabel(this.canalDemolishButton, 'Demolish: the ground opens', 'U');
      return;
    }
    this.canalRedigButton.hidden = true;
    this.canalDemolishButton.hidden = true;
    if (fund) {
      this.icon.textContent = 'M';
      this.title.textContent = fund.title;
      this.loss.textContent = fund.line;
      this.upgradeButton.hidden = true;
      this.demolishButton.hidden = true;
      this.fundButton.hidden = false;
      this.fundButton.disabled = false;
      setButtonLabel(this.fundButton, `Fund stage ${fund.stage}: ${fund.cost}g`, enterEnabled ? 'Enter' : undefined);
      return;
    }
    this.fundButton.hidden = true;
    this.upgradeButton.hidden = false;
    this.demolishButton.hidden = false;
    if (!demolish) return;
    this.icon.textContent = buildingGlyph(demolish.id);
    this.title.textContent = `${demolish.displayName}${upgrade ? ` · Tier ${upgrade.tier}` : ''}`;
    this.loss.textContent = `invested ${demolish.invested}g → returns ${demolish.refund}g. The timber comes back, the labor doesn't.`;
    this.upgradeButton.disabled = !upgrade?.canUpgrade;
    setButtonLabel(this.upgradeButton, upgradeLabel(upgrade), upgrade?.canUpgrade ? 'U' : undefined);
    setButtonLabel(this.demolishButton, `Tear down (+${demolish.refund}g)`, enterEnabled ? 'Enter' : undefined);
  }

  /**
   * The anchor LIST, rebuilt whenever the content key moves. One button per anchor the boat is not
   * at, each carrying its own id in a testid, so a spec can assert WHICH anchors were offered rather
   * than that "an anchor button existed". The upgrade key is bound to the first of them in
   * `Game.confirmUpgrade`, which is how a keyboard player reaches the list without a new binding.
   */
  private renderAnchors(anchors: readonly { id: string; label: string }[]): void {
    this.deckAnchorRow.replaceChildren();
    this.deckAnchorRow.hidden = anchors.length === 0;
    anchors.forEach((anchor, index) => {
      const button = document.createElement('button');
      button.className = 'building-context-prompt__button building-context-prompt__button--deck-anchor';
      button.type = 'button';
      button.dataset.testid = `deck-anchor-${anchor.id}`;
      setButtonLabel(button, `Anchor: ${anchor.label.replaceAll('-', ' ')}`, index === 0 ? 'U' : undefined);
      button.addEventListener('click', () => {
        this.onReanchor(anchor.id);
        button.blur();
      });
      this.deckAnchorRow.append(button);
    });
  }

  private syncGroup(): void {
    const groupName = !this.root.hidden && this.compactScreen.matches ? 'map-context' : '';
    if (this.root.name !== groupName) this.root.name = groupName;
  }

  dispose(): void {
    this.root.remove();
  }
}

function setButtonLabel(button: HTMLButtonElement, label: string, key?: string): void {
  button.textContent = label;
  if (!key) { button.removeAttribute('aria-keyshortcuts'); return; }
  button.setAttribute('aria-keyshortcuts', key);
  const hint = document.createElement('kbd');
  hint.textContent = ` ${key}`;
  hint.setAttribute('aria-hidden', 'true');
  button.append(hint);
}

function upgradeLabel(candidate: UpgradeCandidate | null): string {
  if (!candidate) return 'No tier';
  if (candidate.reason === 'max') return `Tier ${candidate.maxTier} max`;
  if (candidate.reason === 'gated') return `needs science`;
  if (candidate.reason === 'insufficient_gold') return `need ${candidate.cost}g`;
  return `Upgrade to T${candidate.nextTier} (${candidate.cost}g)`;
}

function buildingGlyph(id: BuildableId): string {
  if (id === 'sluice') return 'S';
  if (id === 'palisade') return 'P';
  if (id === 'turret') return 'T';
  if (id === 'assay_office') return 'A';
  if (id === 'stockpile') return 'Y';
  return 'B';
}
