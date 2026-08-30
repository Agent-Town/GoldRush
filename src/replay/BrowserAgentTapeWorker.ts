/// <reference lib="webworker" />

const worker = globalThis as unknown as DedicatedWorkerGlobalScope;

worker.onmessage = async ({ data }: MessageEvent<{ tape: unknown; search: string }>) => {
  try {
    Object.assign(globalThis, { window: { location: new URL(`http://gr-sim.local/${data.search}`) } });
    const { replayAgentTape } = await import('./AgentTapeReplay');
    worker.postMessage({ result: await replayAgentTape(data.tape) });
  } catch (error) {
    worker.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};
