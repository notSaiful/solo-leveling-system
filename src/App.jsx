import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LayoutDashboard, BarChart3, Swords, Settings, ShoppingBag, Sparkles, Coins, Zap, AlertTriangle, Users, Crown, Wrench, Play, Heart } from 'lucide-react';
import { activateSkill, getSkillCooldownRemaining } from './data/skills';
import { checkLegacyShadowExtraction, LEGACY_SHADOW_QUESTS, getConsecutiveDailyCompletions } from './data/legacyShadows';
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
import { getFlowStateDisplay, initializeWeeklyDungeon } from './logic/questEngine';
import { checkAndApplyPenalties } from './logic/penalties';
import { getCharacterBuild } from './data/stats';
import { DEFAULT_STATE, initCloudSync, syncNow, loadState, STORAGE_KEY } from './data/store';
import { isCanonicalSyncConfigured } from './services/canonicalSync';
import { hasApiKey, getApiKey } from './services/aiAssistant';
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
function DiagnosticPanel({ syncStatus, onForceSync }) {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [syncTestResult, setSyncTestResult] = useState(null);
  const [syncTesting, setSyncTesting] = useState(false);

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

  const runSyncTest = async () => {
    setSyncTesting(true);
    setSyncTestResult(null);
    try {
      const secret = import.meta.env.VITE_SLS_SYNC_SECRET || '';
      const response = await fetch('/api/sync-state', {
        method: 'GET',
        headers: {
          'x-sls-sync-secret': secret,
        },
        cache: 'no-store',
      });
      if (response.status === 401) {
        setSyncTestResult({ ok: false, msg: 'Sync secret mismatch. Check Vercel env vars.' });
      } else if (response.ok) {
        const data = await response.json();
        const hasState = data?.state && typeof data.state === 'object';
        setSyncTestResult({ ok: true, msg: hasState ? `Sync OK — cloud state exists` : 'Sync OK — no cloud state yet' });
      } else {
        const text = await response.text().catch(() => 'Unknown error');
        setSyncTestResult({ ok: false, msg: `Sync error ${response.status}: ${text.slice(0, 100)}` });
      }
    } catch (err) {
      setSyncTestResult({ ok: false, msg: `Sync network error: ${err.message}` });
    } finally {
      setSyncTesting(false);
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

      <button
        onClick={runSyncTest}
        disabled={syncTesting}
        className="w-full bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-700/40 text-cyan-300 py-2 rounded text-xs transition-colors mt-2"
      >
        {syncTesting ? 'Testing sync...' : 'Test Cloud Sync'}
      </button>
      {syncTestResult && (
        <div className={`text-[10px] px-2 py-1 rounded ${syncTestResult.ok ? 'bg-green-950/30 text-green-400' : 'bg-red-950/30 text-red-400'}`}>
          {syncTestResult.msg}
        </div>
      )}
      {onForceSync && (
        <button
          onClick={onForceSync}
          disabled={syncStatus?.state === 'syncing' || !isCanonicalSyncConfigured()}
          className="w-full bg-green-900/20 hover:bg-green-900/40 border border-green-700/40 text-green-300 py-2 rounded text-xs transition-colors mt-2"
        >
          {syncStatus?.state === 'syncing' ? 'Syncing...' : 'Force Sync Now'}
        </button>
      )}
      <div className="text-[10px] text-cyan-600/50">
        Sync: {syncStatus?.state || 'unknown'} {syncStatus?.error ? `— ${syncStatus.error}` : ''}
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
  const [syncStatus, setSyncStatus] = useState({ state: isCanonicalSyncConfigured() ? 'initializing' : 'disabled', error: null });

  // Check penalties on mount
  usePenaltyCheck(state, setState, cloudReady);

  const [activeTab, setActiveTab] = useState('dashboard');
  const stateRef = useRef(state);
  stateRef.current = state;

  // Cloud init on mount — blocking, with visible errors
  useEffect(() => {
    if (!isCanonicalSyncConfigured()) {
      setCloudReady(true);
      setSyncStatus({ state: 'disabled', error: null });
      return;
    }

    setSyncStatus({ state: 'initializing', error: null });
    initCloudSync().then((result) => {
      if (result?.success) {
        const fresh = loadState();
        setState({ ...fresh, __preserveLastUpdated: true });
        setSyncStatus({ state: 'connected', error: null });
      } else {
        setSyncStatus({ state: 'local_only', error: result?.reason || 'sync_failed' });
      }
    }).catch((err) => {
      setSyncStatus({ state: 'error', error: err.message || 'Cloud sync failed' });
    }).finally(() => setCloudReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleForceSync = async () => {
    if (!isCanonicalSyncConfigured()) return;
    setSyncStatus(prev => ({ ...prev, state: 'syncing' }));
    try {
      const result = await syncNow(stateRef.current);
      if (result?.success) {
        setSyncStatus({ state: 'connected', error: null });
      } else {
        setSyncStatus({ state: 'error', error: result?.reason || 'sync_failed' });
      }
    } catch (err) {
      setSyncStatus({ state: 'error', error: err.message || 'Force sync failed' });
    }
  };

  // Initialize weekly dungeons if needed
  useEffect(() => {
    if (!cloudReady) return;

    if (state.weeklyDungeons.weekId !== getCurrentWeekId()) {
      const currentWeek = getCurrentWeekId();
      const today = getLocalDateString();
      const hadPreviousWeek = Boolean(state.weeklyDungeons.weekId);

      // Initialize new week's dungeons (resets deenCompleted/bodyCompleted/moneyCompleted/ummahCompleted)
      let nextState = initializeWeeklyDungeon(state);

      // If there was a previous week, run penalty check on it (covers daily + dungeon misses for all 4 pillars)
      if (hadPreviousWeek) {
        nextState = checkAndApplyPenalties(nextState);
      }

      // Strip transient _penaltyMeta from pillars before saving
      const cleanPillars = {};
      for (const p of ['deen', 'body', 'money']) {
        if (nextState.pillars[p]) {
          const { _penaltyMeta, ...rest } = nextState.pillars[p];
          cleanPillars[p] = rest;
        } else {
          cleanPillars[p] = nextState.pillars[p];
        }
      }

      setState(prev => ({
        ...prev,
        pillars: cleanPillars,
        weeklyDungeons: nextState.weeklyDungeons,
        weeklyStats: { soloClear: false, aiPromptsUsed: 0, weekId: currentWeek },
        lastPenaltyCheckDate: today,
      }));
    }
  }, [cloudReady, state.weeklyDungeons.weekId, state.user.overallLevel]);

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
    { id: 'legion', label: 'Legion', icon: Users },
    { id: 'store', label: 'Store', icon: ShoppingBag },
    { id: 'build', label: 'Build', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(state.ummahCommand?.unlocked ? [{ id: 'ummah', label: 'Ummah', icon: Crown }] : []),
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
            {state.skillPoints > 0 && (
              <div className="flex items-center gap-1 bg-purple-900/20 border border-purple-600/30 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">
                <Zap size={12} className="text-purple-400" />
                <span className="font-bold text-purple-400">{state.skillPoints} SP</span>
              </div>
            )}
            {state.ummahCommand?.unlocked && (
              <div className="flex items-center gap-1 bg-amber-900/20 border border-amber-600/30 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">
                <Crown size={12} className="text-amber-400" />
                <span className="font-bold text-amber-400 hidden sm:inline">Ummah</span>
              </div>
            )}
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
        {activeTab === 'legion' && (
          <div className="max-w-2xl mx-auto p-2 sm:p-4 space-y-4">
            <h2 className="font-orbitron text-xl font-bold text-cyan-400 tracking-wider">Shadow Legion</h2>
            <div className="glass-panel p-4 space-y-3">
              <div className="text-sm text-cyan-500/60">Extracted Shadows</div>
              {(state.legacyShadows || []).length === 0 ? (
                <div className="text-sm text-cyan-500/40 italic">No Manhood Forge shadows extracted yet.</div>
              ) : (
                <div className="space-y-2">
                  {(state.legacyShadows || []).map((shadow, i) => (
                    <div key={i} className="flex items-center gap-3 bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-900/40 flex items-center justify-center">
                        <Users size={16} className="text-cyan-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-cyan-200">{shadow.name}</div>
                        <div className="text-xs text-cyan-500/60">+{shadow.boostValue} {shadow.boostType} for future children</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Legacy Shadow Extraction */}
            <div className="glass-panel p-4 space-y-3 border border-cyan-700/30">
              <div className="text-sm text-cyan-500/60">Manhood Forge — Extract Shadow</div>
              <div className="space-y-2">
                {LEGACY_SHADOW_QUESTS.map(template => {
                  const alreadyExtracted = state.legacyShadows?.some(s => s.id === template.shadow.id);
                  const progress = alreadyExtracted ? template.requiredDays : getConsecutiveDailyCompletions(state.history, template.pillar);
                  const canExtract = progress >= template.requiredDays;
                  return (
                    <div key={template.id} className={`rounded-lg border p-3 ${alreadyExtracted ? 'bg-green-950/10 border-green-800/20' : 'bg-cyan-950/10 border-cyan-800/20'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-cyan-200">{template.title}</div>
                        {alreadyExtracted ? (
                          <span className="text-[10px] text-green-400">Extracted ✓</span>
                        ) : (
                          <button
                            onClick={() => setState(prev => checkLegacyShadowExtraction(prev, template.id))}
                            disabled={!canExtract}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                              canExtract
                                ? 'bg-cyan-900/30 border-cyan-500/40 text-cyan-300 hover:bg-cyan-800/40'
                                : 'bg-cyan-950/20 border-cyan-800/20 text-cyan-600 cursor-not-allowed'
                            }`}
                          >
                            {canExtract ? 'Extract' : 'Locked'}
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-cyan-500/60">{template.description}</div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] text-cyan-500/40 mb-1">
                          <span>Progress: {progress}/{template.requiredDays} days</span>
                          <span>{Math.min(100, Math.round((progress / template.requiredDays) * 100))}%</span>
                        </div>
                        <div className="w-full bg-cyan-900/30 rounded-full h-1">
                          <div
                            className={`rounded-full h-1 transition-all ${alreadyExtracted ? 'bg-green-500' : 'bg-cyan-500'}`}
                            style={{ width: `${Math.min(100, (progress / template.requiredDays) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-cyan-500/40 mt-1">Reward: {template.shadow.name} (+{template.shadow.boostValue} {template.shadow.boostType})</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="glass-panel p-4 space-y-3">
              <div className="text-sm text-cyan-500/60">Active Skills</div>
              {(state.skills || []).length === 0 ? (
                <div className="text-sm text-cyan-500/40 italic">No skills learned. Pass Job Change Gates to unlock skills.</div>
              ) : (
                <div className="space-y-2">
                  {(state.skills || []).map((skill, i) => {
                    const cdRemaining = getSkillCooldownRemaining(state, skill.id);
                    const canActivate = cdRemaining === 0;
                    return (
                      <div key={i} className="flex items-center justify-between bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-900/40 flex items-center justify-center">
                            <Zap size={16} className="text-purple-400" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-cyan-200">{skill.name}</div>
                            <div className="text-xs text-cyan-500/60">{skill.description}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (!canActivate) return;
                            setState(prev => activateSkill(prev, skill.id));
                          }}
                          disabled={!canActivate}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
                            canActivate
                              ? 'bg-purple-900/30 border-purple-500/40 text-purple-300 hover:bg-purple-800/40'
                              : 'bg-cyan-950/20 border-cyan-800/20 text-cyan-600 cursor-not-allowed'
                          }`}
                        >
                          <Play size={12} />
                          {canActivate ? 'Activate' : `${Math.ceil(cdRemaining / 3600000)}h`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="glass-panel p-4 space-y-3">
              <div className="text-sm text-cyan-500/60">Equipment</div>
              {['weapon', 'armor', 'ring'].map(slot => {
                const item = state.equipment?.[slot];
                return (
                  <div key={slot} className="flex items-center gap-3 bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center">
                      <Wrench size={16} className="text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-cyan-200 capitalize">{slot}: {item ? item.name : 'Empty'}</div>
                      {item && (
                        <div className="text-xs text-cyan-500/60">
                          Durability: {item.durability}/{item.maxDurability} {item.enchantLevel > 0 && `| +${item.enchantLevel} Enchant`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {activeTab === 'store' && <RewardStore state={state} setState={setState} />}
        {activeTab === 'build' && <StatDistribution state={state} setState={setState} />}
        {activeTab === 'ummah' && (
          <div className="max-w-2xl mx-auto p-2 sm:p-4 space-y-4">
            <h2 className="font-orbitron text-xl font-bold text-amber-400 tracking-wider">Ummah Command</h2>
            <div className="glass-panel p-4 space-y-3 border border-amber-700/30">
              <div className="text-sm text-amber-400/80 font-semibold">Monarch Status: ACTIVE</div>
              <div className="text-sm text-cyan-500/60">You have ascended to Monarch. The Ummah Command protocol is now unlocked.</div>
              <div className="space-y-2 mt-3">
                <div className="text-xs text-cyan-500/40 uppercase tracking-wider">Linked Members</div>
                {(state.ummahCommand?.linkedMembers || []).length === 0 ? (
                  <div className="text-sm text-cyan-500/40 italic">No linked members yet. This feature will allow you to share quests and track family progress.</div>
                ) : (
                  <div className="space-y-2">
                    {(state.ummahCommand?.linkedMembers || []).map((member, i) => (
                      <div key={i} className="flex items-center gap-3 bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-3">
                        <div className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center">
                          <Users size={16} className="text-amber-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-cyan-200">{member.name}</div>
                          <div className="text-xs text-cyan-500/60">{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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

            {/* System Status */}
            <div className="glass-panel p-3 sm:p-4 space-y-3 border border-cyan-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-cyan-400" />
                <span className="font-orbitron text-sm font-semibold text-cyan-300 tracking-wider">SYSTEM STATUS</span>
              </div>
              <div className="text-xs text-cyan-500/50 space-y-1">
                <p>Forge-Master AI: <span className="text-green-400">Server proxy + fallback model</span></p>
                <p>Cloud Sync: <span className={syncStatus.state === 'connected' ? 'text-green-400' : syncStatus.state === 'error' ? 'text-red-400' : 'text-yellow-400'}>{syncStatus.state === 'connected' ? 'Connected' : syncStatus.state === 'error' ? `Error: ${syncStatus.error}` : syncStatus.state === 'disabled' ? 'Disabled (no secret)' : syncStatus.state === 'syncing' ? 'Syncing...' : 'Initializing...'}</span></p>
                <p>Storage: <span className="text-green-400">localStorage + cloud snapshot</span></p>
              </div>
              <DiagnosticPanel syncStatus={syncStatus} onForceSync={handleForceSync} />
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
