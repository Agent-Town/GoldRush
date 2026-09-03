/// <reference lib="webworker" />

const worker = globalThis as unknown as DedicatedWorkerGlobalScope;
let replay: import('./AgentTapeReplay').AgentTapeReplaySession | null = null;

worker.onmessage = async ({ data }: MessageEvent<{
  id?: number;
  type?: 'start' | 'advance';
  tape?: unknown;
  targetTick?: number;
  stopAfterWave?: number;
}>) => {
  try {
    if (data.tape && typeof data.tape === 'object' && !Array.isArray(data.tape)) {
      const contract = Reflect.get(data.tape, 'contract');
      if (typeof contract !== 'string' || !contract) throw new Error('malformed tape');
      const { stageReplayContract } = await import('../meta/ContractFamilies');
      stageReplayContract(contract);
    }
    const { AgentTapeReplaySession, replayAgentTape } = await import('./AgentTapeReplay');
    if (!data.type) {
      worker.postMessage({ result: await replayAgentTape(data.tape) });
      return;
    }
    if (data.type === 'start') {
      replay = new AgentTapeReplaySession(data.tape);
      worker.postMessage({ id: data.id, snapshot: replay.snapshot() });
      return;
    }
    if (!replay) throw new Error('agent replay was not started');
    const snapshot = replay.advanceTo(data.targetTick ?? replay.tick, data.stopAfterWave);
    worker.postMessage({
      id: data.id,
      snapshot,
      ...(replay.complete ? { result: replay.result() } : {}),
    });
  } catch (error) {
    worker.postMessage({ id: data.id, error: error instanceof Error ? error.message : String(error) });
  }
};
