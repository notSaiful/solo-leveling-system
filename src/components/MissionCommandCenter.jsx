import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Circle, FileText, HandHeart, Megaphone, Scale, ShieldCheck, Target, TrendingUp, Wallet } from 'lucide-react';
import { MISSION_DOCTRINE } from '../data/missionDoctrine';
import { IMPACT_CATEGORIES, IMPACT_CATEGORY_LABELS } from '../data/ummahImpact';
import { JUSTICE_ACTION_LABELS, JUSTICE_ACTION_TYPES, JUSTICE_GUARDRAILS } from '../data/justiceResponse';
import { getMissionPlan } from '../logic/missionPlan';
import { addImpactEntryToState, getImpactMetrics } from '../logic/ummahImpact';
import { addJusticeResponseToState, getJusticeResponseMetrics } from '../logic/justiceResponse';

const dutyIcons = {
  tauheed: BookOpen,
  wealth: TrendingUp,
  readiness: Target,
  service: HandHeart,
  family: Scale,
};

export default function MissionCommandCenter({ state, setState }) {
  const history = state.history || [];
  const impactLedger = state.ummahImpactLedger || [];
  const justiceLedger = state.justiceResponseLedger || [];
  const [impactForm, setImpactForm] = useState({
    amount: '',
    category: 'sadaqah',
    peopleHelped: '',
    note: '',
  });
  const [justiceForm, setJusticeForm] = useState({
    cause: '',
    oppressedGroup: '',
    actionType: 'evidence',
    channel: '',
    evidenceCount: '',
    peopleHelped: '',
    note: '',
    guardrailAccepted: true,
  });
  const [formError, setFormError] = useState('');
  const [justiceError, setJusticeError] = useState('');
  const plan = getMissionPlan(history || []);
  const impactMetrics = useMemo(() => getImpactMetrics(impactLedger), [impactLedger]);
  const justiceMetrics = useMemo(() => getJusticeResponseMetrics(justiceLedger), [justiceLedger]);
  const WeakIcon = dutyIcons[plan.weeklyFocus.duty?.id] || ShieldCheck;
  const recentImpact = [...impactLedger]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);
  const recentJustice = [...justiceLedger]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  const updateImpactForm = (key, value) => {
    setImpactForm(prev => ({ ...prev, [key]: value }));
    if (formError) setFormError('');
  };

  const updateJusticeForm = (key, value) => {
    setJusticeForm(prev => ({ ...prev, [key]: value }));
    if (justiceError) setJusticeError('');
  };

  const handleImpactSubmit = (event) => {
    event.preventDefault();
    try {
      setState(prev => addImpactEntryToState(prev, {
        ...impactForm,
        amount: Number(impactForm.amount),
        peopleHelped: Number(impactForm.peopleHelped || 0),
      }));
      setImpactForm({ amount: '', category: impactForm.category, peopleHelped: '', note: '' });
      setFormError('');
    } catch (error) {
      setFormError(error.message || 'Impact entry failed.');
    }
  };

  const handleJusticeSubmit = (event) => {
    event.preventDefault();
    try {
      setState(prev => addJusticeResponseToState(prev, {
        ...justiceForm,
        evidenceCount: Number(justiceForm.evidenceCount || 0),
        peopleHelped: Number(justiceForm.peopleHelped || 0),
      }));
      setJusticeForm(prev => ({
        ...prev,
        channel: '',
        evidenceCount: '',
        peopleHelped: '',
        note: '',
        guardrailAccepted: true,
      }));
      setJusticeError('');
    } catch (error) {
      setJusticeError(error.message || 'Justice response entry failed.');
    }
  };

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

      <section className="glass-panel p-4 border border-yellow-500/20">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-yellow-300 mb-1">
              <Wallet size={16} />
              <span className="font-orbitron text-sm font-semibold tracking-wider uppercase">Ummah Burden Ledger</span>
            </div>
            <div className="text-xs text-cyan-500/60 leading-relaxed">
              Track real money directed toward relief, education, livelihood, dawah, family support, and lawful aid.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-80">
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-950/10 p-3">
              <div className="text-[10px] text-yellow-500/70 uppercase tracking-wider">Given</div>
              <div className="text-sm font-bold text-yellow-200">INR {impactMetrics.totalAmount.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
              <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">People</div>
              <div className="text-sm font-bold text-cyan-100">{impactMetrics.totalPeopleHelped.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
              <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">Entries</div>
              <div className="text-sm font-bold text-cyan-100">{impactMetrics.totalEntries.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleImpactSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={impactForm.amount}
            onChange={(event) => updateImpactForm('amount', event.target.value)}
            placeholder="Amount INR"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <select
            value={impactForm.category}
            onChange={(event) => updateImpactForm('category', event.target.value)}
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          >
            {IMPACT_CATEGORIES.map(category => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={impactForm.peopleHelped}
            onChange={(event) => updateImpactForm('peopleHelped', event.target.value)}
            placeholder="People helped"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            className="rounded-lg border border-yellow-500/40 bg-yellow-900/20 px-3 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-900/30 transition-colors"
          >
            Log Impact
          </button>
          <input
            type="text"
            value={impactForm.note}
            onChange={(event) => updateImpactForm('note', event.target.value)}
            placeholder="Note"
            className="sm:col-span-2 lg:col-span-4 bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
        </form>
        {formError && <div className="text-xs text-red-300 mt-2">{formError}</div>}

        {recentImpact.length > 0 && (
          <div className="mt-4 space-y-2">
            {recentImpact.map(entry => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border border-cyan-900/40 bg-black/20 p-3">
                <div className="min-w-0">
                  <div className="text-sm text-cyan-100 font-semibold">
                    {entry.currency || 'INR'} {(entry.amount || 0).toLocaleString()} · {IMPACT_CATEGORY_LABELS[entry.category] || entry.categoryLabel || 'Impact'}
                  </div>
                  <div className="text-xs text-cyan-500/50 truncate">{entry.note || 'No note recorded'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-cyan-400">{entry.peopleHelped || 0} helped</div>
                  <div className="text-[10px] text-cyan-700">{entry.localDate}</div>
                </div>
              </div>
            ))}
          </div>
        )}
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

      <section className="glass-panel p-4 border border-red-500/20">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-red-300 mb-1">
              <Megaphone size={16} />
              <span className="font-orbitron text-sm font-semibold tracking-wider uppercase">Lawful Justice Response</span>
            </div>
            <div className="text-xs text-cyan-500/60 leading-relaxed">
              Turn anger at oppression into verified evidence, lawful advocacy, relief, education, legal aid, and disciplined restraint.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-80">
            <div className="rounded-lg border border-red-500/20 bg-red-950/10 p-3">
              <div className="text-[10px] text-red-400/70 uppercase tracking-wider">Actions</div>
              <div className="text-sm font-bold text-red-100">{justiceMetrics.totalActions.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
              <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">Evidence</div>
              <div className="text-sm font-bold text-cyan-100">{justiceMetrics.totalEvidence.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
              <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">Causes</div>
              <div className="text-sm font-bold text-cyan-100">{justiceMetrics.activeCauses.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {JUSTICE_GUARDRAILS.map(guardrail => (
            <div key={guardrail} className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-950/10 p-2 text-xs text-cyan-100">
              <ShieldCheck size={14} className="text-red-300 shrink-0 mt-0.5" />
              <span>{guardrail}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleJusticeSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="text"
            value={justiceForm.cause}
            onChange={(event) => updateJusticeForm('cause', event.target.value)}
            placeholder="Cause / oppression"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="text"
            value={justiceForm.oppressedGroup}
            onChange={(event) => updateJusticeForm('oppressedGroup', event.target.value)}
            placeholder="People harmed"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <select
            value={justiceForm.actionType}
            onChange={(event) => updateJusticeForm('actionType', event.target.value)}
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          >
            {JUSTICE_ACTION_TYPES.map(action => (
              <option key={action.id} value={action.id}>{action.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={justiceForm.channel}
            onChange={(event) => updateJusticeForm('channel', event.target.value)}
            placeholder="Channel / org / platform"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={justiceForm.evidenceCount}
            onChange={(event) => updateJusticeForm('evidenceCount', event.target.value)}
            placeholder="Evidence items"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={justiceForm.peopleHelped}
            onChange={(event) => updateJusticeForm('peopleHelped', event.target.value)}
            placeholder="People helped"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <label className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-black/20 px-3 py-2 text-xs text-cyan-100">
            <input
              type="checkbox"
              checked={justiceForm.guardrailAccepted}
              onChange={(event) => updateJusticeForm('guardrailAccepted', event.target.checked)}
            />
            Lawful only
          </label>
          <button
            type="submit"
            className="rounded-lg border border-red-500/40 bg-red-900/20 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-900/30 transition-colors"
          >
            Log Response
          </button>
          <input
            type="text"
            value={justiceForm.note}
            onChange={(event) => updateJusticeForm('note', event.target.value)}
            placeholder="What lawful action did you take?"
            className="sm:col-span-2 lg:col-span-4 bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
        </form>
        {justiceError && <div className="text-xs text-red-300 mt-2">{justiceError}</div>}

        {recentJustice.length > 0 && (
          <div className="mt-4 space-y-2">
            {recentJustice.map(entry => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border border-cyan-900/40 bg-black/20 p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm text-cyan-100 font-semibold">
                    <FileText size={14} className="text-red-300 shrink-0" />
                    <span className="truncate">{JUSTICE_ACTION_LABELS[entry.actionType] || entry.actionLabel || 'Justice'} · {entry.cause}</span>
                  </div>
                  <div className="text-xs text-cyan-500/50 truncate">{entry.note || entry.channel || 'No note recorded'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-cyan-400">{entry.evidenceCount || 0} evidence</div>
                  <div className="text-[10px] text-cyan-700">{entry.localDate}</div>
                </div>
              </div>
            ))}
          </div>
        )}
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
