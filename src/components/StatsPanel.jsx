import { BarChart3, TrendingUp, Flame, AlertTriangle, Shield, Trophy, Zap } from 'lucide-react';
import { isDebuffActive } from '../logic/penalties';

export default function StatsPanel({ state }) {
  const totalXp = state.pillars.deen.xp + state.pillars.body.xp + state.pillars.money.xp;
  const totalQuests = state.history.filter(h => h.completed).length;
  const currentStreak = Math.max(state.pillars.deen.streak, state.pillars.body.streak, state.pillars.money.streak);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 relative z-10">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-orbitron text-sm font-bold text-cyan-300 tracking-wider flex items-center gap-2">
          <BarChart3 size={16} /> STATISTICS
        </h2>
        <div className="text-xs text-cyan-500/40">Overall XP: {totalXp.toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="stat-box">
          <BarChart3 className="mx-auto mb-2 text-cyan-400" size={20} />
          <div className="text-xl font-bold text-cyan-100">{state.pillars.deen.xp.toLocaleString()}</div>
          <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">Deen XP</div>
        </div>
        <div className="stat-box">
          <BarChart3 className="mx-auto mb-2 text-rose-400" size={20} />
          <div className="text-xl font-bold text-cyan-100">{state.pillars.body.xp.toLocaleString()}</div>
          <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">Body XP</div>
        </div>
        <div className="stat-box">
          <BarChart3 className="mx-auto mb-2 text-yellow-400" size={20} />
          <div className="text-xl font-bold text-cyan-100">{state.pillars.money.xp.toLocaleString()}</div>
          <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">Money XP</div>
        </div>
      </div>

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
          <Shield className="mx-auto mb-2 text-yellow-400" size={18} />
          <div className="text-lg font-bold text-cyan-100">{state.levelQuests.filter(q => q.completed).length}</div>
          <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">Lv Quests</div>
        </div>
        <div className="stat-box">
          <Trophy className="mx-auto mb-2 text-rank-s" size={18} />
          <div className="text-lg font-bold text-cyan-100">{state.gold}</div>
          <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">Gold Earned</div>
        </div>
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

      {/* Streak Breakdown */}
      <div className="glass-panel p-4">
        <div className="text-xs font-semibold text-cyan-300/60 mb-3 tracking-wider uppercase">Current Streaks</div>
        <div className="grid grid-cols-3 gap-4">
          {['deen', 'body', 'money'].map(pillar => (
            <div key={pillar} className="text-center">
              <div className="text-2xl font-bold text-cyan-100">{state.pillars[pillar].streak}</div>
              <div className="text-[10px] text-cyan-500/50 uppercase tracking-wider">{pillar}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
