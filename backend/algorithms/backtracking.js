import { buildAdjList } from './graphUtils.js';

export function solveBacktracking(nodes, edges, startNodeId) {
  const startTime = performance.now();
  const steps = [];
  const MAX_STEPS = 15000;
  let stepsExplored = 0;
  let solution = null;
  let limitExceeded = false;

  const startNode = Number(startNodeId);
  const adj = buildAdjList(nodes, edges);
  const path = [startNode];
  const visited = new Set([startNode]);

  // Initial step
  steps.push({ type: 'visit', path: [...path], edge: null });
  stepsExplored++;

  function dfs(u) {
    if (solution || limitExceeded) return false;
    if (steps.length >= MAX_STEPS) {
      limitExceeded = true;
      return false;
    }

    if (path.length === nodes.length) {
      steps.push({ type: 'solution', path: [...path], edge: null });
      solution = [...path];
      stepsExplored++;
      return true;
    }

    const neighbors = Array.from(adj[u] || []);
    const unvisitedNeighbors = neighbors.filter(v => !visited.has(v));

    if (unvisitedNeighbors.length === 0) {
      // No unvisited neighbors, but we haven't visited all nodes -> Dead end
      steps.push({ type: 'dead_end', path: [...path], edge: null });
      stepsExplored++;
      return false;
    }

    for (const v of unvisitedNeighbors) {
      if (steps.length >= MAX_STEPS) {
        limitExceeded = true;
        return false;
      }

      visited.add(v);
      path.push(v);
      steps.push({ type: 'visit', path: [...path], edge: [u, v] });
      stepsExplored++;

      if (dfs(v)) {
        return true;
      }

      // Backtrack
      if (steps.length >= MAX_STEPS) {
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

  if (nodes.length > 0) {
    if (nodes.length === 1) {
      steps.push({ type: 'solution', path: [startNode], edge: null });
      solution = [startNode];
    } else {
      dfs(startNode);
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
