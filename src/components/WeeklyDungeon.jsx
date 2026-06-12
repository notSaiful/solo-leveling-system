import { useState } from 'react';
import { Sword, Shield, Crown, CheckCircle2, Trophy, Star, Lock, Zap, Coins, Users, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRankByLevel, RANK_CONFIG } from '../data/questCatalog';
import { completeWeeklyDungeon, getStreakBonus } from '../logic/questEngine';
import { PILLAR_LABELS } from '../utils/pillarDisplay';

export default function WeeklyDungeon({ state, setState }) {
  const dungeons = state.weeklyDungeons;
  const userRank = state.user.currentRank;
  const rankConfig = RANK_CONFIG[userRank];
  const overallLevel = state.user.overallLevel;

  const [claiming, setClaiming] = useState(null);

  const pillarMeta = {
    deen: { icon: Shield, label: 'Deen', color: 'text-khalifa-blue', border: 'border-khalifa-blue/30', bg: 'bg-khalifa-blue/5', bar: 'bg-khalifa-blue' },
    body: { icon: Sword, label: PILLAR_LABELS.body, color: 'text-khalifa-amber', border: 'border-khalifa-amber/30', bg: 'bg-khalifa-amber/5', bar: 'bg-khalifa-amber' },
    money: { icon: Crown, label: 'Money', color: 'text-khalifa-gold', border: 'border-khalifa-gold/30', bg: 'bg-khalifa-gold/5', bar: 'bg-khalifa-gold' },
    ummah: { icon: Users, label: 'Ummah Service', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/20', bar: 'bg-emerald-400' },
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

  const allDungeonPillars = ['deen', 'body', 'money', 'ummah'];
  const allComplete = allDungeonPillars.every(p => dungeons?.[p]?.steps?.every(s => s.completed));
  const allClaimed = dungeons?.deenCompleted && dungeons?.bodyCompleted && dungeons?.moneyCompleted && dungeons?.ummahCompleted;
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
            subtitle: `All 4 dungeons conquered!`,
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
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto p-2 sm:p-4 space-y-6 relative z-10 font-inter">
      {/* Header */}
      <div className="glass-panel-khalifa p-6 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-khalifa-gold/40" />
        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-khalifa-gold/40" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-khalifa-gold/40" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-khalifa-gold/40" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-khalifa-gold/10 border border-khalifa-gold/20 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.1)]">
            <Sword size={28} className="text-khalifa-gold" />
          </div>
          <div>
            <div className="font-playfair text-xl font-bold text-gray-100 tracking-tight">Weekly Trials</div>
            <div className="font-orbitron text-[9px] text-khalifa-gold/60 tracking-[0.2em] uppercase mt-0.5">Conquer the Dimensional Gates</div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <div className="flex items-center gap-2 bg-khalifa-amber/10 border border-khalifa-amber/30 px-4 py-2 rounded-xl shadow-inner">
            <Coins size={16} className="text-khalifa-amber" />
            <span className="font-orbitron font-bold text-khalifa-amber text-base">{state.gold.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Rank & Difficulty */}
      <div className="glass-panel p-4 flex items-center justify-between bg-khalifa-void/20 border-khalifa-gold/5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-current bg-current/5 text-rank-${userRank.toLowerCase()}`}>
            <Star size={16} className="fill-current" />
          </div>
          <span className="text-sm font-playfair text-gray-200">Current Standing: <span className={`font-bold font-orbitron text-rank-${userRank.toLowerCase()}`}>{userRank}-Rank</span></span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
          <span className="text-[10px] font-orbitron text-khalifa-steel tracking-widest uppercase mr-1">Hazard Level</span>
          {[...Array(6)].map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < difficulty ? 'text-khalifa-gold fill-khalifa-gold shadow-glow' : 'text-gray-800'}
            />
          ))}
        </div>
      </div>

      {/* Solo Clear & Drop Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`glass-panel p-4 border transition-all ${state.weeklyStats?.soloClear ? 'border-green-500/40 bg-green-950/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-khalifa-blue/20 bg-khalifa-blue/5'}`}>
          <div className="flex items-center gap-2 text-sm font-bold font-playfair mb-2 tracking-wide">
            <Users size={18} className={state.weeklyStats?.soloClear ? 'text-green-400' : 'text-khalifa-blue'} />
            <span className={state.weeklyStats?.soloClear ? 'text-green-400' : 'text-gray-200'}>
              Solo Clear Protocol {state.weeklyStats?.soloClear ? '[ACTIVE]' : ''}
            </span>
          </div>
          <div className="text-xs text-khalifa-steel leading-relaxed">
            {state.weeklyStats?.soloClear
              ? 'Dimensional resonance optimized. 2x shadow extraction rate is currently active for all sectors.'
              : `System records ${state.weeklyStats?.aiPromptsUsed || 0} external assists. Maintain 0 usage for Solo Clear bonus.`}
          </div>
        </div>
        <div className="glass-panel p-4 border border-khalifa-amber/20 bg-khalifa-amber/5">
          <div className="flex items-center gap-2 text-sm font-bold font-playfair mb-2 tracking-wide text-gray-200">
            <Wrench size={18} className="text-khalifa-amber" />
            Provision Drop Chance
          </div>
          <div className="text-xs text-khalifa-steel leading-relaxed">
            {state.weeklyStats?.soloClear
              ? 'Divine Provision detected. A guaranteed equipment drop is secured for the next sector claim.'
              : 'Standard drop rate: 15%. Achieve Solo Clear to force a guaranteed high-tier equipment drop.'}
          </div>
        </div>
      </div>

      {/* Dungeon Cards */}
      <div className="space-y-4">
        {allDungeonPillars.map(pillar => {
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
              className={`glass-panel p-5 border ${meta.border} relative overflow-hidden transition-all group ${isClaimed ? 'opacity-40 grayscale-[0.5]' : 'hover:bg-white/[0.02]'}`}
            >
              <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-white/10" />
              <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-white/10" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-white/10" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-white/10" />

              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-current/10 ${meta.color} border border-current/20 shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className="opacity-80" />
                  </div>
                  <div>
                    <div className="font-playfair font-bold text-gray-100 text-lg leading-tight">{dungeon.title}</div>
                    <div className={`font-orbitron text-[9px] uppercase tracking-[0.2em] mt-0.5 ${meta.color} opacity-70`}>{meta.label} Sector {pillar === 'body' ? 'Gate' : 'Trial'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-xl border border-white/5 self-start sm:self-center">
                  <div className="flex items-center gap-1.5 text-xs font-orbitron text-khalifa-blue">
                    <Zap size={14} className="fill-current opacity-70" />
                    <span className="font-bold">{scaledXp}</span>
                  </div>
                  <div className="h-3 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-1.5 text-xs font-orbitron text-khalifa-gold">
                    <Coins size={14} className="fill-current opacity-70" />
                    <span className="font-bold">{scaledGold}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-khalifa-steel/70 mb-5 leading-relaxed font-inter">{dungeon.description}</div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-[9px] font-orbitron text-khalifa-steel uppercase tracking-widest mb-2">
                  <span>Sector Integrity</span>
                  <span className={meta.color}>{stepsDone}/{stepsTotal} Objectives</span>
                </div>
                <div className="h-1 bg-khalifa-void rounded-full overflow-hidden relative">
                  <motion.div
                    className={`h-full rounded-full ${meta.bar} relative z-10`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ boxShadow: `0 0 10px ${meta.bar.replace('bg-', '')}` }}
                  />
                  <div className="absolute inset-0 bg-white/5 opacity-20" />
                </div>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dungeon.steps.map(step => (
                  <motion.div
                    key={step.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleStep(pillar, step.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isClaimed ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      step.completed
                        ? 'bg-white/5 border-white/10 shadow-inner'
                        : 'bg-black/20 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                      step.completed
                        ? 'border-green-500 bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                        : 'border-khalifa-steel/30'
                    }`}>
                      {step.completed && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <span className={`text-xs font-inter transition-all ${step.completed ? 'text-khalifa-steel/50 line-through' : 'text-gray-300 group-hover:text-white'}`}>
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
                  className="mt-5 w-full py-3.5 rounded-xl bg-gradient-to-r from-khalifa-gold/20 to-khalifa-amber/20 hover:from-khalifa-gold/30 hover:to-khalifa-amber/30 border border-khalifa-gold/40 text-khalifa-gold text-sm font-bold transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(234,179,8,0.1)] font-orbitron tracking-widest uppercase"
                >
                  <Trophy size={18} />
                  {claiming === pillar ? 'SYNCHRONIZING...' : `SECURE PROVISION: ${scaledXp}XP + ${scaledGold}G`}
                </motion.button>
              )}

              {isClaimed && (
                <div className="mt-5 w-full py-3.5 rounded-xl bg-green-950/10 border border-green-900/30 text-green-500/60 text-[10px] font-orbitron tracking-[0.3em] uppercase flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  Sector Fully Secured
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* All-4 Bonus */}
      {bonusAvailable && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel-khalifa p-6 border-khalifa-gold/40 bg-khalifa-gold/10 relative overflow-hidden"
        >
           {/* Background pulse effect */}
           <div className="absolute inset-0 bg-khalifa-gold/5 animate-pulse" />

          <div className="flex items-center gap-3 text-khalifa-gold font-bold text-lg mb-3 relative z-10 font-playfair">
            <Trophy size={24} className="animate-bounce" />
            MONARCH'S SUPREMACY UNLOCKED
          </div>
          <div className="text-xs text-khalifa-steel mb-5 leading-relaxed relative z-10 font-inter">
            All Dimensional Gates have been stabilized. The Monarch's influence expands. Claim the grand mastery provision for this week's triumph.
          </div>
          <button
            onClick={handleClaimBonus}
            className="relative z-10 w-full py-4 rounded-xl bg-khalifa-gold hover:bg-khalifa-gold/90 text-black text-sm font-black transition-all shadow-[0_0_30px_rgba(234,179,8,0.4)] font-orbitron tracking-[0.2em] uppercase"
          >
            CLAIM MASTERY: {Math.floor((rankConfig.xpMultiplier || 1) * 200)} GOLD
          </button>
        </motion.div>
      )}

      {allClaimed && dungeons?.bonusClaimed && (
        <div className="glass-panel p-6 border-dashed border-khalifa-steel/20 text-center bg-white/[0.01]">
          <div className="flex flex-col items-center justify-center gap-2 text-khalifa-steel/40 text-sm">
            <Trophy size={32} className="opacity-20 mb-2" />
            <div className="font-orbitron text-[10px] tracking-[0.4em] uppercase">Dimensional Stability Maintained</div>
            <div className="font-playfair italic">New sectors will manifest in the next cycle.</div>
          </div>
        </div>
      )}
    </div>
  );
}
