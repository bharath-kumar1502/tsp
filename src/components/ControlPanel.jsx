import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Sliders, Settings } from 'lucide-react';
import { PRESETS } from '../utils/presets';

export default function ControlPanel({
  selectedAlgo,
  setSelectedAlgo,
  selectedPreset,
  onSelectPreset,
  speed,
  setSpeed,
  isPlaying,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  currentStep,
  totalSteps,
  disabled
}) {
  return (
    <div className="w-full rounded-2xl glass-panel border border-slate-200 p-6 shadow-2xl flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
        <Settings className="w-5 h-5 text-cyan-600" />
        <h2 className="text-sm font-bold tracking-wider uppercase text-slate-700">Control Center</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Algorithm Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Algorithm</label>
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
            {['bruteforce', 'backtracking', 'both'].map((algo) => (
              <button
                key={algo}
                disabled={disabled && isPlaying}
                onClick={() => setSelectedAlgo(algo)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize duration-300 ${
                  selectedAlgo === algo
                    ? 'bg-white text-cyan-700 border border-slate-200/50 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'
                }`}
              >
                {algo === 'both' ? 'Both (VS)' : algo === 'bruteforce' ? 'Brute Force' : 'Backtracking'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Preset Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Graph Preset</label>
          <select
            disabled={isPlaying}
            value={selectedPreset}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="w-full py-2.5 px-3 text-xs bg-white border border-slate-200 text-slate-700 rounded-xl focus:border-cyan-500 focus:outline-none disabled:opacity-50"
          >
            {Object.keys(PRESETS).map((key) => (
              <option key={key} value={key} className="bg-white text-slate-700">
                {PRESETS[key].name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Speed Control */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-600" />
              Delay Speed
            </label>
            <span className="text-xs font-mono text-cyan-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {speed} ms
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="1200"
            step="20"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Fast (20ms)</span>
            <span>Slow (1.2s)</span>
          </div>
        </div>

        {/* 4. Playback Buttons */}
        <div className="flex flex-col gap-2 justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={onStepBackward}
              disabled={isPlaying || currentStep === 0 || disabled}
              title="Step Backward"
              className="flex-1 py-2.5 flex justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all disabled:opacity-30"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onPlayPause}
              disabled={disabled}
              title={isPlaying ? 'Pause' : 'Start Animation'}
              className={`flex-[2] py-2.5 flex justify-center items-center gap-2 font-bold rounded-xl transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_12px_rgba(8,145,178,0.3)]'
              } disabled:opacity-40`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span className="text-xs uppercase">{isPlaying ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={onStepForward}
              disabled={isPlaying || disabled || (totalSteps > 0 && currentStep === totalSteps)}
              title="Step Forward"
              className="flex-1 py-2.5 flex justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all disabled:opacity-30"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={onReset}
              disabled={disabled}
              title="Reset Animation"
              className="flex-1 py-2.5 flex justify-center bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 rounded-xl transition-all disabled:opacity-30"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Animation Progress Slider */}
      {totalSteps > 0 && (
        <div className="flex items-center gap-4 border-t border-slate-150 pt-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</span>
          <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 w-12 text-right font-bold">
              {currentStep}
            </span>
            
            <div className="flex-1 relative flex items-center h-2">
              <div className="absolute top-0 bottom-0 left-0 right-0 bg-slate-200 rounded-full" />
              <div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max={totalSteps}
                value={currentStep}
                disabled={isPlaying}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onStepForward(val);
                }}
                className="absolute w-full h-full opacity-0 cursor-pointer accent-transparent"
              />
            </div>
            
            <span className="text-xs font-mono text-slate-500 w-12 font-bold">
              {totalSteps}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
