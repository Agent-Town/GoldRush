#!/usr/bin/env node
// s1393 scratch: apply e676addf as a PATCH into the detached gate worktree.
import { execFileSync } from 'node:child_process';
const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const GATE = ROOT + '/gate-s1393';
const patch = execFileSync('git', ['-C', ROOT, 'show', 'e676addf'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
execFileSync('git', ['-C', GATE, 'apply', '--index', '-'], { input: patch, stdio: ['pipe', 'inherit', 'inherit'] });
console.log('applied. gate worktree status:');
console.log(execFileSync('git', ['-C', GATE, 'status', '--short'], { encoding: 'utf8' }));
console.log('staged diffstat vs HEAD:');
console.log(execFileSync('git', ['-C', GATE, 'diff', '--cached', '--stat'], { encoding: 'utf8' }));
