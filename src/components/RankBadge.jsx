import { motion } from 'framer-motion';
import { getRankByLevel } from '../data/questCatalog';

export default function RankBadge({ level }) {
  const rank = getRankByLevel(level);

  return (
    <motion.div
      className="flex flex-col items-center relative group"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sleek Minimal Border Ring */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black font-orbitron border relative z-10 bg-slate-950/80"
        style={{
          borderColor: `${rank.hexColor}40`,
          color: rank.hexColor,
        }}
      >
        <span className="relative z-10">
          {rank.key}
        </span>
      </div>

      <div className="mt-3 text-center z-10">
        <div className="font-semibold text-base tracking-tight leading-tight" style={{ color: rank.hexColor }}>
          {rank.name}
        </div>
        <div className="text-[9px] font-orbitron text-khalifa-steel tracking-[0.2em] uppercase mt-0.5">
          {rank.title}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <div className="h-[1px] w-3 bg-slate-800" />
          <div className="text-[10px] font-orbitron text-khalifa-steel/60 tracking-widest uppercase">
            LVL {level}
          </div>
          <div className="h-[1px] w-3 bg-slate-800" />
        </div>
      </div>
    </motion.div>
  );
}
