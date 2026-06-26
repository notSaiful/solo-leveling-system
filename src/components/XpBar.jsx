import { motion } from 'framer-motion';

export default function XpBar({ current, max, color, label, level }) {
  const progress = Math.min(100, (current / max) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] mb-1 tracking-wider font-orbitron">
        <span className="text-slate-400">{label} <span className="text-slate-200 font-bold">Lv.{level}</span></span>
        <span className="text-slate-500">{current.toLocaleString()} / {max.toLocaleString()} XP</span>
      </div>
      <div className="xp-bar-bg relative">
        <motion.div
          className="xp-bar-fill relative"
          style={{ backgroundColor: color, width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
