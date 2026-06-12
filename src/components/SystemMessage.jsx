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
          <div className={`absolute -inset-[1px] bg-gradient-to-br rounded-xl blur-sm ${
            isRankUp || isReward ? 'from-khalifa-gold/50 via-transparent to-khalifa-gold/30' :
            isPenalty ? 'from-red-500/50 via-transparent to-red-500/30' :
            'from-khalifa-blue/50 via-transparent to-khalifa-blue/30'
          }`} />

          <div className={`relative text-center p-8 sm:p-12 rounded-xl border-2 bg-khalifa-void/95 backdrop-blur-2xl overflow-hidden ${
            isRankUp || isReward ? 'border-khalifa-gold/60 shadow-[0_0_50px_rgba(234,179,8,0.3)]' :
            isPenalty ? 'border-red-500/60 shadow-[0_0_50px_rgba(239,44,44,0.3)]' :
            'border-khalifa-blue/60 shadow-[0_0_50px_rgba(59,130,246,0.3)]'
          }`}>
            {/* Background Decorative Star */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <svg viewBox="0 0 100 100" fill="currentColor" className={`w-64 h-64 ${isRankUp || isReward ? 'text-khalifa-gold' : isPenalty ? 'text-red-500' : 'text-khalifa-blue'}`}>
                <path d="M50 0l11.756 36.18h38.244L69.065 58.541l11.756 36.18L50 72.18l-30.821 22.541 11.756-36.18L0 36.18h38.244z" />
              </svg>
            </div>

            {/* Scanline overlay */}
            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.01)_2px,rgba(255,255,255,0.01)_4px)]" />
            </div>

            {/* SYSTEM label */}
            <div className={`font-orbitron text-[10px] sm:text-xs tracking-[0.4em] mb-4 uppercase ${
              isRankUp || isReward ? 'text-khalifa-gold/70' : isPenalty ? 'text-red-400/70' : 'text-khalifa-blue/70'
            }`}>
              {isRankUp ? 'KHALIFATE ASCENSION' : isPenalty ? 'SYSTEM PENALTY' : isReward ? 'DIVINE PROVISION' : 'STRENGTH INCREASED'}
            </div>

            {/* Main title */}
            <motion.div
              animate={{
                textShadow: isRankUp || isReward
                  ? ['0 0 20px rgba(234,179,8,0.5)', '0 0 40px rgba(234,179,8,0.8)', '0 0 20px rgba(234,179,8,0.5)']
                  : isPenalty
                  ? ['0 0 20px rgba(239,44,44,0.5)', '0 0 40px rgba(239,44,44,0.8)', '0 0 20px rgba(239,44,44,0.5)']
                  : ['0 0 20px rgba(59,130,246,0.5)', '0 0 40px rgba(59,130,246,0.8)', '0 0 20px rgba(59,130,246,0.5)']
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className={`font-playfair text-4xl sm:text-5xl font-black mb-4 tracking-tight ${
                isRankUp || isReward ? 'text-khalifa-gold' : isPenalty ? 'text-red-500' : 'text-khalifa-blue'
              }`}
            >
              {notification.title}
            </motion.div>

            {/* Subtitle */}
            <div className="text-xl sm:text-2xl text-gray-200 mb-4 font-playfair italic">
              {notification.subtitle}
            </div>

            {/* Message */}
            <div className="text-gray-400 max-w-md mx-auto text-sm sm:text-base leading-relaxed font-inter">
              {notification.message}
            </div>

            {/* Decorative corners */}
            <div className={`absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 ${isRankUp || isReward ? 'border-khalifa-gold/40' : isPenalty ? 'border-red-500/40' : 'border-khalifa-blue/40'}`} />
            <div className={`absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 ${isRankUp || isReward ? 'border-khalifa-gold/40' : isPenalty ? 'border-red-500/40' : 'border-khalifa-blue/40'}`} />
            <div className={`absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 ${isRankUp || isReward ? 'border-khalifa-gold/40' : isPenalty ? 'border-red-500/40' : 'border-khalifa-blue/40'}`} />
            <div className={`absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 ${isRankUp || isReward ? 'border-khalifa-gold/40' : isPenalty ? 'border-red-500/40' : 'border-khalifa-blue/40'}`} />

            {/* Click to continue */}
            <motion.div
              className="mt-10 text-[10px] text-gray-500 tracking-[0.3em] uppercase font-orbitron"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              [ TOUCH TO PROCEED ]
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
