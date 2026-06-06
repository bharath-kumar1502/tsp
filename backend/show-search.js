import { solveBacktracking } from './algorithms/backtracking.js';

// Define Petersen Graph nodes
const nodes = [];
for (let i = 0; i < 5; i++) {
  nodes.push({ id: i, name: `O${i}` });
}
for (let i = 0; i < 5; i++) {
  nodes.push({ id: i + 5, name: `I${i}` });
}

// Define Petersen Graph edges
const edges = [
  { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 0 },
  { from: 5, to: 7 }, { from: 7, to: 9 }, { from: 9, to: 6 }, { from: 6, to: 8 }, { from: 8, to: 5 },
  { from: 0, to: 5 }, { from: 1, to: 6 }, { from: 2, to: 7 }, { from: 3, to: 8 }, { from: 4, to: 9 }
];

const result = solveBacktracking(nodes, edges, 0);
const steps = result.steps;

async function run() {
  console.log('=== BACKTRACKING SEARCH EXPLORATION ===');
  console.log('Target: Petersen Graph (10 Nodes, 15 Edges)');
  console.log('Start Node: O0 (Outer top vertex)\n');
  
  // Show first 45 steps with delay to simulate animation
  for (let i = 0; i < Math.min(steps.length, 45); i++) {
    const step = steps[i];
    const pathStr = step.path.map(id => id < 5 ? `O${id}` : `I${id - 5}`).join(' ➔ ');
    
    let label = 'VISIT';
    if (step.type === 'dead_end') label = '❌ DEAD END';
    else if (step.type === 'backtrack') label = '↩️ BACKTRACK';
    else if (step.type === 'solution') label = '🏆 SOLUTION';
    else if (step.type === 'visit') label = '➔ VISIT';

    console.log(`[Step ${(i+1).toString().padStart(2, '0')}/${steps.length}] ${label.padEnd(14)} | [${pathStr}]`);
    await new Promise(r => setTimeout(r, 100));
  }
  
  if (steps.length > 45) {
    console.log('\n... [Search continues in background] ...\n');
    const finalStep = steps[steps.length - 1];
    const finalPathStr = finalStep.path.map(id => id < 5 ? `O${id}` : `I${id - 5}`).join(' ➔ ');
    console.log(`[Step ${steps.length}/${steps.length}] 🏆 SOLUTION FOUND | [${finalPathStr}]`);
  }
}

run();
