import fs from 'fs';
// args: <statusPath> <newLine1File> <archiveLabel>
const [statusPath, newLine1File, archiveLabel] = process.argv.slice(2);
const status = fs.readFileSync(statusPath, 'utf8');
const nl = status.indexOf('\n');
const oldLine1 = status.slice(0, nl);
const rest = status.slice(nl + 1); // everything after line-1 (starts at line-2)
const newLine1 = fs.readFileSync(newLine1File, 'utf8').replace(/\n+$/, '');
const bullet = `- **${archiveLabel} (line-1 archive):** ${oldLine1}`;
const out = `${newLine1}\n${bullet}\n${rest}`;
fs.writeFileSync(statusPath, out);
console.log('rewrote line-1; archived old as:', archiveLabel);
