import { hasEdge } from './graphUtils.js';

export function solveBruteForce(nodes, edges, startNodeId) {
  const startTime = performance.now();
  const steps = [];
  const MAX_STEPS = 15000;
  let stepsExplored = 0;
  let solution = null;
  let limitExceeded = false;
  
  const nodeIds = nodes.map(n => n.id);
  const startNode = Number(startNodeId);
  const otherNodes = nodeIds.filter(id => id !== startNode);
  
  function permuteAndCheck(arr, memo = []) {
    if (solution || limitExceeded) return;
    
    if (arr.length === 0) {
      const fullPath = [startNode, ...memo];
      checkPermutation(fullPath);
      return;
    }
    
    for (let i = 0; i < arr.length; i++) {
      if (solution || limitExceeded) return;
      const current = arr[i];
      const nextArr = arr.slice(0, i).concat(arr.slice(i + 1));
      permuteAndCheck(nextArr, memo.concat(current));
    }
  }
  
  function checkPermutation(path) {
    if (steps.length >= MAX_STEPS) {
      limitExceeded = true;
      return;
    }
    
    const currentPath = [path[0]];
    steps.push({ type: 'visit', path: [...currentPath], edge: null });
    stepsExplored++;
    
    let valid = true;
    for (let i = 1; i < path.length; i++) {
      if (steps.length >= MAX_STEPS) {
        limitExceeded = true;
        valid = false;
        break;
      }
      
      const u = path[i - 1];
      const v = path[i];
      const ok = hasEdge(u, v, edges);
      
      if (ok) {
        currentPath.push(v);
        steps.push({ type: 'visit', path: [...currentPath], edge: [u, v] });
        stepsExplored++;
      } else {
        steps.push({ type: 'dead_end', path: [...currentPath], edge: [u, v] });
        stepsExplored++;
        valid = false;
        break;
      }
    }
    
    if (valid && currentPath.length === nodes.length) {
      steps.push({ type: 'solution', path: [...currentPath], edge: null });
      solution = currentPath;
      return;
    }
    
    // Backtrack path to reset for next permutation
    while (currentPath.length > 1) {
      if (steps.length >= MAX_STEPS) {
        limitExceeded = true;
        break;
      }
      const v = currentPath.pop();
      const u = currentPath[currentPath.length - 1];
      steps.push({ type: 'backtrack', path: [...currentPath], edge: [u, v] });
      stepsExplored++;
    }
  }
  
  if (nodes.length > 0) {
    if (nodes.length === 1) {
      steps.push({ type: 'solution', path: [startNode], edge: null });
      solution = [startNode];
      stepsExplored++;
    } else {
      permuteAndCheck(otherNodes);
    }
  }
  
  const endTime = performance.now();
  
  return {
    steps,
    solution,
    timeTaken: endTime - startTime,
    stepsExplored,
    limitExceeded
  };
}
