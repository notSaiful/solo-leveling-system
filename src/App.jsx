import React, { useState, useEffect, useMemo } from 'react';
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
import { getItemTierLabel, getItemColorClass } from './data/equipment';
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

  // Check penalties on mount
  usePenaltyCheck(state, setState, cloudReady);

  const [activeTab, setActiveTab] = useState('dashboard');

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
        weeklyFocus: null,
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
        {activeTab === 'dashboard' && <Dashboard state={state} setState={setState} ready={cloudReady} />}
        {activeTab === 'stats' && <StatsPanel state={state} />}
        {activeTab === 'dungeons' && <WeeklyDungeon state={state} setState={setState} />}
        {activeTab === 'legion' && (
          <div className="max-w-2xl mx-auto p-2 sm:p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-playfair text-2xl font-bold text-khalifa-gold tracking-tight text-glow-khalifa">Shadow Legion</h2>
              <div className="text-[10px] font-orbitron text-khalifa-steel tracking-widest uppercase bg-khalifa-gold/5 px-2 py-1 rounded border border-khalifa-gold/20">
                Level {state.user.overallLevel} Command
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(state.legacyShadows || []).length === 0 ? (
                <div className="col-span-full glass-panel p-8 text-center border-dashed border-khalifa-gold/20">
                  <Skull size={32} className="mx-auto text-khalifa-steel/30 mb-2" />
                  <div className="text-sm text-khalifa-steel italic">No Manhood Forge shadows extracted yet.</div>
                </div>
              ) : (
                (state.legacyShadows || []).map((shadow, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel-khalifa p-4 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-khalifa-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-lg bg-khalifa-purple/20 border border-khalifa-purple/30 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                        <Users size={24} className="text-khalifa-purple" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-gray-100 font-playfair tracking-wide">{shadow.name}</div>
                        <div className="text-[10px] text-khalifa-purple/80 uppercase tracking-widest font-orbitron">Legacy Shadow</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-khalifa-purple/10">
                      <div className="text-xs text-khalifa-steel">
                        Inheritance: <span className="text-khalifa-purple">+{shadow.boostValue} {shadow.boostType}</span>
                      </div>
                      <div className="text-[10px] text-khalifa-steel/50 mt-1 uppercase tracking-tighter">Secured for future generations</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Manhood Forge Extraction UI */}
            <div className="space-y-4">
              <h3 className="font-orbitron text-xs font-bold text-khalifa-gold tracking-[0.3em] uppercase opacity-60">The Manhood Forge</h3>
              <div className="grid grid-cols-1 gap-3">
                {LEGACY_SHADOW_QUESTS.map(template => {
                  const alreadyExtracted = state.legacyShadows?.some(s => s.id === template.shadow.id);
                  const { currentStreak, canLogToday } = getLegacyShadowProgress(state, template.id);
                  const progress = alreadyExtracted ? template.requiredDays : currentStreak;
                  const canExtract = progress >= template.requiredDays;
                  const percent = Math.min(100, Math.round((progress / template.requiredDays) * 100));

                  return (
                    <div key={template.id} className={`glass-panel p-4 relative overflow-hidden ${alreadyExtracted ? 'border-green-500/20 bg-green-950/5' : 'border-khalifa-gold/10'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold font-playfair ${alreadyExtracted ? 'text-green-400' : 'text-gray-200'}`}>{template.title}</span>
                            {alreadyExtracted && <span className="text-[9px] text-green-500/60 uppercase tracking-widest bg-green-500/10 px-1.5 rounded">Extracted</span>}
                          </div>
                          <p className="text-xs text-khalifa-steel mt-1 leading-relaxed">{template.description}</p>
                        </div>

                        {!alreadyExtracted && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setState(prev => logLegacyShadowDay(prev, template.id))}
                              disabled={!canLogToday}
                              className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider transition-all ${
                                canLogToday
                                  ? 'bg-khalifa-gold/10 border-khalifa-gold/30 text-khalifa-gold hover:bg-khalifa-gold/20'
                                  : 'bg-green-500/10 border-green-500/30 text-green-400 cursor-default'
                              }`}
                            >
                              {canLogToday ? 'Log' : 'Logged'}
                            </button>
                            <button
                              onClick={() => setState(prev => checkLegacyShadowExtraction(prev, template.id))}
                              disabled={!canExtract}
                              className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider transition-all ${
                                canExtract
                                  ? 'bg-khalifa-purple/20 border-khalifa-purple/40 text-khalifa-purple shadow-[0_0_10px_rgba(124,58,237,0.3)] hover:bg-khalifa-purple/30'
                                  : 'bg-khalifa-void border-khalifa-steel/20 text-khalifa-steel cursor-not-allowed'
                              }`}
                            >
                              Extract
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[9px] font-orbitron text-khalifa-steel/50 mb-1.5 uppercase tracking-widest">
                          <span>Progress: {progress}/{template.requiredDays} Days</span>
                          <span className={alreadyExtracted ? 'text-green-500' : 'text-khalifa-gold'}>{percent}%</span>
                        </div>
                        <div className="w-full bg-khalifa-void rounded-full h-1 relative">
                          <div
                            className={`rounded-full h-1 transition-all duration-1000 ${alreadyExtracted ? 'bg-green-500' : 'bg-khalifa-gold'}`}
                            style={{ width: `${percent}%`, boxShadow: `0 0 10px ${alreadyExtracted ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Skills */}
            <div className="space-y-4">
              <h3 className="font-orbitron text-xs font-bold text-khalifa-purple tracking-[0.3em] uppercase opacity-60">Awakened Skills</h3>
              <div className="grid grid-cols-1 gap-3">
                {(state.skills || []).length === 0 ? (
                  <div className="glass-panel p-6 text-center border-dashed border-khalifa-purple/20">
                    <Zap size={24} className="mx-auto text-khalifa-steel/30 mb-2" />
                    <div className="text-sm text-khalifa-steel italic">Pass Job Change Gates to unlock skills.</div>
                  </div>
                ) : (
                  (state.skills || []).map((skill, i) => {
                    const cdRemaining = getSkillCooldownRemaining(state, skill.id);
                    const canActivate = cdRemaining === 0;
                    return (
                      <div key={i} className="glass-panel p-4 flex items-center justify-between gap-4 border-khalifa-purple/20 bg-khalifa-purple/5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${skill.active ? 'bg-khalifa-purple border-khalifa-purple shadow-[0_0_15px_rgba(124,58,237,0.5)]' : 'bg-khalifa-purple/10 border-khalifa-purple/30'}`}>
                            <Zap size={20} className={skill.active ? 'text-white' : 'text-khalifa-purple'} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-100">{skill.name}</div>
                            <div className="text-[10px] text-khalifa-steel mt-0.5">{skill.description}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (!canActivate) return;
                            setState(prev => activateSkill(prev, skill.id));
                          }}
                          disabled={!canActivate}
                          className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider transition-all ${
                            canActivate
                              ? 'bg-khalifa-purple/20 border-khalifa-purple/40 text-khalifa-purple hover:bg-khalifa-purple/30'
                              : 'bg-khalifa-void border-khalifa-steel/20 text-khalifa-steel cursor-not-allowed'
                          }`}
                        >
                          {canActivate ? 'Activate' : `${Math.ceil(cdRemaining / 3600000)}h`}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-4 pb-4">
              <h3 className="font-orbitron text-xs font-bold text-khalifa-amber tracking-[0.3em] uppercase opacity-60">Monarch's Regalia</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['weapon', 'armor', 'ring'].map(slot => {
                  const item = state.equipment?.[slot];
                  return (
                    <div key={slot} className="glass-panel p-4 flex flex-col items-center text-center gap-2 border-khalifa-amber/20 bg-khalifa-amber/5">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${item ? 'bg-khalifa-amber/20 border-khalifa-amber/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-khalifa-void border-khalifa-steel/20'}`}>
                        <Wrench size={24} className={item ? 'text-khalifa-amber' : 'text-khalifa-steel/30'} />
                      </div>
                      <div className="w-full">
                        <div className="text-[10px] text-khalifa-steel uppercase tracking-widest mb-1">{slot}</div>
                        <div className={`text-sm font-bold truncate ${item ? getItemColorClass(item) : 'text-khalifa-steel/50'}`}>
                          {item ? item.name : 'Empty'}
                        </div>
                        {item && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-[9px] text-khalifa-steel/60 px-1">
                              <span>Durability</span>
                              <span>{Math.round((item.durability / item.maxDurability) * 100)}%</span>
                            </div>
                            <div className="w-full bg-khalifa-void rounded-full h-1">
                              <div
                                className={`rounded-full h-1 transition-all ${item.durability > item.maxDurability * 0.3 ? 'bg-khalifa-amber' : 'bg-red-500'}`}
                                style={{ width: `${(item.durability / item.maxDurability) * 100}%` }}
                              />
                            </div>
                            <div className="text-[9px] text-khalifa-amber/80 font-bold uppercase tracking-tighter pt-1">
                              {getItemTierLabel(item)} {item.enchantLevel > 0 && `(+${item.enchantLevel})`}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
