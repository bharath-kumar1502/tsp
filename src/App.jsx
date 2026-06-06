import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Network, Activity, Info } from 'lucide-react';

import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import ControlPanel from './components/ControlPanel';
import StatsPanel from './components/StatsPanel';

import { PRESETS } from './utils/presets';
import { solveBruteForce, solveBacktracking } from './utils/solvers';

export default function App() {
  // Graph States
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startNode, setStartNode] = useState(null);
  const [nodeIdCounter, setNodeIdCounter] = useState(0);

  // Editor States
  const [activeMode, setActiveMode] = useState('node'); // 'node' | 'edge' | 'start' | 'eraser'
  const [selectedNodeForEdge, setSelectedNodeForEdge] = useState(null);

  // Visualizer States
  const [selectedAlgo, setSelectedAlgo] = useState('backtracking'); // 'bruteforce' | 'backtracking' | 'both'
  const [selectedPreset, setSelectedPreset] = useState('petersen');
  const [speed, setSpeed] = useState(240); // delay speed in ms
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Solve Results
  const [steps, setSteps] = useState(null);
  const [dualSteps, setDualSteps] = useState(null);
  const [stats, setStats] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'online' | 'fallback'

  // Load default Petersen preset on mount
  useEffect(() => {
    handleSelectPreset('petersen');
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: [{ id: 0, x: 0, y: 0 }], edges: [], startNode: 0, algorithm: 'backtracking' })
      });
      if (response.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('fallback');
      }
    } catch {
      setApiStatus('fallback');
    }
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSteps(null);
    setDualSteps(null);
    setStats(null);
  };

  const handleSelectPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    resetAnimation();
    
    const preset = PRESETS[presetKey];
    if (presetKey === 'custom') {
      setNodes([]);
      setEdges([]);
      setStartNode(null);
      setNodeIdCounter(0);
    } else {
      const graph = preset.getGraph();
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setStartNode(graph.startNode);
      const maxId = Math.max(...graph.nodes.map(n => n.id), -1);
      setNodeIdCounter(maxId + 1);
    }
  };

  // Canvas Actions
  const handleAddNode = (x, y) => {
    resetAnimation();
    const newId = nodeIdCounter;
    const newNode = {
      id: newId,
      name: `${newId}`,
      x,
      y
    };
    setNodes(prev => [...prev, newNode]);
    setNodeIdCounter(prev => prev + 1);
    if (startNode === null) {
      setStartNode(newId);
    }
  };

  const handleDragNode = (id, x, y) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  };

  const handleSetStartNode = (id) => {
    resetAnimation();
    setStartNode(id);
  };

  const handleEraseNode = (id) => {
    resetAnimation();
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    if (startNode === id) {
      setStartNode(null);
    }
  };

  const handleEraseEdge = (edgeId) => {
    resetAnimation();
    setEdges(prev => prev.filter(e => e.id !== edgeId));
  };

  const handleCreateEdge = (from, to) => {
    if (from === to) return;
    const exists = edges.some(e => 
      (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    if (exists) return;
    
    resetAnimation();
    const newEdge = {
      id: `e-${from}-${to}`,
      from,
      to
    };
    setEdges(prev => [...prev, newEdge]);
  };

  const handleClearGraph = () => {
    handleSelectPreset('custom');
  };

  const solveGraph = async () => {
    if (nodes.length === 0) return null;
    setIsLoading(true);
    
    const targetStart = startNode !== null ? startNode : nodes[0].id;
    if (startNode === null) {
      setStartNode(targetStart);
    }

    const payload = {
      nodes: nodes.map(n => ({ id: n.id, x: n.x, y: n.y })),
      edges: edges.map(e => ({ from: e.from, to: e.to })),
      startNode: targetStart,
      algorithm: selectedAlgo
    };

    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('API server returned error');
      }
      
      const data = await response.json();
      setApiStatus('online');
      
      if (selectedAlgo === 'both') {
        setDualSteps(data);
        setStats({
          bruteforce: data.bruteforce,
          backtracking: data.backtracking
        });
      } else {
        setSteps(data.steps);
        setStats({
          [selectedAlgo]: data
        });
      }
      
      setCurrentStepIndex(0);
      setIsLoading(false);
      return data;
    } catch (error) {
      console.warn('API connection failed, using local browser-based solver fallback:', error);
      setApiStatus('fallback');
      
      let data;
      if (selectedAlgo === 'bruteforce') {
        data = solveBruteForce(payload.nodes, payload.edges, payload.startNode);
        setSteps(data.steps);
        setStats({ bruteforce: data });
      } else if (selectedAlgo === 'backtracking') {
        data = solveBacktracking(payload.nodes, payload.edges, payload.startNode);
        setSteps(data.steps);
        setStats({ backtracking: data });
      } else {
        const bf = solveBruteForce(payload.nodes, payload.edges, payload.startNode);
        const bt = solveBacktracking(payload.nodes, payload.edges, payload.startNode);
        data = { bruteforce: bf, backtracking: bt, algorithm: 'both' };
        setDualSteps(data);
        setStats({ bruteforce: bf, backtracking: bt });
      }
      
      setCurrentStepIndex(0);
      setIsLoading(false);
      return data;
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      let currentData = selectedAlgo === 'both' ? dualSteps : steps;
      if (currentData === null) {
        currentData = await solveGraph();
        if (!currentData) return;
      }
      
      const total = selectedAlgo === 'both'
        ? Math.max(currentData?.bruteforce?.steps?.length || 0, currentData?.backtracking?.steps?.length || 0)
        : currentData?.steps?.length || currentData?.length || 0;
        
      if (currentStepIndex >= total - 1) {
        setCurrentStepIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleStepForward = async (exactStep = null) => {
    if (isPlaying) return;
    
    let currentData = selectedAlgo === 'both' ? dualSteps : steps;
    if (currentData === null) {
      currentData = await solveGraph();
      if (!currentData) return;
    }

    const total = selectedAlgo === 'both'
      ? Math.max(currentData?.bruteforce?.steps?.length || 0, currentData?.backtracking?.steps?.length || 0)
      : currentData?.steps?.length || currentData?.length || 0;

    if (exactStep !== null && typeof exactStep === 'number') {
      setCurrentStepIndex(exactStep);
    } else {
      setCurrentStepIndex(prev => {
        if (prev >= total - 1) {
          triggerConfettiIfSolved();
          return prev;
        }
        return prev + 1;
      });
    }
  };

  const handleStepBackward = () => {
    if (isPlaying) return;
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  // Animation playback loop timer
  useEffect(() => {
    if (!isPlaying) return;

    // Wait for step trace data to load
    if (selectedAlgo === 'both' && !dualSteps) return;
    if (selectedAlgo !== 'both' && !steps) return;

    const total = selectedAlgo === 'both'
      ? Math.max(dualSteps?.bruteforce?.steps?.length || 0, dualSteps?.backtracking?.steps?.length || 0)
      : steps?.length || 0;

    if (currentStepIndex >= total - 1) {
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= total - 1) {
          setIsPlaying(false);
          triggerConfettiIfSolved();
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, selectedAlgo, steps, dualSteps]);


  const triggerConfettiIfSolved = () => {
    let isSolved = false;
    if (selectedAlgo === 'both') {
      isSolved = !!(dualSteps?.bruteforce?.solution || dualSteps?.backtracking?.solution);
    } else {
      const stepsList = steps || [];
      isSolved = stepsList[stepsList.length - 1]?.type === 'solution';
    }
    
    if (isSolved) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const totalSteps = selectedAlgo === 'both'
    ? Math.max(dualSteps?.bruteforce?.steps?.length || 0, dualSteps?.backtracking?.steps?.length || 0)
    : steps?.length || 0;

  const getAnimationStateAtStep = (stepsList, index, solution) => {
    if (!stepsList || stepsList.length === 0) {
      return { path: [], edge: null, type: null, solutionPath: [] };
    }
    const stepIdx = Math.min(index, stepsList.length - 1);
    const currentStep = stepsList[stepIdx];
    const isLast = index >= stepsList.length - 1;
    const isSolved = stepsList[stepsList.length - 1]?.type === 'solution';

    return {
      path: currentStep?.path || [],
      edge: currentStep?.edge || null,
      type: currentStep?.type || null,
      solutionPath: (isLast && isSolved) ? stepsList[stepsList.length - 1].path : []
    };
  };

  const getAnimationState = (algoName) => {
    if (selectedAlgo === 'both') {
      if (!dualSteps) return { path: [], edge: null, type: null, solutionPath: [] };
      const stepsList = dualSteps[algoName]?.steps || [];
      const solution = dualSteps[algoName]?.solution || null;
      return getAnimationStateAtStep(stepsList, currentStepIndex, solution);
    } else {
      if (selectedAlgo !== algoName || !steps) return { path: [], edge: null, type: null, solutionPath: [] };
      const solution = stats?.[selectedAlgo]?.solution || null;
      return getAnimationStateAtStep(steps, currentStepIndex, solution);
    }
  };

  const isSolutionFound = () => {
    if (selectedAlgo === 'both') {
      if (!dualSteps) return null;
      return !!(dualSteps.bruteforce.solution || dualSteps.backtracking.solution);
    } else {
      if (!stats || !stats[selectedAlgo]) return null;
      return !!stats[selectedAlgo].solution;
    }
  };

  const getActiveStepData = () => {
    if (selectedAlgo === 'both') {
      if (!dualSteps) return null;
      const btStep = dualSteps.backtracking.steps[Math.min(currentStepIndex, dualSteps.backtracking.steps.length - 1)];
      return btStep;
    } else {
      if (!steps) return null;
      return steps[Math.min(currentStepIndex, steps.length - 1)];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* HEADER NAVBAR */}
      <header className="px-6 py-4 bg-white/90 border-b border-slate-200 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 shadow-[0_0_12px_rgba(124,58,237,0.2)]">
            <Network className="w-6 h-6 text-white font-black" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-purple-600">
              HAMILTONIAN PATH VISUALIZER
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              Brute Force vs Backtracking (DFS)
            </p>
          </div>
        </div>

        {/* API STATUS BADGE */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            apiStatus === 'online'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
              : apiStatus === 'fallback'
              ? 'bg-amber-50 border-amber-200 text-amber-700 font-bold'
              : 'bg-slate-100 border-slate-200 text-slate-500 animate-pulse'
          }`}>
            <Activity className="w-3.5 h-3.5" />
            <span className="capitalize">
              {apiStatus === 'online' ? 'Solver API: Online' : apiStatus === 'fallback' ? 'Solver: Client Fallback' : 'Checking solver status...'}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
        
        {/* LEFT/CENTER AREA: GRAPH CANVAS */}
        <div className="flex-1 flex flex-col gap-6 relative">
          
          <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-1">
            <div className="relative flex-1 flex">
              <Toolbar
                activeMode={isPlaying ? 'view' : activeMode}
                setActiveMode={setActiveMode}
                onClear={handleClearGraph}
              />
              
              {selectedAlgo === 'both' ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full pl-20">
                  <Canvas
                    title="Brute Force Solver"
                    nodes={nodes}
                    edges={edges}
                    startNode={startNode}
                    activeMode={isPlaying ? 'view' : activeMode}
                    selectedNodeForEdge={selectedNodeForEdge}
                    setSelectedNodeForEdge={setSelectedNodeForEdge}
                    animationState={getAnimationState('bruteforce')}
                    onAddNode={handleAddNode}
                    onDragNode={handleDragNode}
                    onSetStartNode={handleSetStartNode}
                    onEraseNode={handleEraseNode}
                    onEraseEdge={handleEraseEdge}
                    onCreateEdge={handleCreateEdge}
                  />

                  <Canvas
                    title="Backtracking Solver (DFS)"
                    nodes={nodes}
                    edges={edges}
                    startNode={startNode}
                    activeMode={isPlaying ? 'view' : activeMode}
                    selectedNodeForEdge={selectedNodeForEdge}
                    setSelectedNodeForEdge={setSelectedNodeForEdge}
                    animationState={getAnimationState('backtracking')}
                    onAddNode={handleAddNode}
                    onDragNode={handleDragNode}
                    onSetStartNode={handleSetStartNode}
                    onEraseNode={handleEraseNode}
                    onEraseEdge={handleEraseEdge}
                    onCreateEdge={handleCreateEdge}
                  />
                </div>
              ) : (
                <div className="w-full pl-20 flex">
                  <Canvas
                    title={selectedAlgo === 'bruteforce' ? 'Brute Force Visualizer' : 'Backtracking (DFS) Visualizer'}
                    nodes={nodes}
                    edges={edges}
                    startNode={startNode}
                    activeMode={isPlaying ? 'view' : activeMode}
                    selectedNodeForEdge={selectedNodeForEdge}
                    setSelectedNodeForEdge={setSelectedNodeForEdge}
                    animationState={getAnimationState(selectedAlgo)}
                    onAddNode={handleAddNode}
                    onDragNode={handleDragNode}
                    onSetStartNode={handleSetStartNode}
                    onEraseNode={handleEraseNode}
                    onEraseEdge={handleEraseEdge}
                    onCreateEdge={handleCreateEdge}
                  />
                </div>
              )}

              {/* Solver Loader Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-30 flex flex-col items-center justify-center rounded-2xl border border-slate-200">
                  <div className="w-12 h-12 rounded-full border-4 border-cyan-600/20 border-t-cyan-600 animate-spin mb-4" />
                  <p className="text-cyan-700 font-bold tracking-wider uppercase text-xs">Running Algorithms...</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Informational Tooltip Banner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-650 shadow-md text-xs flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-extrabold text-slate-800">Hamiltonian Path Definition</p>
              <p>
                A Hamiltonian path is a path in an undirected or directed graph that visits each vertex **exactly once**. Finding such a path is an **NP-complete** problem.
              </p>
              <div className="flex gap-4 mt-2 font-mono text-[10px] flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-650" /> Current Search Path</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cyan-600" /> Active Evaluation Link</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-600" /> Backtracking State</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-600" /> Dead End Hit</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-600" /> Hamiltonian Solution</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT AREA: CONTROLS & STATS PANEL */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          <ControlPanel
            selectedAlgo={selectedAlgo}
            setSelectedAlgo={setSelectedAlgo}
            selectedPreset={selectedPreset}
            onSelectPreset={handleSelectPreset}
            speed={speed}
            setSpeed={setSpeed}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onReset={handleReset}
            currentStep={currentStepIndex}
            totalSteps={totalSteps}
            disabled={nodes.length === 0}
          />

          <StatsPanel
            selectedAlgo={selectedAlgo}
            stats={stats}
            currentStepData={getActiveStepData()}
            solutionFound={isSolutionFound()}
          />
        </div>

      </main>
    </div>
  );
}
