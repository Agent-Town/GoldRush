#!/usr/bin/env node

import { accessSync, constants, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { execFile, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

const MODELS = new Map([
  ['codex', 'gpt-5.6-luna'],
  ['gpt-5.6-luna', 'gpt-5.6-luna'],
  ['gpt-5.6-sol', 'gpt-5.6-sol'],
]);
const MODEL_FLOOR = [0, 149, 1];
const MAX_BODY_BYTES = 1024 * 1024;
const TOOL_SCHEMA = fileURLToPath(new URL('./tool-response.schema.json', import.meta.url));

export function hasCodexAuth(env = process.env) {
  const codexHome = env.CODEX_HOME || path.join(homedir(), '.codex');
  try {
    accessSync(path.join(codexHome, 'auth.json'), constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export function resolveCodexBinary(env = process.env) {
  const candidates = [env.CODEX_BIN, 'codex', ...nvmCandidates()].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const output = execFileSync(candidate, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const version = output.match(/codex-cli\s+(\d+)\.(\d+)\.(\d+)/)?.slice(1).map(Number);
      if (version && versionAtLeast(version, MODEL_FLOOR)) return candidate;
    } catch {
      // Try the next installed client.
    }
  }
  throw new Error('Codex CLI 0.149.1 or newer is required');
}

function versionAtLeast(version, floor) {
  for (let index = 0; index < floor.length; index += 1) {
    if (version[index] !== floor[index]) return version[index] > floor[index];
  }
  return true;
}

function nvmCandidates() {
  const root = path.join(homedir(), '.nvm', 'versions', 'node');
  try {
    return readdirSync(root).sort().reverse().map((version) => path.join(root, version, 'bin', 'codex'));
  } catch {
    return [];
  }
}

function transcript(messages, tools = [], toolChoice) {
  if (!Array.isArray(messages) || messages.length === 0) throw new TypeError('messages must be a non-empty array');
  const history = messages.map((message) => {
    if (!message || !['system', 'developer', 'user', 'assistant', 'tool'].includes(message.role)) {
      throw new TypeError('unsupported message role');
    }
    if (message.role === 'tool') {
      if (typeof message.tool_call_id !== 'string' || typeof message.content !== 'string') throw new TypeError('tool messages need tool_call_id and string content');
      return `TOOL RESULT ${message.tool_call_id}: ${message.content}`;
    }
    const content = message.content == null && message.role === 'assistant' ? '' : messageText(message.content);
    const calls = message.role === 'assistant' && Array.isArray(message.tool_calls) ? `\nTOOL CALLS: ${JSON.stringify(message.tool_calls)}` : '';
    return `${message.role.toUpperCase()}: ${content}${calls}`;
  }).join('\n\n');
  if (!tools.length) return `${history}\n\nReturn only the next assistant message.`;
  const names = tools.map((tool) => {
    if (tool?.type !== 'function' || typeof tool.function?.name !== 'string' || !tool.function.parameters) throw new TypeError('only OpenAI function tools are supported');
    return tool.function.name;
  });
  return `${history}\n\nAVAILABLE FUNCTION TOOLS:\n${JSON.stringify(tools)}\n\nTool choice: ${JSON.stringify(toolChoice ?? 'auto')}. Do not use internal Codex tools. Return the next assistant action as JSON matching the supplied schema. Use only these tool names: ${names.join(', ')}. Put each function's arguments in the arguments field as a JSON object encoded as a string. Use an empty tool_calls array for a final text response.`;
}

function messageText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content) && content.every((part) => part?.type === 'text' && typeof part.text === 'string')) return content.map((part) => part.text).join('');
  throw new TypeError('message content must be a string or text-part array');
}

function complete(codexBinary, model, prompt, timeoutMs, outputSchema, signal) {
  return new Promise((resolve, reject) => {
    const args = [
      'exec', '--ephemeral', '--json', '--skip-git-repo-check', '--ignore-user-config', '--ignore-rules',
      '-s', 'read-only', '-m', model,
      ...(outputSchema ? ['--output-schema', outputSchema] : []), '-'
    ];
    const child = execFile(codexBinary, args, { cwd: tmpdir(), maxBuffer: 4 * 1024 * 1024, timeout: timeoutMs, signal }, (error, stdout) => {
      if (error) return reject(new Error(`Codex completion failed (exit ${error.code ?? 'unknown'})`));
      try {
        let content;
        let usage;
        for (const line of stdout.split('\n').filter(Boolean)) {
          const event = JSON.parse(line);
          if (event.type === 'item.completed' && event.item?.type === 'agent_message') content = event.item.text;
          if (event.type === 'turn.completed') usage = event.usage;
          if (event.type === 'turn.failed') return reject(new Error('Codex completion failed'));
        }
        if (typeof content !== 'string' || !usage) return reject(new Error('Codex returned no completion'));
        resolve({ content, usage });
      } catch {
        reject(new Error('Codex returned invalid event data'));
      }
    });
    child.stdin.end(prompt);
  });
}

export function createCodexShimServer({
  codexBinary = resolveCodexBinary(),
  timeoutMs = Number(process.env.CODEX_SHIM_TIMEOUT_MS || 300_000),
  maxConcurrency = Number(process.env.CODEX_SHIM_MAX_CONCURRENCY || 4),
  completeFn = complete,
} = {}) {
  let active = 0;
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1');
      if (request.method === 'GET' && url.pathname === '/v1/models') {
        return send(response, 200, { object: 'list', data: [...new Set(MODELS.values())].map((id) => ({ id, object: 'model', owned_by: 'openai-codex-subscription' })) });
      }
      if (request.method !== 'POST' || url.pathname !== '/v1/chat/completions') return sendError(response, 404, 'not_found', 'Route not found');
      if (request.headers.origin) return sendError(response, 403, 'browser_origin_denied', 'Browser-origin requests are not allowed');
      if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) return sendError(response, 415, 'unsupported_media_type', 'Content-Type must be application/json');
      if (active >= maxConcurrency) return sendError(response, 429, 'rate_limit_exceeded', 'Too many concurrent completions');
      const controller = new AbortController();
      const abort = () => controller.abort();
      request.once('aborted', abort);
      response.once('close', abort);
      const body = await readJson(request);
      const model = MODELS.get(body.model ?? 'codex');
      if (!model) return sendError(response, 400, 'invalid_model', `Supported models: ${[...MODELS.keys()].join(', ')}`);
      const tools = body.tools ?? [];
      if (!Array.isArray(tools)) throw new TypeError('tools must be an array');
      active += 1;
      let result;
      try {
        result = await completeFn(codexBinary, model, transcript(body.messages, tools, body.tool_choice), timeoutMs, tools.length ? TOOL_SCHEMA : undefined, controller.signal);
      } finally {
        request.off('aborted', abort);
        response.off('close', abort);
        active -= 1;
      }
      let content = result.content;
      let toolCalls = [];
      if (tools.length) {
        let structured;
        try {
          structured = JSON.parse(content);
        } catch {
          throw new Error('Codex returned an invalid tool response');
        }
        const allowedNames = new Set(tools.map((tool) => tool.function.name));
        if (!Array.isArray(structured.tool_calls) || (structured.content !== null && typeof structured.content !== 'string')) throw new Error('Codex returned an invalid tool response');
        toolCalls = structured.tool_calls.map((call) => {
          if (!allowedNames.has(call?.name) || typeof call.arguments !== 'string') throw new Error('Codex returned an invalid function call');
          let args;
          try {
            args = JSON.parse(call.arguments);
          } catch {
            throw new Error('Codex returned invalid function arguments');
          }
          if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('Codex returned invalid function arguments');
          return { id: `call_${randomUUID()}`, type: 'function', function: { name: call.name, arguments: call.arguments } };
        });
        const requiredName = body.tool_choice?.function?.name;
        if ((body.tool_choice === 'required' || requiredName) && !toolCalls.length) throw new Error('Codex did not return the required function call');
        if (requiredName && toolCalls.some((call) => call.function.name !== requiredName)) throw new Error('Codex returned the wrong required function call');
        if (body.tool_choice === 'none' && toolCalls.length) throw new Error('Codex returned a disabled function call');
        content = structured.content;
      }
      const { usage } = result;
      const reasoningTokens = usage.reasoning_output_tokens ?? 0;
      const completionTokens = usage.output_tokens;
      if (body.stream) {
        return sendStream(response, model, content, toolCalls, {
          prompt_tokens: usage.input_tokens,
          completion_tokens: completionTokens,
          total_tokens: usage.input_tokens + completionTokens,
          prompt_tokens_details: { cached_tokens: usage.cached_input_tokens ?? 0 },
          completion_tokens_details: { reasoning_tokens: reasoningTokens },
        });
      }
      send(response, 200, {
        id: `chatcmpl-codex-${randomUUID()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{
          index: 0,
          message: { role: 'assistant', content, ...(toolCalls.length ? { tool_calls: toolCalls } : {}) },
          finish_reason: toolCalls.length ? 'tool_calls' : 'stop',
        }],
        usage: {
          prompt_tokens: usage.input_tokens,
          completion_tokens: completionTokens,
          total_tokens: usage.input_tokens + completionTokens,
          prompt_tokens_details: { cached_tokens: usage.cached_input_tokens ?? 0 },
          completion_tokens_details: { reasoning_tokens: reasoningTokens },
        },
      });
    } catch (error) {
      if (response.destroyed) return;
      const clientError = error instanceof SyntaxError || error instanceof TypeError;
      sendError(response, clientError ? 400 : 502, clientError ? 'invalid_request' : 'backend_error', error instanceof Error ? error.message : 'Request failed');
    }
  });
}

function sendStream(response, model, content, toolCalls, usage) {
  const id = `chatcmpl-codex-${randomUUID()}`;
  const created = Math.floor(Date.now() / 1000);
  const chunk = (delta, finishReason = null, finalUsage) => response.write(`data: ${JSON.stringify({
    id, object: 'chat.completion.chunk', created, model,
    choices: [{ index: 0, delta, finish_reason: finishReason }],
    ...(finalUsage ? { usage: finalUsage } : {}),
  })}\n\n`);
  response.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });
  chunk({ role: 'assistant' });
  chunk(toolCalls.length ? { tool_calls: toolCalls.map((call, index) => ({ index, ...call })) } : { content });
  chunk({}, toolCalls.length ? 'tool_calls' : 'stop', usage);
  response.end('data: [DONE]\n\n');
}

async function readJson(request) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_BODY_BYTES) throw new TypeError('request body exceeds 1 MiB');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function sendError(response, status, code, message) {
  send(response, status, { error: { message, type: code, code } });
}

function send(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function port(value) {
  const parsed = Number(value ?? 8899);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 65_535) throw new Error('PORT must be an integer from 1 to 65535');
  return parsed;
}

async function main() {
  const server = createCodexShimServer();
  server.listen(port(process.env.PORT), '127.0.0.1', () => console.log(`codex shim listening on 127.0.0.1:${server.address().port}`));
  const close = () => server.close();
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
