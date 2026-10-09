import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const conf = readFileSync(new URL('../ops/droplet/agenttown.app.nginx.conf', import.meta.url), 'utf8');
// Tokenize quoted strings before braces: the ledger error body contains JSON.
const tokens = conf.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*|[{};]|[^\s{};#]+/g)
  .filter(token => !token.startsWith('#'));
let pos = 0;
function parse(nested = false) {
  const nodes = [];
  let words = [];
  while (pos < tokens.length) {
    const token = tokens[pos++];
    if (token === '}') {
      assert.ok(nested && words.length === 0, 'unexpected closing brace');
      return nodes;
    }
    if (token === '{' || token === ';') {
      assert.ok(words.length, 'directive must have a name');
      nodes.push({ words, children: token === '{' ? parse(true) : null });
      words = [];
    } else words.push(token);
  }
  assert.ok(!nested && words.length === 0, 'unterminated block or directive');
  return nodes;
}
const tree = parse();
const servers = tree.filter(n => n.words[0] === 'server');
const locations = servers.flatMap(n => n.children).filter(n => n.words[0] === 'location');
function location(name) {
  const matches = locations.filter(n => n.words.slice(1).join(' ') === name);
  assert.equal(matches.length, 1, `one location ${name}`);
  return matches[0].children.map(n => n.words.join(' '));
}
const game = location('/goldrush/');
test('Pages proxy uses request-time DNS, HTTPS, SNI and the Pages Host', () => {
  for (const directive of [
    'resolver 127.0.0.53 1.1.1.1 valid=300s',
    'set $pages_upstream gold-rush-3in.pages.dev',
    'proxy_pass https://$pages_upstream',
    'proxy_ssl_server_name on',
    'proxy_set_header Host gold-rush-3in.pages.dev',
  ]) assert.ok(game.includes(directive), directive);
  assert.equal(game.filter(d => d.startsWith('proxy_pass ')).length, 1);
});
test('prefix rewrite stays in the proxy location and preserves paths and query strings', () => {
  assert.ok(game.includes('rewrite ^/goldrush/(.*)$ /$1 break'));
  assert.equal(game.filter(d => d.startsWith('rewrite ')).length, 1);
  // nginx rewrite operates on the path; without ? in the replacement it retains args.
  for (const [input, expected] of [
    ['/goldrush/', '/'], ['/goldrush/version.json', '/version.json'],
    ['/goldrush/assets/index-abc123.js?v=2', '/assets/index-abc123.js?v=2'],
  ]) {
    const url = new URL(input, 'https://agenttown.app');
    assert.equal(url.pathname.replace(/^\/goldrush\/(.*)$/, '/$1') + url.search, expected);
  }
});
test('bare game URL redirects on the canonical origin', () => {
  assert.deepEqual(location('= /goldrush'), ['return 301 /goldrush/']);
  assert.ok(!locations.some(n => n.words.slice(1).join(' ') === '/goldrush'));
});
test('game directives cannot hide, replace or locally cache upstream cache headers', () => {
  assert.deepEqual(game.map(d => d.split(' ')[0]).sort(), [
    'resolver', 'set', 'rewrite', 'proxy_pass', 'proxy_ssl_server_name', 'proxy_set_header',
  ].sort());
});
test('standings still uses the local ledger and residual API still uses Pages', () => {
  assert.ok(location('/api/standings').includes('proxy_pass http://127.0.0.1:8791'));
  assert.ok(location('/api/').includes('proxy_pass https://$pages_upstream'));
  assert.ok(location('/api/').includes('proxy_set_header Host gold-rush-3in.pages.dev'));
});
