import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LayoutDashboard, BarChart3, Swords, Settings, ShoppingBag, Sparkles, Coins, Zap, AlertTriangle, Users, Crown, Wrench, Play, Heart } from 'lucide-react';
import { activateSkill, getSkillCooldownRemaining } from './data/skills';
import { checkLegacyShadowExtraction, LEGACY_SHADOW_QUESTS, getLegacyShadowProgress, logLegacyShadowDay } from './data/legacyShadows';
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

  // Cloud init on mount — loads cloud state silently, syncs continuously afterward
  useEffect(() => {
    if (!isCanonicalSyncConfigured()) {
      setCloudReady(true);
      return;
    }

    initCloudSync().then((result) => {
      if (result?.success) {
        const fresh = loadState();
        setState({ ...fresh, __preserveLastUpdated: true });
      }
    }).catch(() => {}).finally(() => setCloudReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              <div className="text-[11px] text-cyan-500/40">Log each day manually. Streaks break if you miss a day. No auto-counting.</div>
              <div className="space-y-2">
                {LEGACY_SHADOW_QUESTS.map(template => {
                  const alreadyExtracted = state.legacyShadows?.some(s => s.id === template.shadow.id);
                  const { currentStreak, canLogToday } = getLegacyShadowProgress(state, template.id);
                  const progress = alreadyExtracted ? template.requiredDays : currentStreak;
                  const canExtract = progress >= template.requiredDays;
                  return (
                    <div key={template.id} className={`rounded-lg border p-3 ${alreadyExtracted ? 'bg-green-950/10 border-green-800/20' : 'bg-cyan-950/10 border-cyan-800/20'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-cyan-200">{template.title}</div>
                        {alreadyExtracted ? (
                          <span className="text-[10px] text-green-400">Extracted ✓</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setState(prev => logLegacyShadowDay(prev, template.id))}
                              disabled={!canLogToday}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${
                                canLogToday
                                  ? 'bg-cyan-900/30 border-cyan-500/40 text-cyan-300 hover:bg-cyan-800/40'
                                  : 'bg-green-950/20 border-green-700/30 text-green-400 cursor-default'
                              }`}
                            >
                              {canLogToday ? 'Log Today' : 'Logged ✓'}
                            </button>
                            <button
                              onClick={() => setState(prev => checkLegacyShadowExtraction(prev, template.id))}
                              disabled={!canExtract}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${
                                canExtract
                                  ? 'bg-purple-900/30 border-purple-500/40 text-purple-300 hover:bg-purple-800/40'
                                  : 'bg-cyan-950/20 border-cyan-800/20 text-cyan-600 cursor-not-allowed'
                              }`}
                            >
                              {canExtract ? 'Extract' : 'Locked'}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-cyan-500/60">{template.description}</div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] text-cyan-500/40 mb-1">
                          <span>Streak: {progress}/{template.requiredDays} days</span>
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
