import { useState } from 'react';
import { Sword, Shield, Crown, CheckCircle2, Trophy, Star, Lock, Zap, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRankByLevel, RANK_CONFIG } from '../data/questCatalog';
import { completeWeeklyDungeon, getStreakBonus } from '../logic/questEngine';

export default function WeeklyDungeon({ state, setState }) {
  const dungeons = state.weeklyDungeons;
  const userRank = state.user.currentRank;
  const rankConfig = RANK_CONFIG[userRank];
  const overallLevel = state.user.overallLevel;

  const [claiming, setClaiming] = useState(null);

  const pillarMeta = {
    deen: { icon: Shield, label: 'Deen', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-950/20', bar: 'bg-cyan-400' },
    body: { icon: Sword, label: 'Body', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-950/20', bar: 'bg-rose-400' },
    money: { icon: Crown, label: 'Money', color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-950/20', bar: 'bg-yellow-400' },
  };

  // Difficulty stars based on rank
  const difficultyMap = { E: 1, D: 2, C: 3, B: 4, A: 5, S: 6 };
  const difficulty = difficultyMap[userRank] || 1;

  const handleClaim = (pillar) => {
    setClaiming(pillar);
    setState(prev => {
      const next = completeWeeklyDungeon(prev, pillar);
      return next;
    });
    setTimeout(() => setClaiming(null), 1000);
  };

  const allComplete = ['deen', 'body', 'money'].every(p => dungeons?.[p]?.steps?.every(s => s.completed));
  const allClaimed = dungeons?.deenCompleted && dungeons?.bodyCompleted && dungeons?.moneyCompleted;
  const bonusAvailable = allComplete && allClaimed && !dungeons?.bonusClaimed;

  const handleClaimBonus = () => {
    setState(prev => {
      const bonusGold = (rankConfig.xpMultiplier || 1) * 200;
      return {
        ...prev,
        gold: prev.gold + bonusGold,
        weeklyDungeons: { ...prev.weeklyDungeons, bonusClaimed: true },
        systemMessages: [
          ...prev.systemMessages,
          {
            type: 'reward',
            title: 'WEEKLY DUNGEON BONUS',
            subtitle: `All 3 dungeons conquered!`,
            message: `Bonus: ${bonusGold} Gold`,
          },
        ],
      };
    });
  };

  const toggleStep = (pillar, stepId) => {
    if (dungeons[`${pillar}Completed`]) return;
    setState(prev => {
      const newDungeons = { ...prev.weeklyDungeons };
      const pillarDungeon = { ...newDungeons[pillar] };
      pillarDungeon.steps = pillarDungeon.steps.map(s =>
        s.id === stepId
          ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date().toISOString() : null }
          : s
      );
      newDungeons[pillar] = pillarDungeon;
      return { ...prev, weeklyDungeons: newDungeons };
    });
  };

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto p-2 sm:p-4 space-y-4 relative z-10">
      {/* Header */}
      <div className="glass-panel-strong p-4 flex items-center justify-between relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-cyan-400/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-cyan-400/30" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-cyan-400/30" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-cyan-400/30" />

        <div className="flex items-center gap-3">
          <Sword size={24} className="text-cyan-400" />
          <div>
            <div className="font-orbitron font-bold text-cyan-200 tracking-wider">WEEKLY DUNGEONS</div>
            <div className="text-[10px] text-cyan-500/50 tracking-widest uppercase">Conquer all 3 for bonus rewards</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-yellow-900/20 border border-yellow-600/30 px-3 py-1.5 rounded-lg">
            <Coins size={14} className="text-yellow-400" />
            <span className="font-bold text-yellow-400 text-sm">{state.gold.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Rank & Difficulty */}
      <div className="glass-panel p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={16} className={`text-rank-${userRank.toLowerCase()}`} />
          <span className="text-sm text-cyan-300">Your Rank: <span className={`font-bold text-rank-${userRank.toLowerCase()}`}>{userRank}-Rank</span></span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-cyan-500/50 mr-1">Difficulty:</span>
          {[...Array(6)].map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}
            />
          ))}
        </div>
      </div>

      {/* Dungeon Cards */}
      {['deen', 'body', 'money'].map(pillar => {
        const meta = pillarMeta[pillar];
        const Icon = meta.icon;
        const dungeon = dungeons?.[pillar];
        if (!dungeon) return null;

        const stepsTotal = dungeon.steps?.length || 0;
        const stepsDone = dungeon.steps?.filter(s => s.completed).length || 0;
        const isComplete = stepsDone === stepsTotal && stepsTotal > 0;
        const isClaimed = dungeons?.[`${pillar}Completed`];
        const progress = stepsTotal > 0 ? (stepsDone / stepsTotal) * 100 : 0;

        // Scaled rewards
        const baseXp = dungeon.xp || 200;
        const scaledXp = Math.floor(baseXp * (rankConfig.xpMultiplier || 1));
        const scaledGold = Math.floor(scaledXp * 0.6);

        return (
          <motion.div
            key={pillar}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel p-4 border ${meta.border} relative ${isClaimed ? 'opacity-50' : ''}`}
          >
            <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-cyan-400/20" />
            <div className="absolute top-2 right-2 w-2 h-2 border-r border-t border-cyan-400/20" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-cyan-400/20" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-cyan-400/20" />

            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Icon size={20} className={meta.color} />
                <div>
                  <div className="font-semibold text-cyan-200">{dungeon.title}</div>
                  <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">{meta.label} Dungeon</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-cyan-400">
                  <Zap size={12} />
                  <span>{scaledXp} XP</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-yellow-400">
                  <Coins size={12} />
                  <span>{scaledGold} Gold</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-cyan-400/40 mb-3">{dungeon.description}</div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-cyan-500/50 mb-1">
                <span>Progress</span>
                <span>{stepsDone}/{stepsTotal}</span>
              </div>
              <div className="h-1.5 bg-cyan-950/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${meta.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {dungeon.steps.map(step => (
                <motion.div
                  key={step.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleStep(pillar, step.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    isClaimed ? 'cursor-default' : ''
                  } ${
                    step.completed ? 'bg-cyan-900/20' : 'bg-cyan-950/20 hover:bg-cyan-900/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    step.completed ? 'border-cyan-400 bg-cyan-400/20' : 'border-cyan-700'
                  }`}>
                    {step.completed && <CheckCircle2 size={14} className="text-cyan-400" />}
                  </div>
                  <span className={`text-sm ${step.completed ? 'text-cyan-400/60 line-through' : 'text-cyan-200'}`}>
                    {step.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Claim button */}
            {isComplete && !isClaimed && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleClaim(pillar)}
                disabled={claiming === pillar}
                className="mt-3 w-full py-2.5 rounded-lg bg-cyan-900/30 hover:bg-cyan-800/40 border border-cyan-500/40 text-cyan-300 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Trophy size={16} />
                {claiming === pillar ? 'Claiming...' : `Claim ${scaledXp} XP + ${scaledGold} Gold`}
              </motion.button>
            )}

            {isClaimed && (
              <div className="mt-3 w-full py-2.5 rounded-lg bg-cyan-950/30 border border-cyan-900/30 text-cyan-600 text-sm flex items-center justify-center gap-2">
                <CheckCircle2 size={16} />
                Dungeon Conquered
              </div>
            )}
          </motion.div>
        );
      })}

      {/* All-3 Bonus */}
      {bonusAvailable && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-5 border border-yellow-500/40 bg-yellow-950/10"
        >
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm mb-2">
            <Trophy size={18} />
            WEEKLY BONUS UNLOCKED
          </div>
          <div className="text-xs text-cyan-400/50 mb-3">
            All 3 dungeons conquered. Claim your mastery bonus.
          </div>
          <button
            onClick={handleClaimBonus}
            className="w-full py-2.5 rounded-lg bg-yellow-900/30 hover:bg-yellow-800/40 border border-yellow-500/40 text-yellow-300 text-sm font-semibold transition-colors"
          >
            Claim Bonus: {Math.floor((rankConfig.xpMultiplier || 1) * 200)} Gold
          </button>
        </motion.div>
      )}

      {allClaimed && dungeons?.bonusClaimed && (
        <div className="glass-panel p-4 border border-cyan-700/30 text-center">
          <div className="flex items-center justify-center gap-2 text-cyan-400/60 text-sm">
            <Trophy size={16} />
            Weekly Dungeons Complete. New dungeons arrive next week.
          </div>
        </div>
      )}
    </div>
  );
}
