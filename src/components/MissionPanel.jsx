import { ShieldCheck, Target, Scale, HandHeart, TrendingUp } from 'lucide-react';
import { MISSION_DOCTRINE } from '../data/missionDoctrine';
import { getMissionMetrics } from '../logic/missionMetrics';

export default function MissionPanel({ history }) {
  const metrics = getMissionMetrics(history || []);
  const dutyIcon = {
    tauheed: ShieldCheck,
    wealth: TrendingUp,
    readiness: Target,
    service: HandHeart,
    family: Scale,
  };
  const WeakIcon = dutyIcon[metrics.weakestDuty?.id] || Target;

  return (
    <div className="glass-panel p-4 border border-cyan-500/25 bg-cyan-950/10">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="font-orbitron text-sm font-bold text-cyan-200 tracking-wider">
            {MISSION_DOCTRINE.title.toUpperCase()}
          </div>
          <div className="text-xs text-cyan-500/50 mt-1">
            {MISSION_DOCTRINE.ultimateQuestion}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-bold text-cyan-300">{metrics.missionScore}%</div>
          <div className="text-[10px] text-cyan-600 uppercase tracking-wider">Mission Coverage</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="rounded-lg border border-red-500/20 bg-red-950/10 p-3">
          <div className="flex items-center gap-2 text-red-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <WeakIcon size={14} />
            Weakest Duty
          </div>
          <div className="text-sm text-cyan-100">{metrics.weakestDuty?.label}</div>
        </div>

        <div className="rounded-lg border border-yellow-500/20 bg-yellow-950/10 p-3">
          <div className="flex items-center gap-2 text-yellow-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <HandHeart size={14} />
            Today
          </div>
          <div className="text-sm text-cyan-100">{metrics.todayActions} mission action{metrics.todayActions === 1 ? '' : 's'}</div>
        </div>

        <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Scale size={14} />
            Command
          </div>
          <div className="text-sm text-cyan-100 leading-snug">{metrics.todayServiceCommand}</div>
        </div>
      </div>
    </div>
  );
}
