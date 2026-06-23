import { BarChart3, TrendingUp, Flame, AlertTriangle, Shield, Skull, Trophy, Zap, Activity, Swords, Brain, Eye, Heart, Sparkles, Dumbbell, Wind } from 'lucide-react';
import { isDebuffActive } from '../logic/penalties';
import { getLevelProgress } from '../logic/questEngine';
import { xpForNextLevel } from '../data/questCatalog';
import { getRankByLevel } from '../data/questCatalog';
import { STAT_NAMES, getCharacterBuild } from '../data/stats';
import { getPillarLabel } from '../utils/pillarDisplay';

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
    <div className="glass-panel p-3 sm:p-4 border-khalifa-gold/5 bg-khalifa-void/20 group hover:border-khalifa-gold/20 transition-all">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={16} className={color} />}
        <span className="text-[10px] text-khalifa-steel uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold font-playfair text-gray-100 mb-1">{value}</div>
      {sub && <div className="text-[10px] text-khalifa-steel/50 mb-3">{sub}</div>}
      {progress !== undefined && <ProgressBar value={progress} color={color.replace('text-', 'bg-')} />}
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

  const pillarColors = {
    deen: 'text-khalifa-blue',
    body: 'text-khalifa-amber',
    money: 'text-khalifa-gold'
  };

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto p-2 sm:p-4 space-y-6 relative z-10">
      {/* Overall Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-playfair text-xl font-bold text-khalifa-gold tracking-tight flex items-center gap-2">
          <BarChart3 size={20} /> MONARCH RECORDS
        </h2>
        <div className="font-orbitron text-[10px] text-khalifa-steel tracking-widest">ACCUMULATED XP: {totalXp.toLocaleString()}</div>
      </div>

      {/* Rank & Overall Progress */}
      <div className="glass-panel-khalifa p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 opacity-[0.02] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-khalifa-gold">
            <path d="M50 0l11.756 36.18h38.244L69.065 58.541l11.756 36.18L50 72.18l-30.821 22.541 11.756-36.18L0 36.18h38.244z" />
          </svg>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-black font-orbitron ${rank.color || 'text-khalifa-gold'} text-glow-khalifa`}>{rank.key}</div>
            <div>
              <div className="text-xl font-bold font-playfair text-gray-100">{rank.name}</div>
              <div className="text-[10px] text-khalifa-gold/60 font-orbitron uppercase tracking-widest">{rank.title}</div>
            </div>
          </div>
          <div className="sm:text-right border-l sm:border-l-0 sm:border-r border-khalifa-gold/20 pl-4 sm:pl-0 sm:pr-4">
            <div className="text-2xl font-bold font-orbitron text-khalifa-gold">LVL {state.user.overallLevel}</div>
            <div className="text-[10px] text-khalifa-steel font-orbitron uppercase tracking-tighter">Ascension Progress</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-orbitron text-khalifa-steel uppercase tracking-widest mb-1">
            <span>Rank {rank.key}</span>
            <span>{rankProgress}% to {rank.key === 'S' ? 'MAX' : 'next rank'}</span>
          </div>
          <ProgressBar value={rankProgress} color={rank.color?.replace('text-', 'bg-') || 'bg-khalifa-gold'} />
        </div>
      </div>

      {/* Pillar Stats with Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Deen"
          value={`Lv ${state.pillars.deen.level}`}
          sub={`${state.pillars.deen.xp.toLocaleString()} XP · ${state.pillars.deen.streak} day streak`}
          icon={Shield}
          color="text-khalifa-blue"
          progress={deenProgress}
        />
        <StatCard
          label="Body"
          value={`Lv ${state.pillars.body.level}`}
          sub={`${state.pillars.body.xp.toLocaleString()} XP · ${state.pillars.body.streak} day streak`}
          icon={Activity}
          color="text-khalifa-amber"
          progress={bodyProgress}
        />
        <StatCard
          label="Money"
          value={`Lv ${state.pillars.money.level}`}
          sub={`${state.pillars.money.xp.toLocaleString()} XP · ${state.pillars.money.streak} day streak`}
          icon={Trophy}
          color="text-khalifa-gold"
          progress={moneyProgress}
        />
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-box group border-khalifa-blue/10">
          <TrendingUp className="mx-auto mb-2 text-khalifa-blue group-hover:scale-110 transition-transform" size={18} />
          <div className="text-xl font-bold font-orbitron text-gray-100">{totalQuests}</div>
          <div className="text-[9px] text-khalifa-steel uppercase tracking-[0.2em]">Quests</div>
        </div>
        <div className="stat-box group border-khalifa-amber/10">
          <Flame className="mx-auto mb-2 text-khalifa-amber group-hover:scale-110 transition-transform" size={18} />
          <div className="text-xl font-bold font-orbitron text-gray-100">{currentStreak}</div>
          <div className="text-[9px] text-khalifa-steel uppercase tracking-[0.2em]">Streak</div>
        </div>
        <div className="stat-box group border-khalifa-purple/10">
          <Zap className="mx-auto mb-2 text-khalifa-purple group-hover:scale-110 transition-transform" size={18} />
          <div className="text-xl font-bold font-orbitron text-gray-100">{state.levelQuests.filter(q => q.completed).length}</div>
          <div className="text-[9px] text-khalifa-steel uppercase tracking-[0.2em]">Lv Quests</div>
        </div>
        <div className="stat-box group border-khalifa-gold/10">
          <Trophy className="mx-auto mb-2 text-khalifa-gold group-hover:scale-110 transition-transform" size={18} />
          <div className="text-xl font-bold font-orbitron text-gray-100">{state.gold.toLocaleString()}</div>
          <div className="text-[9px] text-khalifa-steel uppercase tracking-[0.2em]">Gold</div>
        </div>
      </div>

      {/* Character Stats */}
      <div className="glass-panel-khalifa p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold text-khalifa-gold/80 tracking-[0.3em] uppercase font-orbitron">Vessel Capacities</div>
          <div className="flex items-center gap-2 bg-khalifa-gold/5 border border-khalifa-gold/20 px-4 py-1.5 rounded-xl shadow-inner">
            <span className="text-lg">{build.icon}</span>
            <span className="text-xs font-bold font-playfair text-khalifa-gold tracking-wide">{build.name}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {Object.entries(STAT_NAMES).map(([key, config]) => {
            const value = stats[key] || 10;
            const Icon = statIcons[key] || Shield;
            return (
              <div key={key} className="group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-khalifa-void/60 border border-khalifa-gold/10 flex items-center justify-center group-hover:border-khalifa-gold/30 transition-all">
                    <Icon size={18} style={{ color: config.color }} className="opacity-70 group-hover:opacity-100" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-khalifa-steel font-orbitron uppercase tracking-widest">{config.name}</span>
                      <span className="font-bold font-orbitron text-gray-100">{value}</span>
                    </div>
                    <ProgressBar
                      value={((value - 10) / 40) * 100}
                      color="bg-khalifa-gold"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stat Effects Summary */}
      <div className="glass-panel-khalifa p-6 bg-khalifa-void/40">
        <div className="font-orbitron text-[10px] font-bold text-khalifa-gold tracking-[0.3em] mb-4 uppercase opacity-60">Active Capacity Modifiers</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Dumbbell size={14} className="text-khalifa-amber mt-0.5 shrink-0" />
              <div className="text-xs text-khalifa-steel leading-relaxed">
                <span className="text-gray-200 font-bold">Strength:</span> Increases Adventure XP yield by <span className="text-khalifa-amber">+{((stats.strength || 10) - 10) * 2}%</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain size={14} className="text-khalifa-blue mt-0.5 shrink-0" />
              <div className="text-xs text-khalifa-steel leading-relaxed">
                <span className="text-gray-200 font-bold">Intelligence:</span> Increases Deen XP yield by <span className="text-khalifa-blue">+{((stats.intelligence || 10) - 10) * 2}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Eye size={14} className="text-khalifa-gold mt-0.5 shrink-0" />
              <div className="text-xs text-khalifa-steel leading-relaxed">
                <span className="text-gray-200 font-bold">Sense:</span> Increases Money XP yield by <span className="text-khalifa-gold">+{((stats.sense || 10) - 10) * 2}%</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Wind size={14} className="text-khalifa-purple mt-0.5 shrink-0" />
              <div className="text-xs text-khalifa-steel leading-relaxed">
                <span className="text-gray-200 font-bold">Agility:</span> Elevates total XP gain by <span className="text-khalifa-purple">+{(((stats.agility || 10) - 10) * 0.5).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Penalties */}
      {Object.entries(state.pillars).some(([_, p]) => isDebuffActive(p.activeDebuff)) && (
        <div className="glass-panel p-4 border border-red-500/30 bg-red-950/10">
          <div className="flex items-center gap-2 text-red-400 font-bold mb-3 text-xs tracking-[0.2em] font-orbitron">
            <Skull size={18} /> SYSTEM DISRUPTIONS
          </div>
          {Object.entries(state.pillars).filter(([_, p]) => isDebuffActive(p.activeDebuff)).map(([pillar, p]) => (
            <div key={pillar} className="text-sm text-red-300/70 mb-2 flex items-start gap-2">
              <span className="font-bold text-red-400 shrink-0 uppercase text-[10px] mt-1 border border-red-500/30 px-1 rounded">{getPillarLabel(pillar)}:</span>
              <span className="leading-tight">{p.activeDebuff.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
