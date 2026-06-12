import { motion } from 'framer-motion';
import { Sparkles, Shield, Brain, Eye, Zap, Heart, Droplets } from 'lucide-react';
import { STAT_NAMES, STAT_DEFAULTS } from '../data/stats';
import { getCharacterBuild } from '../data/stats';

const statMeta = {
  strength: { icon: Shield, label: 'STR' },
  intelligence: { icon: Brain, label: 'INT' },
  sense: { icon: Eye, label: 'SEN' },
  agility: { icon: Zap, label: 'AGI' },
  health: { icon: Heart, label: 'HP' },
  mana: { icon: Droplets, label: 'MP' },
};

export default function StatDistribution({ state }) {
  const stats = state.stats || STAT_DEFAULTS;
  const build = getCharacterBuild(stats);

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto p-2 sm:p-4 space-y-4">
      {/* Header */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="text-rank-s" />
            <div>
              <div className="font-orbitron font-bold text-cyan-100">Character Stats</div>
              <div className="text-xs text-cyan-400">Auto-assigned by the System based on your performance</div>
            </div>
          </div>
        </div>

        {/* Build Display */}
        <div className="bg-cyan-900/40 rounded-lg p-3 flex items-center gap-3">
          <div className="text-2xl">{build.icon}</div>
          <div>
            <div className="font-semibold text-cyan-100">{build.name}</div>
            <div className="text-xs text-cyan-300">{build.description}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        {Object.entries(STAT_NAMES).map(([key, config]) => {
          const current = stats[key] || 10;
          const Meta = statMeta[key];

          return (
            <motion.div
              key={key}
              className="glass-panel p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <div className="font-semibold text-cyan-100">{config.name}</div>
                    <div className="text-xs text-cyan-400">{config.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Meta.icon size={14} className="text-cyan-500/50" />
                  <div className="text-xl font-bold text-cyan-100 w-12 text-center">
                    {current}
                  </div>
                </div>
              </div>

              {/* Stat Bar */}
              <div className="h-2 bg-cyan-900/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: config.color }}
                  animate={{ width: `${Math.min(100, (current / 50) * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <div className="glass-panel p-4 text-sm text-cyan-300 space-y-2">
        <div className="font-semibold text-cyan-200 mb-2">Stat Effects</div>
        <ul className="space-y-1 text-xs">
          <li>💪 <strong>Strength:</strong> +2% Adventure XP per point above 10</li>
          <li>🧠 <strong>Intelligence:</strong> +2% Deen XP per point above 10</li>
          <li>👁️ <strong>Sense:</strong> +2% Money XP per point above 10</li>
          <li>⚡ <strong>Agility:</strong> +0.5% all XP, enables Flow State faster</li>
          <li>❤️ <strong>Health:</strong> Reduces XP loss from debuffs (max 50%)</li>
          <li>✨ <strong>Mana:</strong> Reduces debuff duration (max 50%)</li>
        </ul>
        <div className="text-xs text-cyan-500/60 pt-2 border-t border-cyan-900/30 mt-2">
          Stats grow automatically as you level up pillars. Adventure → Strength + Agility. Deen → Intelligence + Mana. Money → Sense + Agility.
        </div>
      </div>
    </div>
  );
}
