import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Settings, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { useStore } from './hooks/useStore';
import { useLevelUp } from './hooks/useLevelUp';
import { usePenaltyCheck } from './hooks/usePenaltyCheck';
import Dashboard from './components/Dashboard';
import SystemMessage from './components/SystemMessage';
import AIAssistant from './components/AIAssistant';
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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const guidedEnabled = !!state.guidedMode?.enabled;
  const rank = getRankByLevel(state.user.overallLevel);

  // Self-test flag — inert unless ?selftest=crash is in the URL.
  const selfTestCrash = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('selftest') === 'crash';

  // Check penalties on mount (only when Guided Mode is on — no quests/dungeons to miss otherwise)
  usePenaltyCheck(state, setState, cloudReady && guidedEnabled);

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

  return (
    <ErrorBoundary>
    <div className="min-h-screen pb-12 relative bg-khalifa-void">
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
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`p-2 rounded-lg transition-all hover:bg-slate-800/50 text-khalifa-steel hover:text-khalifa-gold ${
                settingsOpen ? 'text-khalifa-gold bg-slate-800/40' : ''
              }`}
              aria-label="Toggle Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-4 px-2 sm:px-4">
        {settingsOpen && (
          <SectionErrorBoundary label="Settings">
            <div className="max-w-2xl mx-auto mb-6 p-4 space-y-4 glass-panel-khalifa border border-khalifa-gold/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="font-orbitron text-sm font-bold text-khalifa-gold tracking-wider">SYSTEM SETTINGS</h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="text-xs text-khalifa-steel hover:text-khalifa-gold uppercase font-orbitron"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-khalifa-steel uppercase tracking-wider font-orbitron">Player Name</label>
                  <input
                    type="text"
                    value={state.user.name}
                    onChange={(e) => setState(prev => ({ ...prev, user: { ...prev.user, name: e.target.value } }))}
                    className="w-full mt-1 bg-khalifa-void border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-khalifa-gold/50"
                  />
                </div>

                <div>
                  <div className="text-xs text-khalifa-steel uppercase tracking-wider font-orbitron mb-1">GUIDED MODE</div>
                  <div className="text-khalifa-steel/70 text-[10px] mb-2">
                    Optional daily quests and dungeons. Off by default — just log what you did.
                  </div>
                  <button
                    onClick={() => setState((prev) => ({
                      ...prev,
                      guidedMode: { enabled: !prev.guidedMode?.enabled, lastQuestDate: prev.guidedMode?.lastQuestDate || null },
                    }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-orbitron border transition-all ${
                      guidedEnabled
                        ? 'border-khalifa-gold/60 text-khalifa-gold bg-khalifa-gold/10'
                        : 'border-khalifa-steel/30 text-khalifa-steel bg-transparent'
                    }`}
                  >
                    {guidedEnabled ? 'GUIDED: ON' : 'GUIDED: OFF'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (confirm('Clear browser cache and reload? This fixes stale code and stuck API keys.')) {
                        localStorage.removeItem('openrouter_api_key');
                        window.location.href = window.location.href + '?nocache=' + Date.now();
                      }
                    }}
                    className="bg-yellow-900/10 hover:bg-yellow-900/20 border border-yellow-700/30 text-yellow-400/90 py-2 rounded-lg text-xs transition-colors font-orbitron font-bold min-h-[36px]"
                  >
                    Clear Cache
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
                    className="bg-red-900/10 hover:bg-red-900/20 border border-red-700/30 text-red-400/90 py-2 rounded-lg text-xs transition-colors font-orbitron font-bold min-h-[36px]"
                  >
                    Reset Progress
                  </button>
                </div>
              </div>
            </div>
          </SectionErrorBoundary>
        )}

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
    </div>
    </ErrorBoundary>
  );
}
