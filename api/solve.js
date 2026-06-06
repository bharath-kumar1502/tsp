import { solveBruteForce } from './bruteforce.js';
import { solveBacktracking } from './backtracking.js';

export default async function handler(req, res) {
  // Set CORS headers for flexbility
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
      return res.status(200).json({ ...result, algorithm });
    } else if (algorithm === 'backtracking') {
      const result = solveBacktracking(nodes, edges, startNode);
      return res.status(200).json({ ...result, algorithm });
    } else if (algorithm === 'both') {
      const bruteforce = solveBruteForce(nodes, edges, startNode);
      const backtracking = solveBacktracking(nodes, edges, startNode);
      return res.status(200).json({
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
}
