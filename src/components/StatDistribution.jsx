import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, RotateCcw, Sparkles } from 'lucide-react';
import { STAT_NAMES, STAT_DEFAULTS, getStatPointsForLevel } from '../data/stats';
import { getCharacterBuild } from '../data/stats';

export default function StatDistribution({ state, setState }) {
  const stats = state.stats || STAT_DEFAULTS;
  const [pendingChanges, setPendingChanges] = useState({});
  const statPoints = state.statPoints || 0;

  const totalSpent = Object.values(pendingChanges).reduce((a, b) => a + b, 0);
  const remainingPoints = statPoints - totalSpent;

  const currentValues = {};
  for (const [key, val] of Object.entries(stats)) {
    currentValues[key] = val + (pendingChanges[key] || 0);
  }

  const build = getCharacterBuild(currentValues);

  const adjustStat = (stat, delta) => {
    const newVal = currentValues[stat] + delta;
    if (newVal < 1) return;
    if (delta > 0 && remainingPoints <= 0) return;

    setPendingChanges(prev => ({
      ...prev,
      [stat]: (prev[stat] || 0) + delta,
    }));
  };

  const commitChanges = () => {
    const newStats = { ...stats };
    for (const [key, delta] of Object.entries(pendingChanges)) {
      newStats[key] = (newStats[key] || 0) + delta;
    }

    setState(prev => ({
      ...prev,
      stats: newStats,
      statPoints: remainingPoints,
      systemMessages: [
        ...prev.systemMessages,
        {
          type: 'levelUp',
          title: '⚡ Stats Updated!',
          subtitle: `Build: ${build.name}`,
          message: 'Your power has been redistributed.',
        },
      ],
    }));
    setPendingChanges({});
  };

  const resetChanges = () => setPendingChanges({});

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto p-2 sm:p-4 space-y-4">
      {/* Header */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="text-rank-s" />
            <div>
              <div className="font-orbitron font-bold text-gray-200">Character Stats</div>
              <div className="text-xs text-gray-500">Distribute your stat points</div>
            </div>
          </div>
          <div className="bg-yellow-400/20 border border-yellow-400/50 px-4 py-2 rounded-lg">
            <span className="font-bold text-rank-s">{remainingPoints}</span>
            <span className="text-xs text-yellow-400/70 ml-1">POINTS LEFT</span>
          </div>
        </div>

        {/* Build Display */}
        <div className="bg-dark-border/50 rounded-lg p-3 flex items-center gap-3">
          <div className="text-2xl">{build.icon}</div>
          <div>
            <div className="font-semibold text-gray-200">{build.name}</div>
            <div className="text-xs text-gray-400">{build.description}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        {Object.entries(STAT_NAMES).map(([key, config]) => {
          const current = currentValues[key];
          const hasChange = (pendingChanges[key] || 0) !== 0;

          return (
            <motion.div
              key={key}
              className={`glass-panel p-4 ${hasChange ? 'border-yellow-400/40' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-200">{config.name}</div>
                    <div className="text-xs text-gray-500">{config.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adjustStat(key, -1)}
                    disabled={current <= 1}
                    className="w-8 h-8 rounded-lg bg-dark-border hover:bg-red-900/30 disabled:opacity-30 flex items-center justify-center transition-colors"
                  >
                    <Minus size={14} />
                  </button>

                  <div className={`text-xl font-bold w-12 text-center ${
                    hasChange ? 'text-rank-s' : 'text-gray-200'
                  }`}>
                    {current}
                  </div>

                  <button
                    onClick={() => adjustStat(key, 1)}
                    disabled={remainingPoints <= 0}
                    className="w-8 h-8 rounded-lg bg-dark-border hover:bg-green-900/30 disabled:opacity-30 flex items-center justify-center transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Stat Bar */}
              <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: config.color }}
                  animate={{ width: `${Math.min(100, (current / 50) * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Base: {stats[key] || 10}</span>
                {hasChange && <span className="text-rank-s">+{pendingChanges[key]}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      {totalSpent > 0 && (
        <div className="flex gap-3">
          <button
            onClick={commitChanges}
            className="flex-1 bg-yellow-400 hover:bg-yellow-400/80 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Commit Changes
          </button>
          <button
            onClick={resetChanges}
            className="px-4 bg-dark-border hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      )}

      {/* Info */}
      <div className="glass-panel p-4 text-sm text-gray-400 space-y-2">
        <div className="font-semibold text-gray-300 mb-2">Stat Effects</div>
        <ul className="space-y-1 text-xs">
          <li>💪 <strong>Strength:</strong> +2% Body XP per point above 10</li>
          <li>🧠 <strong>Intelligence:</strong> +2% Deen XP per point above 10</li>
          <li>👁️ <strong>Sense:</strong> +2% Money XP per point above 10</li>
          <li>⚡ <strong>Agility:</strong> +0.5% all XP, enables Flow State faster</li>
          <li>❤️ <strong>Health:</strong> Reduces XP loss from debuffs (max 50%)</li>
          <li>✨ <strong>Mana:</strong> Reduces debuff duration (max 50%)</li>
        </ul>
      </div>
    </div>
  );
}
