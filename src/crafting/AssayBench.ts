import {
  loadCraftingQueue,
  postPendingOrder,
  type CraftingRejectedNotice,
  type PendingPostResult,
} from './CraftingQueue';
import { normalizeQueueProfile, type CraftedItemDef } from './CraftingQueueContract';

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
}

export class AssayBenchPanel {
  private readonly bench: AssayBench;
  private readonly rejected: CraftingRejectedNotice[];
  private readonly root = document.createElement('section');
  private readonly text: HTMLTextAreaElement;
  private readonly profile: HTMLInputElement;
  private readonly pendingStatus: HTMLElement;
  private readonly pendingPath: HTMLElement;
  private readonly pendingJson: HTMLElement;
  private readonly history: HTMLElement;
  private readonly rejections: HTMLElement;

  constructor(parent: HTMLElement, options: { profile?: string } = {}) {
    const profile = normalizeQueueProfile(options.profile ?? new URLSearchParams(window.location.search).get('profile'));
    const queue = loadCraftingQueue(profile);
    this.bench = new AssayBench(queue.approved);
    this.rejected = queue.rejected;

    this.root.className = 'assay-bench';
    this.root.dataset.testid = 'assay-bench';
    this.root.setAttribute('aria-label', 'Assay Bench');
    this.root.innerHTML = `
      <form class="assay-bench__form" data-testid="assay-form">
        <label>
          <span>Assay Bench</span>
          <textarea data-testid="assay-text" rows="3">steady brass pan receipt for faster claim work</textarea>
        </label>
        <label>
          <span>Profile</span>
          <input data-testid="assay-profile" value="${escapeAttr(profile)}" />
        </label>
        <button type="button" data-testid="assay-post">Post the order</button>
      </form>
      <article class="assay-bench__card assay-bench__pending" data-testid="assay-pending-card">
        <strong data-testid="assay-pending-status">No order posted</strong>
        <code data-testid="assay-pending-path"></code>
        <pre data-testid="assay-pending-json"></pre>
      </article>
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
    this.history = this.get('[data-testid="assay-log"]');
    this.rejections = this.get('[data-testid="assay-queue-rejections"]');

    this.root.querySelector('[data-testid="assay-post"]')?.addEventListener('click', this.postOrder);
    this.root.addEventListener('keydown', this.stopGameHotkeys);
    this.root.addEventListener('keyup', this.stopGameHotkeys);
    this.renderHistory();
    this.renderRejections();
    parent.append(this.root);
  }

  dispose(): void {
    this.root.querySelector('[data-testid="assay-post"]')?.removeEventListener('click', this.postOrder);
    this.root.removeEventListener('keydown', this.stopGameHotkeys);
    this.root.removeEventListener('keyup', this.stopGameHotkeys);
    this.root.remove();
  }

  private readonly stopGameHotkeys = (event: KeyboardEvent) => {
    event.stopPropagation();
  };

  private readonly postOrder = async () => {
    this.pendingStatus.textContent = 'Posting';
    this.renderPending(await postPendingOrder(this.text.value, this.profile.value, queueTimestamp()));
  };

  private renderPending(result: PendingPostResult): void {
    this.root.dataset.pendingSaved = String(result.saved);
    this.pendingStatus.textContent = result.saved ? 'Posted' : `JSON ready${result.error ? ` (${result.error})` : ''}`;
    this.pendingPath.textContent = result.path;
    this.pendingJson.textContent = JSON.stringify(result.request, null, 2);
  }

  private renderHistory(): void {
    this.history.replaceChildren(
      ...this.bench.acceptedLog.map((item) => {
        const row = document.createElement('li');
        row.textContent = `${item.name} (${item.rarity})`;
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

export function install(parent: HTMLElement, options: { profile?: string } = {}): AssayBenchPanel | undefined {
  if (!new URLSearchParams(window.location.search).has('debug')) return undefined;
  return new AssayBenchPanel(parent, options);
}

function queueTimestamp(): Date {
  const override = new URLSearchParams(window.location.search).get('queueNow');
  if (!override) return new Date();
  const parsed = new Date(override);
  return Number.isNaN(parsed.valueOf()) ? new Date() : parsed;
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
