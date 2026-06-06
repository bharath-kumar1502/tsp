export const PRESETS = {
  custom: {
    name: 'Custom (Blank)',
    nodes: [],
    edges: [],
    startNode: null
  },
  petersen: {
    name: 'Petersen Graph',
    getGraph: () => {
      const nodes = [];
      const edges = [];
      const cx = 400;
      const cy = 230;
      const rOuter = 150;
      const rInner = 75;

      // Generate nodes
      // Outer 5 nodes
      for (let i = 0; i < 5; i++) {
        const theta = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        nodes.push({
          id: i,
          name: `O${i}`,
          x: cx + rOuter * Math.cos(theta),
          y: cy + rOuter * Math.sin(theta)
        });
      }

      // Inner 5 nodes
      for (let i = 0; i < 5; i++) {
        const theta = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        nodes.push({
          id: i + 5,
          name: `I${i}`,
          x: cx + rInner * Math.cos(theta),
          y: cy + rInner * Math.sin(theta)
        });
      }

      // Generate edges
      // Outer cycle
      for (let i = 0; i < 5; i++) {
        edges.push({ id: `e-o-${i}`, from: i, to: (i + 1) % 5 });
      }

      // Inner star
      edges.push({ id: 'e-i-1', from: 5, to: 7 });
      edges.push({ id: 'e-i-2', from: 7, to: 9 });
      edges.push({ id: 'e-i-3', from: 9, to: 6 });
      edges.push({ id: 'e-i-4', from: 6, to: 8 });
      edges.push({ id: 'e-i-5', from: 8, to: 5 });

      // Connecting outer and inner
      for (let i = 0; i < 5; i++) {
        edges.push({ id: `e-c-${i}`, from: i, to: i + 5 });
      }

      return { nodes, edges, startNode: 0 };
    }
  },
  cycle: {
    name: 'Cycle Graph (C6)',
    getGraph: () => {
      const nodes = [];
      const edges = [];
      const cx = 400;
      const cy = 230;
      const r = 140;

      for (let i = 0; i < 6; i++) {
        const theta = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        nodes.push({
          id: i,
          name: `${i}`,
          x: cx + r * Math.cos(theta),
          y: cy + r * Math.sin(theta)
        });
        edges.push({
          id: `e-${i}`,
          from: i,
          to: (i + 1) % 6
        });
      }

      return { nodes, edges, startNode: 0 };
    }
  },
  complete: {
    name: 'Complete Graph (K5)',
    getGraph: () => {
      const nodes = [];
      const edges = [];
      const cx = 400;
      const cy = 230;
      const r = 140;
      const n = 5;

      for (let i = 0; i < n; i++) {
        const theta = (i * 2 * Math.PI) / n - Math.PI / 2;
        nodes.push({
          id: i,
          name: `${i}`,
          x: cx + r * Math.cos(theta),
          y: cy + r * Math.sin(theta)
        });
      }

      let edgeIdCounter = 0;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          edges.push({
            id: `e-${edgeIdCounter++}`,
            from: i,
            to: j
          });
        }
      }

      return { nodes, edges, startNode: 0 };
    }
  }
};
