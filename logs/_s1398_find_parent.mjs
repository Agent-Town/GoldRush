import fs from 'node:fs';
const g = JSON.parse(fs.readFileSync('tasks/goals.json', 'utf8'));

for (const goal of g.goals) {
  for (const leaf of goal.tasks ?? []) {
    if (leaf.id === 'e1-headless-the-claim') console.log('ROOT-TASKS of goal:', goal.id, goal.title);
  }
  for (const sub of goal.subgoals ?? []) {
    for (const leaf of sub.tasks ?? []) {
      if (['e1-headless-the-claim', 'gr-sim-headless-contract-runner'].includes(leaf.id) ||
          String(leaf.id).startsWith('e1-headless')) {
        console.log('goal=', goal.id, '| subgoal=', sub.id, '|', sub.title.slice(0, 90));
        console.log('   leaf:', leaf.id, 'status=', leaf.status, 'lane=', leaf.lane ?? '(none)');
      }
    }
  }
}
