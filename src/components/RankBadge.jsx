import { motion } from 'framer-motion';
import { getRankByLevel } from '../data/questCatalog';

export default function RankBadge({ level }) {
  const rank = getRankByLevel(level);

  return (
    <motion.div
      className="flex flex-col items-center relative group"
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* 8-point Star Background (Geometric Radiance) */}
      <div className="absolute inset-[-15px] opacity-20 group-hover:opacity-40 transition-opacity">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow" style={{ fill: rank.hexColor }}>
          <path d="M50 0l11.756 36.18h38.244L69.065 58.541l11.756 36.18L50 72.18l-30.821 22.541 11.756-36.18L0 36.18h38.244z" />
        </svg>
      </div>

      {/* Outer glow ring */}
      <div
        className="absolute inset-[-4px] rounded-full blur-xl opacity-40 animate-pulse-slow"
        style={{ backgroundColor: rank.hexColor }}
      />

      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black font-orbitron border-2 relative z-10 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${rank.hexColor}20, ${rank.hexColor}05)`,
          borderColor: rank.hexColor,
          color: rank.hexColor,
          boxShadow: `0 0 40px ${rank.hexColor}40, inset 0 0 25px ${rank.hexColor}20`,
        }}
      >
        {/* Subtle inner scanline effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1/2 w-full animate-scan pointer-events-none" />
        <span className="relative z-10 text-glow-monarch" style={rank.key === 'S' ? { textShadow: `0 0 20px ${rank.hexColor}` } : {}}>
          {rank.key}
        </span>
      </div>

      <div className="mt-4 text-center z-10">
        <div className="font-playfair font-bold text-lg tracking-tight leading-tight" style={{ color: rank.hexColor }}>
          {rank.name}
        </div>
        <div className="text-[9px] font-orbitron text-khalifa-gold/60 tracking-[0.2em] uppercase mt-0.5">
          {rank.title}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <div className="h-[1px] w-4 bg-gradient-to-r from-transparent to-khalifa-gold/30" />
          <div className="text-[10px] font-orbitron text-khalifa-steel tracking-widest uppercase">
            LVL {level}
          </div>
          <div className="h-[1px] w-4 bg-gradient-to-l from-transparent to-khalifa-gold/30" />
        </div>
      </div>
    </motion.div>
  );
}
