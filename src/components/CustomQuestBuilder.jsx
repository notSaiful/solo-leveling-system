import { useState } from 'react';
import { Plus, AlertTriangle, Check, X, Bot, Loader2 } from 'lucide-react';
import { validateQuestAlignment } from '../logic/alignment';
import { evaluateCustomQuest, hasApiKey } from '../services/aiAssistant';

export default function CustomQuestBuilder({ onAdd, state }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [xp, setXp] = useState(10);
  const [alignment, setAlignment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [aiEvaluating, setAiEvaluating] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState(null);

  const checkAlignment = () => {
    const result = validateQuestAlignment(title, description);
    setAlignment(result);
    return result;
  };

  const handleAiEvaluate = async () => {
    if (!title.trim()) return;
    setAiEvaluating(true);
    setAiEvaluation(null);
    try {
      const result = await evaluateCustomQuest(title, description || '', state);
      setAiEvaluation(result);
    } catch (err) {
      setAiEvaluation(`⚠️ ${err.message}`);
    } finally {
      setAiEvaluating(false);
    }
  };

  const handleSubmit = () => {
    const result = checkAlignment();
    if (result.status === 'rejected') return;

    onAdd({
      id: `custom-${Date.now()}`,
      title,
      description,
      xp: parseInt(xp),
      pillar: result.pillar,
      alignmentStatus: result.status,
      justification: description,
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setDescription('');
    setXp(10);
    setAlignment(null);
    setAiEvaluation(null);
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="glass-panel p-4 w-full flex items-center justify-center gap-2 text-cyan-500/50 hover:text-cyan-300 transition-colors border border-dashed border-cyan-700/30"
      >
        <Plus size={18} /> Add Custom Quest
      </button>
    );
  }

  return (
    <div className="glass-panel p-4 space-y-3 border border-cyan-500/20">
      <div className="flex justify-between items-center">
        <h3 className="font-orbitron text-sm font-semibold text-cyan-200 tracking-wider">NEW QUEST</h3>
        <button onClick={() => setShowForm(false)} className="text-cyan-600 hover:text-cyan-300"><X size={18} /></button>
      </div>

      <input
        type="text"
        placeholder="Quest title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-cyan-950/30 border border-cyan-800/50 rounded-lg px-3 py-2 text-base text-cyan-100 focus:outline-none focus:border-cyan-500/50 placeholder-cyan-700/50"
      />

      <textarea
        placeholder="Description (for alignment check)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-cyan-950/30 border border-cyan-800/50 rounded-lg px-3 py-2 text-base text-cyan-100 focus:outline-none focus:border-cyan-500/50 h-20 resize-none placeholder-cyan-700/50"
      />

      <div className="flex gap-3">
        <input
          type="number"
          placeholder="XP"
          value={xp}
          onChange={(e) => setXp(e.target.value)}
          className="w-24 bg-cyan-950/30 border border-cyan-800/50 rounded-lg px-3 py-2 text-base text-cyan-100 focus:outline-none focus:border-cyan-500/50"
        />
        <button
          onClick={checkAlignment}
          className="flex-1 bg-cyan-950/30 hover:bg-cyan-900/30 border border-cyan-800/50 rounded-lg py-2 text-sm text-cyan-400 transition-colors"
        >
          Check Alignment
        </button>
      </div>

      {/* AI Evaluation Button */}
      {hasApiKey() && (
        <button
          onClick={handleAiEvaluate}
          disabled={aiEvaluating || !title.trim()}
          className="w-full bg-cyan-900/20 hover:bg-cyan-800/30 border border-cyan-700/40 rounded-lg py-2 text-sm text-cyan-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {aiEvaluating ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
          {aiEvaluating ? 'SYSTEM evaluating...' : 'Ask SYSTEM to Evaluate Quest'}
        </button>
      )}

      {/* Local Alignment Result */}
      {alignment && (
        <div className={`p-3 rounded-lg text-sm ${
          alignment.status === 'approved' ? 'bg-cyan-900/20 border border-cyan-700/50 text-cyan-400' :
          alignment.status === 'warning' ? 'bg-yellow-900/20 border border-yellow-700/50 text-yellow-400' :
          'bg-red-900/20 border border-red-700/50 text-red-400'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            {alignment.status === 'approved' ? <Check size={16} /> :
             alignment.status === 'warning' ? <AlertTriangle size={16} /> :
             <X size={16} />}
            {alignment.status.toUpperCase()}
          </div>
          <div className="mt-1 text-xs opacity-80">{alignment.reason}</div>
          {alignment.status !== 'rejected' && (
            <div className="mt-2 text-xs">
              Pillar: <span className="font-semibold capitalize">{alignment.pillar}</span>
            </div>
          )}
        </div>
      )}

      {/* AI Evaluation Result */}
      {aiEvaluation && (
        <div className="p-3 rounded-lg text-sm bg-black/40 border border-cyan-700/30 text-cyan-200 whitespace-pre-wrap">
          <div className="flex items-center gap-2 mb-1 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Bot size={12} /> SYSTEM Evaluation
          </div>
          {aiEvaluation}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!alignment || alignment.status === 'rejected'}
        className="w-full bg-cyan-700/30 hover:bg-cyan-600/30 disabled:opacity-30 disabled:cursor-not-allowed text-cyan-300 font-semibold py-3 rounded-lg transition-colors border border-cyan-600/30 min-h-[44px]"
      >
        Create Quest
      </button>
    </div>
  );
}
