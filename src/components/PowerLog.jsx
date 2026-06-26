import React, { useState } from 'react';
import { Dumbbell, PlusCircle, TrendingUp, CheckCircle2, RefreshCw } from 'lucide-react';
import { logLift, recomputeTrainingMax, nextSessionLoad } from '../logic/strengthLog';

const CORE_LIFTS = [
  { key: 'squat', label: 'Squat' },
  { key: 'deadlift', label: 'Deadlift' },
  { key: 'press', label: 'Overhead Press' },
  { key: 'bench', label: 'Bench Press' },
  { key: 'row', label: 'Barbell Row' },
  { key: 'pullup', label: 'Pull-Up' },
];

export default function PowerLog({ state, setState }) {
  const log = state.strengthLog || { bodyweightKg: null, baselineTested: false, lifts: {} };
  const physicalPower = state.physicalPower || { equipment: null, trackProgress: { strength: 0, power: 0, endurance: 0, resilience: 0 } };
  const equipment = physicalPower.equipment;

  // Regular log form state
  const [logForm, setLogForm] = useState({ lift: 'squat', weight: '', reps: '', sets: '3', rpe: '8' });
  // Custom rep max calculator state
  const [calcForm, setCalcForm] = useState({ lift: 'squat', weight: '', reps: '' });

  // Baseline prompt form state
  const [baselineEquip, setBaselineEquip] = useState('barbell');
  const [baselineBw, setBaselineBw] = useState('');
  const [baselines, setBaselines] = useState({
    squat: { weight: '', reps: '' },
    deadlift: { weight: '', reps: '' },
    press: { weight: '', reps: '' },
    bench: { weight: '', reps: '' },
    row: { weight: '', reps: '' },
    pullup: { weight: '', reps: '' },
  });

  // Handle baseline submission
  const handleBaselineSubmit = (e) => {
    e.preventDefault();
    if (!baselineBw) return;

    const updatedLifts = {};
    CORE_LIFTS.forEach((l) => {
      const w = parseFloat(baselines[l.key].weight) || 0;
      const r = parseInt(baselines[l.key].reps) || 0;
      const initialLiftState = { trainingMax: 0, history: [], lastTested: null };
      const updated = recomputeTrainingMax(initialLiftState, { weight: w, reps: r });
      updatedLifts[l.key] = updated;
    });

    setState((prev) => ({
      ...prev,
      physicalPower: {
        ...(prev.physicalPower || {}),
        equipment: baselineEquip,
      },
      strengthLog: {
        ...(prev.strengthLog || {}),
        bodyweightKg: parseFloat(baselineBw),
        baselineTested: true,
        lifts: updatedLifts,
      },
    }));
  };

  // Handle regular lift logging
  const handleLogSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(logForm.weight) || 0;
    const r = parseInt(logForm.reps) || 0;
    const s = parseInt(logForm.sets) || 0;
    const rpeValue = logForm.rpe ? parseFloat(logForm.rpe) : null;

    if (r <= 0 || s <= 0) return;

    setState((prev) => {
      const nextState = logLift(prev, {
        lift: logForm.lift,
        weight: w,
        reps: r,
        sets: s,
        rpe: rpeValue,
      });
      return nextState;
    });

    // Reset weight/reps input after submission
    setLogForm((prev) => ({ ...prev, weight: '', reps: '' }));
  };

  // Handle recalculate training max
  const handleRecalculateTm = (e) => {
    e.preventDefault();
    const w = parseFloat(calcForm.weight) || 0;
    const r = parseInt(calcForm.reps) || 0;
    if (w <= 0 || r <= 0) return;

    setState((prev) => {
      const currentLifts = prev.strengthLog?.lifts || {};
      const currentLiftState = currentLifts[calcForm.lift] || { trainingMax: 0, history: [], lastTested: null };
      const updated = recomputeTrainingMax(currentLiftState, { weight: w, reps: r });
      return {
        ...prev,
        strengthLog: {
          ...(prev.strengthLog || {}),
          lifts: {
            ...currentLifts,
            [calcForm.lift]: updated,
          },
        },
      };
    });

    setCalcForm((prev) => ({ ...prev, weight: '', reps: '' }));
  };

  if (!equipment) {
    // Setup / Baseline Prompt Panel
    return (
      <div className="glass-panel p-4 border border-slate-800 bg-slate-950/20 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold mb-3">
          <Dumbbell size={16} className="text-khalifa-blue" /> PHYSICAL POWER INITIALIZATION
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Before entering the forge, define your available gear and physical baseline. The system will calibrate your training loads accordingly.
        </p>

        <form onSubmit={handleBaselineSubmit} className="space-y-4">
          {/* Equipment Picker */}
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-orbitron mb-1">Equipment Level</label>
            <select
              value={baselineEquip}
              onChange={(e) => setBaselineEquip(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="barbell">Barbell Focus (Gym / Loaded Lifts)</option>
              <option value="bodyweight">Bodyweight Focus (Calisthenics)</option>
              <option value="mixed">Mixed Focus (Barbell + Calisthenics)</option>
              <option value="kettlebell">Kettlebell / Dumbbell Focus</option>
            </select>
          </div>

          {/* Bodyweight */}
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-orbitron mb-1">Bodyweight (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="e.g. 72.5"
              value={baselineBw}
              onChange={(e) => setBaselineBw(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            />
          </div>

          {/* Core Lifts Bests */}
          <div className="space-y-2">
            <label className="block text-[10px] text-slate-500 uppercase font-orbitron">Est. Bests (Weight × Reps)</label>
            <div className="grid grid-cols-2 gap-2">
              {CORE_LIFTS.map((l) => (
                <div key={l.key} className="rounded border border-slate-800/60 bg-slate-950/40 p-2">
                  <span className="text-[10px] font-semibold text-slate-300 block mb-1">{l.label}</span>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      placeholder="kg"
                      value={baselines[l.key].weight}
                      onChange={(e) =>
                        setBaselines({
                          ...baselines,
                          [l.key]: { ...baselines[l.key], weight: e.target.value },
                        })
                      }
                      className="w-1/2 bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[10px] text-slate-200 text-center outline-none"
                    />
                    <input
                      type="number"
                      placeholder="reps"
                      value={baselines[l.key].reps}
                      onChange={(e) =>
                        setBaselines({
                          ...baselines,
                          [l.key]: { ...baselines[l.key], reps: e.target.value },
                        })
                      }
                      className="w-1/2 bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[10px] text-slate-200 text-center outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors font-orbitron"
          >
            <CheckCircle2 size={14} /> INITIALIZE BASELINE
          </button>
        </form>
      </div>
    );
  }

  // Active Logging / View Panel
  return (
    <div className="glass-panel p-4 border border-slate-800 bg-slate-950/20 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-900">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <Dumbbell size={16} className="text-khalifa-blue" /> PHYSICAL POWER LOG
        </div>
        <div className="text-[10px] text-khalifa-steel/70 font-orbitron uppercase">
          {equipment} · {log.bodyweightKg} kg
        </div>
      </div>

      {/* Lift Table */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 text-[9px] text-slate-500 uppercase tracking-wider font-orbitron px-1">
          <span className="col-span-4">Lift</span>
          <span className="col-span-3 text-center">Training Max</span>
          <span className="col-span-3 text-center">Next Target</span>
          <span className="col-span-2 text-right">Tested</span>
        </div>
        {CORE_LIFTS.map((l) => {
          const liftState = log.lifts?.[l.key] || { trainingMax: 0, history: [], lastTested: null };
          const prescription = nextSessionLoad(state, l.key);
          const historyCount = liftState.history?.length || 0;

          return (
            <div
              key={l.key}
              className="grid grid-cols-12 text-xs items-center p-1.5 rounded border border-slate-900 bg-slate-950/40 hover:bg-slate-900/40 transition-colors"
            >
              <div className="col-span-4 min-w-0">
                <span className="font-semibold text-slate-200 block truncate">{l.label}</span>
                {liftState.milestone && (
                  <span className="text-[9px] text-khalifa-gold/80 truncate block">
                    ★ {liftState.milestone}
                  </span>
                )}
              </div>
              <div className="col-span-3 text-center text-slate-300 font-mono">
                {liftState.trainingMax} kg
              </div>
              <div className="col-span-3 text-center text-khalifa-blue/90 font-mono">
                {prescription.sets}×{prescription.reps} @ {prescription.kg} kg
              </div>
              <div className="col-span-2 text-right text-[10px] text-khalifa-steel/50">
                {liftState.lastTested ? liftState.lastTested.substring(5) : '—'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main logging form */}
      <form onSubmit={handleLogSubmit} className="space-y-2 pt-2 border-t border-slate-900">
        <div className="text-[10px] text-slate-500 uppercase font-orbitron">Log Workout Session</div>
        <div className="grid grid-cols-12 gap-2">
          {/* Lift Picker */}
          <select
            value={logForm.lift}
            onChange={(e) => setLogForm({ ...logForm, lift: e.target.value })}
            className="col-span-4 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
          >
            {CORE_LIFTS.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Weight */}
          <input
            type="number"
            placeholder="kg"
            required
            value={logForm.weight}
            onChange={(e) => setLogForm({ ...logForm, weight: e.target.value })}
            className="col-span-2 bg-slate-900 border border-slate-800 rounded px-1 py-1.5 text-xs text-slate-200 text-center outline-none"
          />

          {/* Reps */}
          <input
            type="number"
            placeholder="reps"
            required
            value={logForm.reps}
            onChange={(e) => setLogForm({ ...logForm, reps: e.target.value })}
            className="col-span-2 bg-slate-900 border border-slate-800 rounded px-1 py-1.5 text-xs text-slate-200 text-center outline-none"
          />

          {/* Sets */}
          <input
            type="number"
            placeholder="sets"
            required
            value={logForm.sets}
            onChange={(e) => setLogForm({ ...logForm, sets: e.target.value })}
            className="col-span-2 bg-slate-900 border border-slate-800 rounded px-1 py-1.5 text-xs text-slate-200 text-center outline-none"
          />

          {/* RPE */}
          <select
            value={logForm.rpe}
            onChange={(e) => setLogForm({ ...logForm, rpe: e.target.value })}
            className="col-span-2 bg-slate-900 border border-slate-800 rounded px-1 py-1.5 text-xs text-slate-200 outline-none"
          >
            <option value="10">@10</option>
            <option value="9">@9</option>
            <option value="8">@8</option>
            <option value="7">@7</option>
            <option value="6">@6</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-1 text-xs py-2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors font-orbitron"
        >
          <PlusCircle size={12} /> LOG SESSION
        </button>
      </form>

      {/* Recalculate 1RM / TM Form */}
      <form onSubmit={handleRecalculateTm} className="space-y-2 pt-2 border-t border-slate-900">
        <div className="text-[10px] text-slate-500 uppercase font-orbitron">Recalibrate Training Max (Test)</div>
        <div className="grid grid-cols-12 gap-2">
          <select
            value={calcForm.lift}
            onChange={(e) => setCalcForm({ ...calcForm, lift: e.target.value })}
            className="col-span-4 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
          >
            {CORE_LIFTS.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Tested kg"
            required
            value={calcForm.weight}
            onChange={(e) => setCalcForm({ ...calcForm, weight: e.target.value })}
            className="col-span-4 bg-slate-900 border border-slate-800 rounded px-1 py-1.5 text-xs text-slate-200 text-center outline-none"
          />

          <input
            type="number"
            placeholder="Reps done"
            required
            value={calcForm.reps}
            onChange={(e) => setCalcForm({ ...calcForm, reps: e.target.value })}
            className="col-span-4 bg-slate-900 border border-slate-800 rounded px-1 py-1.5 text-xs text-slate-200 text-center outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-1 text-xs py-2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors font-orbitron"
        >
          <RefreshCw size={12} /> RECALCULATE MAX
        </button>
      </form>
    </div>
  );
}
