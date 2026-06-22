import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Mic, BarChart3, Swords, Settings, ShoppingBag, Sparkles, Skull, Coins, Zap, Crown, Heart, Target } from 'lucide-react';
import { useStore } from './hooks/useStore';
import { useLevelUp } from './hooks/useLevelUp';
import { usePenaltyCheck } from './hooks/usePenaltyCheck';
import LogTab from './components/LogTab';
import Dashboard from './components/Dashboard';
import StatsPanel from './components/StatsPanel';
import WeeklyDungeon from './components/WeeklyDungeon';
import SystemMessage from './components/SystemMessage';
import RewardStore from './components/RewardStore';
import StatDistribution from './components/StatDistribution';
import AIAssistant from './components/AIAssistant';
import Legion from './components/Legion';
import MissionCommandCenter from './components/MissionCommandCenter';
import { getCurrentWeekId } from './logic/dungeons';
import { getFlowStateDisplay, initializeWeeklyDungeon } from './logic/questEngine';
import { checkAndApplyPenalties } from './logic/penalties';
import { getCharacterBuild } from './data/stats';
import { DEFAULT_STATE, initCloudSync, syncNow, loadState, STORAGE_KEY } from './data/store';
import { isCanonicalSyncConfigured } from './services/canonicalSync';
import { getLocalDateString } from './utils/dateUtils';
import { pruneExpiredCustomQuests } from './logic/customQuests';

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
        <div className="min-h-screen flex items-center justify-center bg-khalifa-void text-khalifa-gold p-6">
          <div className="glass-panel-khalifa p-8 max-w-md w-full text-center space-y-4 border-red-500/30 bg-red-950/10">
            <Skull size={48} className="mx-auto text-red-500 animate-pulse" />
            <h2 className="font-playfair text-xl font-bold tracking-tight">SYSTEM COLLAPSE</h2>
            <p className="text-sm text-khalifa-steel">
              Dimensional instability detected. The Monarch's resolve must be restored.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                window.location.reload();
              }}
              className="w-full bg-red-900/40 hover:bg-red-800/60 border border-red-500/50 text-red-100 py-3 rounded-lg font-bold transition-all uppercase tracking-widest font-orbitron"
            >
              Initialize System Rebirth
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
  const particles = useMemo(() => (
    [...Array(25)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      color: Math.random() > 0.5 ? '#3B82F6' : '#EAB308',
      animationDelay: `${Math.random() * 6}s`,
      animationDuration: `${8 + Math.random() * 10}s`,
    }))
  ), []);

  return (
    <div className="floating-particles">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full animate-float opacity-20"
          style={{
            left: particle.left,
            top: particle.top,
            backgroundColor: particle.color,
            boxShadow: `0 0 8px ${particle.color}`,
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

  const guidedEnabled = !!state.guidedMode?.enabled;

  // Check penalties on mount (only when Guided Mode is on — no quests/dungeons to miss otherwise)
  usePenaltyCheck(state, setState, cloudReady && guidedEnabled);

  const [activeTab, setActiveTab] = useState('log');

  // Cloud init on mount — loads cloud state silently, syncs continuously afterward
  useEffect(() => {
    if (!isCanonicalSyncConfigured()) {
      setCloudReady(true);
      return;
    }

    initCloudSync().then((result) => {
      if (result?.success) {
        const fresh = loadState();
        setState({ ...fresh, __preserveLastUpdated: true, __skipCloudSync: true });
      }
    }).catch(() => {}).finally(() => setCloudReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Weekly reset. Guided Mode: re-initialize dungeons + apply penalties for the new week.
  // Non-guided (listen-and-level): only clear weeklyFocus and stamp lastPenaltyCheckDate.
  // weekId is intentionally left stale in non-guided mode so that enabling Guided Mode
  // mid-week triggers initialization for the current week (the guided branch runs then).
  useEffect(() => {
    if (!cloudReady) return;

    const today = getLocalDateString();
    // Non-guided: nothing to reset except once per day — skip the re-fire on every level-up.
    if (!guidedEnabled && state.lastPenaltyCheckDate === today) return;

    if (state.weeklyDungeons.weekId !== getCurrentWeekId()) {
      const currentWeek = getCurrentWeekId();
      const hadPreviousWeek = Boolean(state.weeklyDungeons.weekId);

      if (guidedEnabled) {
        // Initialize new week's dungeons (resets deenCompleted/bodyCompleted/moneyCompleted/ummahCompleted)
        // initializeWeeklyDungeon returns a full state with refreshed weeklyDungeons.
        let nextState = initializeWeeklyDungeon(state);

        // checkAndApplyPenalties returns a RESULT ENVELOPE ({ penalties, updatedPillars, ... }),
        // NOT a full state — keep nextState intact and read the envelope's fields separately.
        // (Reassigning nextState to the envelope previously wiped .pillars/.weeklyDungeons and
        // crashed the effect with "Cannot read properties of undefined (reading 'deen')".)
        const penaltyResult = hadPreviousWeek ? checkAndApplyPenalties(nextState) : null;
        const sourcePillars = penaltyResult ? penaltyResult.updatedPillars : nextState.pillars;

        // Strip transient _penaltyMeta from pillars before saving
        const cleanPillars = {};
        for (const p of ['deen', 'body', 'money']) {
          const pillar = sourcePillars?.[p];
          if (pillar) {
            const { _penaltyMeta, ...rest } = pillar;
            cleanPillars[p] = rest;
          } else {
            cleanPillars[p] = nextState.pillars?.[p];
          }
        }

        setState(prev => ({
          ...prev,
          pillars: cleanPillars,
          weeklyDungeons: nextState.weeklyDungeons,
          weeklyStats: { soloClear: false, aiPromptsUsed: 0, weekId: currentWeek },
          weeklyFocus: null,
          lastPenaltyCheckDate: penaltyResult?.lastPenaltyCheckDate || today,
        }));
      } else {
        // Non-guided: no dungeons or penalties — just clear weekly focus and stamp the date.
        setState(prev => ({
          ...prev,
          weeklyFocus: null,
          lastPenaltyCheckDate: today,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudReady, state.weeklyDungeons.weekId, state.user.overallLevel, guidedEnabled]);

  // Clear expired flow state
  useEffect(() => {
    if (!cloudReady) return;

    const prunedCustomQuests = pruneExpiredCustomQuests(state.customQuests || []);
    if (prunedCustomQuests.length !== (state.customQuests || []).length) {
      setState(prev => ({
        ...prev,
        customQuests: pruneExpiredCustomQuests(prev.customQuests || []),
      }));
      return;
    }

    if (state.flowState?.active && state.flowState.expiresAt < Date.now()) {
      setState(prev => ({
        ...prev,
        flowState: { active: false, multiplier: 1, expiresAt: 0, questsInWindow: 0 },
      }));
    }
  }, [cloudReady, state.customQuests, state.flowState?.active, state.flowState?.expiresAt]);

  const flowDisplay = getFlowStateDisplay(state.flowState);
  const build = getCharacterBuild(state.stats || {});

  const tabs = [
    { id: 'log', label: 'Log', icon: Mic },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'legion', label: 'Legion', icon: Skull },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    ...(guidedEnabled ? [{ id: 'guided', label: 'Guided', icon: LayoutDashboard }] : []),
    ...(guidedEnabled ? [{ id: 'dungeons', label: 'Dungeons', icon: Swords }] : []),
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
      <header className="relative z-10 p-3 sm:p-4 border-b border-khalifa-gold/10 bg-khalifa-void/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <h1 className="font-playfair text-lg sm:text-xl font-bold text-khalifa-gold tracking-tight text-glow-khalifa">
                KHALIFA
              </h1>
              <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-khalifa-gold/40 to-transparent" />
            </div>
            {flowDisplay && (
              <div className="flex items-center gap-1 bg-khalifa-blue/10 border border-khalifa-blue/30 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs text-khalifa-blue animate-pulse">
                <Zap size={10} className="sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">FLOW</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-khalifa-steel hidden sm:flex uppercase tracking-widest font-orbitron">
              <Sparkles size={12} className="text-khalifa-gold/40" />
              <span>{build.name}</span>
            </div>
            {state.skillPoints > 0 && (
              <div className="flex items-center gap-1 bg-khalifa-purple/10 border border-khalifa-purple/30 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">
                <Zap size={12} className="text-khalifa-purple" />
                <span className="font-bold text-khalifa-purple font-orbitron">{state.skillPoints} SP</span>
              </div>
            )}
            {state.ummahCommand?.unlocked && (
              <div className="flex items-center gap-1 bg-khalifa-gold/10 border border-khalifa-gold/30 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">
                <Crown size={12} className="text-khalifa-gold" />
                <span className="font-bold text-khalifa-gold hidden sm:inline uppercase tracking-widest font-orbitron">Ummah</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-khalifa-amber/10 border border-khalifa-amber/30 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">
              <Coins size={12} className="text-khalifa-amber" />
              <span className="font-bold text-khalifa-amber font-orbitron">{state.gold.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-4 px-2 sm:px-4">
        {activeTab === 'log' && <LogTab state={state} setState={setState} />}
        {activeTab === 'missions' && <MissionCommandCenter state={state} setState={setState} />}
        {activeTab === 'legion' && <Legion state={state} setState={setState} />}
        {activeTab === 'guided' && <Dashboard state={state} setState={setState} ready={cloudReady} />}
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

            <div className="glass-panel-khalifa p-4">
              <div className="text-khalifa-gold font-orbitron text-sm mb-1">GUIDED MODE</div>
              <div className="text-khalifa-steel/70 text-xs mb-3">
                Optional daily quests and dungeons. Off by default — just log what you did.
              </div>
              <button
                onClick={() => setState((prev) => ({
                  ...prev,
                  guidedMode: { enabled: !prev.guidedMode?.enabled, lastQuestDate: prev.guidedMode?.lastQuestDate || null },
                }))}
                className={`px-4 py-2 rounded-lg text-sm font-orbitron border ${
                  guidedEnabled ? 'border-khalifa-gold/60 text-khalifa-gold bg-khalifa-gold/10' : 'border-khalifa-steel/30 text-khalifa-steel'
                }`}
              >
                {guidedEnabled ? 'GUIDED: ON' : 'GUIDED: OFF'}
              </button>
            </div>

            {/* Ummah Burden Tracker */}
            <div className="glass-panel p-3 sm:p-4 space-y-3 border border-rose-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={16} className="text-rose-400" />
                <span className="font-orbitron text-sm font-semibold text-rose-300 tracking-wider">UMMAH BURDEN</span>
              </div>
              {[
                { key: 'familySupported', label: 'Family Members Supported', step: 1 },
                { key: 'zakatPaid', label: 'Zakat Payments (count)', step: 1 },
                { key: 'sadaqahJariyah', label: 'Sadaqah Jariyah Projects', step: 1 },
                { key: 'muslimVentures', label: 'Muslim Ventures Funded', step: 1 },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-sm text-cyan-500/60">{field.label}</label>
                  <input
                    type="number"
                    min={0}
                    step={field.step}
                    value={state.ummahBurden?.[field.key] || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setState(prev => {
                        const updated = {
                          ...prev.ummahBurden,
                          [field.key]: val,
                        };
                        updated.score = (updated.familySupported * 10) + (updated.zakatPaid * 5) + (updated.sadaqahJariyah * 3) + (updated.muslimVentures * 20);
                        return { ...prev, ummahBurden: updated };
                      });
                    }}
                    className="w-full mt-1 bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-base text-cyan-100 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              ))}
              <div className="text-xs text-rose-500/60 pt-1">
                Current Score: {((state.ummahBurden?.familySupported || 0) * 10 + (state.ummahBurden?.zakatPaid || 0) * 5 + (state.ummahBurden?.sadaqahJariyah || 0) * 3 + (state.ummahBurden?.muslimVentures || 0) * 20).toLocaleString()}
              </div>
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
                      syncRevision: 1,
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
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-khalifa-void/95 border-t border-khalifa-gold/10 pb-safe backdrop-blur-lg">
        <div className="max-w-2xl mx-auto flex justify-around items-center p-1 sm:p-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl transition-all min-w-[44px] min-h-[44px] sm:min-w-[56px] ${
                  activeTab === tab.id
                    ? 'text-khalifa-gold bg-khalifa-gold/10 border border-khalifa-gold/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                    : 'text-khalifa-steel hover:text-khalifa-gold/50'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span className="text-[10px] font-orbitron tracking-tighter uppercase hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
    </ErrorBoundary>
  );
}
