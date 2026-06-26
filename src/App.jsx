import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Settings, Zap, Heart, AlertTriangle, RefreshCw, Activity } from 'lucide-react';
import { useStore } from './hooks/useStore';
import { useLevelUp } from './hooks/useLevelUp';
import { usePenaltyCheck } from './hooks/usePenaltyCheck';
import Dashboard from './components/Dashboard';
import PowerLog from './components/PowerLog';
import SystemMessage from './components/SystemMessage';
import AIAssistant from './components/AIAssistant';
import MissionCommandCenter from './components/MissionCommandCenter';
import SectionErrorBoundary from './components/SectionErrorBoundary';
import { getCurrentWeekId } from './logic/dungeons';
import { getFlowStateDisplay, initializeWeeklyDungeon } from './logic/questEngine';
import { checkAndApplyPenalties } from './logic/penalties';
import { getRankByLevel } from './data/questCatalog';
import { DEFAULT_STATE, initCloudSync, syncNow, loadState, STORAGE_KEY } from './data/store';
import { isCanonicalSyncConfigured } from './services/canonicalSync';
import { getLocalDateString } from './utils/dateUtils';
import { pruneExpiredCustomQuests } from './logic/customQuests';

// Error Boundary to catch runtime crashes. This is the LAST-RESORT boundary —
// it only fires if a throw escapes every SectionErrorBoundary (i.e. the app
// shell itself crashed). Per-tab boundaries handle the common case so a single
// broken section never takes down the whole app. Recovery here is
// NON-DESTRUCTIVE first (reload keeps localStorage + cloud state); the wipe
// is demoted to a confirmed secondary so a transient render bug can never
// silently destroy months of progress.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Log the real error + component stack so a collapse is diagnosable from
    // the console instead of vanishing into a red screen with no detail.
    console.error('[App crash — top-level ErrorBoundary]', error, info && info.componentStack);
  }
  reloadApp = () => window.location.reload();
  wipeAndReload = () => {
    if (confirm('This permanently deletes ALL local progress (the cloud copy is untouched). Only use this if reloading keeps crashing. Proceed?')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };
  render() {
    if (this.state.hasError) {
      const msg = (this.state.error && (this.state.error.message || String(this.state.error))) || '';
      return (
        <div className="min-h-screen flex items-center justify-center bg-khalifa-void text-khalifa-gold p-6">
          <div className="glass-panel-khalifa p-8 max-w-md w-full text-center space-y-4 border-red-500/30 bg-red-950/10">
            <AlertTriangle size={48} className="mx-auto text-red-500 animate-pulse" />
            <h2 className="font-playfair text-xl font-bold tracking-tight">SYSTEM INSTABILITY</h2>
            <p className="text-sm text-khalifa-steel">
              A fatal error escaped the System's defenses. Your progress is safe in local storage and the cloud.
              Reload to resume — this is almost always enough.
            </p>
            {msg && (
              <pre className="text-[10px] text-red-300/70 bg-red-950/20 border border-red-500/20 rounded p-2 text-left overflow-auto max-h-24 whitespace-pre-wrap break-words">
                {msg}
              </pre>
            )}
            <button
              onClick={this.reloadApp}
              className="w-full bg-khalifa-gold/90 hover:bg-khalifa-gold text-khalifa-void py-3 rounded-lg font-bold transition-all uppercase tracking-widest font-orbitron flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> RELOAD APP
            </button>
            <button
              onClick={this.wipeAndReload}
              className="w-full bg-red-900/30 hover:bg-red-800/50 border border-red-500/40 text-red-300/80 py-2 rounded-lg text-xs transition-all uppercase tracking-widest font-orbitron"
            >
              Wipe local & reinitialize (last resort)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


// URL-gated self-test probe (?selftest=crash): forces a render throw inside a
// real SectionErrorBoundary so the e2e smoke can verify a throw is ISOLATED
// (localized "unstable" notice, app stays alive, no SYSTEM COLLAPSE, no data
// wipe) instead of regressing to a full collapse. Inert in normal and prod
// use — only activates when the query param is present.
function CrashProbe() {
  throw new Error('self-test: forced render throw');
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
  const rank = getRankByLevel(state.user.overallLevel);

  // Self-test flag — inert unless ?selftest=crash is in the URL.
  const selfTestCrash = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('selftest') === 'crash';

  // Check penalties on mount (only when Guided Mode is on — no quests/dungeons to miss otherwise)
  usePenaltyCheck(state, setState, cloudReady && guidedEnabled);

  const [activeTab, setActiveTab] = useState('quests');

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

  const tabs = [
    { id: 'quests', label: 'Quests', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workouts', icon: Activity },
    { id: 'ledger', label: 'Ummah Ledger', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <ErrorBoundary>
    <div className="min-h-screen pb-20 relative bg-khalifa-void">
      {/* System Messages */}
      <SectionErrorBoundary label="System Message">
        <SystemMessage notification={notification} onDismiss={dismiss} />
      </SectionErrorBoundary>

       <header className="relative z-10 p-3 sm:p-4 border-b border-slate-800 bg-khalifa-void/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <h1 className="font-orbitron text-lg sm:text-xl font-black text-slate-100 tracking-[0.25em]">
                KHALIFA
              </h1>
            </div>
            {flowDisplay && (
              <div className="flex items-center gap-1 bg-khalifa-blue/10 border border-khalifa-blue/30 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs text-khalifa-blue font-bold uppercase tracking-wider">
                <Zap size={10} className="sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">FLOW</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-khalifa-steel font-bold uppercase tracking-widest font-orbitron">
              {rank.title} · Level {state.user.overallLevel}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-4 px-2 sm:px-4">
        {activeTab === 'quests' && (
          <SectionErrorBoundary label="Quests">
            {guidedEnabled ? (
              <Dashboard state={state} setState={setState} ready={cloudReady} />
            ) : (
              <div className="max-w-2xl mx-auto p-6 text-center space-y-4 glass-panel-khalifa border border-yellow-500/20">
                <LayoutDashboard size={48} className="mx-auto text-khalifa-gold/50" />
                <h3 className="font-playfair text-lg font-bold text-khalifa-gold">Daily Quests Suspended</h3>
                <p className="text-sm text-khalifa-steel/80 max-w-sm mx-auto">
                  Guided Mode is currently disabled. Enable it in Settings to receive and track your daily Deen, Body, and Money quests.
                </p>
              </div>
            )}
          </SectionErrorBoundary>
        )}
        {activeTab === 'workouts' && (
          <SectionErrorBoundary label="Workouts">
            <PowerLog state={state} setState={setState} />
          </SectionErrorBoundary>
        )}
        {activeTab === 'ledger' && (
          <SectionErrorBoundary label="Ummah Ledger">
            <MissionCommandCenter state={state} setState={setState} />
          </SectionErrorBoundary>
        )}
        {activeTab === 'settings' && (
          <SectionErrorBoundary label="Settings">
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
          </SectionErrorBoundary>
        )}

        {selfTestCrash && (
          <SectionErrorBoundary label="Self-Test">
            <CrashProbe />
          </SectionErrorBoundary>
        )}
      </main>

      {/* AI Assistant Floating Widget */}
      <SectionErrorBoundary label="Forge-Master">
        <AIAssistant state={state} setState={setState} />
      </SectionErrorBoundary>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-slate-950/95 border-t border-slate-900 pb-safe backdrop-blur-lg">
        <div className="max-w-2xl mx-auto flex justify-around items-center p-1 sm:p-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl transition-all min-w-[44px] min-h-[44px] sm:min-w-[56px] ${
                  activeTab === tab.id
                    ? 'text-khalifa-gold bg-khalifa-gold/5 border border-khalifa-gold/20'
                    : 'text-khalifa-steel hover:text-slate-300'
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
