import React from 'react';
import { Award, Timer, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function StatsPanel({
  selectedAlgo,
  stats,
  currentStepData,
  solutionFound,
  currentStep,
  onSelectSolution
}) {
  const { bruteforce, backtracking } = stats || {};

  const formatTime = (time) => {
    if (time === undefined || time === null) return 'N/A';
    return `${time.toFixed(3)} ms`;
  };

  const renderComparisonChart = () => {
    if (!bruteforce || !backtracking) return null;

    const bfSteps = bruteforce.stepsExplored || 1;
    const btSteps = backtracking.stepsExplored || 1;
    const maxSteps = Math.max(bfSteps, btSteps);

    const bfPct = (bfSteps / maxSteps) * 100;
    const btPct = (btSteps / maxSteps) * 100;

    const ratio = bfSteps / btSteps;
    const isBtBetter = ratio > 1;

    return (
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-bold">Search Efficiency Comparison</span>
        
        <div className="flex flex-col gap-3 pt-2">
          {/* Brute Force bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-pink-600 font-bold">Brute Force</span>
              <span className="text-slate-600 font-bold">{bfSteps.toLocaleString()} steps</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(219,39,119,0.2)]"
                style={{ width: `${Math.max(3, bfPct)}%` }}
              />
            </div>
          </div>

          {/* Backtracking bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-cyan-700 font-bold">Backtracking</span>
              <span className="text-slate-600 font-bold">{btSteps.toLocaleString()} steps</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(8,145,178,0.2)]"
                style={{ width: `${Math.max(3, btPct)}%` }}
              />
            </div>
          </div>
        </div>

        {isBtBetter && (
          <div className="mt-2 text-xs text-slate-600 border-t border-slate-200 pt-2 flex items-center gap-1.5 font-medium">
            <Award className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>
              Backtracking explored <strong className="text-green-600 font-extrabold">{ratio.toFixed(1)}x fewer</strong> states than Brute Force!
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderSingleStats = (name, data) => {
    if (!data) return null;
    const { stepsExplored, timeTaken, limitExceeded, solution, solutions = [] } = data;

    return (
      <div className="flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
          {/* Card 1: Time Taken */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600">
              <Timer className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Time Taken</span>
              <span className="text-sm font-mono font-extrabold text-slate-800">{formatTime(timeTaken)}</span>
            </div>
          </div>

          {/* Card 2: Steps Explored */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-650">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Steps Explored</span>
              <span className="text-sm font-mono font-extrabold text-slate-800">{stepsExplored?.toLocaleString()}</span>
            </div>
          </div>

          {/* Card 3: Solution Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${
              solution
                ? 'bg-emerald-50 border-emerald-200 text-emerald-650'
                : 'bg-red-50 border-red-200 text-red-650'
            }`}>
              {solution ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hamiltonian Path</span>
              <span className={`text-xs font-black ${solution ? 'text-emerald-600' : 'text-red-650'}`}>
                {solution ? 'Path Exists' : 'No Path Found'}
              </span>
            </div>
          </div>

          {/* Card 4: Step Limit Alert */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${
              limitExceeded
                ? 'bg-amber-50 border-amber-200 text-amber-600 animate-pulse'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Search Limit</span>
              <span className={`text-xs font-black ${limitExceeded ? 'text-amber-600' : 'text-slate-400'}`}>
                {limitExceeded ? 'Truncated (15k)' : 'Complete Search'}
              </span>
            </div>
          </div>
        </div>

        {/* Alternative Solutions Selector */}
        {solutions.length > 1 && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-bold">
              Alternative Solutions ({solutions.length} found)
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {solutions.map((sol, index) => {
                const isActive = currentStep === sol.stepIndex;
                return (
                  <button
                    key={index}
                    onClick={() => onSelectSolution && onSelectSolution(sol.stepIndex)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                      isActive
                        ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    Path {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Display Current Traversal State (Node Path) */}
        {currentStepData && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-bold">Current Search State</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                currentStepData.type === 'solution'
                  ? 'bg-emerald-100 border border-emerald-250 text-emerald-700'
                  : currentStepData.type === 'dead_end'
                  ? 'bg-red-100 border border-red-250 text-red-700'
                  : currentStepData.type === 'backtrack'
                  ? 'bg-amber-100 border border-amber-250 text-amber-700'
                  : 'bg-cyan-100 border border-cyan-250 text-cyan-700'
              }`}>
                {currentStepData.type}
              </span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-semibold">Path:</span>
              {currentStepData.path.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Empty</span>
              ) : (
                <div className="flex items-center gap-1 overflow-x-auto py-1">
                  {currentStepData.path.map((nodeId, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-slate-400 text-xs font-bold">→</span>}
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-xs font-bold text-slate-700 shadow-sm">
                        {nodeId}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!stats) return null;

  return (
    <div className="w-full rounded-2xl glass-panel border border-slate-200 p-6 shadow-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-150 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          <h2 className="text-sm font-bold tracking-wider uppercase text-slate-700">
            {selectedAlgo === 'both' ? 'Performance Metrics Comparison' : 'Solver Statistics'}
          </h2>
        </div>
        
        {solutionFound !== null && (
          <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
            solutionFound
              ? 'bg-emerald-100 border border-emerald-200 text-emerald-700'
              : 'bg-red-100 border border-red-200 text-red-700'
          }`}>
            {solutionFound ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Hamiltonian Path Found!
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                No Hamiltonian Path Exists
              </>
            )}
          </span>
        )}
      </div>

      {selectedAlgo === 'both' ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            <div>
              <h3 className="text-xs font-black text-pink-600 uppercase tracking-widest mb-3">Brute Force</h3>
              {renderSingleStats('Brute Force', bruteforce)}
            </div>
            <div>
              <h3 className="text-xs font-black text-cyan-700 uppercase tracking-widest mb-3">Backtracking</h3>
              {renderSingleStats('Backtracking', backtracking)}
            </div>
          </div>
          
          {renderComparisonChart()}
        </div>
      ) : (
        renderSingleStats(
          selectedAlgo === 'bruteforce' ? 'Brute Force' : 'Backtracking',
          selectedAlgo === 'bruteforce' ? bruteforce : backtracking
        )
      )}
    </div>
  );
}
