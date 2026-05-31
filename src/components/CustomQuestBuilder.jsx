import { useState } from 'react';
import { Plus, Check, X, Bot, Loader2, Skull } from 'lucide-react';
import { forgeCustomQuest } from '../services/aiAssistant';

/**
 * CustomQuestBuilder — Forge-Master Edition
 * Flow: User types raw idea -> Clicks "Forge Quest" -> AI forges title/description/XP/pillar -> User accepts
 * NO manual XP. NO manual description. The AI decides everything.
 * NEVER rejects. The Forge-Master smelts all ore into steel.
 */

function parseForgedQuest(rawText) {
  try {
    const blockMatch = rawText.match(/\[\[FORGED_QUEST\]\]([\s\S]*?)\[\[\/FORGED_QUEST\]\]/);
    if (!blockMatch) return null;

    const block = blockMatch[1];
    const clean = (v) => {
      if (!v) return '';
      return v.trim().replace(/^<|>$/g, '').replace(/^\s*<\s*|\s*>\s*$/g, '').trim();
    };
    const getLine = (key) => {
      // Match key: value (single line), strip trailing bracket artifacts
      const regex = new RegExp(`^${key}:\\s*(.+)$`, 'm');
      const m = block.match(regex);
      return m ? clean(m[1]) : '';
    };

    return {
      title: getLine('Title'),
      description: getLine('Description'),
      pillar: getLine('Pillar').toLowerCase(),
      xp: parseInt(getLine('XP'), 10) || 0,
      status: getLine('Status').toLowerCase(),
      reason: getLine('Reason'),
    };
  } catch {
    return null;
  }
}

const pillarMeta = {
  deen: { label: 'Deen', color: '#22d3ee', bg: 'bg-cyan-900/40', border: 'border-cyan-600/40', activeBg: 'bg-cyan-700/50' },
  body: { label: 'Body', color: '#f43f5e', bg: 'bg-rose-900/40', border: 'border-rose-600/40', activeBg: 'bg-rose-700/50' },
  money: { label: 'Money', color: '#fbbf24', bg: 'bg-yellow-900/40', border: 'border-yellow-600/40', activeBg: 'bg-yellow-700/50' },
};

export default function CustomQuestBuilder({ onAdd, state }) {
  const [rawIdea, setRawIdea] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('body');
  const [showForm, setShowForm] = useState(false);
  const [forging, setForging] = useState(false);
  const [forgedQuest, setForgedQuest] = useState(null);
  const [forgeError, setForgeError] = useState(null);

  const handleForge = async () => {
    if (!rawIdea.trim()) return;

    setForging(true);
    setForgedQuest(null);
    setForgeError(null);

    try {
      const aiReply = await forgeCustomQuest(rawIdea, state, selectedPillar);
      const parsed = parseForgedQuest(aiReply);

      if (!parsed) {
        setForgeError('The Forge-Master returned an unreadable response. Retry.');
        setForging(false);
        return;
      }

      // Use user-selected pillar, overriding AI if needed
      parsed.pillar = selectedPillar;

      // Clamp XP
      parsed.xp = Math.max(5, Math.min(200, parsed.xp));

      // Force approved — the Forge-Master never rejects
      parsed.status = 'approved';

      setForgedQuest(parsed);
    } catch (err) {
      setForgeError(err.message || 'Forge connection failed. Check AI status in Settings.');
    } finally {
      setForging(false);
    }
  };

  const handleAccept = () => {
    if (!forgedQuest) return;

    onAdd({
      title: forgedQuest.title,
      description: forgedQuest.description,
      xp: forgedQuest.xp,
      pillar: selectedPillar,
      alignmentStatus: 'approved',
      justification: forgedQuest.reason,
      createdAt: new Date().toISOString(),
    });

    // Reset
    setRawIdea('');
    setSelectedPillar('body');
    setForgedQuest(null);
    setForgeError(null);
    setShowForm(false);
  };

  const handleReject = () => {
    setForgedQuest(null);
    setForgeError(null);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="glass-panel p-4 w-full flex items-center justify-center gap-2 text-cyan-500/50 hover:text-cyan-300 transition-colors border border-dashed border-cyan-700/30"
      >
        <Plus size={18} /> Forge Custom Quest
      </button>
    );
  }

  return (
    <div className="glass-panel p-4 space-y-3 border border-cyan-500/20">
      <div className="flex justify-between items-center">
        <h3 className="font-orbitron text-sm font-semibold text-cyan-200 tracking-wider">FORGE A QUEST</h3>
        <button
          onClick={() => {
            setShowForm(false);
            setRawIdea('');
            setSelectedPillar('body');
            setForgedQuest(null);
            setForgeError(null);
          }}
          className="text-cyan-600 hover:text-cyan-300"
        >
          <X size={18} />
        </button>
      </div>

      {/* Raw Idea Input */}
      {!forgedQuest && !forgeError && (
        <>
          {/* Pillar Selector */}
          <div className="flex gap-2">
            {['deen', 'body', 'money'].map((p) => {
              const meta = pillarMeta[p];
              const active = selectedPillar === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPillar(p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${
                    active
                      ? `${meta.activeBg} ${meta.border} text-white`
                      : `${meta.bg} border-cyan-900/30 text-cyan-500/60 hover:text-cyan-300`
                  }`}
                  style={active ? { borderColor: meta.color } : {}}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>

          <textarea
            placeholder="What do you want to do? Example: '50 pushups' or 'Study seerah for 30 minutes'"
            value={rawIdea}
            onChange={(e) => setRawIdea(e.target.value)}
            className="w-full bg-cyan-950/30 border border-cyan-800/50 rounded-lg px-3 py-2 text-base text-cyan-100 focus:outline-none focus:border-cyan-500/50 h-20 resize-none placeholder-cyan-700/50"
          />

          <button
            onClick={handleForge}
            disabled={forging || !rawIdea.trim()}
            className="w-full bg-cyan-700/30 hover:bg-cyan-600/30 disabled:opacity-30 disabled:cursor-not-allowed text-cyan-300 font-semibold py-3 rounded-lg transition-colors border border-cyan-600/30 min-h-[44px] flex items-center justify-center gap-2"
          >
            {forging ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                The Forge-Master is forging...
              </>
            ) : (
              <>
                <Bot size={16} />
                Forge Quest
              </>
            )}
          </button>
        </>
      )}

      {/* Loading State */}
      {forging && (
        <div className="text-center py-4 text-cyan-500/50 text-sm">
          <Loader2 size={24} className="animate-spin mx-auto mb-2 text-cyan-400" />
          The Forge-Master is evaluating your idea...
        </div>
      )}

      {/* Forged Quest Result */}
      {forgedQuest && !forging && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg border bg-cyan-950/20 border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="font-orbitron text-sm font-bold text-cyan-200">{forgedQuest.title}</div>
              <div className="text-xs font-bold px-2 py-1 rounded bg-yellow-900/30 text-yellow-400 border border-yellow-600/30">
                {forgedQuest.xp} XP
              </div>
            </div>

            <div className="text-sm text-cyan-300/80 mb-2">{forgedQuest.description}</div>

            {/* Pillar override selector in result */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-cyan-500/60 uppercase tracking-wider">Assign to:</span>
              {['deen', 'body', 'money'].map((p) => {
                const meta = pillarMeta[p];
                const active = selectedPillar === p;
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedPillar(p)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                      active
                        ? `${meta.activeBg} ${meta.border} text-white`
                        : `${meta.bg} border-cyan-900/30 text-cyan-500/60 hover:text-cyan-300`
                    }`}
                    style={active ? { borderColor: meta.color } : {}}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 text-xs text-cyan-500/50 italic">{forgedQuest.reason}</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 bg-cyan-700/30 hover:bg-cyan-600/30 text-cyan-300 font-semibold py-3 rounded-lg transition-colors border border-cyan-600/30 flex items-center justify-center gap-2"
            >
              <Check size={16} /> Accept Quest
            </button>
            <button
              onClick={handleReject}
              className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-300 font-semibold py-3 rounded-lg transition-colors border border-red-600/30 flex items-center justify-center gap-2"
            >
              <X size={16} /> Discard
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {forgeError && !forging && (
        <div className="p-4 rounded-lg bg-red-950/20 border border-red-500/30 text-red-300 text-sm text-center">
          <Skull size={20} className="mx-auto mb-2 text-red-400" />
          {forgeError}
          <button
            onClick={() => {
              setForgeError(null);
              setRawIdea('');
            }}
            className="mt-3 w-full bg-red-900/20 hover:bg-red-900/40 text-red-300 py-2 rounded text-xs transition-colors border border-red-600/30"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
