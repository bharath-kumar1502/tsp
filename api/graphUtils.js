export function buildAdjList(nodes, edges) {
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

export function hasEdge(u, v, edges) {
  return edges.some(edge => 
    (edge.from === u && edge.to === v) || (edge.from === v && edge.to === u)
  );
}
