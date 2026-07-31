import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const consentSource = readFileSync(new URL('../src/agent/AgentConsent.ts', import.meta.url), 'utf8');
const toolSurfaceSource = readFileSync(new URL('../src/agent/ToolSurface.ts', import.meta.url), 'utf8');
const level = (source, ability) => Number(source.match(new RegExp(`\\{[^}]*id: '${ability}'[^}]*level: (\\d),`))?.[1]);

test('agent consent keeps the ruled pan rung and shipped repair rung', () => {
  assert.deepEqual(
    { auto_pan: level(consentSource, 'auto_pan'), auto_repair: level(consentSource, 'auto_repair') },
    { auto_pan: 2, auto_repair: 1 },
  );
});

test('tool surface keeps auto-pan at the ruled rung', () => {
  assert.equal(level(toolSurfaceSource, 'auto_pan'), 2);
});
