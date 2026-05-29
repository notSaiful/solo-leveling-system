import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Swords, Settings, ShoppingBag, Sparkles, Coins, Zap, AlertTriangle } from 'lucide-react';
import { useStore } from './hooks/useStore';
import { useLevelUp } from './hooks/useLevelUp';
import { usePenaltyCheck } from './hooks/usePenaltyCheck';
import Dashboard from './components/Dashboard';
import StatsPanel from './components/StatsPanel';
import WeeklyDungeon from './components/WeeklyDungeon';
import SystemMessage from './components/SystemMessage';
import RewardStore from './components/RewardStore';
import StatDistribution from './components/StatDistribution';
import AIAssistant from './components/AIAssistant';
import { getCurrentWeekId } from './logic/dungeons';
import { getRankByLevel, getWeeklyDungeonForRank } from './data/questCatalog';
import { getFlowStateDisplay } from './logic/questEngine';
import { getCharacterBuild } from './data/stats';
import { initCloudSync, STORAGE_KEY } from './data/store';
import { isSupabaseConfigured } from './services/supabaseClient';

// Error Boundary to catch runtime crashes and show reset UI
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-cyan-400 p-6">
          <div className="glass-panel-strong p-8 max-w-md w-full text-center space-y-4">
            <AlertTriangle size={48} className="mx-auto text-red-400" />
            <h2 className="font-orbitron text-xl font-bold tracking-wider">SYSTEM ERROR</h2>
            <p className="text-sm text-cyan-500/70">
              Corrupted data detected. Reset to restore the System.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                window.location.reload();
              }}
              className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-500/40 text-red-300 py-3 rounded-lg font-semibold transition-colors"
            >
              Reset System
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  // Silent cloud init on mount if credentials exist
  useEffect(() => {
    if (isSupabaseConfigured()) {
      initCloudSync().catch(() => {});
    }
  }, []);

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

  // Clear expired flow state
  useEffect(() => {
    if (state.flowState?.active && state.flowState.expiresAt < Date.now()) {
      setState(prev => ({
        ...prev,
        flowState: { active: false, multiplier: 1, expiresAt: 0, questsInWindow: 0 },
      }));
    }
  }, [state.flowState?.active, state.flowState?.expiresAt]);

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
    <ErrorBoundary>
    <div className="min-h-screen pb-20 relative">
      {/* Background effects */}
      <FloatingParticles />
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent pointer-events-none z-0" />

      {/* System Messages */}
      <SystemMessage notification={notification} onDismiss={dismiss} />

      {/* Header */}
      <header className="relative z-10 p-3 sm:p-4 border-b border-cyan-900/50 bg-black/80">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <h1 className="font-orbitron text-base sm:text-lg font-bold text-cyan-400 tracking-widest text-glow-cyan">
                SYSTEM
              </h1>
              <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            </div>
            {flowDisplay && (
              <div className="flex items-center gap-1 bg-cyan-900/30 border border-cyan-500/30 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs text-cyan-400 animate-pulse">
                <Zap size={10} className="sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">FLOW</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-cyan-500/60 hidden sm:flex">
              <Sparkles size={12} />
              <span>{build.name}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-900/20 border border-yellow-600/30 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">
              <Coins size={12} className="text-yellow-400" />
              <span className="font-bold text-yellow-400">{state.gold.toLocaleString()}</span>
            </div>
            <div className="text-[10px] sm:text-xs text-cyan-500/40 hidden sm:block">
              {state.user.name}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-4 px-2 sm:px-4">
        {activeTab === 'dashboard' && <Dashboard state={state} setState={setState} />}
        {activeTab === 'stats' && <StatsPanel state={state} />}
        {activeTab === 'dungeons' && <WeeklyDungeon state={state} setState={setState} />}
        {activeTab === 'store' && <RewardStore state={state} setState={setState} />}
        {activeTab === 'build' && <StatDistribution state={state} setState={setState} />}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto p-2 sm:p-4 space-y-4">
            <h2 className="font-orbitron text-xl font-bold text-cyan-400 tracking-wider">System Settings</h2>

            <div className="glass-panel p-3 sm:p-4 space-y-3">
              <div>
                <label className="text-sm text-cyan-500/60">Player Name</label>
                <input
                  type="text"
                  value={state.user.name}
                  onChange={(e) => setState(prev => ({ ...prev, user: { ...prev.user, name: e.target.value } }))}
                  className="w-full mt-1 bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-base text-cyan-100 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* System Status */}
            <div className="glass-panel p-3 sm:p-4 space-y-3 border border-cyan-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-cyan-400" />
                <span className="font-orbitron text-sm font-semibold text-cyan-300 tracking-wider">SYSTEM STATUS</span>
              </div>
              <div className="text-xs text-cyan-500/50 space-y-1">
                <p>Forge-Master AI: <span className="text-green-400">Connected (kimi-k2.6)</span></p>
                <p>Cloud Sync: <span className="text-green-400">Auto-sync active</span></p>
                <p>Storage: <span className="text-green-400">localStorage + Supabase</span></p>
              </div>
            </div>

            <div className="glass-panel p-3 sm:p-4 space-y-3">
              <button
                onClick={() => {
                  if (confirm('Reset all progress? This cannot be undone.')) {
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem('system_chat_history');
                    window.location.reload();
                  }
                }}
                className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-700/50 text-red-400 py-3 rounded-lg text-base transition-colors min-h-[44px]"
              >
                Reset All Progress
              </button>
            </div>
          </div>
        )}
      </main>

      {/* AI Assistant Floating Widget */}
      <AIAssistant state={state} setState={setState} />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-black/90 border-t border-cyan-900/50 pb-safe">
        <div className="max-w-2xl mx-auto flex justify-around items-center p-1 sm:p-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all min-w-[44px] min-h-[44px] sm:min-w-[56px] ${
                  activeTab === tab.id
                    ? 'text-cyan-400 bg-cyan-900/30 border border-cyan-500/30'
                    : 'text-cyan-600/50 hover:text-cyan-400/70'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span className="text-[10px] sm:text-xs tracking-wider uppercase hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
    </ErrorBoundary>
  );
}
