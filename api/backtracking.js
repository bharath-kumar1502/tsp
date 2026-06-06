import { buildAdjList } from './graphUtils.js';

export function solveBacktracking(nodes, edges, startNodeId) {
  // Coerce all IDs to numbers to prevent string vs number type mismatches
  const coercedNodes = nodes.map(n => ({ ...n, id: Number(n.id) }));
  const coercedEdges = edges.map(e => ({ ...e, from: Number(e.from), to: Number(e.to) }));
  const startNode = Number(startNodeId);

  const startTime = performance.now();
  const steps = [];
  const MAX_STEPS = 15000;
  let stepsExplored = 0;
  let limitExceeded = false;

  const adj = buildAdjList(coercedNodes, coercedEdges);
  const path = [startNode];
  const visited = new Set([startNode]);

  const solutions = [];

  // Initial step
  steps.push({ type: 'visit', path: [...path], edge: null });
  stepsExplored++;

  function dfs(u) {
    if (limitExceeded) return false;
    if (steps.length >= MAX_STEPS) {
      limitExceeded = true;
      return false;
    }

    if (path.length === coercedNodes.length) {
      const solutionIndex = steps.length;
      steps.push({ type: 'solution', path: [...path], edge: null });
      solutions.push({ path: [...path], stepIndex: solutionIndex });
      stepsExplored++;
      
      if (solutions.length >= 25) {
        limitExceeded = true;
      }
      return false; // return false to force backtracking and continue searching
    }

    const neighbors = Array.from(adj[u] || []);
    const unvisitedNeighbors = neighbors.filter(v => !visited.has(v));

    if (unvisitedNeighbors.length === 0) {
      steps.push({ type: 'dead_end', path: [...path], edge: null });
      stepsExplored++;
      return false;
    }

    for (const v of unvisitedNeighbors) {
      if (limitExceeded || steps.length >= MAX_STEPS) {
        limitExceeded = true;
        return false;
      }

      visited.add(v);
      path.push(v);
      steps.push({ type: 'visit', path: [...path], edge: [u, v] });
      stepsExplored++;

      dfs(v);

      if (limitExceeded || steps.length >= MAX_STEPS) {
        limitExceeded = true;
        return false;
      }
      visited.delete(v);
      path.pop();
      steps.push({ type: 'backtrack', path: [...path], edge: [u, v] });
      stepsExplored++;
    }

    return false;
  }

  if (coercedNodes.length > 0) {
    if (coercedNodes.length === 1) {
      steps.push({ type: 'solution', path: [startNode], edge: null });
      solutions.push({ path: [startNode], stepIndex: 0 });
    } else {
      dfs(startNode);
    }
  }

  const endTime = performance.now();

  return {
    steps,
    solution: solutions[0]?.path || null,
    solutions,
    timeTaken: endTime - startTime,
    stepsExplored,
    limitExceeded
  };
}
