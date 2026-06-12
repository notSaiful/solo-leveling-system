import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Compass, BookOpen, Wallet, Zap, Skull, Lock, ChevronDown } from 'lucide-react';
import { getPillarDisplayKey } from '../utils/pillarDisplay';

const pillarIcons = {
  deen: BookOpen,
  body: Compass,
  money: Wallet,
};

const pillarColors = {
  deen: 'border-khalifa-blue/20 hover:border-khalifa-blue/60 bg-khalifa-blue/5',
  body: 'border-khalifa-amber/20 hover:border-khalifa-amber/60 bg-khalifa-amber/5',
  money: 'border-khalifa-gold/20 hover:border-khalifa-gold/60 bg-khalifa-gold/5',
};

const pillarTextColors = {
  deen: 'text-khalifa-blue',
  body: 'text-khalifa-amber',
  money: 'text-khalifa-gold',
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
  const Icon = pillarIcons[quest.pillar] || Zap;
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
      onComplete?.();
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleComplete}
      title={disabledReason}
      className={`quest-card flex flex-col gap-2 ${isCompleted ? 'opacity-40' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${pillarColors[quest.pillar] || pillarColors.deen} ${
        isRedemption ? 'border-red-500/40 bg-red-950/20' : ''
      } ${isLevelQuest ? 'border-khalifa-gold/40 bg-khalifa-gold/10' : ''}`}
    >
      {/* Main Row */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-lg relative shrink-0 ${isCompleted ? 'bg-khalifa-void/50' : isRedemption ? 'bg-red-950/30' : isLevelQuest ? 'bg-khalifa-gold/20' : 'bg-khalifa-void/30'}`}>
          <div className={`absolute inset-0 rounded-lg opacity-10 bg-gradient-to-br from-white to-transparent`} />
          {isRedemption ? <Skull size={18} className={`sm:w-5 sm:h-5 ${isCompleted ? 'text-gray-600' : 'text-red-400'}`} /> :
           isLevelQuest ? <Zap size={18} className={`sm:w-5 sm:h-5 ${isCompleted ? 'text-gray-600' : 'text-khalifa-gold'}`} /> :
           <Icon size={18} className={`sm:w-5 sm:h-5 ${isCompleted ? 'text-gray-600' : pillarTextColors[quest.pillar] || 'text-khalifa-blue'}`} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-100 truncate">
            {quest.title}
            {isRedemption && <span className="ml-2 text-[10px] text-red-400 uppercase tracking-wider">[Redemption]</span>}
            {isLevelQuest && <span className="ml-2 text-[10px] text-khalifa-gold uppercase tracking-wider">[Level {quest.requiredLevel}]</span>}
          </div>
          <div className="text-xs text-khalifa-steel mt-0.5">
            {quest.isPreset && typeof quest.scaleFn === 'function' ? `+${quest.scaleFn(rank)} XP` : `+${quest.xp || 0} XP`} · {getPillarDisplayKey(quest.pillar)}
            {isRedemption && <span className="ml-2 text-red-400">· {disabled ? 'Locked' : 'Clears debuff'}</span>}
            {quest.missionDuty && <span className="ml-2 text-khalifa-gold">· {missionDutyLabels[quest.missionDuty] || 'Mission'}</span>}
          </div>
          {hasDescription && !isExpanded && (
            <div className="text-[11px] text-khalifa-steel/60 mt-1 line-clamp-2">
              {quest.description}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasDescription && (
            <button
              onClick={toggleExpand}
              className="p-1 rounded-full hover:bg-white/5 transition-colors"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-khalifa-steel" />
              </motion.div>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleComplete();
            }}
            disabled={isCompleted || disabled}
            aria-label={isCompleted ? 'Quest completed' : disabled ? disabledReason || 'Quest locked' : `Complete ${quest.title}`}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isCompleted
                ? 'text-green-400 cursor-default'
                : disabled
                  ? 'text-red-500/70 cursor-not-allowed'
                  : 'hover:bg-white/5 active:bg-white/10'
            }`}
          >
            {isCompleted ? (
              <Check size={18} className="sm:w-5 sm:h-5" />
            ) : disabled ? (
              <Lock size={18} className="sm:w-5 sm:h-5" />
            ) : (
              <span className={`w-5 h-5 rounded-full border-2 ${isRedemption ? 'border-red-500/50' : isLevelQuest ? 'border-khalifa-gold/50' : 'border-khalifa-steel/50'}`} />
            )}
          </button>
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
            <div className="rounded-lg bg-khalifa-void/40 border border-khalifa-gold/10 p-3 text-[12px] text-gray-400 leading-relaxed space-y-2">
              <p>{quest.description}</p>
              {quest.steps && quest.steps.length > 0 && (
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  {quest.steps.map((step, idx) => (
                    <li key={idx} className="text-gray-300">
                      {typeof step === 'string' ? step : step.text}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
