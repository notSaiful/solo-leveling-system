import { motion } from 'framer-motion';

export default function XpBar({ current, max, color, label, level }) {
  const progress = Math.min(100, (current / max) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1 tracking-wider">
        <span className="text-cyan-300/60">{label} <span className="text-cyan-100 font-bold">Lv.{level}</span></span>
        <span className="text-cyan-500/40">{current.toLocaleString()} / {max.toLocaleString()} XP</span>
      </div>
      <div className="xp-bar-bg relative">
        <motion.div
          className="xp-bar-fill relative"
          style={{ backgroundColor: color, width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 blur-[2px]" />
        </motion.div>
      </div>
    </div>
  );
}
