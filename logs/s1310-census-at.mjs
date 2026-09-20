import { execSync } from 'node:child_process';

const count = (ref) => {
  const raw = execSync('git show ' + ref + ':tasks/goals.json', { encoding: 'utf8', maxBuffer: 1 << 28 });
  const g = JSON.parse(raw);
  let childless = 0;
  const walk = (x) => {
    const kids = (x.subgoals || []).concat(x.tasks || []);
    if (kids.length === 0) childless++;
    for (const c of kids) walk(c);
  };
  for (const x of g.goals) walk(x);
  return childless;
};

for (const ref of process.argv.slice(2)) {
  const s = execSync('git log -1 --format=%s ' + ref, { encoding: 'utf8' }).trim().slice(0, 52);
  console.log(String(count(ref)).padStart(5), ref, s);
}
