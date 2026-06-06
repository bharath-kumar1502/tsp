// Shared graph utilities for client-side fallback
function buildAdjList(nodes, edges) {
  const adj = {};
  for (const node of nodes) {
    adj[node.id] = new Set();
  }
  for (const edge of edges) {
    const { from, to } = edge;
    if (adj[from] && adj[to]) {
      adj[from].add(to);
      adj[to].add(from);
    }
  }
  return adj;
}

function hasEdge(u, v, edges) {
  return edges.some(edge => 
    (edge.from === u && edge.to === v) || (edge.from === v && edge.to === u)
  );
}

export function solveBruteForce(nodes, edges, startNodeId) {
  // Coerce all IDs to numbers to prevent string vs number type mismatches
  const coercedNodes = nodes.map(n => ({ ...n, id: Number(n.id) }));
  const coercedEdges = edges.map(e => ({ ...e, from: Number(e.from), to: Number(e.to) }));
  const startNode = Number(startNodeId);

  const startTime = performance.now();
  const steps = [];
  const MAX_STEPS = 15000;
  let stepsExplored = 0;
  let limitExceeded = false;
  
  const nodeIds = coercedNodes.map(n => n.id);
  const otherNodes = nodeIds.filter(id => id !== startNode);

  const solutions = [];
  
  function permuteAndCheck(arr, memo = []) {
    if (limitExceeded) return;
    
    if (arr.length === 0) {
      const fullPath = [startNode, ...memo];
      checkPermutation(fullPath);
      return;
    }
    
    for (let i = 0; i < arr.length; i++) {
      if (limitExceeded) return;
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
      const ok = hasEdge(u, v, coercedEdges);
      
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
    
    if (valid && currentPath.length === coercedNodes.length) {
      const solutionIndex = steps.length;
      steps.push({ type: 'solution', path: [...currentPath], edge: null });
      solutions.push({ path: [...currentPath], stepIndex: solutionIndex });
      if (solutions.length >= 25) {
        limitExceeded = true;
      }
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
  
  if (coercedNodes.length > 0) {
    if (coercedNodes.length === 1) {
      steps.push({ type: 'solution', path: [startNode], edge: null });
      solutions.push({ path: [startNode], stepIndex: 0 });
      stepsExplored++;
    } else {
      permuteAndCheck(otherNodes);
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
