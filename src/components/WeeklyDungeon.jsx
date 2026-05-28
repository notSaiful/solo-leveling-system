import { Sword, Shield, Crown, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WeeklyDungeon({ state, setState }) {
  const dungeons = state.weeklyDungeons;

  const toggleStep = (pillar, stepId) => {
    setState(prev => {
      const newDungeons = { ...prev.weeklyDungeons };
      const pillarDungeon = { ...newDungeons[pillar] };
      pillarDungeon.steps = pillarDungeon.steps.map(s =>
        s.id === stepId ? { ...s, completed: !s.completed } : s
      );
      newDungeons[pillar] = pillarDungeon;
      return { ...prev, weeklyDungeons: newDungeons };
    });
  };

  const dungeonData = {
    deen: { icon: Shield, title: dungeons.deen?.title || 'Deen Dungeon', color: 'text-cyan-400', border: 'border-cyan-500/20' },
    body: { icon: Sword, title: dungeons.body?.title || 'Body Dungeon', color: 'text-rose-400', border: 'border-rose-500/20' },
    money: { icon: Crown, title: dungeons.money?.title || 'Money Dungeon', color: 'text-yellow-400', border: 'border-yellow-500/20' },
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <Sword size={20} className="text-cyan-400" />
        <h2 className="font-orbitron text-sm font-bold text-cyan-300 tracking-wider">WEEKLY DUNGEONS</h2>
      </div>

      {['deen', 'body', 'money'].map(pillar => {
        const config = dungeonData[pillar];
        const Icon = config.icon;
        const dungeon = dungeons[pillar];
        if (!dungeon) return null;

        return (
          <div key={pillar} className={`glass-panel p-4 border ${config.border} relative`}>
            <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-cyan-400/20" />
            <div className="absolute top-2 right-2 w-2 h-2 border-r border-t border-cyan-400/20" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-cyan-400/20" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-cyan-400/20" />

            <div className="flex items-center gap-3 mb-3">
              <Icon size={20} className={config.color} />
              <div className="font-semibold text-cyan-200">{dungeon.title}</div>
            </div>
            <div className="text-xs text-cyan-400/30 mb-3">{dungeon.description}</div>
            <div className="space-y-2">
              {dungeon.steps.map(step => (
                <motion.div
                  key={step.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleStep(pillar, step.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    step.completed ? 'bg-cyan-900/20' : 'bg-cyan-950/20 hover:bg-cyan-900/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    step.completed ? 'border-cyan-400 bg-cyan-400/20' : 'border-cyan-700'
                  }`}>
                    {step.completed && <CheckCircle2 size={14} className="text-cyan-400" />}
                  </div>
                  <span className={`text-sm ${step.completed ? 'text-cyan-400/60 line-through' : 'text-cyan-200'}`}>
                    {step.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
