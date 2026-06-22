import { useMemo, useState } from 'react';
import { Mic, Square, Send, Flame, Sparkles, Loader2, Skull, Crown } from 'lucide-react';
import { useVoiceLog } from '../hooks/useVoiceLog';
import { parseActivities } from '../services/activityParser';
import { awardActivities } from '../logic/logEngine';
import { checkFlowState, getActivityStreakBonus } from '../logic/progression';
import { getRankByLevel, xpForNextLevel } from '../data/questCatalog';
import { getLocalDateString } from '../utils/dateUtils';
import { getTotalShadowPower } from '../data/shadows';
import { getActiveJobChangeGate } from '../data/jobChangeGates';

function ProgressHeader({ state }) {
  const overall = state.user.overallLevel || 0;
  const rank = getRankByLevel(overall);
  const pillars = ['deen', 'body', 'money'];
  return (
    <div className="glass-panel-khalifa p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-orbitron text-2xl text-khalifa-gold">{rank.key}-RANK</div>
          <div className="text-khalifa-steel text-sm">{rank.title} · Level {overall}</div>
        </div>
        {state.flowState?.active && (
          <div className="text-khalifa-gold text-sm font-orbitron">FLOW x{state.flowState.multiplier}</div>
        )}
      </div>
      <div className="space-y-3">
        {pillars.map((p) => {
          const lvl = state.pillars[p].level || 0;
          const xp = state.pillars[p].xp || 0;
          const needed = xpForNextLevel(lvl);
          const pct = Math.min(100, Math.round((xp / needed) * 100));
          return (
            <div key={p}>
              <div className="flex justify-between text-xs text-khalifa-steel mb-1">
                <span className="uppercase tracking-wider">{p}</span>
                <span>L{lvl} · {xp}/{needed}</span>
              </div>
              <div className="h-2 rounded-full bg-khalifa-void/60 overflow-hidden">
                <div className="h-full bg-khalifa-gold/80" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {/* Endgame status — terse, only when data exists */}
      {(() => {
        const activeGate = getActiveJobChangeGate(state);
        const hasEndgame = state.shadows?.length > 0 || state.user.jobClass || state.monarchTrials?.active || activeGate;
        if (!hasEndgame) return null;
        return (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-khalifa-gold/10 text-[11px]">
            {state.shadows?.length > 0 && (
              <span className="text-purple-400 flex items-center gap-1">
                <Skull size={11} /> {state.shadows.length} shadow{state.shadows.length === 1 ? '' : 's'} · +{Math.round(getTotalShadowPower(state) * 100)}%
              </span>
            )}
            {state.user.jobClass && (
              <span className="text-khalifa-gold flex items-center gap-1">
                <Crown size={11} /> {state.user.jobClass}
              </span>
            )}
            {state.monarchTrials?.active && (
              <span className="text-yellow-400">Trial · Stage {state.monarchTrials.stage}</span>
            )}
            {activeGate && (
              <span className="text-blue-400">Gate · Day {activeGate.day}/{activeGate.totalDays}</span>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function LogRow({ entry }) {
  const bonus = getActivityStreakBonus(entry.streak || 0);
  return (
    <div className="flex items-center justify-between py-2 border-b border-khalifa-void/40 last:border-0">
      <div className="min-w-0">
        <div className="text-khalifa-steel text-sm truncate">{entry.title}</div>
        <div className="text-xs text-khalifa-steel/60 uppercase tracking-wider">
          {entry.pillar} · {entry.localDate}
          {entry.quantity != null ? ` · ${entry.quantity} ${entry.unit || ''}` : ''}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {entry.streak >= 7 && (
          <span className="flex items-center gap-1 text-xs text-khalifa-gold">
            <Flame size={12} /> {entry.streak} · {bonus.label}
          </span>
        )}
        <span className="text-khalifa-gold text-sm font-orbitron">+{entry.xp} XP</span>
      </div>
    </div>
  );
}

export default function LogTab({ state, setState }) {
  const today = getLocalDateString();
  const [text, setText] = useState('');
  const [status, setStatus] = useState(''); // '', 'parsing', 'crisis', 'empty', 'error'
  const [notice, setNotice] = useState('');

  const voice = useVoiceLog({ onTranscript: (t) => setText((prev) => (prev ? prev + ' ' : '') + t) });

  const todaysLogs = useMemo(() => {
    return (state.history || [])
      .filter((h) => h.type === 'log' && h.localDate === today)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [state.history, today]);

  const activityLedger = state.activities || {};

  async function handleLog(payload) {
    const input = (payload ?? text).trim();
    if (!input) return;
    setNotice('');
    setStatus('parsing');
    let result;
    try {
      result = await parseActivities(input);
    } catch (err) {
      setStatus('error');
      setNotice(err.message || 'The System could not parse your log. Saved for retry.');
      savePendingLog(input);
      return;
    }

    if (result.crisis) {
      setStatus('crisis');
      setNotice(result.message);
      return;
    }
    if (!result.activities || result.activities.length === 0) {
      if (result.error) {
        setStatus('error');
        setNotice(result.error);
        savePendingLog(result.raw || input);
      } else {
        setStatus('empty');
        setNotice('The System recognized no activities in that log. Try: "100 push-ups, prayed Fajr, studied AI 30 min".');
      }
      return;
    }

    setState((prev) => {
      let next = awardActivities(prev, result.activities, today);
      const rank = getRankByLevel(next.user.overallLevel || 0);
      const flow = checkFlowState(next.history, rank.key);
      next = { ...next, flowState: flow };
      if (result.error && result.raw) {
        next.pendingLogs = [...(next.pendingLogs || []), { raw: result.raw, at: today }];
      }
      return next;
    });

    const gained = result.activities.length;
    setStatus('');
    setNotice(`Logged ${gained} activit${gained === 1 ? 'y' : 'ies'}. The System acknowledges your effort.`);
    setText('');
  }

  function savePendingLog(raw) {
    setState((prev) => ({ ...prev, pendingLogs: [...(prev.pendingLogs || []), { raw, at: today }] }));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <ProgressHeader state={state} />

      <div className="glass-panel-khalifa p-4 mb-4">
        <div className="text-khalifa-gold font-orbitron text-sm mb-3 flex items-center gap-2">
          <Sparkles size={14} /> TELL THE SYSTEM WHAT YOU DID
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I did 100 push-ups, prayed Fajr on time, and spent 30 minutes studying AI."
          className="w-full bg-khalifa-void/60 text-khalifa-steel rounded-lg p-3 text-sm border border-khalifa-gold/20 focus:border-khalifa-gold/60 focus:outline-none min-h-24 resize-none"
        />
        {voice.interim && <div className="text-khalifa-steel/50 text-xs mt-1 italic">{voice.interim}</div>}
        <div className="flex items-center gap-2 mt-3">
          {voice.supported && (
            <button
              onClick={voice.listening ? voice.stop : voice.start}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-orbitron border ${
                voice.listening
                  ? 'border-red-500/60 text-red-400'
                  : 'border-khalifa-gold/40 text-khalifa-gold'
              }`}
            >
              {voice.listening ? <Square size={14} /> : <Mic size={14} />}
              {voice.listening ? 'STOP' : 'SPEAK'}
            </button>
          )}
          <button
            onClick={() => handleLog()}
            disabled={status === 'parsing' || !text.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-orbitron bg-khalifa-gold text-khalifa-void disabled:opacity-40"
          >
            {status === 'parsing' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            LOG
          </button>
        </div>
        {voice.error && <div className="text-red-400 text-xs mt-2">{voice.error}</div>}
        {notice && (
          <div
            className={`text-xs mt-3 p-2 rounded ${
              status === 'crisis'
                ? 'bg-red-500/10 text-red-300'
                : status === 'error'
                ? 'bg-khalifa-gold/10 text-khalifa-gold/80'
                : 'bg-khalifa-gold/5 text-khalifa-steel'
            }`}
          >
            {notice}
          </div>
        )}
      </div>

      <div className="glass-panel-khalifa p-4 mb-4">
        <div className="text-khalifa-gold font-orbitron text-sm mb-2">TODAY · {today}</div>
        {todaysLogs.length === 0 ? (
          <div className="text-khalifa-steel/60 text-sm py-4 text-center">No logs yet today. Tell the System what you did.</div>
        ) : (
          <div>
            {todaysLogs.map((h, i) => (
              <LogRow
                key={h.eventId || i}
                entry={{ ...h, streak: activityLedger[h.activityKey]?.streak || 0 }}
              />
            ))}
          </div>
        )}
      </div>

      {Object.keys(activityLedger).length > 0 && (
        <div className="glass-panel-khalifa p-4">
          <div className="text-khalifa-gold font-orbitron text-sm mb-2">YOUR STREAKS</div>
          <div className="space-y-2">
            {Object.entries(activityLedger)
              .sort((a, b) => (b[1].streak || 0) - (a[1].streak || 0))
              .slice(0, 6)
              .map(([key, rec]) => {
                const bonus = getActivityStreakBonus(rec.streak || 0);
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-khalifa-steel truncate">{rec.name || key}</span>
                    <span className="flex items-center gap-1 text-khalifa-gold shrink-0">
                      <Flame size={12} /> {rec.streak} · {bonus.label}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
