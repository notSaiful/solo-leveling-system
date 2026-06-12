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

  // Handle daily quest completion
  const handleCompleteDaily = (questUniqueId) => {
    setState(prev => {
      let next = completeDailyQuest(prev, questUniqueId);

      // Apply shadow + streak bonuses
      const quest = prev.dailyQuests.find(q => q.uniqueId === questUniqueId);
      if (quest) {
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

      return next;
    });
  };

  // Handle level quest sub-quest completion
  const handleCompleteLevelSubQuest = (levelQuestIndex, questIndex) => {
    setState(prev => {
      let next = completeLevelQuest(prev, levelQuestIndex, questIndex);
      next = recalculateOverallLevel(next);
      next = { ...next, flowState: checkFlowState(next.history || [], rank.key) };
      return next;
    });
  };

  // Handle redemption quest completion
  const handleCompleteRedemption = (redemptionId) => {
    setState(prev => {
      let next = completeRedemptionQuest(prev, redemptionId);
      next = { ...next, flowState: checkFlowState(next.history || [], rank.key) };
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
      next = recalculateOverallLevel(next);
      next = { ...next, flowState: checkFlowState(next.history || [], rank.key) };
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
        {/* Decorative Corner Brackets */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-khalifa-gold/50" />
        <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-khalifa-gold/50" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-khalifa-gold/50" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-khalifa-gold/50" />

        {/* Background Decorative Star */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-khalifa-gold">
            <path d="M50 0l11.756 36.18h38.244L69.065 58.541l11.756 36.18L50 72.18l-30.821 22.541 11.756-36.18L0 36.18h38.244z" />
          </svg>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          <RankBadge level={state.user.overallLevel} />
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="system-header text-glow-khalifa text-khalifa-gold/80">Monarch Status</div>
              <div className="font-orbitron text-[10px] text-khalifa-steel tracking-widest">{new Date().toLocaleDateString('en-CA')}</div>
            </div>

            <XpBar
              current={state.pillars.deen.xp + state.pillars.body.xp + state.pillars.money.xp}
              max={xpForNextLevel(state.user.overallLevel) * 3}
              color="#EAB308"
              label="OVERALL POWER"
              level={state.user.overallLevel}
            />

            <div className="grid grid-cols-1 gap-3 mt-4">
              <XpBar current={state.pillars.deen.xp} max={xpForNextLevel(state.pillars.deen.level)} color="#3B82F6" label="DEEN" level={state.pillars.deen.level} />
              <XpBar current={state.pillars.body.xp} max={xpForNextLevel(state.pillars.body.level)} color="#F59E0B" label="BODY" level={state.pillars.body.level} />
              <XpBar current={state.pillars.money.xp} max={xpForNextLevel(state.pillars.money.level)} color="#EAB308" label="MONEY" level={state.pillars.money.level} />
            </div>
          </div>
        </div>

        {/* Stats row */}
        {state.stats && (
          <div className="grid grid-cols-6 gap-2 mt-6 pt-6 border-t border-khalifa-gold/10">
            {Object.entries(state.stats).map(([key, val]) => (
              <div key={key} className="text-center group">
                <div className="text-[9px] text-khalifa-steel group-hover:text-khalifa-gold/60 transition-colors uppercase tracking-[0.2em]">{key.slice(0, 3)}</div>
                <div className="text-sm font-orbitron font-bold text-khalifa-gold/90">{val}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Pillar Focus Selector */}
      <div className="glass-panel p-3 border border-yellow-500/30 bg-yellow-950/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
            <Star size={16} /> WEEKLY FOCUS
          </div>
          {state.weeklyFocus && (
            <button
              onClick={() => setState(prev => ({ ...prev, weeklyFocus: null }))}
              className="text-[10px] text-yellow-600 hover:text-yellow-400 uppercase tracking-wider px-2 py-1 rounded hover:bg-yellow-900/20 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="text-[10px] text-yellow-500/60 mb-2 uppercase tracking-wider">
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
                    ? 'bg-yellow-700/40 border-yellow-500/50 text-yellow-200'
                    : 'bg-yellow-950/20 border-yellow-800/30 text-yellow-500/60 hover:text-yellow-300 hover:border-yellow-700/40'
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
        <div className="glass-panel p-3 border border-cyan-500/40 bg-cyan-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Zap size={18} className="animate-pulse" />
            <span className="font-semibold text-sm tracking-wider">{flowDisplay.text}</span>
          </div>
          <span className="text-xs text-cyan-600">{flowDisplay.timeLeft}</span>
        </div>
      )}

      {/* Streak Bonus */}
      {streakBonus.multiplier > 1 && (
        <div className={`glass-panel p-3 border border-yellow-500/40 bg-yellow-950/20 flex items-center justify-between`}>
          <div className="flex items-center gap-2 text-yellow-400">
            <Sparkles size={18} />
            <span className="font-semibold text-sm">{streakBonus.label} STREAK</span>
            <span className="text-xs text-yellow-600">+{Math.round((streakBonus.multiplier - 1) * 100)}% XP</span>
          </div>
          <span className="text-xs text-yellow-600">{bestStreak} days</span>
        </div>
      )}


      {/* Gold Display */}
      <div className="flex items-center justify-between glass-panel p-3">
        <div className="flex items-center gap-2 text-yellow-400">
          <Coins size={18} />
          <span className="font-bold">{state.gold.toLocaleString()}</span>
          <span className="text-[10px] text-yellow-600 uppercase tracking-wider">Gold</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-cyan-500/40">
            <Activity size={12} />
            <span>Streak: {bestStreak}</span>
          </div>
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
        <div className="glass-panel p-3 border border-blue-500/30 bg-blue-950/10">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold mb-2">
            <Lock size={16} /> JOB CHANGE GATE
          </div>
          {state.jobChangeGates.filter(g => !g.completed && !g.failed).map(gate => {
            const currentStepIndex = gate.steps.findIndex(s => !s.completed);
            const currentStep = currentStepIndex === -1 ? gate.steps.length : currentStepIndex;
            const stepData = gate.steps[currentStep];
            return (
              <div key={gate.gateId} className="space-y-2">
                <div className="text-xs text-cyan-300">{gate.title} (Rank {gate.rank}) — Day {gate.day}/{gate.totalDays}</div>
                <div className="text-xs text-cyan-500/60">{currentStep}/{gate.steps.length} steps completed</div>
                <div className="w-full bg-cyan-900/30 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 rounded-full h-1.5 transition-all"
                    style={{ width: `${(currentStep / gate.steps.length) * 100}%` }}
                  />
                </div>
                {stepData && (
                  <div className="mt-2 rounded-lg border border-blue-700/30 bg-blue-950/10 p-2">
                    <div className="text-xs text-blue-300 font-semibold">{stepData.title}</div>
                    <div className="text-xs text-cyan-500/60">{stepData.description}</div>
                    <button
                      onClick={() => setState(prev => completeGateStep(prev, gate.gateId, currentStep))}
                      className="mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-900/30 border border-blue-500/40 text-blue-300 hover:bg-blue-800/40 transition-colors"
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
        <div className="glass-panel p-3 border border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-2">
            <BookOpen size={16} /> SEERAH QUEST CHAIN
          </div>
          {state.seerahChains.filter(c => !c.completed && !c.failed).map(chain => (
            <div key={chain.chainId} className="space-y-1">
              <div className="text-xs text-cyan-300">{chain.traitName} — Day {chain.day}/{chain.totalDays}</div>
              <div className="w-full bg-cyan-900/30 rounded-full h-1.5">
                <div
                  className="bg-amber-500 rounded-full h-1.5 transition-all"
                  style={{ width: `${(chain.day / chain.totalDays) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monarch Trials */}
      {state.monarchTrials?.active && (
        <div className="glass-panel p-3 border border-yellow-500/30 bg-yellow-950/10">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold mb-2">
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
                <div className="text-xs text-cyan-300">Stage {trial.stage}: {stageDef.name}</div>
                <div className="text-xs text-cyan-500/60">{progress}% complete</div>
                <div className="w-full bg-cyan-900/30 rounded-full h-1.5">
                  <div
                    className="bg-yellow-500 rounded-full h-1.5 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {trial.stage === 4 && (
                  <div className="text-[10px] text-yellow-500/60 mt-1">40 days of complete mastery. Zero misses across all 3 pillars.</div>
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
          <div className="glass-panel p-3 border border-emerald-500/30 bg-emerald-950/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <Crown size={16} /> KHALIFATE OBJECTIVES
              </div>
              <div className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-900/20 text-emerald-300">
                {progress.completed}/{progress.required} complete
              </div>
            </div>
            <div className="text-xs text-emerald-500/70 mb-2">
              {activeGate.subtitle}
            </div>
            <div className="w-full bg-cyan-900/30 rounded-full h-1.5 mb-3">
              <div
                className="bg-emerald-500 rounded-full h-1.5 transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="space-y-2">
              {allObjectives.map(obj => (
                <div key={obj.id} className={`flex items-start gap-2 rounded-lg border p-2 ${obj.completed ? 'border-emerald-700/30 bg-emerald-950/10' : 'border-cyan-800/20 bg-cyan-950/10'}`}>
                  <button
                    onClick={() => {
                      if (obj.completed) return;
                      setState(prev => completeKhalifateObjective(prev, obj.id));
                    }}
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${obj.completed ? 'bg-emerald-500 border-emerald-500' : 'border-cyan-600 hover:border-emerald-400'}`}
                  >
                    {obj.completed && <CheckCircle2 size={12} className="text-black" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${obj.completed ? 'text-emerald-400 line-through opacity-60' : 'text-cyan-300'}`}>{obj.label}</div>
                    <div className="text-[10px] text-cyan-500/60 leading-tight">{obj.description}</div>
                    {obj.completed && obj.completedAt && (
                      <div className="text-[9px] text-emerald-500/50 mt-0.5">Completed {new Date(obj.completedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${obj.pillar === 'deen' ? 'border-cyan-700/30 text-cyan-400' : obj.pillar === 'money' ? 'border-yellow-700/30 text-yellow-400' : obj.pillar === 'body' ? 'border-rose-700/30 text-rose-400' : 'border-purple-700/30 text-purple-400'}`}>
                    {obj.pillar}
                  </span>
                </div>
              ))}
            </div>
            {progress.percent >= 100 && (
              <div className="mt-2 text-xs text-emerald-400 font-semibold text-center">
                🚪 Gate Open. Level ascension unlocked.
              </div>
            )}
          </div>
        );
      })()}

      {/* Equipment Status */}
      {state.equipment && Object.values(state.equipment).some(Boolean) && (
        <div className="glass-panel p-3 border border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
              <Wrench size={16} /> EQUIPMENT
            </div>
            {(() => {
              const setBonus = getSetBonusStatus(state);
              return setBonus.active ? (
                <div className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-900/20 text-amber-300">
                  {setBonus.label} +10%
                </div>
              ) : null;
            })()}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['weapon', 'armor', 'ring'].map(slot => {
              const item = state.equipment?.[slot];
              return (
                <div key={slot} className={`rounded-lg p-2 border ${item ? 'bg-amber-950/20 border-amber-700/30' : 'bg-cyan-950/10 border-cyan-800/20'}`}>
                  <div className="text-[10px] text-cyan-500/60 uppercase capitalize">{slot}</div>
                  <div className={`text-xs truncate ${item ? getItemColorClass(item) : 'text-cyan-200'}`}>
                    {item ? item.name : 'Empty'}
                  </div>
                  {item && (
                    <>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[9px] text-cyan-500/50">{getItemTierLabel(item)}</span>
                        {item.enchantLevel > 0 && (
                          <span className="text-[9px] text-purple-400">+{item.enchantLevel}</span>
                        )}
                      </div>
                      <div className="mt-1 w-full bg-cyan-900/30 rounded-full h-1">
                        <div
                          className={`rounded-full h-1 transition-all ${item.durability > item.maxDurability * 0.3 ? 'bg-green-500' : 'bg-red-500'}`}
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
        <div className="glass-panel p-3 border border-purple-500/30 bg-purple-950/10">
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-2">
            <Star size={16} /> SKILLS
          </div>
          <div className="flex flex-wrap gap-2">
            {state.skills.map(skill => (
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

      {/* Solo Clear Bonus */}
      {state.weeklyStats?.soloClear && (
        <div className="glass-panel p-3 border border-green-500/30 bg-green-950/10 flex items-center gap-2">
          <Zap size={16} className="text-green-400" />
          <div className="text-sm text-green-400 font-semibold">Solo Clear Bonus Active</div>
          <div className="text-xs text-green-500/60">2x shadow extraction rate this week</div>
        </div>
      )}

      {/* Debuffs Warning */}
      {Object.entries(state.pillars).some(([_, p]) => isDebuffActive(p.activeDebuff)) && (
        <div className="glass-panel p-4 border border-red-500/30 bg-red-950/10">
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
          <div className="glass-panel p-4 border border-orange-500/30 bg-orange-950/10">
            <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2 text-sm tracking-wider">
              <Flame size={18} /> EXTREME MODE
            </div>
            {extremePillars.map(({ pillar, streak, severity }) => (
              <div key={pillar} className={`text-sm flex items-center gap-2 ${severity === 'critical' ? 'text-red-300' : severity === 'severe' ? 'text-orange-300' : 'text-orange-300/70'}`}>
                <AlertTriangle size={14} className={severity === 'critical' ? 'text-red-400' : 'text-orange-400'} />
                {getPillarDisplayKey(pillar)}: {getExtremePillarLabel(streak)} — {streak} days of silence
                <span className="text-[10px] ml-auto border border-orange-700/30 bg-orange-900/20 px-1.5 py-0.5 rounded">
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
          <h2 className="font-orbitron text-sm font-bold text-yellow-400 tracking-wider flex items-center gap-2">
            <Zap size={16} /> LEVEL QUEST: {activeLevelQuest.title}
          </h2>
          <div className="text-xs text-cyan-500/50 mb-2">{activeLevelQuest.description}</div>
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
        <h2 className="font-orbitron text-sm font-bold text-cyan-300 tracking-wider flex items-center gap-2">
          <Activity size={16} /> DAILY QUESTS
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
                  <span className="text-[10px] ml-1 text-yellow-400 font-semibold" title="Streak frozen — complete a quest today to save it. Miss today and it resets.">
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
            <div className="text-xs text-cyan-500/40 font-semibold uppercase tracking-widest">Custom</div>
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
