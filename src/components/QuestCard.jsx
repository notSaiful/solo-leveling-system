import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Dumbbell, BookOpen, Wallet, Zap, Skull, Lock, ChevronDown } from 'lucide-react';

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

const missionDutyLabels = {
  tauheed: 'Truth',
  wealth: 'Wealth',
  readiness: 'Readiness',
  service: 'Service',
  family: 'Family',
};

export default function QuestCard({ quest, onComplete, rank, disabled = false, disabledReason = '' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = pillarIcons[quest.pillar];
  const isCompleted = quest.completedToday;
  const isRedemption = quest.isRedemption;
  const isLevelQuest = quest.isLevelQuest;
  const hasDescription = Boolean(quest.description);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };

  const handleComplete = () => {
    if (!isCompleted && !disabled) {
      onComplete(quest);
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleComplete}
      title={disabledReason}
      className={`quest-card flex flex-col gap-2 ${isCompleted ? 'opacity-40' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${pillarColors[quest.pillar]} ${
        isRedemption ? 'border-red-500/40 bg-red-950/20' : ''
      } ${isLevelQuest ? 'border-yellow-500/40 bg-yellow-950/20' : ''}`}
    >
      {/* Main Row */}
      <div className="flex items-center gap-3 sm:gap-4">
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
            {quest.missionDuty && <span className="ml-2 text-yellow-400">· {missionDutyLabels[quest.missionDuty] || 'Mission'}</span>}
          </div>
          {hasDescription && !isExpanded && (
            <div className="text-[11px] text-cyan-500/35 mt-1 line-clamp-2">
              {quest.description}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasDescription && (
            <button
              onClick={toggleExpand}
              className="p-1 rounded-full hover:bg-cyan-500/10 transition-colors"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-cyan-500/60" />
              </motion.div>
            </button>
          )}

          {isCompleted ? (
            <div className="text-cyan-400">
              <Check size={18} className="sm:w-5 sm:h-5" />
            </div>
          ) : disabled ? (
            <div className="text-red-500/70">
              <Lock size={18} className="sm:w-5 sm:h-5" />
            </div>
          ) : (
            <div className={`w-5 h-5 rounded-full border-2 ${isRedemption ? 'border-red-500/50' : isLevelQuest ? 'border-yellow-500/50' : 'border-cyan-600/50'}`} />
          )}
        </div>
      </div>

      {/* Expandable Description */}
      <AnimatePresence>
        {isExpanded && hasDescription && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="rounded-lg bg-cyan-950/20 border border-cyan-500/10 p-3 text-[12px] text-cyan-400/70 leading-relaxed">
              {quest.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
