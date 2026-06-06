import express from 'express';
import cors from 'cors';
import { solveBruteForce } from './algorithms/bruteforce.js';
import { solveBacktracking } from './algorithms/backtracking.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/solve', (req, res) => {
  const { nodes, edges, startNode, algorithm } = req.body;
  
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return res.status(400).json({ error: 'Nodes array is required and cannot be empty.' });
  }
  if (startNode === undefined || startNode === null) {
    return res.status(400).json({ error: 'Start node is required.' });
  }
  
  try {
    if (algorithm === 'bruteforce') {
      const result = solveBruteForce(nodes, edges, startNode);
      return res.json({ ...result, algorithm });
    } else if (algorithm === 'backtracking') {
      const result = solveBacktracking(nodes, edges, startNode);
      return res.json({ ...result, algorithm });
    } else if (algorithm === 'both') {
      const bruteforce = solveBruteForce(nodes, edges, startNode);
      const backtracking = solveBacktracking(nodes, edges, startNode);
      return res.json({
        bruteforce,
        backtracking,
        algorithm
      });
    } else {
      return res.status(400).json({ error: `Invalid algorithm: ${algorithm}` });
    }
  } catch (error) {
    console.error('Error running solver:', error);
    return res.status(500).json({ error: 'Internal server error while running solver.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
