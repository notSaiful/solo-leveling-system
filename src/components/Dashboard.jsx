import { useMemo, useEffect } from 'react';
import RankBadge from './RankBadge';
import XpBar from './XpBar';
import QuestCard from './QuestCard';
import CustomQuestBuilder from './CustomQuestBuilder';
import {
  initializeDailyQuests,
  initializeLevelQuest,
  initializeWeeklyDungeon,
  completeDailyQuest,
  completeLevelQuest,
  completeRedemptionQuest,
  recalculateOverallLevel,
  getFlowStateDisplay,
  getStreakBonus,
  getLevelProgress,
} from '../logic/questEngine';
import { getRankByLevel, xpForNextLevel } from '../data/questCatalog';
import { applyStatModifiers, getStatPointsForLevel } from '../data/stats';
import { isDebuffActive } from '../logic/penalties';
import { getShadowBonuses, applyShadowBonuses } from '../data/shadows';
import { AlertTriangle, Skull, Zap, Coins, Sparkles, Activity, Swords, Shield, Crown } from 'lucide-react';

export default function Dashboard({ state, setState }) {
  const rank = getRankByLevel(state.user.overallLevel);
  const today = new Date().toISOString().split('T')[0];

  // Initialize quests after render (not during render to avoid reversion loops)
  useEffect(() => {
    setState(prev => {
      let s = prev;
      s = initializeDailyQuests(s);
      s = initializeLevelQuest(s);
      s = initializeWeeklyDungeon(s);
      return s;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user.overallLevel, state.lastQuestDate, state.weeklyDungeons.weekId]);

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
          }
          next = { ...next, pillars: newPillars };
        }

        // Recalculate overall level
        next = recalculateOverallLevel(next);
      }

      return next;
    });
  };

  // Handle level quest sub-quest completion
  const handleCompleteLevelSubQuest = (levelQuestIndex, questIndex) => {
    setState(prev => {
      let next = completeLevelQuest(prev, levelQuestIndex, questIndex);
      next = recalculateOverallLevel(next);
      return next;
    });
  };

  // Handle redemption quest completion
  const handleCompleteRedemption = (redemptionId) => {
    setState(prev => completeRedemptionQuest(prev, redemptionId));
  };

  const addCustomQuest = (quest) => {
    setState(prev => ({
      ...prev,
      customQuests: [...prev.customQuests, { ...quest, lastCompleted: null }],
    }));
  };

  const pillarLabels = { deen: 'Deen', body: 'Body', money: 'Money' };
  const pillarColors = { deen: '#22d3ee', body: '#f43f5e', money: '#fbbf24' };
  const pillarIcons = { deen: Shield, body: Swords, money: Crown };

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 relative z-10">
      {/* Status Window - RPG Style */}
      <div className="glass-panel-strong p-6 relative">
        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-cyan-400/40" />
        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-cyan-400/40" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-cyan-400/40" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-cyan-400/40" />

        <div className="flex items-center gap-6">
          <RankBadge level={state.user.overallLevel} />
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="system-header">Player Status</div>
              <div className="text-xs text-cyan-500/40">{new Date().toLocaleDateString()}</div>
            </div>

            <XpBar
              current={state.pillars.deen.xp + state.pillars.body.xp + state.pillars.money.xp}
              max={xpForNextLevel(state.user.overallLevel) * 3}
              color={rank.color}
              label="Overall"
              level={state.user.overallLevel}
            />
            <XpBar current={state.pillars.deen.xp} max={xpForNextLevel(state.pillars.deen.level)} color="#22d3ee" label="Deen" level={state.pillars.deen.level} />
            <XpBar current={state.pillars.body.xp} max={xpForNextLevel(state.pillars.body.level)} color="#f43f5e" label="Body" level={state.pillars.body.level} />
            <XpBar current={state.pillars.money.xp} max={xpForNextLevel(state.pillars.money.level)} color="#fbbf24" label="Money" level={state.pillars.money.level} />
          </div>
        </div>

        {/* Stats row */}
        {state.stats && (
          <div className="grid grid-cols-6 gap-2 mt-4 pt-4 border-t border-cyan-900/30">
            {Object.entries(state.stats).map(([key, val]) => (
              <div key={key} className="text-center">
                <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">{key.slice(0, 3)}</div>
                <div className="text-sm font-bold text-cyan-300">{val}</div>
              </div>
            ))}
          </div>
        )}
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

      {/* Stat Points Notification */}
      {state.statPoints > 0 && (
        <div className="glass-panel p-3 border border-yellow-500/40 bg-yellow-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-400">
            <Sparkles size={18} />
            <span className="font-semibold text-sm">{state.statPoints} Stat Points</span>
          </div>
          <span className="text-xs text-yellow-600">Go to Build tab</span>
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

      {/* Debuffs Warning */}
      {Object.entries(state.pillars).some(([_, p]) => isDebuffActive(p.activeDebuff)) && (
        <div className="glass-panel p-4 border border-red-500/30 bg-red-950/10">
          <div className="flex items-center gap-2 text-red-400 font-semibold mb-2 text-sm tracking-wider">
            <Skull size={18} /> SYSTEM ALERT
          </div>
          {Object.entries(state.pillars).filter(([_, p]) => isDebuffActive(p.activeDebuff)).map(([pillar, p]) => (
            <div key={pillar} className="text-sm text-red-300/70 flex items-center gap-2">
              <AlertTriangle size={14} />
              {pillar.toUpperCase()}: {p.activeDebuff.message} (-{Math.round((1 - p.activeDebuff.multiplier) * 100)}% XP)
            </div>
          ))}
        </div>
      )}

      {/* Redemption Quests */}
      {state.redemptionQuests.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-orbitron text-sm font-bold text-red-400 tracking-wider flex items-center gap-2">
            <Zap size={16} /> REDEMPTION QUESTS
          </h2>
          {state.redemptionQuests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={{
                ...quest,
                completedToday: quest.completed,
                isRedemption: true,
              }}
              onComplete={() => handleCompleteRedemption(quest.id)}
              rank={rank.key}
            />
          ))}
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
            {state.customQuests.map(quest => (
              <QuestCard
                key={quest.id}
                quest={{
                  ...quest,
                  completedToday: state.history.some(h => h.date === today && h.questId === quest.id),
                }}
                onComplete={() => handleCompleteDaily(quest.uniqueId)}
                rank={rank.key}
              />
            ))}
          </div>
        )}

        <CustomQuestBuilder onAdd={addCustomQuest} state={state} />
      </div>
    </div>
  );
}
