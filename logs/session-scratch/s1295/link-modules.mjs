import { symlinkSync, existsSync } from 'node:fs'
const src = '/Users/robin/Claude/Projects/Gold Rush/node_modules'
const dst = '/Users/robin/Claude/Projects/gr-s1295-control/node_modules'
if (!existsSync(dst)) symlinkSync(src, dst, 'dir')
console.log('vite present:', existsSync(dst + '/.bin/vite'))
console.log('playwright present:', existsSync(dst + '/.bin/playwright'))
