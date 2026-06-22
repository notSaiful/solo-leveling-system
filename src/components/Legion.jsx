import { Skull, Lock, BookOpen, Crown, Wrench, Star, Zap, CheckCircle2 } from 'lucide-react';
import {
  getShadowBonuses,
  getUnlockedShadows,
  extractShadow,
  getTotalShadowPower,
  getShadowGradeColor,
} from '../data/shadows';
import {
  completeGateStep,
  getActiveJobChangeGate,
  JOB_CHANGE_GATES,
} from '../data/jobChangeGates';
import {
  getActiveGate,
  getGateProgress,
  completeKhalifateObjective,
} from '../data/missionGates';
import { MONARCH_STAGES } from '../logic/monarchTrials';
import { getItemTierLabel, getItemColorClass, getSetBonusStatus } from '../data/equipment';

const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S'];

export default function Legion({ state, setState }) {
  const overallLevel = state.user.overallLevel || 0;
  const currentRank = state.user.currentRank || 'E';

  // ── Shadows ──
  const shadowBonuses = getShadowBonuses(state);
  const unlockedShadows = getUnlockedShadows(state);
  const extractedShadows = unlockedShadows.filter((s) => s.extracted);
  const availableShadows = unlockedShadows.filter((s) => !s.extracted);
  const totalPower = getTotalShadowPower(state);

  // ── Job Change Gates ──
  const activeJobGate = getActiveJobChangeGate(state);
  const gateEntries = state.jobChangeGates || [];

  // ── Seerah ──
  const activeSeerahChains = (state.seerahChains || []).filter((c) => !c.completed && !c.failed);

  // ── Monarch ──
  const monarchTrial = state.monarchTrials;

  // ── Khalifate ──
  const activeGate = getActiveGate(state);
  const gateProgress = activeGate ? getGateProgress(state, activeGate) : null;
  const allObjectives = activeGate
    ? activeGate.objectives.map((obj) => {
        const userObj = (state.khalifateObjectives || []).find((o) => o.id === obj.id);
        return { ...obj, completed: userObj?.completed || false, completedAt: userObj?.completedAt || null };
      })
    : [];

  // ── Equipment / Skills ──
  const setBonus = getSetBonusStatus(state);
  const hasEquipment = state.equipment && Object.values(state.equipment).some(Boolean);
  const skills = state.skills || [];

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      <div className="text-center">
        <div className="font-orbitron text-xl text-khalifa-gold tracking-wider">LEGION</div>
        <div className="text-khalifa-steel/60 text-xs">Shadow Army · Gates · Ascension</div>
      </div>

      {/* ───────── SHADOW ARMY ───────── */}
      <div className="glass-panel-khalifa p-4 border border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold">
            <Skull size={16} /> SHADOW ARMY
          </div>
          <div className="text-[10px] text-purple-300/70 font-orbitron">
            {extractedShadows.length} EXTRACTED · +{Math.round(totalPower * 100)}% POWER
          </div>
        </div>

        {extractedShadows.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {extractedShadows.map((shadow) => (
              <span
                key={shadow.id}
                className={`text-[10px] px-2 py-1 rounded border border-purple-700/30 bg-purple-900/20 ${getShadowGradeColor(shadow.grade)}`}
              >
                {shadow.name}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-xs text-khalifa-steel/60 mb-3">
            No shadows yet. Hold any activity streak to 7, 30, 90, 180, or 365 days and the System extracts a shadow automatically — or arise one manually below once unlocked.
          </div>
        )}

        <div className="text-xs text-purple-500/60 mb-2">
          +{Math.round((shadowBonuses.allXp - 1) * 100)}% all XP from shadows
          {shadowBonuses.penaltyImmunity && ' · penalty immunity'}
          {shadowBonuses.penaltyImmunityMinor && ' · minor penalty immunity'}
          {shadowBonuses.fasterRecovery && ' · faster recovery'}
        </div>

        {availableShadows.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-purple-700/20">
            <div className="text-[10px] text-purple-400/70 uppercase tracking-wider">Available to extract</div>
            {availableShadows.map((shadow) => (
              <div
                key={shadow.id}
                className="flex items-center justify-between rounded-lg border border-purple-700/30 bg-purple-950/10 p-2"
              >
                <div className="min-w-0">
                  <div className={`text-xs font-semibold ${getShadowGradeColor(shadow.grade)}`}>{shadow.name}</div>
                  <div className="text-[10px] text-khalifa-steel/60">{shadow.description}</div>
                </div>
                <button
                  onClick={() => setState((prev) => extractShadow(prev, shadow.id))}
                  className="flex-shrink-0 ml-2 flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-purple-900/40 border border-purple-500/40 text-purple-200 hover:bg-purple-800/50 transition-colors"
                >
                  <Skull size={10} /> ARISE
                </button>
              </div>
            ))}
          </div>
        )}
        {extractedShadows.length === 0 && availableShadows.length === 0 && (
          <div className="text-[10px] text-khalifa-steel/40 pt-2 border-t border-purple-700/20">
            Shadows unlock as you rank up. Keep logging — the army grows with you.
          </div>
        )}
      </div>

      {/* ───────── JOB CHANGE GATES ───────── */}
      <div className="glass-panel-khalifa p-4 border border-blue-500/30">
        <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold mb-3">
          <Lock size={16} /> JOB CHANGE GATES
        </div>

        {activeJobGate ? (
          <div className="space-y-2 mb-4">
            <div className="text-xs text-cyan-300">{activeJobGate.title} (Rank {activeJobGate.rank}) — Day {activeJobGate.day}/{activeJobGate.totalDays}</div>
            <div className="w-full bg-cyan-900/30 rounded-full h-1.5">
              <div
                className="bg-blue-500 rounded-full h-1.5 transition-all"
                style={{ width: `${(activeJobGate.steps.filter((s) => s.completed).length / activeJobGate.steps.length) * 100}%` }}
              />
            </div>
            {(() => {
              const idx = activeJobGate.steps.findIndex((s) => !s.completed);
              const step = idx >= 0 ? activeJobGate.steps[idx] : null;
              if (!step) return null;
              return (
                <div className="rounded-lg border border-blue-700/30 bg-blue-950/10 p-2">
                  <div className="text-xs text-blue-300 font-semibold">{step.title}</div>
                  <div className="text-xs text-cyan-500/60">{step.description}</div>
                  <div className="text-[10px] text-blue-400/50 mt-1">
                    Auto-advances on a qualifying {step.pillar === 'all' ? 'any-pillar' : step.pillar} log today.
                  </div>
                  <button
                    onClick={() => setState((prev) => completeGateStep(prev, activeJobGate.gateId, idx))}
                    className="mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-900/30 border border-blue-500/40 text-blue-300 hover:bg-blue-800/40 transition-colors"
                  >
                    <CheckCircle2 size={12} /> Complete Step (override)
                  </button>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-xs text-khalifa-steel/60 mb-4">
            No active gate. The next gate opens when you reach its level.
          </div>
        )}

        <div className="space-y-1 pt-2 border-t border-blue-700/20">
          {JOB_CHANGE_GATES.map((g) => {
            const entry = gateEntries.find((e) => e.gateId === g.id);
            const cleared = entry?.completed;
            const isActive = activeJobGate?.gateId === g.id;
            const userRankIdx = RANK_ORDER.indexOf(currentRank);
            const gateRankIdx = RANK_ORDER.indexOf(g.rank);
            const passed = gateRankIdx <= userRankIdx && cleared;
            const ready = !cleared && !isActive && overallLevel >= g.levelRequired;
            const locked = !cleared && !isActive && overallLevel < g.levelRequired;
            const status = passed ? 'CLEARED' : cleared ? 'CLEARED' : isActive ? 'ACTIVE' : ready ? 'READY' : `LOCKED · L${g.levelRequired}`;
            const color = passed || cleared ? 'text-emerald-400' : isActive ? 'text-blue-300' : ready ? 'text-amber-400' : 'text-khalifa-steel/50';
            return (
              <div key={g.id} className="flex items-center justify-between text-xs">
                <span className={`${color} truncate`}>{g.rank}-Rank · {g.title}</span>
                <span className={`${color} flex-shrink-0 text-[10px] font-orbitron`}>{status}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ───────── SEERAH CHAINS ───────── */}
      <div className="glass-panel-khalifa p-4 border border-amber-500/30">
        <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-3">
          <BookOpen size={16} /> SEERAH CHARACTER CHAINS
        </div>
        {activeSeerahChains.length > 0 ? (
          <div className="space-y-2">
            {activeSeerahChains.map((chain) => (
              <div key={chain.chainId} className="space-y-1">
                <div className="text-xs text-cyan-300">{chain.traitName} — Day {chain.day}/{chain.totalDays}</div>
                <div className="w-full bg-cyan-900/30 rounded-full h-1.5">
                  <div className="bg-amber-500 rounded-full h-1.5 transition-all" style={{ width: `${(chain.day / chain.totalDays) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="text-[10px] text-amber-500/50 pt-1">
              Chains advance with ibadah tracking (tahajjud / rawatib) — arriving in Phase 2.
            </div>
          </div>
        ) : (
          <div className="text-xs text-khalifa-steel/60">
            A prophetic-character chain opens as you rank up. Completion awards a permanent Nabawi Trait.
          </div>
        )}
      </div>

      {/* ───────── MONARCH TRIALS ───────── */}
      {monarchTrial?.active && (
        <div className="glass-panel-khalifa p-4 border border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold mb-3">
            <Crown size={16} /> MONARCH TRIAL
          </div>
          {(() => {
            const stageDef = MONARCH_STAGES.find((s) => s.stage === monarchTrial.stage);
            if (!stageDef) return null;
            const progress = monarchTrial.stage < 4
              ? Math.max(0, Math.min(100, Math.floor(((overallLevel - stageDef.levelRange[0]) / (stageDef.levelRange[1] - stageDef.levelRange[0])) * 100)))
              : Math.max(0, Math.min(100, Math.floor(
                  (Math.min(40, Math.floor((Date.now() - new Date(monarchTrial.startedAt).getTime()) / (24 * 60 * 60 * 1000))) / 40) * 100
                )));
            return (
              <div className="space-y-1">
                <div className="text-xs text-cyan-300">Stage {monarchTrial.stage}: {stageDef.name}</div>
                <div className="text-xs text-cyan-500/60">{progress}% complete</div>
                <div className="w-full bg-cyan-900/30 rounded-full h-1.5">
                  <div className="bg-yellow-500 rounded-full h-1.5 transition-all" style={{ width: `${progress}%` }} />
                </div>
                {monarchTrial.stage === 4 && (
                  <div className="text-[10px] text-yellow-500/60 mt-1">40 days of complete mastery — 3 distinct pillars with XP every day, zero misses.</div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ───────── KHALIFATE OBJECTIVES ───────── */}
      <div className="glass-panel-khalifa p-4 border border-emerald-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <Crown size={16} /> KHALIFATE OBJECTIVES
          </div>
          {gateProgress && (
            <div className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-900/20 text-emerald-300">
              {gateProgress.completed}/{gateProgress.required} complete
            </div>
          )}
        </div>
        {activeGate ? (
          <>
            <div className="text-xs text-emerald-500/70 mb-1">{activeGate.title}</div>
            <div className="text-xs text-cyan-500/60 mb-2">{activeGate.subtitle}</div>
            <div className="w-full bg-cyan-900/30 rounded-full h-1.5 mb-3">
              <div className="bg-emerald-500 rounded-full h-1.5 transition-all" style={{ width: `${gateProgress.percent}%` }} />
            </div>
            <div className="space-y-2">
              {allObjectives.map((obj) => (
                <div key={obj.id} className={`flex items-start gap-2 rounded-lg border p-2 ${obj.completed ? 'border-emerald-700/30 bg-emerald-950/10' : 'border-cyan-800/20 bg-cyan-950/10'}`}>
                  <button
                    onClick={() => {
                      if (obj.completed) return;
                      setState((prev) => completeKhalifateObjective(prev, obj.id));
                    }}
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${obj.completed ? 'bg-emerald-500 border-emerald-500' : 'border-cyan-600 hover:border-emerald-400'}`}
                  >
                    {obj.completed && <CheckCircle2 size={12} className="text-black" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${obj.completed ? 'text-emerald-400 line-through opacity-60' : 'text-cyan-300'}`}>{obj.label}</div>
                    <div className="text-[10px] text-cyan-500/60 leading-tight">{obj.description}</div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${obj.pillar === 'deen' ? 'border-cyan-700/30 text-cyan-400' : obj.pillar === 'money' ? 'border-yellow-700/30 text-yellow-400' : obj.pillar === 'body' ? 'border-rose-700/30 text-rose-400' : 'border-purple-700/30 text-purple-400'}`}>
                    {obj.pillar}
                  </span>
                </div>
              ))}
            </div>
            {gateProgress.percent >= 100 && (
              <div className="mt-2 text-xs text-emerald-400 font-semibold text-center">Gate open. Level ascension unlocked.</div>
            )}
          </>
        ) : (
          <div className="text-xs text-khalifa-steel/60">
            The first Khalifate gate opens at Level 100. Below that, levels climb freely — build the habits, the army, and the income first.
          </div>
        )}
      </div>

      {/* ───────── EQUIPMENT + SKILLS ───────── */}
      {hasEquipment && (
        <div className="glass-panel-khalifa p-4 border border-amber-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
              <Wrench size={16} /> EQUIPMENT
            </div>
            {setBonus.active && (
              <div className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-900/20 text-amber-300">{setBonus.label} +10%</div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['weapon', 'armor', 'ring'].map((slot) => {
              const item = state.equipment?.[slot];
              return (
                <div key={slot} className={`rounded-lg p-2 border ${item ? 'bg-amber-950/20 border-amber-700/30' : 'bg-cyan-950/10 border-cyan-800/20'}`}>
                  <div className="text-[10px] text-cyan-500/60 uppercase capitalize">{slot}</div>
                  <div className={`text-xs truncate ${item ? getItemColorClass(item) : 'text-cyan-200'}`}>{item ? item.name : 'Empty'}</div>
                  {item && (
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9px] text-cyan-500/50">{getItemTierLabel(item)}</span>
                      {item.enchantLevel > 0 && <span className="text-[9px] text-purple-400">+{item.enchantLevel}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="glass-panel-khalifa p-4 border border-purple-500/30">
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-2">
            <Star size={16} /> SKILLS
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill.id} className="text-[10px] px-2 py-1 rounded border border-purple-700/30 bg-purple-900/20 text-purple-300">
                {skill.name} {skill.active && <span className="text-green-400">●</span>}
              </span>
            ))}
          </div>
          {state.skillPoints > 0 && (
            <div className="text-xs text-purple-500/60 mt-1">{state.skillPoints} skill points available</div>
          )}
        </div>
      )}
    </div>
  );
}