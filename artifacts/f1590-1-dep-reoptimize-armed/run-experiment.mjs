import { readFileSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'artifacts/f1590-1-dep-reoptimize-armed')
const metadataPath = path.join(root, 'node_modules/.vite/deps/_metadata.json')
const port = '5231'
const optimizationPattern = /optim(?:iz|is)(?:ing|ed)|Re-optimizing dependencies/i

function write(name, body) {
  writeFileSync(path.join(outDir, name), body)
}

function spawnCaptured(command, args, env = process.env) {
  const child = spawn(command, args, { cwd: root, env })
  let output = ''
  child.stdout.on('data', (chunk) => { output += chunk })
  child.stderr.on('data', (chunk) => { output += chunk })
  return { child, output: () => output }
}

async function stop(child) {
  if (child.exitCode !== null) return
  child.kill('SIGTERM')
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ])
  if (child.exitCode === null) child.kill('SIGKILL')
}

async function waitForReady(server, timeoutMs = 15_000) {
  const started = Date.now()
  while (!/ready in \d+ ms/.test(server.output())) {
    if (server.child.exitCode !== null) throw new Error(`vite exited before readiness (rc=${server.child.exitCode})`)
    if (Date.now() - started > timeoutMs) throw new Error('vite readiness timed out')
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
}

async function run(arm, repetition, staleHash) {
  const stem = `arm-${arm.toLowerCase()}-${repetition}`
  const before = JSON.parse(readFileSync(metadataPath, 'utf8'))
  if (staleHash) writeFileSync(metadataPath, JSON.stringify({ ...before, lockfileHash: 'deadbeef' }, null, 2))

  const server = spawnCaptured('npx', ['vite', '--port', port, '--strictPort'])
  let playwright = { output: () => '', child: { exitCode: 127 } }
  let readyLog = ''
  let testWindowLog = ''
  const wallStarted = Date.now()
  try {
    await waitForReady(server)
    readyLog = server.output()
    const testWindowOffset = readyLog.length
    const env = {
      ...process.env,
      GR_CAPTURE_EXTERNAL_SERVER: '1',
      GR_CAPTURE_BASE_URL: `http://127.0.0.1:${port}`,
    }
    playwright = spawnCaptured('npx', [
      'playwright', 'test', 'e2e/beauty-town.spec.ts',
      '--project=desktop-chrome', '--workers=1',
      '-g', 'the day town boots with ground contact',
    ], env)
    await new Promise((resolve) => playwright.child.once('exit', resolve))
    await new Promise((resolve) => setTimeout(resolve, 250))
    testWindowLog = server.output().slice(testWindowOffset)
  } finally {
    await stop(server.child)
  }

  const serverLog = server.output()
  const playwrightLog = playwright.output()
  const armLines = serverLog.split('\n').filter((line) => line.includes('Re-optimizing dependencies because lockfile has changed'))
  const startupOptimizationLines = readyLog.split('\n').filter((line) => optimizationPattern.test(line))
  const testWindowOptimizationLines = testWindowLog.split('\n').filter((line) => optimizationPattern.test(line))
  const after = JSON.parse(readFileSync(metadataPath, 'utf8'))
  const firstTest = playwrightLog.match(/ground contact[^\n]*\((\d+(?:\.\d+)?)(ms|s)\)/)?.slice(1).join(' ') ?? 'unparsed'
  const suite = playwrightLog.match(/1 passed \((\d+(?:\.\d+)?)(ms|s)\)/)?.slice(1).join(' ') ?? 'unparsed'
  const meta = [
    `arm=${arm}`,
    `repetition=${repetition}`,
    `lockfileHash-before=${before.lockfileHash}`,
    `lockfileHash-written=${staleHash ? 'deadbeef' : '<unchanged>'}`,
    `armed=${armLines.length > 0}`,
    `arm-proof=${armLines.join(' | ')}`,
    `first-test-duration=${firstTest}`,
    `suite-duration=${suite}`,
    `wall-seconds=${((Date.now() - wallStarted) / 1000).toFixed(2)}`,
    `rc=${playwright.child.exitCode}`,
    `startup-optimization-lines=${startupOptimizationLines.join(' | ') || 'NONE'}`,
    `test-window-optimization-lines=${testWindowOptimizationLines.join(' | ') || 'NONE'}`,
    `lockfileHash-after=${after.lockfileHash}`,
    `self-healed=${after.lockfileHash === before.lockfileHash}`,
  ].join('\n') + '\n'
  write(`${stem}-server.log`, serverLog)
  write(`${stem}-playwright.txt`, playwrightLog)
  write(`${stem}-meta.txt`, meta)
  console.log(meta.trim())
  return { armed: armLines.length > 0, silent: startupOptimizationLines.length === 0 && testWindowOptimizationLines.length === 0, rc: playwright.child.exitCode }
}

for (let repetition = 1; repetition <= 3; repetition += 1) {
  const result = await run('A', repetition, true)
  if (!result.armed) throw new Error(`Arm A${repetition} did not arm; retry required`)
}

let convergence = 0
do {
  convergence += 1
  var converged = await run('CONVERGENCE', convergence, false)
} while (!converged.silent && convergence < 3)
if (!converged.silent) throw new Error('control did not converge to a silent server')

for (let repetition = 1; repetition <= 3; repetition += 1) {
  const result = await run('B', repetition, false)
  if (!result.silent) throw new Error(`Arm B${repetition} was not silent; retry required`)
}
