import React, { useRef, useState } from 'react';

export default function Canvas({
  nodes,
  edges,
  startNode,
  activeMode,
  selectedNodeForEdge,
  setSelectedNodeForEdge,
  animationState,
  onAddNode,
  onDragNode,
  onSetStartNode,
  onEraseNode,
  onEraseEdge,
  onCreateEdge,
  title = "Graph Editor"
}) {
  const svgRef = useRef(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);

  // Determine active states from animationState
  const { path = [], edge: activeEdge = null, type: stepType = null, solutionPath = [] } = animationState || {};

  // Check if an edge is in the current path
  const isEdgeInPath = (u, v) => {
    for (let i = 0; i < path.length - 1; i++) {
      if (
        (path[i] === u && path[i + 1] === v) ||
        (path[i] === v && path[i + 1] === u)
      ) {
        return true;
      }
    }
    return false;
  };

  // Check if an edge is in the solution path
  const isEdgeInSolution = (u, v) => {
    if (!solutionPath || solutionPath.length < 2) return false;
    for (let i = 0; i < solutionPath.length - 1; i++) {
      if (
        (solutionPath[i] === u && solutionPath[i + 1] === v) ||
        (solutionPath[i] === v && solutionPath[i + 1] === u)
      ) {
        return true;
      }
    }
    return false;
  };

  // Check if an edge is the active edge being evaluated
  const isEdgeActive = (u, v) => {
    if (!activeEdge) return false;
    return (
      (activeEdge[0] === u && activeEdge[1] === v) ||
      (activeEdge[0] === v && activeEdge[1] === u)
    );
  };

  // Get edge color and filter
  const getEdgeStyle = (u, v) => {
    const isSol = isEdgeInSolution(u, v);
    const isActive = isEdgeActive(u, v);
    const inPath = isEdgeInPath(u, v);

    if (isSol) {
      return {
        stroke: 'var(--color-bright-green)',
        strokeWidth: 4,
        filter: 'url(#glow-green)',
        strokeDasharray: '0'
      };
    }

    if (isActive) {
      if (stepType === 'visit') {
        return {
          stroke: 'var(--color-bright-cyan)',
          strokeWidth: 4,
          filter: 'url(#glow-cyan)',
          strokeDasharray: '6 4',
          animation: 'dash 1s linear infinite'
        };
      }
      if (stepType === 'backtrack') {
        return {
          stroke: 'var(--color-bright-amber)',
          strokeWidth: 4,
          filter: 'url(#glow-amber)'
        };
      }
      if (stepType === 'dead_end') {
        return {
          stroke: 'var(--color-bright-red)',
          strokeWidth: 4,
          filter: 'url(#glow-red)'
        };
      }
    }

    if (inPath) {
      return {
        stroke: 'var(--color-bright-purple)',
        strokeWidth: 3,
        filter: 'url(#glow-purple)'
      };
    }

    // Default connection
    return {
      stroke: '#cbd5e1',
      strokeWidth: 2,
      strokeDasharray: '0'
    };
  };

  // Get node colors and styling
  const getNodeStyle = (nodeId) => {
    const isStart = startNode === nodeId;
    const isSol = solutionPath.includes(nodeId);
    const inPath = path.includes(nodeId);
    const isCurrent = path.length > 0 && path[path.length - 1] === nodeId;

    let bg = 'fill-white';
    let stroke = 'stroke-slate-350';
    let textFill = 'fill-slate-700';
    let filter = '';
    let r = 20;

    if (isSol) {
      bg = 'fill-emerald-50';
      stroke = 'stroke-bright-green';
      textFill = 'fill-emerald-800';
      filter = 'url(#glow-green)';
    } else if (isCurrent) {
      if (stepType === 'dead_end') {
        bg = 'fill-red-50';
        stroke = 'stroke-bright-red';
        textFill = 'fill-red-800';
        filter = 'url(#glow-red)';
      } else {
        bg = 'fill-cyan-50';
        stroke = 'stroke-bright-cyan';
        textFill = 'fill-cyan-800';
        filter = 'url(#glow-cyan)';
      }
    } else if (inPath) {
      bg = 'fill-purple-50';
      stroke = 'stroke-bright-purple';
      textFill = 'fill-purple-800';
      filter = 'url(#glow-purple)';
    }

    let ringStroke = null;
    if (isStart) {
      ringStroke = 'var(--color-bright-amber)';
    }

    return { bg, stroke, textFill, filter, r, ringStroke };
  };

  // SVG coordinate converter
  const getSVGCoords = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    const x = ((clientX - rect.left) / rect.width) * 800;
    const y = ((clientY - rect.top) / rect.height) * 480;

    return { x, y };
  };

  // Handle pointer down
  const handlePointerDown = (e, targetNodeId = null) => {
    if (e.button !== undefined && e.button !== 0) return;

    if (targetNodeId !== null) {
      e.stopPropagation();
      
      if (activeMode === 'eraser') {
        onEraseNode(targetNodeId);
      } else if (activeMode === 'start') {
        onSetStartNode(targetNodeId);
      } else if (activeMode === 'edge') {
        if (selectedNodeForEdge === null) {
          setSelectedNodeForEdge(targetNodeId);
        } else if (selectedNodeForEdge === targetNodeId) {
          setSelectedNodeForEdge(null);
        } else {
          onCreateEdge(selectedNodeForEdge, targetNodeId);
          setSelectedNodeForEdge(null);
        }
      } else if (activeMode === 'node') {
        setDraggingNodeId(targetNodeId);
        if (svgRef.current) {
          svgRef.current.setPointerCapture(e.pointerId);
        }
      }
    } else {
      if (activeMode === 'node') {
        const { x, y } = getSVGCoords(e);
        if (x > 30 && x < 770 && y > 30 && y < 450) {
          onAddNode(x, y);
        }
      }
      setSelectedNodeForEdge(null);
    }
  };

  const handlePointerMove = (e) => {
    if (draggingNodeId === null || activeMode !== 'node') return;
    const { x, y } = getSVGCoords(e);
    const boundedX = Math.max(25, Math.min(775, x));
    const boundedY = Math.max(25, Math.min(455, y));
    onDragNode(draggingNodeId, boundedX, boundedY);
  };

  const handlePointerUp = (e) => {
    if (draggingNodeId !== null) {
      if (svgRef.current) {
        svgRef.current.releasePointerCapture(e.pointerId);
      }
      setDraggingNodeId(null);
    }
  };

  return (
    <div className="relative flex-1 min-h-[380px] lg:min-h-[480px] rounded-2xl glass-panel overflow-hidden border border-slate-200 shadow-2xl flex flex-col">
      {/* Canvas Title */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
        <span className="text-sm font-semibold tracking-wider text-slate-500 uppercase">{title}</span>
        {path.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Path length:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-cyan-600 font-bold">{path.length}</span>
          </div>
        )}
      </div>

      {/* SVG Workspace */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 480"
        className="w-full flex-1 select-none touch-none bg-white cursor-crosshair"
        onPointerDown={(e) => handlePointerDown(e)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="1" />
          </pattern>

          {/* Glowing filter effects */}
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <style>
            {`
              @keyframes dash {
                to {
                  stroke-dashoffset: -20;
                }
              }
            `}
          </style>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* --- EDGES --- */}
        {edges.map((edge) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);

          if (!fromNode || !toNode) return null;

          const edgeStyle = getEdgeStyle(edge.from, edge.to);

          return (
            <g key={edge.id} className="cursor-pointer group">
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="transparent"
                strokeWidth={12}
                onClick={(e) => {
                  if (activeMode === 'eraser') {
                    e.stopPropagation();
                    onEraseEdge(edge.id);
                  }
                }}
              />
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                style={edgeStyle}
                className="transition-all duration-300"
              />
            </g>
          );
        })}

        {/* --- NODES --- */}
        {nodes.map((node) => {
          const { bg, stroke, textFill, filter, r, ringStroke } = getNodeStyle(node.id);
          const isSelected = selectedNodeForEdge === node.id;
          const isStartNode = startNode === node.id;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className={`cursor-pointer ${draggingNodeId === node.id ? 'scale-105' : 'hover:scale-[1.03]'} transition-transform duration-150`}
              onPointerDown={(e) => handlePointerDown(e, node.id)}
            >
              {/* Active selection ring for Edge mode */}
              {isSelected && (
                <circle
                  r={r + 8}
                  fill="none"
                  stroke="var(--color-bright-amber)"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  className="animate-spin"
                  style={{ animationDuration: '6s' }}
                />
              )}

              {/* Start node outer ring */}
              {isStartNode && !isSelected && (
                <circle
                  r={r + 6}
                  fill="none"
                  stroke={ringStroke}
                  strokeWidth={2}
                  filter="url(#glow-amber)"
                  className="animate-pulse"
                />
              )}

              {/* Core node circle */}
              <circle
                r={r}
                className={`${bg} ${stroke} border-2 transition-all duration-300`}
                strokeWidth={2.5}
                filter={filter}
              />

              {/* Node text label */}
              <text
                dy=".35em"
                textAnchor="middle"
                className={`${textFill} text-[11px] font-bold select-none`}
              >
                {node.name !== undefined ? node.name : node.id}
              </text>

              {/* "START" badge below starting node */}
              {isStartNode && (
                <g transform="translate(0, 32)">
                  <rect
                    x="-18"
                    y="-8"
                    width="36"
                    height="14"
                    rx="3"
                    fill="#d97706"
                    className="shadow-sm"
                  />
                  <text
                    textAnchor="middle"
                    className="fill-white font-black text-[9px] select-none uppercase tracking-wide"
                    y="2"
                  >
                    Start
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Empty canvas overlay */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/70 pointer-events-none select-none">
          <p className="text-cyan-700 font-semibold text-lg mb-1">Canvas is Empty</p>
          <p className="text-slate-500 text-sm max-w-sm">
            Select the <strong className="text-slate-600 font-bold">Add & Move Node</strong> tool to place cities, then connect them using the <strong className="text-slate-600 font-bold">Add Edge</strong> tool.
          </p>
        </div>
      )}
    </div>
  );
}
