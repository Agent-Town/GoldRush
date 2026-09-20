# s2275 drain control — the streaming wall, before and after

Subject: the merged tree of lane/b (gauntlet-heat3c-shim-streaming) vs main pre-merge.
Both arms use a FAKE completeFn, so this control spends ZERO Codex subscription allowance.
The control arm asserts its own validity: it must still show the wall (F-2215-1).

## ARM A — CURED (merged tree)

```
HTTP 200 | content-type: text/event-stream; charset=utf-8
--- raw wire bytes ---
data: {"id":"chatcmpl-codex-476a4928-c2c3-4b36-ac68-11360ebd9753","object":"chat.completion.chunk","created":1787569563,"model":"gpt-5.6-luna","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl-codex-476a4928-c2c3-4b36-ac68-11360ebd9753","object":"chat.completion.chunk","created":1787569563,"model":"gpt-5.6-luna","choices":[{"index":0,"delta":{"content":"howdy from the assay office"},"finish_reason":null}]}

data: {"id":"chatcmpl-codex-476a4928-c2c3-4b36-ac68-11360ebd9753","object":"chat.completion.chunk","created":1787569563,"model":"gpt-5.6-luna","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":11,"completion_tokens":5,"total_tokens":16,"prompt_tokens_details":{"cached_tokens":0},"completion_tokens_details":{"reasoning_tokens":0}}}

data: [DONE]


SSE data lines: 4 | terminator: "data: [DONE]"
WALL PRESENT (400 Streaming is not supported): false
```

## ARM B — CONTROL (main pre-merge, serve.mjs at ba3562720)

```
HTTP 400 | content-type: application/json; charset=utf-8
--- raw wire bytes ---
{"error":{"message":"Streaming is not supported","type":"unsupported_value","code":"unsupported_value"}}
SSE data lines: 0 | terminator: undefined
WALL PRESENT (400 Streaming is not supported): true
```

## Probe source (identical but for the import target)

```js
// Free control (s2275 drain): does the merged tree still return the 400 wall
// that DNF'd all four riders in heat3b? Uses a fake completeFn => ZERO Codex
// subscription spend. Scratch: lives in the disposable gate worktree, never
// committed, removed with the worktree (F-1665-1 — never scripts/).
import { createCodexShimServer } from './server/codex-shim/serve.mjs';

const server = createCodexShimServer({
  completeFn: async () => ({
    content: 'howdy from the assay office',
    toolCalls: [],
    usage: { input_tokens: 11, cached_input_tokens: 0, output_tokens: 5, reasoning_output_tokens: 0 },
  }),
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ model: 'codex', stream: true, messages: [{ role: 'user', content: 'hi' }] }),
});
console.log('HTTP', res.status, '| content-type:', res.headers.get('content-type'));
const body = await res.text();
console.log('--- raw wire bytes ---');
console.log(body);
const dataLines = body.split('\n').filter(l => l.startsWith('data: '));
console.log('SSE data lines:', dataLines.length, '| terminator:', JSON.stringify(dataLines.at(-1)));
console.log('WALL PRESENT (400 Streaming is not supported):', body.includes('Streaming is not supported'));
await new Promise(r => server.close(r));
```
