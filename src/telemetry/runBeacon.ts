import type { EventBus } from '../core/EventBus';
import {
  TELEMETRY_DEV_SEND_STORAGE_KEY,
  buildRunTelemetryPayload,
  readTelemetryOptIn,
  type RunEndedEvent,
  type RunTelemetryPayload,
} from './payload';

type RunTelemetryHost = {
  events: EventBus;
  contract: () => string;
  upgradeStacks: () => Record<string, number>;
};

export function installRunTelemetry(host: RunTelemetryHost): () => void {
  const sentRunIds = new Set<number>();
  let lastPayload: RunTelemetryPayload | null = null;

  const record = (event: RunEndedEvent) => {
    if (sentRunIds.has(event.runId)) return;
    sentRunIds.add(event.runId);
    if (!readTelemetryOptIn()) return;
    if (!shouldPostTelemetry()) return;

    const payload = buildRunTelemetryPayload(event, {
      contract: host.contract(),
      upgradeStacks: host.upgradeStacks(),
    });
    lastPayload = payload;
    void postRunTelemetry(payload);
  };

  const disposeEvent = host.events.on('run_ended', record);
  if (new URLSearchParams(globalThis.location?.search ?? '').has('debug')) {
    globalThis.window.__GR_TELEMETRY__ = {
      recordRunEndedForTest: record,
      lastPayload: () => lastPayload,
    };
  }

  return () => {
    disposeEvent();
    if (globalThis.window.__GR_TELEMETRY__?.recordRunEndedForTest === record) {
      globalThis.window.__GR_TELEMETRY__ = undefined;
    }
  };
}

export async function postRunTelemetry(payload: RunTelemetryPayload): Promise<void> {
  try {
    await fetch('/api/telemetry', {
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
