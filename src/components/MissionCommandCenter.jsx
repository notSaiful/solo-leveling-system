import { useMemo, useState } from 'react';
import { BookOpen, Briefcase, CheckCircle2, Circle, FileText, GraduationCap, HandHeart, HeartHandshake, Home, Megaphone, Scale, ShieldCheck, Target, TrendingUp, Users, Wallet } from 'lucide-react';
import { MISSION_DOCTRINE } from '../data/missionDoctrine';
import { FAMILY_ACTION_LABELS, FAMILY_ACTIONS, FAMILY_GUARDRAILS, FAMILY_RELATION_LABELS, FAMILY_RELATIONS } from '../data/familyCovenant';
import { IMPACT_CATEGORIES, IMPACT_CATEGORY_LABELS } from '../data/ummahImpact';
import { JUSTICE_ACTION_LABELS, JUSTICE_ACTION_TYPES, JUSTICE_GUARDRAILS } from '../data/justiceResponse';
import { LIVELIHOOD_ACTION_LABELS, LIVELIHOOD_ACTIONS, LIVELIHOOD_GUARDRAILS, LIVELIHOOD_OUTCOME_LABELS, LIVELIHOOD_OUTCOMES } from '../data/livelihoodPipeline';
import { TEACHING_FORMAT_LABELS, TEACHING_FORMATS, TEACHING_GUARDRAILS, TEACHING_TOPIC_LABELS, TEACHING_TOPICS } from '../data/teachingPipeline';
import { getMissionPlan } from '../logic/missionPlan';
import { addFamilyCovenantEntryToState, getFamilyCovenantMetrics } from '../logic/familyCovenant';
import { addLivelihoodEntryToState, getLivelihoodMetrics } from '../logic/livelihoodPipeline';
import { addImpactEntryToState, getImpactMetrics } from '../logic/ummahImpact';
import { addJusticeResponseToState, getJusticeResponseMetrics } from '../logic/justiceResponse';
import { addTeachingEntryToState, getTeachingMetrics } from '../logic/teachingPipeline';

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
  const teachingLedger = state.teachingPipelineLedger || [];
  const familyLedger = state.familyCovenantLedger || [];
  const livelihoodLedger = state.livelihoodPipelineLedger || [];
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
  const [teachingForm, setTeachingForm] = useState({
    title: '',
    topic: 'tauheed',
    format: 'study-note',
    source: '',
    audienceCount: '',
    mentee: '',
    actionStep: '',
    followUp: '',
    note: '',
  });
  const [familyForm, setFamilyForm] = useState({
    actionType: 'worship',
    relation: 'household',
    action: '',
    minutes: '',
    repair: '',
    note: '',
  });
  const [livelihoodForm, setLivelihoodForm] = useState({
    actionType: 'skill-training',
    outcome: 'planned',
    beneficiary: '',
    skill: '',
    action: '',
    peopleHelped: '1',
    projectedMonthlyIncome: '',
    followUpDate: '',
    note: '',
    halalGuardrailAccepted: true,
  });
  const [formError, setFormError] = useState('');
  const [justiceError, setJusticeError] = useState('');
  const [teachingError, setTeachingError] = useState('');
  const [familyError, setFamilyError] = useState('');
  const [livelihoodError, setLivelihoodError] = useState('');
  const plan = getMissionPlan(history || []);
  const impactMetrics = useMemo(() => getImpactMetrics(impactLedger), [impactLedger]);
  const justiceMetrics = useMemo(() => getJusticeResponseMetrics(justiceLedger), [justiceLedger]);
  const teachingMetrics = useMemo(() => getTeachingMetrics(teachingLedger), [teachingLedger]);
  const familyMetrics = useMemo(() => getFamilyCovenantMetrics(familyLedger), [familyLedger]);
  const livelihoodMetrics = useMemo(() => getLivelihoodMetrics(livelihoodLedger), [livelihoodLedger]);
  const WeakIcon = dutyIcons[plan.weeklyFocus.duty?.id] || ShieldCheck;
  const recentImpact = [...impactLedger]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);
  const recentJustice = [...justiceLedger]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);
  const recentTeaching = [...teachingLedger]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);
  const recentFamily = [...familyLedger]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);
  const recentLivelihood = [...livelihoodLedger]
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

  const updateTeachingForm = (key, value) => {
    setTeachingForm(prev => ({ ...prev, [key]: value }));
    if (teachingError) setTeachingError('');
  };

  const updateFamilyForm = (key, value) => {
    setFamilyForm(prev => ({ ...prev, [key]: value }));
    if (familyError) setFamilyError('');
  };

  const updateLivelihoodForm = (key, value) => {
    setLivelihoodForm(prev => ({ ...prev, [key]: value }));
    if (livelihoodError) setLivelihoodError('');
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

  const handleTeachingSubmit = (event) => {
    event.preventDefault();
    try {
      setState(prev => addTeachingEntryToState(prev, {
        ...teachingForm,
        audienceCount: Number(teachingForm.audienceCount || 0),
      }));
      setTeachingForm(prev => ({
        ...prev,
        title: '',
        source: '',
        audienceCount: '',
        mentee: '',
        actionStep: '',
        followUp: '',
        note: '',
      }));
      setTeachingError('');
    } catch (error) {
      setTeachingError(error.message || 'Teaching entry failed.');
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

  const handleFamilySubmit = (event) => {
    event.preventDefault();
    try {
      setState(prev => addFamilyCovenantEntryToState(prev, {
        ...familyForm,
        minutes: Number(familyForm.minutes || 0),
      }));
      setFamilyForm(prev => ({
        ...prev,
        action: '',
        minutes: '',
        repair: '',
        note: '',
      }));
      setFamilyError('');
    } catch (error) {
      setFamilyError(error.message || 'Family covenant entry failed.');
    }
  };

  const handleLivelihoodSubmit = (event) => {
    event.preventDefault();
    try {
      setState(prev => addLivelihoodEntryToState(prev, {
        ...livelihoodForm,
        peopleHelped: Number(livelihoodForm.peopleHelped || 0),
        projectedMonthlyIncome: Number(livelihoodForm.projectedMonthlyIncome || 0),
      }));
      setLivelihoodForm(prev => ({
        ...prev,
        beneficiary: '',
        skill: '',
        action: '',
        peopleHelped: '1',
        projectedMonthlyIncome: '',
        followUpDate: '',
        note: '',
        halalGuardrailAccepted: true,
      }));
      setLivelihoodError('');
    } catch (error) {
      setLivelihoodError(error.message || 'Livelihood entry failed.');
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

      <section className="glass-panel p-4 border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 mb-1">
              <HeartHandshake size={17} />
              <span className="font-orbitron text-sm font-semibold tracking-wider uppercase">Family Covenant</span>
            </div>
            <div className="text-xs text-cyan-500/60 leading-relaxed">
              Track worship, mercy, provision, repair, presence, teaching, protection, and role-model actions at home.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-80">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/10 p-3">
              <div className="text-[10px] text-emerald-500/70 uppercase tracking-wider">Actions</div>
              <div className="text-sm font-bold text-emerald-100">{familyMetrics.totalActions.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
              <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">Minutes</div>
              <div className="text-sm font-bold text-cyan-100">{familyMetrics.totalMinutes.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
              <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">Relations</div>
              <div className="text-sm font-bold text-cyan-100">{familyMetrics.relationsServed.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {FAMILY_GUARDRAILS.map(guardrail => (
            <div key={guardrail} className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/10 p-2 text-xs text-cyan-100">
              <Home size={14} className="text-emerald-300 shrink-0 mt-0.5" />
              <span>{guardrail}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleFamilySubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <select
            value={familyForm.actionType}
            onChange={(event) => updateFamilyForm('actionType', event.target.value)}
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          >
            {FAMILY_ACTIONS.map(action => (
              <option key={action.id} value={action.id}>{action.label}</option>
            ))}
          </select>
          <select
            value={familyForm.relation}
            onChange={(event) => updateFamilyForm('relation', event.target.value)}
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          >
            {FAMILY_RELATIONS.map(relation => (
              <option key={relation.id} value={relation.id}>{relation.label}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={familyForm.minutes}
            onChange={(event) => updateFamilyForm('minutes', event.target.value)}
            placeholder="Minutes"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            className="rounded-lg border border-emerald-500/40 bg-emerald-900/20 px-3 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-900/30 transition-colors"
          >
            Log Covenant
          </button>
          <input
            type="text"
            value={familyForm.action}
            onChange={(event) => updateFamilyForm('action', event.target.value)}
            placeholder="What did you do?"
            className="sm:col-span-2 bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="text"
            value={familyForm.repair}
            onChange={(event) => updateFamilyForm('repair', event.target.value)}
            placeholder="Repair / follow-up"
            className="sm:col-span-2 bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="text"
            value={familyForm.note}
            onChange={(event) => updateFamilyForm('note', event.target.value)}
            placeholder="Note"
            className="sm:col-span-2 lg:col-span-4 bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
        </form>
        {familyError && <div className="text-xs text-red-300 mt-2">{familyError}</div>}

        {recentFamily.length > 0 && (
          <div className="mt-4 space-y-2">
            {recentFamily.map(entry => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border border-cyan-900/40 bg-black/20 p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm text-cyan-100 font-semibold">
                    <HeartHandshake size={14} className="text-emerald-300 shrink-0" />
                    <span className="truncate">{FAMILY_ACTION_LABELS[entry.actionType] || entry.actionLabel || 'Family'} · {FAMILY_RELATION_LABELS[entry.relation] || entry.relationLabel || 'Household'}</span>
                  </div>
                  <div className="text-xs text-cyan-500/50 truncate">{entry.action}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-cyan-400">{entry.minutes || 0} min</div>
                  <div className="text-[10px] text-cyan-700">{entry.localDate}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass-panel p-4 border border-cyan-500/20">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 mb-1">
              <GraduationCap size={17} />
              <span className="font-orbitron text-sm font-semibold tracking-wider uppercase">Tauheed Teaching Pipeline</span>
            </div>
            <div className="text-xs text-cyan-500/60 leading-relaxed">
              Convert learning into source-backed lessons, mentoring, family tarbiyah, dawah reminders, and action steps.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-80">
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
              <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">Lessons</div>
              <div className="text-sm font-bold text-cyan-100">{teachingMetrics.totalLessons.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
              <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">Reached</div>
              <div className="text-sm font-bold text-cyan-100">{teachingMetrics.totalAudience.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
              <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">Mentees</div>
              <div className="text-sm font-bold text-cyan-100">{teachingMetrics.totalMentees.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {TEACHING_GUARDRAILS.map(guardrail => (
            <div key={guardrail} className="flex items-start gap-2 rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-2 text-xs text-cyan-100">
              <BookOpen size={14} className="text-cyan-300 shrink-0 mt-0.5" />
              <span>{guardrail}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleTeachingSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="text"
            value={teachingForm.title}
            onChange={(event) => updateTeachingForm('title', event.target.value)}
            placeholder="Lesson title"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <select
            value={teachingForm.topic}
            onChange={(event) => updateTeachingForm('topic', event.target.value)}
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          >
            {TEACHING_TOPICS.map(topic => (
              <option key={topic.id} value={topic.id}>{topic.label}</option>
            ))}
          </select>
          <select
            value={teachingForm.format}
            onChange={(event) => updateTeachingForm('format', event.target.value)}
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          >
            {TEACHING_FORMATS.map(format => (
              <option key={format.id} value={format.id}>{format.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={teachingForm.source}
            onChange={(event) => updateTeachingForm('source', event.target.value)}
            placeholder="Source / reference"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={teachingForm.audienceCount}
            onChange={(event) => updateTeachingForm('audienceCount', event.target.value)}
            placeholder="People reached"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="text"
            value={teachingForm.mentee}
            onChange={(event) => updateTeachingForm('mentee', event.target.value)}
            placeholder="Mentee / audience"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="text"
            value={teachingForm.actionStep}
            onChange={(event) => updateTeachingForm('actionStep', event.target.value)}
            placeholder="One action step"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            className="rounded-lg border border-cyan-500/40 bg-cyan-900/20 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-900/30 transition-colors"
          >
            Log Lesson
          </button>
          <input
            type="text"
            value={teachingForm.followUp}
            onChange={(event) => updateTeachingForm('followUp', event.target.value)}
            placeholder="Follow-up"
            className="sm:col-span-2 bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="text"
            value={teachingForm.note}
            onChange={(event) => updateTeachingForm('note', event.target.value)}
            placeholder="Note"
            className="sm:col-span-2 bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
        </form>
        {teachingError && <div className="text-xs text-red-300 mt-2">{teachingError}</div>}

        {recentTeaching.length > 0 && (
          <div className="mt-4 space-y-2">
            {recentTeaching.map(entry => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border border-cyan-900/40 bg-black/20 p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm text-cyan-100 font-semibold">
                    <Users size={14} className="text-cyan-300 shrink-0" />
                    <span className="truncate">{entry.title} · {TEACHING_TOPIC_LABELS[entry.topic] || entry.topicLabel || 'Tauheed'}</span>
                  </div>
                  <div className="text-xs text-cyan-500/50 truncate">{TEACHING_FORMAT_LABELS[entry.format] || entry.formatLabel || 'Lesson'} · {entry.source}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-cyan-400">{entry.audienceCount || 0} reached</div>
                  <div className="text-[10px] text-cyan-700">{entry.localDate}</div>
                </div>
              </div>
            ))}
          </div>
        )}
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

      <section className="glass-panel p-4 border border-lime-500/20">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-lime-300 mb-1">
              <Briefcase size={16} />
              <span className="font-orbitron text-sm font-semibold tracking-wider uppercase">Livelihood Pipeline</span>
            </div>
            <div className="text-xs text-cyan-500/60 leading-relaxed">
              Build earning capacity through halal skills, jobs, client leads, tools, business setup, and follow-up outcomes.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-80">
            <div className="rounded-lg border border-lime-500/20 bg-lime-950/10 p-3">
              <div className="text-[10px] text-lime-500/70 uppercase tracking-wider">People</div>
              <div className="text-sm font-bold text-lime-100">{livelihoodMetrics.totalPeopleHelped.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
              <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">Monthly INR</div>
              <div className="text-sm font-bold text-cyan-100">{livelihoodMetrics.totalProjectedMonthlyIncome.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
              <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">Outcomes</div>
              <div className="text-sm font-bold text-cyan-100">{livelihoodMetrics.earningOutcomes.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {LIVELIHOOD_GUARDRAILS.map(guardrail => (
            <div key={guardrail} className="flex items-start gap-2 rounded-lg border border-lime-500/20 bg-lime-950/10 p-2 text-xs text-cyan-100">
              <Briefcase size={14} className="text-lime-300 shrink-0 mt-0.5" />
              <span>{guardrail}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleLivelihoodSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <select
            value={livelihoodForm.actionType}
            onChange={(event) => updateLivelihoodForm('actionType', event.target.value)}
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          >
            {LIVELIHOOD_ACTIONS.map(action => (
              <option key={action.id} value={action.id}>{action.label}</option>
            ))}
          </select>
          <select
            value={livelihoodForm.outcome}
            onChange={(event) => updateLivelihoodForm('outcome', event.target.value)}
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          >
            {LIVELIHOOD_OUTCOMES.map(outcome => (
              <option key={outcome.id} value={outcome.id}>{outcome.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={livelihoodForm.beneficiary}
            onChange={(event) => updateLivelihoodForm('beneficiary', event.target.value)}
            placeholder="Beneficiary / group"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="text"
            value={livelihoodForm.skill}
            onChange={(event) => updateLivelihoodForm('skill', event.target.value)}
            placeholder="Skill / job path"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={livelihoodForm.peopleHelped}
            onChange={(event) => updateLivelihoodForm('peopleHelped', event.target.value)}
            placeholder="People helped"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={livelihoodForm.projectedMonthlyIncome}
            onChange={(event) => updateLivelihoodForm('projectedMonthlyIncome', event.target.value)}
            placeholder="Projected monthly INR"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="date"
            value={livelihoodForm.followUpDate}
            onChange={(event) => updateLivelihoodForm('followUpDate', event.target.value)}
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            className="rounded-lg border border-lime-500/40 bg-lime-900/20 px-3 py-2 text-sm font-semibold text-lime-100 hover:bg-lime-900/30 transition-colors"
          >
            Log Livelihood
          </button>
          <input
            type="text"
            value={livelihoodForm.action}
            onChange={(event) => updateLivelihoodForm('action', event.target.value)}
            placeholder="Concrete action taken"
            className="sm:col-span-2 bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
          <label className="flex items-center gap-2 rounded-lg border border-lime-500/20 bg-black/20 px-3 py-2 text-xs text-cyan-100">
            <input
              type="checkbox"
              checked={livelihoodForm.halalGuardrailAccepted}
              onChange={(event) => updateLivelihoodForm('halalGuardrailAccepted', event.target.checked)}
            />
            Halal benefit only
          </label>
          <input
            type="text"
            value={livelihoodForm.note}
            onChange={(event) => updateLivelihoodForm('note', event.target.value)}
            placeholder="Note"
            className="bg-system-dark border border-cyan-900/50 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50"
          />
        </form>
        {livelihoodError && <div className="text-xs text-red-300 mt-2">{livelihoodError}</div>}

        {recentLivelihood.length > 0 && (
          <div className="mt-4 space-y-2">
            {recentLivelihood.map(entry => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border border-cyan-900/40 bg-black/20 p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm text-cyan-100 font-semibold">
                    <Briefcase size={14} className="text-lime-300 shrink-0" />
                    <span className="truncate">{LIVELIHOOD_ACTION_LABELS[entry.actionType] || entry.actionLabel || 'Livelihood'} · {entry.skill}</span>
                  </div>
                  <div className="text-xs text-cyan-500/50 truncate">{entry.beneficiary} · {LIVELIHOOD_OUTCOME_LABELS[entry.outcome] || entry.outcomeLabel || 'Outcome'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-cyan-400">{entry.currency || 'INR'} {(entry.projectedMonthlyIncome || 0).toLocaleString()}</div>
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
