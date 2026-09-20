import fs from 'node:fs';

const g = JSON.parse(fs.readFileSync('tasks/goals.json', 'utf8'));
let withTaskFile = 0, childless = 0, nodes = 0;
const statuses = {};
const walk = (x) => {
  nodes++;
  const kids = (x.subgoals || []).concat(x.tasks || []);
  if (typeof x.taskFile === 'string') withTaskFile++;
  if (kids.length === 0) {
    childless++;
    statuses[x.status || 'NONE'] = (statuses[x.status || 'NONE'] || 0) + 1;
  }
  for (const c of kids) walk(c);
};
for (const x of g.goals) walk(x);
console.log('total nodes            :', nodes);
console.log('childless (s1309 sense):', childless);
console.log('with taskFile (drain-block-check sense):', withTaskFile);
console.log('childless by status    :', JSON.stringify(statuses, null, 0));
