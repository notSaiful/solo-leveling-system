import { motion } from 'framer-motion';
import { getRankByLevel } from '../data/ranks';

export default function RankBadge({ level }) {
  const rank = getRankByLevel(level);

  return (
    <motion.div
      className="flex flex-col items-center relative"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-[-8px] rounded-full blur-md opacity-50"
        style={{ backgroundColor: rank.color }}
      />

      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black font-orbitron border-2 relative"
        style={{
          backgroundColor: `${rank.color}15`,
          borderColor: rank.color,
          color: rank.color,
          boxShadow: `0 0 30px ${rank.color}50, inset 0 0 20px ${rank.color}20`,
        }}
      >
        {rank.key}
      </div>

      <div className="mt-3 text-center">
        <div className="font-orbitron font-bold text-sm tracking-wider" style={{ color: rank.color }}>
          {rank.name}
        </div>
        <div className="text-[10px] text-cyan-500/50 tracking-widest uppercase">
          {rank.title}
        </div>
        <div className="text-[10px] text-cyan-600/40 mt-1">
          Level {level}
        </div>
      </div>
    </motion.div>
  );
}
