import { BookOpen, CheckCircle2, Circle, HandHeart, Scale, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { MISSION_DOCTRINE } from '../data/missionDoctrine';
import { getMissionPlan } from '../logic/missionPlan';

const dutyIcons = {
  tauheed: BookOpen,
  wealth: TrendingUp,
  readiness: Target,
  service: HandHeart,
  family: Scale,
};

export default function MissionCommandCenter({ history }) {
  const plan = getMissionPlan(history || []);
  const WeakIcon = dutyIcons[plan.weeklyFocus.duty?.id] || ShieldCheck;

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-5 relative z-10">
      <section className="glass-panel-strong p-5 sm:p-6 border border-cyan-500/25">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-300">
              <ShieldCheck size={18} />
              <span className="font-orbitron text-sm font-bold tracking-wider uppercase">Mission Command</span>
            </div>
            <h2 className="font-orbitron text-xl sm:text-2xl font-bold text-cyan-100 tracking-wide">
              {MISSION_DOCTRINE.title}
            </h2>
            <p className="text-sm text-cyan-500/70 leading-relaxed max-w-2xl">
              {MISSION_DOCTRINE.oath}
            </p>
          </div>
          <div className="sm:text-right shrink-0">
            <div className="text-2xl font-bold text-cyan-300">{plan.metrics.missionScore}%</div>
            <div className="text-[10px] uppercase tracking-wider text-cyan-600">Coverage</div>
          </div>
        </div>
      </section>

      <section className="glass-panel p-4 border border-yellow-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="text-[10px] text-yellow-500/70 uppercase tracking-wider">Current Phase</div>
            <div className="font-orbitron text-lg font-bold text-yellow-200">{plan.currentPhase.title}</div>
            <div className="text-sm text-cyan-500/70 mt-1">{plan.currentPhase.aim}</div>
          </div>
          <div className="sm:text-right">
            <div className="text-xs text-cyan-500/60">
              {plan.nextPhase ? `Next: ${plan.nextPhase.title}` : 'Final phase active'}
            </div>
            <div className="mt-2 w-full sm:w-40 h-2 rounded-full bg-cyan-950 overflow-hidden">
              <div
                className="h-full bg-yellow-400"
                style={{ width: `${plan.phaseProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {plan.currentPhase.objectives.map(objective => (
            <div key={objective} className="border border-cyan-900/40 bg-cyan-950/10 rounded-lg p-3 text-sm text-cyan-100 leading-snug">
              {objective}
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel p-4 border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-3 text-cyan-300">
          <WeakIcon size={16} />
          <span className="font-orbitron text-sm font-semibold tracking-wider uppercase">Weekly Focus</span>
        </div>
        <div className="text-sm text-cyan-100 leading-relaxed">{plan.weeklyFocus.command}</div>
        <div className="mt-3 text-xs text-cyan-500/50">
          Weakest duty: {plan.weeklyFocus.duty?.label || 'Unknown'}
        </div>
      </section>

      <section className="glass-panel p-4 border border-cyan-500/20">
        <div className="font-orbitron text-sm font-semibold text-cyan-300 tracking-wider uppercase mb-3">
          Daily Trusts
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {plan.trusts.map((trust) => {
            const TrustIcon = trust.completedToday ? CheckCircle2 : Circle;
            return (
              <div key={trust.id} className="flex items-start gap-3 rounded-lg border border-cyan-900/40 bg-black/20 p-3">
                <TrustIcon size={17} className={trust.completedToday ? 'text-green-400 shrink-0 mt-0.5' : 'text-cyan-700 shrink-0 mt-0.5'} />
                <div>
                  <div className="text-sm font-semibold text-cyan-100">{trust.title}</div>
                  <div className="text-xs text-cyan-500/60 leading-snug mt-0.5">{trust.command}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-4 border border-red-500/20">
          <div className="flex items-center gap-2 text-red-300 mb-3">
            <Scale size={16} />
            <span className="font-orbitron text-sm font-semibold tracking-wider uppercase">Lawful Justice Protocol</span>
          </div>
          <div className="space-y-2">
            {plan.lawfulJusticeProtocol.map(item => (
              <div key={item} className="text-sm text-cyan-100 leading-snug border-l border-red-500/30 pl-3">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4 border border-cyan-500/20">
          <div className="font-orbitron text-sm font-semibold text-cyan-300 tracking-wider uppercase mb-3">
            Weekly Review
          </div>
          <div className="space-y-2">
            {plan.weeklyReviewQuestions.map(question => (
              <div key={question} className="text-sm text-cyan-100 leading-snug border-l border-cyan-500/30 pl-3">
                {question}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
