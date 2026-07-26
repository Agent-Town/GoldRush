import { gameApiUrl } from '../app/GameApi';
import type { EventBus } from '../core/EventBus';
import {
  TELEMETRY_DEV_SEND_STORAGE_KEY,
  buildRunTelemetryPayload,
  readTelemetryOptIn,
  type RunEndedEvent,
  type RunSecuredEvent,
  type RunTelemetryPayload,
} from './payload';

type RunTelemetryHost = {
  events: EventBus;
  contract: () => string;
  upgradeStacks: () => Record<string, number>;
};

export function installRunTelemetry(host: RunTelemetryHost): () => void {
  const sentEvents = new Set<string>();
  let lastPayload: RunTelemetryPayload | null = null;

  const record = (event: RunEndedEvent | RunSecuredEvent, stage: RunTelemetryPayload['stage']) => {
    const key = `${event.runId}:${stage}`;
    if (sentEvents.has(key)) return;
    sentEvents.add(key);
    if (!readTelemetryOptIn()) return;
    if (!shouldPostTelemetry()) return;

    const payload = buildRunTelemetryPayload(event, {
      contract: host.contract(),
      upgradeStacks: host.upgradeStacks(),
    }, stage);
    lastPayload = payload;
    void postRunTelemetry(payload);
  };

  const recordEnded = (event: RunEndedEvent) => record(event, 'end');
  const disposeSecure = host.events.on('run_secured', (event) => record(event, 'secure'));
  const disposeEnded = host.events.on('run_ended', recordEnded);
  if (new URLSearchParams(globalThis.location?.search ?? '').has('debug')) {
    globalThis.window.__GR_TELEMETRY__ = {
      recordRunEndedForTest: recordEnded,
      lastPayload: () => lastPayload,
    };
  }

  return () => {
    disposeSecure();
    disposeEnded();
    if (globalThis.window.__GR_TELEMETRY__?.recordRunEndedForTest === recordEnded) {
      globalThis.window.__GR_TELEMETRY__ = undefined;
    }
  };
}

export async function postRunTelemetry(payload: RunTelemetryPayload): Promise<void> {
  try {
    await fetch(gameApiUrl('/api/telemetry'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Telemetry must never affect the run-return flow.
  }
}

function shouldPostTelemetry(): boolean {
  if (__APP_BUILD__ !== 'dev') return true;
  try {
    return globalThis.localStorage?.getItem(TELEMETRY_DEV_SEND_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
