import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { DEFAULT_STATE, initCloudSync, syncNow, loadState, STORAGE_KEY } from './data/store';
import { isCanonicalSyncConfigured } from './services/canonicalSync';
import { hasApiKey, getApiKey } from './services/aiAssistant';
import { getLocalDateString } from './utils/dateUtils';
import { getScaledPenalty } from './data/rankDifficulty';

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

// Diagnostic panel for troubleshooting
function DiagnosticPanel() {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const useDirectKey = hasApiKey();
      const response = await fetch(useDirectKey ? 'https://openrouter.ai/api/v1/chat/completions' : '/api/forge-master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(useDirectKey ? {
            'Authorization': `Bearer ${getApiKey()}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Solo Leveling System',
          } : {}),
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [{ role: 'user', content: 'ping' }],
          temperature: 0.85,
          max_tokens: 20,
        }),
      });
      const data = await response.json();
      if (response.ok && data.choices) {
        setTestResult({ ok: true, msg: `OK - ${data.model} responded` });
      } else {
        setTestResult({ ok: false, msg: `Error ${response.status}: ${data.error?.message || JSON.stringify(data)}` });
      }
    } catch (err) {
      setTestResult({ ok: false, msg: `Network error: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mt-2 pt-2 border-t border-cyan-900/20 space-y-2">
      <button
        onClick={runTest}
        disabled={testing}
        className="w-full bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-700/40 text-cyan-300 py-2 rounded text-xs transition-colors"
      >
        {testing ? 'Testing connection...' : 'Test AI Connection'}
      </button>
      {testResult && (
        <div className={`text-[10px] px-2 py-1 rounded ${testResult.ok ? 'bg-green-950/30 text-green-400' : 'bg-red-950/30 text-red-400'}`}>
          {testResult.msg}
        </div>
      )}
      <div className="text-[10px] text-cyan-600/50">
        AI route: {hasApiKey() ? 'Custom browser key' : 'Private server proxy'}
      </div>
    </div>
  );
}

// Floating particle component
function FloatingParticles() {
  const particles = useMemo(() => (
    [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 6}s`,
      animationDuration: `${6 + Math.random() * 4}s`,
    }))
  ), []);

  return (
    <div className="floating-particles">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-float"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const { state, setState } = useStore();
  const { notification, dismiss } = useLevelUp(state);
  const [cloudReady, setCloudReady] = useState(() => !isCanonicalSyncConfigured());

  // Check penalties on mount
  usePenaltyCheck(state, setState, cloudReady);

  const [activeTab, setActiveTab] = useState('dashboard');
  const stateRef = useRef(state);
  stateRef.current = state;

  // Silent cloud init on mount if credentials exist
  useEffect(() => {
    if (isCanonicalSyncConfigured()) {
      initCloudSync().then((result) => {
        if (result?.success && result?.source === 'cloud') {
          const fresh = loadState();
          // Only overwrite React state if the freshly loaded cloud data is newer
          // than what we currently hold in memory (handles cross-device sync)
          if (fresh.lastUpdated > (stateRef.current.lastUpdated || 0)) {
            setState({ ...fresh, __preserveLastUpdated: true });
          }
        }
      }).catch(() => {}).finally(() => setCloudReady(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize weekly dungeons if needed
  useEffect(() => {
    if (!cloudReady) return;

    if (state.weeklyDungeons.weekId !== getCurrentWeekId()) {
      const rank = getRankByLevel(state.user.overallLevel);
      const newDungeons = getWeeklyDungeonForRank(rank.key);
      newDungeons.weekId = getCurrentWeekId();

      // Check if previous week's dungeon was missed and apply penalties
      const oldDungeons = state.weeklyDungeons;
      const missedPillars = [];
      if (!oldDungeons.deenCompleted) missedPillars.push('deen');
      if (!oldDungeons.bodyCompleted) missedPillars.push('body');
      if (!oldDungeons.moneyCompleted) missedPillars.push('money');

      let newPillars = { ...state.pillars };
      const today = getLocalDateString();
      const messages = [];

      if (missedPillars.length > 0 && oldDungeons.weekId) {
        const scaledDungeon = getScaledPenalty(rank.key, 'missedDungeon');
        for (const pillar of missedPillars) {
          newPillars[pillar] = {
            ...newPillars[pillar],
            activeDebuff: {
              type: 'missedDungeon',
              multiplier: scaledDungeon.multiplier,
              duration: scaledDungeon.duration,
              message: scaledDungeon.message,
              appliedAt: Date.now(),
            },
          };
        }
        messages.push({
          type: 'penalty',
          title: '⚠️ DUNGEON PENALTY',
          subtitle: 'Weekly dungeon missed',
          message: `${scaledDungeon.message}\nAffected: ${missedPillars.join(', ')}.`,
          date: today,
        });
      }

      setState(prev => ({
        ...prev,
        pillars: newPillars,
        weeklyDungeons: newDungeons,
        systemMessages: messages.length > 0 ? [...prev.systemMessages, ...messages] : prev.systemMessages,
      }));
    }
  }, [cloudReady, state.weeklyDungeons.weekId, state.user.overallLevel]);

  // Clear expired flow state
  useEffect(() => {
    if (!cloudReady) return;

    if (state.flowState?.active && state.flowState.expiresAt < Date.now()) {
      setState(prev => ({
        ...prev,
        flowState: { active: false, multiplier: 1, expiresAt: 0, questsInWindow: 0 },
      }));
    }
  }, [cloudReady, state.flowState?.active, state.flowState?.expiresAt]);

  // Force cloud sync before app goes to background / closes
  useEffect(() => {
    const forceSync = () => {
      if (cloudReady && isCanonicalSyncConfigured()) {
        syncNow(state).catch(() => {});
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') forceSync();
    };
    const handleUnload = () => forceSync();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [cloudReady, state]);

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
        {activeTab === 'dashboard' && <Dashboard state={state} setState={setState} ready={cloudReady} />}
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
                <p>Forge-Master AI: <span className="text-green-400">Server proxy + fallback model</span></p>
                <p>Cloud Sync: <span className="text-green-400">Auto-sync active</span></p>
                <p>Storage: <span className="text-green-400">localStorage + cloud snapshot</span></p>
              </div>
              <DiagnosticPanel />
            </div>

            <div className="glass-panel p-3 sm:p-4 space-y-3">
              <button
                onClick={() => {
                  if (confirm('Clear browser cache and reload? This fixes stale code and stuck API keys.')) {
                    localStorage.removeItem('openrouter_api_key');
                    window.location.href = window.location.href + '?nocache=' + Date.now();
                  }
                }}
                className="w-full bg-yellow-900/20 hover:bg-yellow-900/40 border border-yellow-700/50 text-yellow-400 py-3 rounded-lg text-base transition-colors min-h-[44px] mb-2"
              >
                Clear Cache & Reload
              </button>
              <button
                onClick={async () => {
                  if (confirm('Reset all progress? This cannot be undone.')) {
                    await syncNow({
                      ...DEFAULT_STATE,
                      lastActiveDate: getLocalDateString(),
                      lastUpdated: Date.now(),
                    }).catch(() => {});
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
