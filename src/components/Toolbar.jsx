import React from 'react';
import { MousePointer, Share2, MapPin, Eraser, Trash2 } from 'lucide-react';

export default function Toolbar({ activeMode, setActiveMode, onClear }) {
  const tools = [
    {
      id: 'node',
      label: 'Add & Move Node',
      icon: MousePointer,
      description: 'Click empty space to add a city. Drag to reposition.'
    },
    {
      id: 'edge',
      label: 'Add Edge',
      icon: Share2,
      description: 'Click node A, then node B to connect them.'
    },
    {
      id: 'start',
      label: 'Set Start Node',
      icon: MapPin,
      description: 'Click any city to set it as the starting point.'
    },
    {
      id: 'eraser',
      label: 'Eraser',
      icon: Eraser,
      description: 'Click a node or an edge to delete it.'
    }
  ];

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-2xl">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeMode === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => setActiveMode(tool.id)}
            title={`${tool.label}: ${tool.description}`}
            className={`group relative p-3 rounded-lg transition-all duration-300 ${
              isActive
                ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(8,145,178,0.4)] scale-110'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            
            {/* Tooltip */}
            <span className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 ml-1 w-48 rounded bg-slate-900 border border-slate-800 p-2 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl select-none">
              <strong className="block text-slate-100 font-semibold mb-0.5">{tool.label}</strong>
              {tool.description}
            </span>
          </button>
        );
      })}

      <div className="w-full h-px bg-slate-200 my-1" />

      <button
        onClick={onClear}
        title="Clear Graph: Reset the canvas completely"
        className="group relative p-3 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
      >
        <Trash2 className="w-5 h-5" />
        
        <span className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 ml-1 w-32 rounded bg-slate-900 border border-slate-800 p-2 text-xs text-red-350 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl select-none">
          <strong className="block text-red-400 font-semibold mb-0.5">Clear All</strong>
          Delete all nodes and edges.
        </span>
      </button>
    </div>
  );
}
