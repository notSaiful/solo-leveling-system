import { BarChart3, TrendingUp, Flame, AlertTriangle, Shield, Trophy, Zap, Activity, Swords, Brain, Eye, Heart, Sparkles, Dumbbell, Wind } from 'lucide-react';
import { isDebuffActive } from '../logic/penalties';
import { getLevelProgress } from '../logic/questEngine';
import { xpForNextLevel } from '../data/questCatalog';
import { getRankByLevel } from '../data/questCatalog';
import { STAT_NAMES, getCharacterBuild } from '../data/stats';

function ProgressBar({ value, color = 'bg-cyan-400', bg = 'bg-cyan-900/30' }) {
  return (
    <div className={`h-2 rounded-full ${bg} overflow-hidden`}>
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, progress }) {
  return (
    <div className="glass-panel p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={16} className={color} />}
        <span className="text-xs text-cyan-500/60 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-cyan-100 mb-1">{value}</div>
      {sub && <div className="text-[10px] text-cyan-500/40 mb-2">{sub}</div>}
      {progress !== undefined && <ProgressBar value={progress} />}
    </div>
  );
}

export default function StatsPanel({ state }) {
  const totalXp = state.pillars.deen.xp + state.pillars.body.xp + state.pillars.money.xp;
  const totalQuests = state.history.filter(h => h.completed).length;
  const currentStreak = Math.max(state.pillars.deen.streak, state.pillars.body.streak, state.pillars.money.streak);
  const stats = state.stats || {};
  const build = getCharacterBuild(stats);
  const rank = getRankByLevel(state.user.overallLevel);

  // Overall rank progress
  const nextRankMin = rank.maxLevel + 1;
  const prevRankMin = rank.minLevel;
  const rankProgress = state.user.overallLevel >= nextRankMin ? 100 : Math.floor(((state.user.overallLevel - prevRankMin) / (nextRankMin - prevRankMin)) * 100);

  // Pillar progress
  const deenProgress = getLevelProgress(state.pillars.deen);
  const bodyProgress = getLevelProgress(state.pillars.body);
  const moneyProgress = getLevelProgress(state.pillars.money);
  const deenNeeded = xpForNextLevel(state.pillars.deen.level);
  const bodyNeeded = xpForNextLevel(state.pillars.body.level);
  const moneyNeeded = xpForNextLevel(state.pillars.money.level);

  // Character stat icon map
  const statIcons = {
    strength: Dumbbell,
    agility: Wind,
    intelligence: Brain,
    sense: Eye,
    health: Heart,
    mana: Sparkles,
  };

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto p-2 sm:p-4 space-y-4 relative z-10">
      {/* Overall Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-orbitron text-sm font-bold text-cyan-300 tracking-wider flex items-center gap-2">
          <BarChart3 size={16} /> STATISTICS
        </h2>
        <div className="text-xs text-cyan-500/40">Overall XP: {totalXp.toLocaleString()}</div>
      </div>

      {/* Rank & Overall Progress */}
      <div className="glass-panel-strong p-4 relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-cyan-400/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-cyan-400/30" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-cyan-400/30" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-cyan-400/30" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-black ${rank.color || 'text-cyan-400'}`}>{rank.key}-RANK</div>
            <div className="text-sm text-cyan-400/60">{rank.title}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-100">Lvl {state.user.overallLevel}</div>
            <div className="text-[10px] text-cyan-500/50">Next rank at {nextRankMin}</div>
          </div>
        </div>
        <ProgressBar value={rankProgress} color={rank.color?.replace('text-', 'bg-') || 'bg-cyan-400'} />
        <div className="flex justify-between text-[10px] text-cyan-500/40 mt-1">
          <span>{prevRankMin}</span>
          <span>{rankProgress}% to {rank.key === 'S' ? 'MAX' : 'next rank'}</span>
          <span>{nextRankMin}</span>
        </div>
      </div>

      {/* Pillar Stats with Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Deen"
          value={`Lv ${state.pillars.deen.level}`}
          sub={`${state.pillars.deen.xp.toLocaleString()} / ${deenNeeded.toLocaleString()} XP · ${state.pillars.deen.streak}🔥 streak`}
          icon={Shield}
          color="text-cyan-400"
          progress={deenProgress}
        />
        <StatCard
          label="Body"
          value={`Lv ${state.pillars.body.level}`}
          sub={`${state.pillars.body.xp.toLocaleString()} / ${bodyNeeded.toLocaleString()} XP · ${state.pillars.body.streak}🔥 streak`}
          icon={Activity}
          color="text-rose-400"
          progress={bodyProgress}
        />
        <StatCard
          label="Money"
          value={`Lv ${state.pillars.money.level}`}
          sub={`${state.pillars.money.xp.toLocaleString()} / ${moneyNeeded.toLocaleString()} XP · ${state.pillars.money.streak}🔥 streak`}
          icon={Trophy}
          color="text-yellow-400"
          progress={moneyProgress}
        />
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="stat-box">
          <TrendingUp className="mx-auto mb-2 text-cyan-400" size={18} />
          <div className="text-lg font-bold text-cyan-100">{totalQuests}</div>
          <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">Quests Done</div>
        </div>
        <div className="stat-box">
          <Flame className="mx-auto mb-2 text-orange-400" size={18} />
          <div className="text-lg font-bold text-cyan-100">{currentStreak}</div>
          <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">Best Streak</div>
        </div>
        <div className="stat-box">
          <Zap className="mx-auto mb-2 text-yellow-400" size={18} />
          <div className="text-lg font-bold text-cyan-100">{state.levelQuests.filter(q => q.completed).length}</div>
          <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">Lv Quests</div>
        </div>
        <div className="stat-box">
          <Trophy className="mx-auto mb-2 text-rank-s" size={18} />
          <div className="text-lg font-bold text-cyan-100">{state.gold.toLocaleString()}</div>
          <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">Gold</div>
        </div>
      </div>

      {/* Character Stats */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-cyan-300/60 tracking-wider uppercase">Character Stats</div>
          <div className="flex items-center gap-2 bg-cyan-950/30 border border-cyan-800/30 px-3 py-1 rounded-lg">
            <span className="text-sm">{build.icon}</span>
            <span className="text-xs text-cyan-300">{build.name}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(STAT_NAMES).map(([key, config]) => {
            const value = stats[key] || 10;
            const Icon = statIcons[key] || Shield;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center">
                  <Icon size={14} style={{ color: config.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-cyan-400/70">{config.name}</span>
                    <span className="font-bold text-cyan-100">{value}</span>
                  </div>
                  <ProgressBar
                    value={((value - 10) / 40) * 100}
                    color="bg-cyan-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stat Effects Summary */}
      <div className="glass-panel p-4 text-xs text-cyan-400/60 space-y-2">
        <div className="font-semibold text-cyan-300/70 mb-2 tracking-wider uppercase">Active Modifiers</div>
        <ul className="space-y-1">
          <li>💪 <strong className="text-cyan-300">Strength:{stats.strength || 10}</strong> → +{((stats.strength || 10) - 10) * 2}% Body XP</li>
          <li>🧠 <strong className="text-cyan-300">Intelligence:{stats.intelligence || 10}</strong> → +{((stats.intelligence || 10) - 10) * 2}% Deen XP</li>
          <li>👁️ <strong className="text-cyan-300">Sense:{stats.sense || 10}</strong> → +{((stats.sense || 10) - 10) * 2}% Money XP</li>
          <li>⚡ <strong className="text-cyan-300">Agility:{stats.agility || 10}</strong> → +{(((stats.agility || 10) - 10) * 0.5).toFixed(1)}% all XP</li>
          <li>❤️ <strong className="text-cyan-300">Health:{stats.health || 10}</strong> → -{Math.min(50, ((stats.health || 10) - 10) * 2)}% debuff XP loss</li>
          <li>✨ <strong className="text-cyan-300">Mana:{stats.mana || 10}</strong> → -{Math.min(50, ((stats.mana || 10) - 10) * 2)}% debuff duration</li>
        </ul>
      </div>

      {/* Active Penalties */}
      {Object.entries(state.pillars).some(([_, p]) => isDebuffActive(p.activeDebuff)) && (
        <div className="glass-panel p-4 border border-red-500/30">
          <div className="flex items-center gap-2 text-red-400 font-semibold mb-3 text-sm tracking-wider">
            <AlertTriangle size={16} /> SYSTEM ALERTS
          </div>
          {Object.entries(state.pillars).filter(([_, p]) => isDebuffActive(p.activeDebuff)).map(([pillar, p]) => (
            <div key={pillar} className="text-sm text-red-300/60 mb-1">
              <span className="font-semibold capitalize">{pillar}</span>: {p.activeDebuff.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
