import { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Swords, Settings, ShoppingBag, Sparkles, Coins, Zap } from 'lucide-react';
import { useStore } from './hooks/useStore';
import { useLevelUp } from './hooks/useLevelUp';
import { usePenaltyCheck } from './hooks/usePenaltyCheck';
import Dashboard from './components/Dashboard';
import StatsPanel from './components/StatsPanel';
import WeeklyDungeon from './components/WeeklyDungeon';
import SystemMessage from './components/SystemMessage';
import RewardStore from './components/RewardStore';
import StatDistribution from './components/StatDistribution';
import { getCurrentWeekId } from './logic/dungeons';
import { getRankByLevel, getWeeklyDungeonForRank } from './data/questCatalog';
import { getFlowStateDisplay } from './logic/questEngine';
import { getCharacterBuild } from './data/stats';

// Floating particle component
function FloatingParticles() {
  return (
    <div className="floating-particles">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const { state, setState } = useStore();
  const { notification, dismiss } = useLevelUp(state);

  // Check penalties on mount
  usePenaltyCheck(state, setState);

  const [activeTab, setActiveTab] = useState('dashboard');

  // Initialize weekly dungeons if needed
  useEffect(() => {
    if (state.weeklyDungeons.weekId !== getCurrentWeekId()) {
      const rank = getRankByLevel(state.user.overallLevel);
      const newDungeons = getWeeklyDungeonForRank(rank.key);
      newDungeons.weekId = getCurrentWeekId();
      setState(prev => ({
        ...prev,
        weeklyDungeons: newDungeons,
      }));
    }
  }, [state.weeklyDungeons.weekId, state.user.overallLevel]);

  const flowDisplay = getFlowStateDisplay(state.flowState);
  const build = getCharacterBuild(state.stats || {});

  const tabs = [
    { id: 'dashboard', label: 'Status', icon: LayoutDashboard },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'dungeons', label: 'Dungeons', icon: Swords },
    { id: 'store', label: 'Store', icon: ShoppingBag },
    { id: 'build', label: 'Build', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background effects */}
      <FloatingParticles />
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent pointer-events-none z-0" />

      {/* System Messages */}
      <SystemMessage notification={notification} onDismiss={dismiss} />

      {/* Header */}
      <header className="relative z-10 p-4 border-b border-cyan-900/50 bg-black/80 backdrop-blur-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h1 className="font-orbitron text-lg font-bold text-cyan-400 tracking-widest text-glow-cyan">
                SYSTEM
              </h1>
              <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            </div>
            {flowDisplay && (
              <div className="flex items-center gap-1 bg-cyan-900/30 border border-cyan-500/30 px-2 py-0.5 rounded text-xs text-cyan-400 animate-pulse">
                <Zap size={12} />
                FLOW
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-cyan-500/60">
              <Sparkles size={12} />
              <span>{build.name}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-900/20 border border-yellow-600/30 px-2 py-0.5 rounded text-xs">
              <Coins size={12} className="text-yellow-400" />
              <span className="font-bold text-yellow-400">{state.gold}</span>
            </div>
            <div className="text-xs text-cyan-500/40">
              {state.user.name}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-4">
        {activeTab === 'dashboard' && <Dashboard state={state} setState={setState} />}
        {activeTab === 'stats' && <StatsPanel state={state} />}
        {activeTab === 'dungeons' && <WeeklyDungeon state={state} setState={setState} />}
        {activeTab === 'store' && <RewardStore state={state} setState={setState} />}
        {activeTab === 'build' && <StatDistribution state={state} setState={setState} />}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto p-4 space-y-4">
            <h2 className="font-orbitron text-xl font-bold text-cyan-400 tracking-wider">System Settings</h2>
            <div className="glass-panel p-4 space-y-3">
              <div>
                <label className="text-sm text-cyan-500/60">Player Name</label>
                <input
                  type="text"
                  value={state.user.name}
                  onChange={(e) => setState(prev => ({ ...prev, user: { ...prev.user, name: e.target.value } }))}
                  className="w-full mt-1 bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <button
                onClick={() => {
                  if (confirm('Reset all progress? This cannot be undone.')) {
                    localStorage.removeItem('soloLevelingData');
                    window.location.reload();
                  }
                }}
                className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-700/50 text-red-400 py-2 rounded-lg text-sm transition-colors"
              >
                Reset All Progress
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-black/90 backdrop-blur-lg border-t border-cyan-900/50">
        <div className="max-w-2xl mx-auto flex justify-around p-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'text-cyan-400 bg-cyan-900/30 border border-cyan-500/30'
                    : 'text-cyan-600/50 hover:text-cyan-400/70'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] tracking-wider uppercase">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
