import { useMemo, useEffect } from 'react';
import RankBadge from './RankBadge';
import XpBar from './XpBar';
import QuestCard from './QuestCard';
import CustomQuestBuilder from './CustomQuestBuilder';
import {
  initializeDailyQuests,
  initializeLevelQuest,
  initializeWeeklyDungeon,
  initializePenalties,
  completeDailyQuest,
  completeCustomQuest,
  completeLevelQuest,
  completeRedemptionQuest,
  recalculateOverallLevel,
  getFlowStateDisplay,
  checkFlowState,
  getStreakBonus,
  getLevelProgress,
  getRedemptionProgress,
} from '../logic/questEngine';
import { getRankByLevel, xpForNextLevel } from '../data/questCatalog';
import { isDebuffActive } from '../logic/penalties';
import { getExtremeModeSummary, getExtremePillarLabel } from '../logic/extremeMode';
import { getItemTierLabel, getItemColorClass, getSetBonusStatus } from '../data/equipment';
import { getActiveGate, getGateProgress, isGateComplete, completeKhalifateObjective, MISSION_GATES } from '../data/missionGates';
import { getShadowBonuses } from '../data/shadows';
import { autoAssignStatPoints } from '../data/stats';
import { getLocalDateString, toLocalDateString } from '../utils/dateUtils';
import { completeGateStep } from '../data/jobChangeGates';
import { AlertTriangle, Skull, Zap, Coins, Sparkles, Activity, Swords, Shield, Crown, Wrench, BookOpen, Lock, Star, Heart, CheckCircle2, Flame } from 'lucide-react';
import { calculateUmmahBurden, getCurrentMilestone } from '../data/ummah';
import { PILLAR_LABELS, getPillarDisplayKey } from '../utils/pillarDisplay';
import { runEndgameCycle } from '../logic/endgame';
import { applyPhysicalPowerSideEffects } from '../logic/physicalPowerSideEffects';

const rankColorMap = {
  'text-gray-400': '#9ca3af',
  'text-cyan-400': '#22d3ee',
  'text-blue-400': '#60a5fa',
  'text-purple-400': '#c084fc',
  'text-orange-400': '#fb923c',
  'text-yellow-400': '#facc15',
};

export default function Dashboard({ state, setState, ready = true }) {
  const rank = getRankByLevel(state.user.overallLevel);
  const today = getLocalDateString();

  // Run the endgame cycle (seerah / job-gate / monarch / khalifate) after any
  // quest completion so the v3 endgame advances from quests now that the log
  // flow is gone. Wrapped non-fatal — an endgame throw must never break quest
  // completion (the Monday-crash lesson).
  const runEndgame = (s) => {
    try { return runEndgameCycle(s, today); } catch (e) { console.warn('[endgame] non-fatal:', e); return s; }
  };

  // Initialize quests after render (not during render to avoid reversion loops)
  useEffect(() => {
    if (!ready) return;

    setState(prev => {
      let s = prev;
      s = initializePenalties(s);
      s = initializeDailyQuests(s);
      s = initializeLevelQuest(s);
      s = initializeWeeklyDungeon(s);
      return s;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, state.user.overallLevel, state.lastQuestDate, state.weeklyDungeons.weekId]);

  // Shadow bonuses
  const shadowBonuses = useMemo(() => getShadowBonuses(state), [state.shadows]);

  // Flow state
  const flowDisplay = useMemo(() => getFlowStateDisplay(state.flowState), [state.flowState]);

  // Streak bonus
  const bestStreak = Math.max(state.pillars.deen.streak, state.pillars.body.streak, state.pillars.money.streak);
  const streakBonus = getStreakBonus(bestStreak);

  // Progress
  const deenProgress = getLevelProgress(state.pillars.deen);
  const bodyProgress = getLevelProgress(state.pillars.body);
  const moneyProgress = getLevelProgress(state.pillars.money);

  // Daily quests grouped by pillar
  const dailyByPillar = useMemo(() => {
    const grouped = { deen: [], body: [], money: [] };
    state.dailyQuests.forEach(q => {
      if (grouped[q.pillar]) grouped[q.pillar].push(q);
    });
    return grouped;
  }, [state.dailyQuests]);

  // Active level quest
  const activeLevelQuest = useMemo(() => {
    return state.levelQuests.find(lq => !lq.completed);
  }, [state.levelQuests]);

  const handleCompleteDaily = (questUniqueId) => {
    setState(prev => {
      let next = completeDailyQuest(prev, questUniqueId);

      // Apply shadow + streak bonuses
      const quest = prev.dailyQuests.find(q => q.uniqueId === questUniqueId);
      if (quest) {
        next = applyPhysicalPowerSideEffects(next, quest);
        const bonuses = getShadowBonuses(next);
        let multiplier = bonuses.allXp;
        if (quest.pillar === 'deen') multiplier *= bonuses.deenXp;
        if (quest.pillar === 'body') multiplier *= bonuses.bodyXp;
        if (quest.pillar === 'money') multiplier *= bonuses.moneyXp;

        // Streak bonus (computed fresh from next state for correctness)
        const s = getStreakBonus(next.pillars[quest.pillar].streak);
        multiplier *= s.multiplier;

        // Add bonus XP on top of what completeDailyQuest already gave
        const baseXp = quest.xp || 0;
        const boostedXp = Math.floor(baseXp * multiplier);
        const bonusXp = boostedXp - baseXp;

        if (bonusXp > 0) {
          const p = quest.pillar;
          const newPillars = { ...next.pillars };
          newPillars[p] = {
            ...newPillars[p],
            xp: newPillars[p].xp + bonusXp,
          };
          // Re-check pillar level-up with bonus XP
          const needed = xpForNextLevel(newPillars[p].level);
          if (newPillars[p].xp >= needed) {
            newPillars[p].level += 1;
            newPillars[p].xp -= needed;
            // Auto-assign stat points for the bonus-triggered level-up
            const pillarRank = getRankByLevel(newPillars[p].level);
            const spAwarded = pillarRank.statPointsPerLevel || 1;
            const autoStatResult = autoAssignStatPoints(next.stats || {}, p, spAwarded);
            if (autoStatResult) {
              next.stats = autoStatResult.stats;
              const assignStr = autoStatResult.assignments.map(a => `${a.stat.toUpperCase()} +${a.points}`).join(', ');
              next.systemMessages = [
                ...(next.systemMessages || []),
                {
                  type: 'levelUp',
                  title: `${getPillarDisplayKey(p)} LEVEL UP!`,
                  subtitle: `Level ${newPillars[p].level}`,
                  message: `SYSTEM auto-assigned: ${assignStr}. Performance determines growth.`,
                },
              ];
            }
          }
          next = { ...next, pillars: newPillars };
        }

        // Recalculate overall level
        next = recalculateOverallLevel(next);
      }

      // Update flow state after any quest completion
      next = { ...next, flowState: checkFlowState(next.history || [], rank.key) };
      next = runEndgame(next);

      return next;
    });
  };

  // Handle level quest sub-quest completion
  const handleCompleteLevelSubQuest = (levelQuestIndex, questIndex) => {
    setState(prev => {
      let next = completeLevelQuest(prev, levelQuestIndex, questIndex);
      const levelQuest = prev.levelQuests[levelQuestIndex];
      const quest = levelQuest?.quests?.[questIndex];
      if (quest) {
        next = applyPhysicalPowerSideEffects(next, quest);
      }
      next = recalculateOverallLevel(next);
      next = { ...next, flowState: checkFlowState(next.history || [], rank.key) };
      next = runEndgame(next);
      return next;
    });
  };

  // Handle redemption quest completion
  const handleCompleteRedemption = (redemptionId) => {
    setState(prev => {
      let next = completeRedemptionQuest(prev, redemptionId);
      const quest = prev.redemptionQuests.find(rq => rq.id === redemptionId);
      if (quest) {
        next = applyPhysicalPowerSideEffects(next, quest);
      }
      next = { ...next, flowState: checkFlowState(next.history || [], rank.key) };
      next = runEndgame(next);
      return next;
    });
  };

  const addCustomQuest = (quest) => {
    const uniqueId = `custom-${quest.id || Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const createdAt = quest.createdAt || new Date().toISOString();
    setState(prev => ({
      ...prev,
      customQuests: [...prev.customQuests, {
        ...quest,
        id: quest.id || uniqueId,
        uniqueId,
        lastCompleted: null,
        createdAt,
        createdLocalDate: today,
      }],
    }));
  };

  const handleCompleteCustom = (questUniqueId) => {
    setState(prev => {
      let next = completeCustomQuest(prev, questUniqueId, today);
      if (next === prev) return prev;
      const quest = prev.customQuests.find(q => q.uniqueId === questUniqueId || q.id === questUniqueId);
      if (quest) {
        next = applyPhysicalPowerSideEffects(next, quest);
      }
      next = recalculateOverallLevel(next);
      next = { ...next, flowState: checkFlowState(next.history || [], rank.key) };
      next = runEndgame(next);
      return next;
    });
  };

  const pillarLabels = PILLAR_LABELS;
  const pillarColors = { deen: '#3B82F6', body: '#F59E0B', money: '#EAB308' };
  const pillarIcons = { deen: Shield, body: Swords, money: Crown };

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 relative z-10">
      {/* Status Window - Khalifa Monarch Style */}
      <div className="glass-panel-khalifa p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <RankBadge level={state.user.overallLevel} />
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="system-header text-slate-300 font-bold">Forge Status</div>
              <div className="font-orbitron text-[10px] text-khalifa-steel tracking-widest">{new Date().toLocaleDateString('en-CA')}</div>
            </div>

            <XpBar
              current={state.pillars.deen.xp + state.pillars.body.xp + state.pillars.money.xp}
              max={xpForNextLevel(state.user.overallLevel) * 3}
              color="#D97706"
              label="OVERALL POWER"
              level={state.user.overallLevel}
            />

            <div className="grid grid-cols-1 gap-3 mt-4">
              <XpBar current={state.pillars.deen.xp} max={xpForNextLevel(state.pillars.deen.level)} color="#0EA5E9" label="DEEN" level={state.pillars.deen.level} />
              <XpBar current={state.pillars.body.xp} max={xpForNextLevel(state.pillars.body.level)} color="#F59E0B" label="BODY" level={state.pillars.body.level} />
              <XpBar current={state.pillars.money.xp} max={xpForNextLevel(state.pillars.money.level)} color="#D97706" label="MONEY" level={state.pillars.money.level} />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Pillar Focus Selector */}
      <div className="glass-panel p-3 border border-slate-800/80 bg-slate-950/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
            <Star size={16} className="text-khalifa-gold" /> WEEKLY FOCUS
          </div>
          {state.weeklyFocus && (
            <button
              onClick={() => setState(prev => ({ ...prev, weeklyFocus: null }))}
              className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">
          {state.weeklyFocus
            ? `${pillarLabels[state.weeklyFocus] || state.weeklyFocus} quests earn +50% XP this week`
            : 'Select a pillar to focus this week for +50% XP'}
        </div>
        <div className="flex gap-2">
          {['deen', 'body', 'money'].map(p => {
            const active = state.weeklyFocus === p;
            const Icon = pillarIcons[p];
            return (
              <button
                key={p}
                onClick={() => setState(prev => ({ ...prev, weeklyFocus: p }))}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${
                  active
                    ? 'bg-khalifa-gold/15 border-khalifa-gold/40 text-slate-100'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
                style={active ? { borderColor: pillarColors[p] } : {}}
              >
                <Icon size={14} style={{ color: active ? pillarColors[p] : undefined }} />
                {pillarLabels[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Flow State Banner */}
      {flowDisplay && (
        <div className="glass-panel p-3 border border-slate-800/80 bg-slate-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-khalifa-blue">
            <Zap size={18} />
            <span className="font-semibold text-sm tracking-wider">{flowDisplay.text}</span>
          </div>
          <span className="text-xs text-slate-500">{flowDisplay.timeLeft}</span>
        </div>
      )}

      {/* Streak Bonus */}
      {streakBonus.multiplier > 1 && (
        <div className={`glass-panel p-3 border border-slate-800/80 bg-slate-950/20 flex items-center justify-between`}>
          <div className="flex items-center gap-2 text-khalifa-gold">
            <Sparkles size={18} />
            <span className="font-semibold text-sm">{streakBonus.label} STREAK</span>
            <span className="text-xs text-slate-500">+{Math.round((streakBonus.multiplier - 1) * 100)}% XP</span>
          </div>
          <span className="text-xs text-slate-500">{bestStreak} days</span>
        </div>
      )}

      {/* Streak and Status Panel */}
      <div className="flex items-center justify-between glass-panel p-3 border border-slate-800/80 bg-slate-950/20">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Activity size={14} className="text-khalifa-blue" />
          <span className="font-orbitron uppercase tracking-wider">Pillar Streak:</span>
          <span className="font-mono font-bold text-slate-200">{bestStreak} days</span>
        </div>
      </div>

      {/* Ummah Burden */}
      {(() => {
        const burdenScore = calculateUmmahBurden(state.ummahBurden);
        const milestone = getCurrentMilestone(burdenScore);
        if (burdenScore === 0) return null;
        return (
          <div className="glass-panel p-3 border border-rose-500/30 bg-rose-950/10">
            <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold mb-1">
              <Heart size={16} /> UMMAH BURDEN
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-cyan-500/60">Score: {burdenScore.toLocaleString()}</div>
              {milestone && (
                <div className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: milestone.color + '40', color: milestone.color, backgroundColor: milestone.color + '10' }}>
                  {milestone.label}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Shadow Power */}
      {state.shadows?.length > 0 && (
        <div className="glass-panel p-3 border border-purple-500/30 bg-purple-950/10">
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-2">
            <Skull size={16} /> SHADOW ARMY ({state.shadows.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {state.shadows.map(shadow => (
              <span key={shadow.id} className="text-[10px] px-2 py-1 rounded border border-purple-700/30 bg-purple-900/20 text-purple-300">
                {shadow.name}
              </span>
            ))}
          </div>
          <div className="text-xs text-purple-500/50 mt-1">
            +{Math.round((shadowBonuses.allXp - 1) * 100)}% all XP from shadows
          </div>
        </div>
      )}

      {/* Active Job Change Gate */}
      {state.jobChangeGates?.some(g => !g.completed && !g.failed) && (
        <div className="glass-panel p-3 border border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-2 text-khalifa-blue text-sm font-semibold mb-2">
            <Lock size={16} /> JOB CHANGE GATE
          </div>
          {state.jobChangeGates.filter(g => !g.completed && !g.failed).map(gate => {
            const currentStepIndex = gate.steps.findIndex(s => !s.completed);
            const currentStep = currentStepIndex === -1 ? gate.steps.length : currentStepIndex;
            const stepData = gate.steps[currentStep];
            return (
              <div key={gate.gateId} className="space-y-2">
                <div className="text-xs text-slate-200">{gate.title} (Rank {gate.rank}) — Day {gate.day}/{gate.totalDays}</div>
                <div className="text-xs text-slate-500">{currentStep}/{gate.steps.length} steps completed</div>
                <div className="w-full bg-slate-900 rounded-full h-[3px]">
                  <div
                    className="bg-khalifa-blue rounded-full h-[3px] transition-all"
                    style={{ width: `${(currentStep / gate.steps.length) * 100}%` }}
                  />
                </div>
                {stepData && (
                  <div className="mt-2 rounded-lg border border-slate-800 bg-slate-900/10 p-2">
                    <div className="text-xs text-slate-300 font-semibold">{stepData.title}</div>
                    <div className="text-xs text-slate-500">{stepData.description}</div>
                    <button
                      onClick={() => setState(prev => completeGateStep(prev, gate.gateId, currentStep))}
                      className="mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      <CheckCircle2 size={12} /> Complete Step
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Active Seerah Chain */}
      {state.seerahChains?.some(c => !c.completed && !c.failed) && (
        <div className="glass-panel p-3 border border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-2 text-khalifa-gold text-sm font-semibold mb-2">
            <BookOpen size={16} /> SEERAH QUEST CHAIN
          </div>
          {state.seerahChains.filter(c => !c.completed && !c.failed).map(chain => (
            <div key={chain.chainId} className="space-y-1">
              <div className="text-xs text-slate-200">{chain.traitName} — Day {chain.day}/{chain.totalDays}</div>
              <div className="w-full bg-slate-900 rounded-full h-[3px]">
                <div
                  className="bg-khalifa-gold rounded-full h-[3px] transition-all"
                  style={{ width: `${(chain.day / chain.totalDays) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monarch Trials */}
      {state.monarchTrials?.active && (
        <div className="glass-panel p-3 border border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-2 text-khalifa-gold text-sm font-semibold mb-2">
            <Crown size={16} /> MONARCH TRIAL
          </div>
          {(() => {
            const trial = state.monarchTrials;
            const stageDef = [null,
              { name: 'Financial Capacity', range: [76, 85] },
              { name: 'Adventure Capacity', range: [86, 95] },
              { name: 'Knowledge Capacity', range: [96, 99] },
              { name: 'The Final Trial', range: [100, 100] },
            ][trial.stage];
            if (!stageDef) return null;
            const progress = trial.stage < 4
              ? Math.max(0, Math.min(100, Math.floor(((state.user.overallLevel - stageDef.range[0]) / (stageDef.range[1] - stageDef.range[0])) * 100)))
              : Math.max(0, Math.min(100, Math.floor(
                  (Math.min(40, Math.floor((Date.now() - new Date(trial.startedAt).getTime()) / (24 * 60 * 60 * 1000))) / 40) * 100
                )));
            return (
              <div className="space-y-1">
                <div className="text-xs text-slate-200">Stage {trial.stage}: {stageDef.name}</div>
                <div className="text-xs text-slate-500">{progress}% complete</div>
                <div className="w-full bg-slate-900 rounded-full h-[3px]">
                  <div
                    className="bg-khalifa-gold rounded-full h-[3px] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {trial.stage === 4 && (
                  <div className="text-[10px] text-slate-500 mt-1">40 days of complete mastery. Zero misses across all 3 pillars.</div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Khalifate Mission Objectives */}
      {(() => {
        const activeGate = getActiveGate(state);
        if (!activeGate) return null;
        const progress = getGateProgress(state, activeGate);
        const allObjectives = activeGate.objectives.map(obj => {
          const userObj = (state.khalifateObjectives || []).find(o => o.id === obj.id);
          return { ...obj, completed: userObj?.completed || false, completedAt: userObj?.completedAt || null };
        });
        return (
          <div className="glass-panel p-3 border border-slate-800 bg-slate-950/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
                <Crown size={16} className="text-khalifa-gold" /> KHALIFATE OBJECTIVES
              </div>
              <div className="text-[10px] px-2 py-0.5 rounded border border-slate-800 bg-slate-900/30 text-slate-300">
                {progress.completed}/{progress.required} complete
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">
              {activeGate.subtitle}
            </div>
            <div className="w-full bg-slate-900 rounded-full h-[3px] mb-3">
              <div
                className="bg-khalifa-blue rounded-full h-[3px] transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="space-y-2">
              {allObjectives.map(obj => (
                <div key={obj.id} className={`flex items-start gap-2 rounded-lg border p-2 ${obj.completed ? 'border-slate-800 bg-slate-900/10' : 'border-slate-800/60 bg-slate-950/30'}`}>
                  <button
                    onClick={() => {
                      if (obj.completed) return;
                      setState(prev => completeKhalifateObjective(prev, obj.id));
                    }}
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${obj.completed ? 'bg-khalifa-blue border-khalifa-blue' : 'border-slate-700 hover:border-slate-500'}`}
                  >
                    {obj.completed && <CheckCircle2 size={12} className="text-black" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${obj.completed ? 'text-slate-400 line-through opacity-60' : 'text-slate-200'}`}>{obj.label}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{obj.description}</div>
                    {obj.completed && obj.completedAt && (
                      <div className="text-[9px] text-slate-500 mt-0.5">Completed {new Date(obj.completedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 border-slate-800 text-slate-400`}>
                    {obj.pillar}
                  </span>
                </div>
              ))}
            </div>
            {progress.percent >= 100 && (
              <div className="mt-2 text-xs text-khalifa-blue font-semibold text-center">
                🚪 Gate Open. Level ascension unlocked.
              </div>
            )}
          </div>
        );
      })()}

      {/* Equipment Status */}
      {state.equipment && Object.values(state.equipment).some(Boolean) && (
        <div className="glass-panel p-3 border border-slate-800 bg-slate-950/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
              <Wrench size={16} className="text-khalifa-gold" /> EQUIPMENT
            </div>
            {(() => {
              const setBonus = getSetBonusStatus(state);
              return setBonus.active ? (
                <div className="text-[10px] px-2 py-0.5 rounded-full border border-slate-800 bg-slate-900/30 text-slate-300">
                  {setBonus.label} +10%
                </div>
              ) : null;
            })()}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['weapon', 'armor', 'ring'].map(slot => {
              const item = state.equipment?.[slot];
              return (
                <div key={slot} className={`rounded-lg p-2 border ${item ? 'bg-slate-900/30 border-slate-800/60' : 'bg-slate-950/20 border-slate-800/50'}`}>
                  <div className="text-[10px] text-slate-500 uppercase capitalize">{slot}</div>
                  <div className={`text-xs truncate ${item ? getItemColorClass(item) : 'text-slate-300'}`}>
                    {item ? item.name : 'Empty'}
                  </div>
                  {item && (
                    <>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[9px] text-slate-500">{getItemTierLabel(item)}</span>
                        {item.enchantLevel > 0 && (
                          <span className="text-[9px] text-purple-400">+{item.enchantLevel}</span>
                        )}
                      </div>
                      <div className="mt-1 w-full bg-slate-900 rounded-full h-[3px]">
                        <div
                          className={`rounded-full h-[3px] transition-all ${item.durability > item.maxDurability * 0.3 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${(item.durability / item.maxDurability) * 100}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Skills */}
      {state.skills?.length > 0 && (
        <div className="glass-panel p-3 border border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold mb-2">
            <Star size={16} className="text-khalifa-gold" /> SKILLS
          </div>
          <div className="flex flex-wrap gap-2">
            {state.skills.map(skill => (
              <span key={skill.id} className="text-[10px] px-2 py-1 rounded border border-slate-800 bg-slate-950/40 text-slate-300">
                {skill.name} {skill.active && <span className="text-green-400">●</span>}
              </span>
            ))}
          </div>
          {state.skillPoints > 0 && (
            <div className="text-xs text-slate-500 mt-1">{state.skillPoints} skill points available</div>
          )}
        </div>
      )}

      {/* Solo Clear Bonus */}
      {state.weeklyStats?.soloClear && (
        <div className="glass-panel p-3 border border-slate-800 bg-slate-950/20 flex items-center gap-2">
          <Zap size={16} className="text-khalifa-blue" />
          <div className="text-sm text-slate-300 font-semibold">Solo Clear Bonus Active</div>
          <div className="text-xs text-slate-500">2x shadow extraction rate this week</div>
        </div>
      )}

      {/* Debuffs Warning */}
      {Object.entries(state.pillars).some(([_, p]) => isDebuffActive(p.activeDebuff)) && (
        <div className="glass-panel p-4 border border-red-950 bg-red-950/5">
          <div className="flex items-center gap-2 text-red-400 font-semibold mb-2 text-sm tracking-wider">
            <Skull size={18} /> SYSTEM ALERT
          </div>
          {Object.entries(state.pillars).filter(([_, p]) => isDebuffActive(p.activeDebuff)).map(([pillar, p]) => (
            <div key={pillar} className="text-sm text-red-300/70 flex items-center gap-2">
              <AlertTriangle size={14} />
              {getPillarDisplayKey(pillar)}: {p.activeDebuff.message} (-{Math.round((1 - p.activeDebuff.multiplier) * 100)}% XP)
            </div>
          ))}
        </div>
      )}

      {/* Extreme Mode Warning */}
      {(() => {
        const extremePillars = getExtremeModeSummary(state);
        if (extremePillars.length === 0) return null;
        return (
          <div className="glass-panel p-4 border border-orange-950 bg-orange-950/5">
            <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2 text-sm tracking-wider">
              <Flame size={18} /> EXTREME MODE
            </div>
            {extremePillars.map(({ pillar, streak, severity }) => (
              <div key={pillar} className={`text-sm flex items-center gap-2 ${severity === 'critical' ? 'text-red-300' : 'text-orange-300'}`}>
                <AlertTriangle size={14} className={severity === 'critical' ? 'text-red-400' : 'text-orange-400'} />
                {getPillarDisplayKey(pillar)}: {getExtremePillarLabel(streak)} — {streak} days of silence
                <span className="text-[10px] ml-auto border border-orange-950 bg-orange-950/20 px-1.5 py-0.5 rounded">
                  Complete to break
                </span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Redemption Quests */}
      {state.redemptionQuests.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-orbitron text-sm font-bold text-red-400 tracking-wider flex items-center gap-2">
            <Zap size={16} /> REDEMPTION QUESTS
          </h2>
          {state.redemptionQuests.map(quest => {
            const progress = getRedemptionProgress(state, quest);
            return (
              <QuestCard
                key={quest.id}
                quest={{
                  ...quest,
                  description: progress.ready
                    ? quest.description
                    : `${quest.description} Progress: ${progress.questCompletions}/${progress.questRequired}${quest.requiresDungeonStep ? ` | Dungeon step: ${progress.dungeonStepReady ? 'done' : 'required'}` : ''}${quest.requiresFullDungeon ? ` | Full dungeon: ${progress.fullDungeonReady ? 'done' : 'required'}` : ''}`,
                  completedToday: quest.completed,
                  isRedemption: true,
                }}
                disabled={!progress.ready}
                disabledReason={progress.missing.join(' ')}
                onComplete={() => handleCompleteRedemption(quest.id)}
                rank={rank.key}
              />
            );
          })}
        </div>
      )}

      {/* Active Level Quest */}
      {activeLevelQuest && (
        <div className="space-y-3">
          <h2 className="font-orbitron text-sm font-bold text-khalifa-gold tracking-wider flex items-center gap-2">
            <Zap size={16} /> LEVEL QUEST: {activeLevelQuest.title}
          </h2>
          <div className="text-xs text-slate-500 mb-2">{activeLevelQuest.description}</div>
          {activeLevelQuest.quests.map((q, i) => (
            <QuestCard
              key={q.id}
              quest={{
                ...q,
                completedToday: q.completed,
                isLevelQuest: true,
              }}
              onComplete={() => handleCompleteLevelSubQuest(state.levelQuests.indexOf(activeLevelQuest), i)}
              rank={rank.key}
            />
          ))}
        </div>
      )}

      {/* Today's Quests */}
      <div className="space-y-3">
        <h2 className="font-orbitron text-sm font-bold text-slate-200 tracking-wider flex items-center gap-2">
          <Activity size={16} className="text-khalifa-blue" /> DAILY QUESTS
        </h2>

        {['deen', 'body', 'money'].map(pillar => {
          const Icon = pillarIcons[pillar];
          const quests = dailyByPillar[pillar] || [];
          const completedCount = quests.filter(q => q.completed).length;

          return (
            <div key={pillar} className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: pillarColors[pillar] }}>
                <Icon size={14} />
                {pillarLabels[pillar]}
                <span className="text-[10px] ml-1 opacity-60">
                  {completedCount}/{quests.length}
                </span>
                {state.pillars[pillar].streak > 0 && (
                  <span className="text-[10px] ml-1 opacity-60">🔥 {state.pillars[pillar].streak}</span>
                )}
                {state.streakFrozen?.[pillar] && (
                  <span className="text-[10px] ml-1 text-khalifa-gold font-semibold" title="Streak frozen — complete a quest today to save it. Miss today and it resets.">
                    ⚠ FROZEN
                  </span>
                )}
              </div>
              {quests.map(quest => (
                <QuestCard
                  key={quest.uniqueId}
                  quest={{
                    ...quest,
                    completedToday: quest.completed,
                  }}
                  onComplete={() => handleCompleteDaily(quest.uniqueId)}
                  rank={rank.key}
                />
              ))}
            </div>
          );
        })}

        {/* Custom Quests */}
        {state.customQuests.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Custom</div>
            {state.customQuests.map(quest => {
              const questKey = quest.uniqueId || quest.id;
              const completedToday = quest.lastCompleted === today ||
                (quest.completedAt && toLocalDateString(quest.completedAt) === today);
              return (
              <QuestCard
                key={questKey}
                quest={{
                  ...quest,
                  uniqueId: questKey,
                  completedToday,
                }}
                onComplete={() => handleCompleteCustom(questKey)}
                rank={rank.key}
              />
              );
            })}
          </div>
        )}

        <CustomQuestBuilder onAdd={addCustomQuest} state={state} />
      </div>
    </div>
  );
}
