import { solveBruteForce } from './algorithms/bruteforce.js';
import { solveBacktracking } from './algorithms/backtracking.js';

const testNodes = [
  { id: 0, x: 100, y: 100 },
  { id: 1, x: 200, y: 100 },
  { id: 2, x: 200, y: 200 },
  { id: 3, x: 100, y: 200 }
];

const testEdges = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 0 }
];

console.log('--- Testing Brute Force Solver ---');
const bfResult = solveBruteForce(testNodes, testEdges, 0);
console.log('Solution:', bfResult.solution);
console.log('Steps Count:', bfResult.steps.length);
console.log('Time Taken (ms):', bfResult.timeTaken);

console.log('\n--- Testing Backtracking Solver ---');
const btResult = solveBacktracking(testNodes, testEdges, 0);
console.log('Solution:', btResult.solution);
console.log('Steps Count:', btResult.steps.length);
console.log('Time Taken (ms):', btResult.timeTaken);
