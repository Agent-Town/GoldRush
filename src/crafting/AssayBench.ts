import {
  loadCraftingQueue,
  loadCraftingQueueState,
  postPendingOrder,
  type CraftingPendingNotice,
  type CraftingQueueSnapshot,
  type CraftingRejectedNotice,
  type PendingPostResult,
} from './CraftingQueue';
import { normalizeQueueProfile, type CraftedItemDef } from './CraftingQueueContract';
import { browserResearchStorage, contractTierForResearch, loadResearchState } from '../meta/ResearchTree';
import { ComplaintDeskPanel } from '../ui/ComplaintDesk';

export class AssayBench {
  private readonly accepted = new Map<string, CraftedItemDef>();

  constructor(initialAccepted: readonly CraftedItemDef[] = []) {
    this.ingestApproved(initialAccepted);
  }

  get acceptedLog(): CraftedItemDef[] {
    return [...this.accepted.values()];
  }

  ingestApproved(items: readonly CraftedItemDef[]): void {
    for (const item of items) this.accepted.set(item.id, item);
  }

  replaceApproved(items: readonly CraftedItemDef[]): void {
    this.accepted.clear();
    this.ingestApproved(items);
  }
}

export class AssayBenchPanel {
  private readonly bench: AssayBench;
  private pending: CraftingPendingNotice[];
  private rejected: CraftingRejectedNotice[];
  private readonly root = document.createElement('section');
  private readonly text: HTMLTextAreaElement;
  private readonly profile: HTMLInputElement;
  private readonly pendingStatus: HTMLElement;
  private readonly pendingPath: HTMLElement;
  private readonly pendingJson: HTMLElement;
  private readonly pendingOrders: HTMLElement;
  private readonly history: HTMLElement;
  private readonly rejections: HTMLElement;
  private readonly postButton: HTMLButtonElement;
  private readonly wireStatus: HTMLElement;
  private readonly closeButton: HTMLButtonElement;
  private refreshSeq = 0;
  private queueAvailable: boolean | null = null;
  private loggedQueueProbe = false;

  constructor(parent: HTMLElement, options: { profile?: string; initiallyOpen?: boolean } = {}) {
    const profile = normalizeQueueProfile(options.profile ?? new URLSearchParams(window.location.search).get('profile'));
    const queue = loadCraftingQueue(profile);
    this.bench = new AssayBench(queue.approved);
    this.pending = queue.pending;
    this.rejected = queue.rejected;

    this.root.className = 'assay-bench';
    this.root.dataset.testid = 'assay-bench';
    this.root.dataset.assayOfficeSurface = '';
    this.root.setAttribute('aria-label', 'Assay Bench');
    this.root.hidden = options.initiallyOpen === false;
    this.root.setAttribute('aria-hidden', String(this.root.hidden));
    this.root.innerHTML = `
      <header class="assay-bench__header">
        <div>
          <strong>Assay Bench</strong>
          <p class="assay-bench__hint" data-testid="assay-hint">Write what you need — the Assayer takes orders between sessions when the wire is open.</p>
        </div>
        <button class="assay-bench__close" type="button" aria-label="Close Assay Bench" data-testid="assay-close">✕</button>
      </header>
      <form class="assay-bench__form" data-testid="assay-form">
        <label>
          <span>Order</span>
          <textarea data-testid="assay-text" rows="3"></textarea>
        </label>
        <label>
          <span>Profile</span>
          <input data-testid="assay-profile" value="${escapeAttr(profile)}" />
        </label>
        <button type="button" data-testid="assay-post" hidden>Post the order</button>
        <p class="assay-bench__wire" data-testid="assay-wire-status">Checking the wire to the Assayer.</p>
      </form>
      <article class="assay-bench__card assay-bench__pending" data-testid="assay-pending-card">
        <strong data-testid="assay-pending-status">No order posted</strong>
        <code data-testid="assay-pending-path"></code>
        <pre data-testid="assay-pending-json"></pre>
      </article>
      <section class="assay-bench__card assay-bench__pending-orders" aria-label="Pending orders">
        <strong>At the works</strong>
        <ul data-testid="assay-queue-pending"></ul>
      </section>
      <section class="assay-bench__card" aria-label="Crafted item history">
        <strong>History</strong>
        <ol data-testid="assay-log"></ol>
      </section>
      <section class="assay-bench__card assay-bench__rejects" aria-label="Rejected orders">
        <strong>Reject pile</strong>
        <ul data-testid="assay-queue-rejections"></ul>
      </section>
    `;

    this.text = this.get('[data-testid="assay-text"]');
    this.profile = this.get('[data-testid="assay-profile"]');
    this.pendingStatus = this.get('[data-testid="assay-pending-status"]');
    this.pendingPath = this.get('[data-testid="assay-pending-path"]');
    this.pendingJson = this.get('[data-testid="assay-pending-json"]');
    this.pendingOrders = this.get('[data-testid="assay-queue-pending"]');
    this.history = this.get('[data-testid="assay-log"]');
    this.rejections = this.get('[data-testid="assay-queue-rejections"]');
    this.postButton = this.get('[data-testid="assay-post"]');
    this.wireStatus = this.get('[data-testid="assay-wire-status"]');
    this.closeButton = this.get('[data-testid="assay-close"]');

    this.postButton.addEventListener('click', this.postOrder);
    this.closeButton.addEventListener('click', this.close);
    this.root.addEventListener('keydown', this.onRootKeyDown);
    this.root.addEventListener('keyup', this.stopGameHotkeys);
    document.addEventListener('keydown', this.onDocumentKeyDown);
    this.renderQueue(queue);
    parent.append(this.root);
    if (!this.root.hidden) void this.refreshQueue();
  }

  focus(): void {
    this.root.hidden = false;
    this.root.setAttribute('aria-hidden', 'false');
    void this.refreshQueue();
    this.text.focus();
  }

  dispose(): void {
    this.postButton.removeEventListener('click', this.postOrder);
    this.closeButton.removeEventListener('click', this.close);
    this.root.removeEventListener('keydown', this.onRootKeyDown);
    this.root.removeEventListener('keyup', this.stopGameHotkeys);
    document.removeEventListener('keydown', this.onDocumentKeyDown);
    this.root.remove();
  }

  private readonly close = () => {
    this.root.hidden = true;
    this.root.setAttribute('aria-hidden', 'true');
  };

  private readonly onRootKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
    event.stopPropagation();
  };

  private readonly onDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || this.root.hidden) return;
    event.preventDefault();
    this.close();
    event.stopPropagation();
  };

  private readonly stopGameHotkeys = (event: KeyboardEvent) => {
    event.stopPropagation();
  };

  private readonly postOrder = async () => {
    if (this.queueAvailable !== true) {
      this.renderQueueCapability(this.queueAvailable === false ? false : null);
      return;
    }

    const text = this.text.value.trim();
    if (!text) {
      this.root.dataset.pendingSaved = 'false';
      this.pendingStatus.textContent = 'Write an order first';
      this.pendingPath.textContent = '';
      this.pendingJson.textContent = '';
      return;
    }

    this.pendingStatus.textContent = 'Posting';
    this.renderPending(await postPendingOrder(text, this.profile.value, queueTimestamp(), currentContractTier()));
    await this.refreshQueue();
  };

  private renderPending(result: PendingPostResult): void {
    this.root.dataset.pendingSaved = String(result.saved);
    this.pendingStatus.textContent = result.alreadyExists
      ? 'Already at the works'
      : result.saved
        ? 'Posted'
        : `JSON ready${result.error ? ` (${result.error})` : ''}`;
    this.pendingPath.textContent = result.path;
    this.pendingJson.textContent = JSON.stringify(result.request, null, 2);
  }

  private async refreshQueue(): Promise<void> {
    if (this.queueAvailable === false) return;
    const seq = ++this.refreshSeq;
    const queue = await loadCraftingQueueState(this.profile.value);
    if (seq === this.refreshSeq) this.renderQueue(queue);
  }

  private renderQueue(queue: CraftingQueueSnapshot): void {
    this.renderQueueCapability(queue.queueAvailable);
    this.bench.replaceApproved(queue.approved);
    this.pending = queue.pending;
    this.rejected = queue.rejected;
    this.renderPendingOrders();
    this.renderHistory();
    this.renderRejections();
  }

  private renderQueueCapability(available: boolean | null): void {
    this.queueAvailable = available;
    this.postButton.hidden = available !== true;
    this.postButton.setAttribute('aria-hidden', String(available !== true));
    if (available === true) {
      this.wireStatus.textContent = 'The wire to the Assayer is open.';
    } else if (available === false) {
      this.wireStatus.textContent = 'The wire to the Assayer is still being strung — orders open soon.';
    } else {
      this.wireStatus.textContent = 'Checking the wire to the Assayer.';
    }
    if (available !== null && !this.loggedQueueProbe) {
      this.loggedQueueProbe = true;
      console.info(`[gold-rush] assay queue endpoint ${available ? 'available' : 'unavailable'}`);
    }
  }

  private renderPendingOrders(): void {
    this.pendingOrders.replaceChildren(
      ...this.pending.map((entry) => {
        const row = document.createElement('li');
        row.className = 'assay-bench__pending-order';
        row.textContent = `${entry.text} (${formatQueueTimestamp(entry.timestamp)}) — at the assay works, check back next run`;
        row.dataset.orderId = entry.id;
        row.dataset.status = 'pending';
        return row;
      }),
    );
  }

  private renderHistory(): void {
    this.history.replaceChildren(
      ...this.bench.acceptedLog.map((item) => {
        const row = document.createElement('li');
        row.textContent = `${item.name} (${item.rarity}) arrived — collection opens soon`;
        row.dataset.itemId = item.id;
        return row;
      }),
    );
  }

  private renderRejections(): void {
    this.rejections.replaceChildren(
      ...this.rejected.flatMap((entry) =>
        entry.reasons.map((reason) => {
          const row = document.createElement('li');
          row.textContent = `${entry.text}: ${reason.message}`;
          row.dataset.orderId = entry.id;
          row.dataset.reasonCode = reason.code;
          return row;
        }),
      ),
    );
  }

  private get<T extends HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing assay bench element: ${selector}`);
    return element;
  }
}

export function install(
  parent: HTMLElement,
  options: { profile?: string; initiallyOpen?: boolean } = {},
): AssayBenchPanel | ComplaintDeskPanel {
  return new URLSearchParams(window.location.search).has('debug')
    ? new AssayBenchPanel(parent, options)
    : new ComplaintDeskPanel(parent);
}

function queueTimestamp(): Date {
  const override = new URLSearchParams(window.location.search).get('queueNow');
  if (!override) return new Date();
  const parsed = new Date(override);
  return Number.isNaN(parsed.valueOf()) ? new Date() : parsed;
}

function currentContractTier(): number {
  return contractTierForResearch(loadResearchState(browserResearchStorage()));
}

function formatQueueTimestamp(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? value : parsed.toISOString();
}

function escapeAttr(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    if (char === '"') return '&quot;';
    return '&#39;';
  });
}
