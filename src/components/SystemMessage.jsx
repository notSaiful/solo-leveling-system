import { motion, AnimatePresence } from 'framer-motion';

export default function SystemMessage({ notification, onDismiss }) {
  if (!notification) return null;

  const isRankUp = notification.type === 'rankUp';
  const isPenalty = notification.type === 'penalty';
  const isReward = notification.type === 'reward';

  return (
    <AnimatePresence>
      <motion.div
        key={notification.type + '-' + notification.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="system-message scanline"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.7, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative"
        >
          {/* Holographic border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-400/50 via-transparent to-cyan-400/30 rounded-xl blur-sm" />

          <div className={`relative text-center p-8 rounded-xl border-2 bg-[rgba(0,10,20,0.95)] backdrop-blur-xl ${
            isRankUp || isReward ? 'border-yellow-400/60 shadow-[0_0_40px_rgba(251,191,36,0.3)]' :
            isPenalty ? 'border-red-400/60 shadow-[0_0_40px_rgba(248,113,113,0.3)]' :
            'border-cyan-400/60 shadow-[0_0_40px_rgba(6,182,212,0.3)]'
          }`}>
            {/* Scanline overlay */}
            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,212,255,0.03)_2px,rgba(0,212,255,0.03)_4px)]" />
            </div>

            {/* SYSTEM label */}
            <div className="system-header mb-4">
              {isRankUp ? '⚡ RANK UP DETECTED' : isPenalty ? '⚠️ SYSTEM WARNING' : isReward ? '📦 REWARD ACQUIRED' : '⚡ LEVEL UP DETECTED'}
            </div>

            {/* Main title */}
            <motion.div
              animate={{
                textShadow: isRankUp || isReward
                  ? ['0 0 20px rgba(251,191,36,0.8)', '0 0 40px rgba(251,191,36,1)', '0 0 20px rgba(251,191,36,0.8)']
                  : isPenalty
                  ? ['0 0 20px rgba(248,113,113,0.8)', '0 0 40px rgba(248,113,113,1)', '0 0 20px rgba(248,113,113,0.8)']
                  : ['0 0 20px rgba(6,182,212,0.8)', '0 0 40px rgba(6,182,212,1)', '0 0 20px rgba(6,182,212,0.8)']
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`font-orbitron text-3xl md:text-4xl font-black mb-3 tracking-wider ${
                isRankUp || isReward ? 'text-yellow-400' : isPenalty ? 'text-red-400' : 'text-cyan-400'
              }`}
            >
              {notification.title}
            </motion.div>

            {/* Subtitle */}
            <div className="text-lg text-cyan-200/80 mb-3 font-light tracking-wide">
              {notification.subtitle}
            </div>

            {/* Message */}
            <div className="text-cyan-300/60 max-w-md text-sm leading-relaxed">
              {notification.message}
            </div>

            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyan-400/50" />
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyan-400/50" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-400/50" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-400/50" />

            {/* Click to continue */}
            <motion.div
              className="mt-6 text-xs text-cyan-500/40 tracking-widest uppercase"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              [ Click anywhere to continue ]
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
