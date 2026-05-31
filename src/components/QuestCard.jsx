import { motion } from 'framer-motion';
import { Check, Dumbbell, BookOpen, Wallet, Zap, Skull, Lock } from 'lucide-react';

const pillarIcons = {
  deen: BookOpen,
  body: Dumbbell,
  money: Wallet,
};

const pillarColors = {
  deen: 'border-cyan-500/20 hover:border-cyan-400/60',
  body: 'border-rose-500/20 hover:border-rose-400/60',
  money: 'border-yellow-500/20 hover:border-yellow-400/60',
};

export default function QuestCard({ quest, onComplete, rank, disabled = false, disabledReason = '' }) {
  const Icon = pillarIcons[quest.pillar];
  const isCompleted = quest.completedToday;
  const isRedemption = quest.isRedemption;
  const isLevelQuest = quest.isLevelQuest;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => !isCompleted && !disabled && onComplete(quest)}
      title={disabledReason}
      className={`quest-card flex items-center gap-3 sm:gap-4 ${isCompleted ? 'opacity-40' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${pillarColors[quest.pillar]} ${
        isRedemption ? 'border-red-500/40 bg-red-950/20' : ''
      } ${isLevelQuest ? 'border-yellow-500/40 bg-yellow-950/20' : ''}`}
    >
      <div className={`p-2 sm:p-3 rounded-lg relative shrink-0 ${isCompleted ? 'bg-cyan-950/30' : isRedemption ? 'bg-red-950/30' : isLevelQuest ? 'bg-yellow-950/30' : 'bg-cyan-950/30'}`}>
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400/10 to-transparent" />
        {isRedemption ? <Skull size={18} className={`sm:w-5 sm:h-5 ${isCompleted ? 'text-cyan-800' : 'text-red-400'}`} /> :
         isLevelQuest ? <Zap size={18} className={`sm:w-5 sm:h-5 ${isCompleted ? 'text-cyan-800' : 'text-yellow-400'}`} /> :
         <Icon size={18} className={`sm:w-5 sm:h-5 ${isCompleted ? 'text-cyan-800' : 'text-cyan-300'}`} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-cyan-100 truncate">
          {quest.title}
          {isRedemption && <span className="ml-2 text-[10px] text-red-400 uppercase tracking-wider">[Redemption]</span>}
          {isLevelQuest && <span className="ml-2 text-[10px] text-yellow-400 uppercase tracking-wider">[Level {quest.requiredLevel}]</span>}
        </div>
        <div className="text-xs text-cyan-500/40 mt-0.5">
          {quest.isPreset && typeof quest.scaleFn === 'function' ? `+${quest.scaleFn(rank)} XP` : `+${quest.xp || 0} XP`} · {quest.pillar.toUpperCase()}
          {isRedemption && <span className="ml-2 text-red-400">· {disabled ? 'Locked' : 'Clears debuff'}</span>}
        </div>
        {quest.description && (
          <div className="text-[11px] text-cyan-500/35 mt-1 line-clamp-2">
            {quest.description}
          </div>
        )}
      </div>

      {isCompleted ? (
        <div className="text-cyan-400 shrink-0">
          <Check size={18} className="sm:w-5 sm:h-5" />
        </div>
      ) : disabled ? (
        <div className="text-red-500/70 shrink-0">
          <Lock size={18} className="sm:w-5 sm:h-5" />
        </div>
      ) : (
        <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${isRedemption ? 'border-red-500/50' : isLevelQuest ? 'border-yellow-500/50' : 'border-cyan-600/50'}`} />
      )}
    </motion.div>
  );
}
