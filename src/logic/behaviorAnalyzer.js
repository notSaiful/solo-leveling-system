/** ============================================================
 *  BEHAVIOR ANALYZER — Procrastination & Excuse Detection
 *  ============================================================
 *  Scans user messages for weakness patterns, tracks
 *  accountability metrics, and builds a "tough love"
 *  intervention payload for the AI prompt.
 *  ============================================================ */

// ─── EXCUSE PATTERN LIBRARY ───

const EXCUSE_PATTERNS = [
  // Temporal evasion
  { pattern: /\b(tomorrow|later|soon|next time|another day|some other time|eventually|when i('|')?m ready)\b/i, type: 'temporal_evasion', severity: 7, label: 'Temporal evasion' },
  { pattern: /\b(i('|')?ll do it (tomorrow|later|tonight|in a bit|soon))\b/i, type: 'temporal_evasion', severity: 8, label: 'Delayed commitment' },

  // Emotional weakness
  { pattern: /\b(i('|')?m (tired|exhausted|burnt out|stressed|overwhelmed|not feeling it|in a bad mood|depressed|sad))\b/i, type: 'emotional_weakness', severity: 5, label: 'Emotional surrender' },
  { pattern: /\b(i don('|')?t feel like (it|doing|practicing|working|studying))\b/i, type: 'emotional_weakness', severity: 9, label: 'Feelings-based quit' },
  { pattern: /\b(i don('|')?t have (motivation|energy|the drive|the will))\b/i, type: 'emotional_weakness', severity: 8, label: 'Motivation dependency' },

  // Busy-ness lies
  { pattern: /\b(i('|')?m (too )?busy|i have no time|i don('|')?t have time|work is crazy|schedule is packed|too much going on)\b/i, type: 'busyness_lie', severity: 7, label: 'Fake busy-ness' },
  { pattern: /\b(i have (a lot|too much|so much) (work|homework|stuff|things) (to do|going on))\b/i, type: 'busyness_lie', severity: 6, label: 'Workload excuse' },

  // Conditional surrender
  { pattern: /\b(if only|i would if|i could if|i wish i could|maybe if|i need to (prepare|plan|organize) first)\b/i, type: 'conditional_surrender', severity: 7, label: 'Conditional cop-out' },
  { pattern: /\b(i('|')?m not (ready|prepared|set up|in the right (mindset|space|place)))\b/i, type: 'conditional_surrender', severity: 8, label: 'Readiness myth' },

  // Self-deprecation loops
  { pattern: /\b(i('|')?m (lazy|a loser|pathetic|weak|useless|trash|garbage|worthless|failure|screw up))\b/i, type: 'self_deprecation', severity: 6, label: 'Self-loathing without action' },
  { pattern: /\b(i can('|')?t do (this|it)|i('|')?m not (good|smart|strong|capable) enough)\b/i, type: 'self_deprecation', severity: 9, label: 'Capability lie' },
  { pattern: /\b(i always (fail|mess up|screw up|quit|give up))\b/i, type: 'self_deprecation', severity: 8, label: 'Identity-level surrender' },

  // Vagueness / non-committal
  { pattern: /\b(maybe|perhaps|i might|i may|we('|')?ll see|probably|kind of|sort of)\b/i, type: 'vagueness', severity: 5, label: 'Non-committal language' },
  { pattern: /\b(i (think|guess) i (should|will|might)|i (should|need to) (probably|maybe))\b/i, type: 'vagueness', severity: 6, label: 'Hesitant commitment' },

  // Permission-seeking
  { pattern: /\b(can i (skip|miss|take a break|rest)|is it okay if i|do i have to|must i|is it (alright|fine) to)\b/i, type: 'permission_seeking', severity: 7, label: 'Permission-seeking weakness' },
  { pattern: /\b(i (deserve|need) a (break|rest day|cheat day|day off))\b/i, type: 'permission_seeking', severity: 8, label: 'Unearned rest claim' },

  // Comparison / victimhood
  { pattern: /\b(it('|')?s (harder|more difficult|tougher) for me|other people (have it easier|don('|')?t understand)|no one (gets it|understands))\b/i, type: 'victimhood', severity: 7, label: 'Special suffering claim' },
  { pattern: /\b(i (was going to|planned to|intended to|meant to) (but|however))\b/i, type: 'victimhood', severity: 9, label: 'Intent without execution' },

  // Procrastination language
  { pattern: /\b(i (forgot|didn('|')?t remember|lost track of time|got distracted|ended up))\b/i, type: 'procrastination', severity: 7, label: 'Distraction admission' },
  { pattern: /\b(i (started|began) (but|and then)|i got (sidetracked|distracted|caught up))\b/i, type: 'procrastination', severity: 6, label: 'Partial effort confession' },

  // Minimization
  { pattern: /\b(it('|')?s (just|only) (one|a single|a few)|it won('|')?t (matter|hurt)|just this once)\b/i, type: 'minimization', severity: 8, label: 'Minimization trap' },
  { pattern: /\b(i (already|did) (did enough|worked hard today|did a lot|did my best))\b/i, type: 'minimization', severity: 7, label: 'Premature satisfaction' },
];

// ─── PERFORMANCE METRICS ───

function calculatePerformanceMetrics(state) {
  const today = new Date().toLocaleDateString('en-CA');
  const dailyQuests = state.dailyQuests || [];
  const totalDaily = dailyQuests.length;
  const completedDaily = dailyQuests.filter(q => q.completed).length;
  const completionRate = totalDaily > 0 ? completedDaily / totalDaily : 0;

  // Streak health
  const streaks = [state.pillars?.deen?.streak || 0, state.pillars?.body?.streak || 0, state.pillars?.money?.streak || 0];
  const avgStreak = streaks.reduce((a, b) => a + b, 0) / 3;
  const minStreak = Math.min(...streaks);
  const hasBrokenStreak = minStreak === 0 && avgStreak > 0;

  // Check last active date
  const lastActive = state.lastActiveDate;
  const daysSinceActive = lastActive ? Math.floor((new Date(today) - new Date(lastActive)) / (1000 * 60 * 60 * 24)) : 0;

  // Debuff status
  const activeDebuffs = ['deen', 'body', 'money'].filter(p => state.pillars?.[p]?.activeDebuff).length;

  // History analysis (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentHistory = (state.history || []).filter(h => new Date(h.date) >= weekAgo);
  const recentCompletions = recentHistory.length;

  return {
    completionRate,
    totalDaily,
    completedDaily,
    avgStreak,
    minStreak,
    hasBrokenStreak,
    daysSinceActive,
    activeDebuffs,
    recentCompletions,
    isPerformingWell: completionRate >= 0.7 && avgStreak >= 3,
    isSlacking: completionRate < 0.4 || daysSinceActive > 1,
    isInCrisis: completionRate === 0 && daysSinceActive > 2,
  };
}

// ─── MESSAGE SCANNING ───

export function analyzeMessage(text) {
  const detected = [];
  let maxSeverity = 0;

  for (const rule of EXCUSE_PATTERNS) {
    if (rule.pattern.test(text)) {
      detected.push({ type: rule.type, label: rule.label, severity: rule.severity });
      maxSeverity = Math.max(maxSeverity, rule.severity);
    }
  }

  // Extra: detect question that is really a delay tactic
  const isQuestionDelay = /\b(should i|do i need to|is it necessary to|how do i start|what('|')?s the (best|easiest|fastest) way)\b/i.test(text) &&
    !/\b(i (already|just|will|plan to)|i('|')?m (doing|working on|starting))\b/i.test(text);

  if (isQuestionDelay && detected.length === 0) {
    detected.push({ type: 'question_delay', label: 'Endless preparation', severity: 5 });
    maxSeverity = Math.max(maxSeverity, 5);
  }

  // Extra: detect "thinking about" without action
  const thinkingWithoutAction = /\b(i('|')?m (thinking about|considering|pondering|reflecting on)|i (want to|would like to) (start|begin|do))\b/i.test(text) &&
    !/\b(i (did|completed|finished|started|began)|today|yesterday|this morning)\b/i.test(text);

  if (thinkingWithoutAction && !detected.find(d => d.type === 'conditional_surrender')) {
    detected.push({ type: 'thinking_loop', label: 'Analysis paralysis', severity: 6 });
    maxSeverity = Math.max(maxSeverity, 6);
  }

  return {
    detected,
    maxSeverity,
    isExcuse: detected.length > 0,
    excuseCount: detected.length,
    summary: detected.map(d => d.label).join(', '),
  };
}

// ─── ACCOUNTABILITY CONTEXT BUILDER ───

export function buildAccountabilityContext(state, chatHistory) {
  const metrics = calculatePerformanceMetrics(state);
  const analysis = analyzeMessage(chatHistory[chatHistory.length - 1]?.content || '');

  // Count past excuses in this session
  const pastExcuses = chatHistory.filter(m => m.role === 'user').map(m => analyzeMessage(m.content)).filter(a => a.isExcuse).length;

  let toneDirective = '';
  let interventionDirective = '';

  if (metrics.isInCrisis) {
    toneDirective = 'The user has completed ZERO quests and has been inactive for multiple days. This is NOT a "bad day" — this is a character failure. Do NOT comfort them. Attack the weakness directly. Make them feel the shame of inaction. Remind them that the Prophet (SAW) never took "days off" from his mission.';
  } else if (metrics.isSlacking) {
    toneDirective = 'The user is underperforming. Completion rate is low or streaks are broken. Be direct and critical. No sugarcoating. Point out exactly what they are avoiding. Use their own stats against them.';
  } else if (metrics.isPerformingWell) {
    toneDirective = 'The user is performing well. DO NOT praise them excessively. A lion does not purr when the cub does what it is supposed to do. Acknowledge briefly and immediately raise the standard. Push them harder. "Good — now do more."';
  } else {
    toneDirective = 'Performance is mediocre. The user is coasting. Identify the specific pillar they are neglecting and demand immediate action.';
  }

  if (analysis.isExcuse) {
    const severityLabel = analysis.maxSeverity >= 8 ? 'HIGH' : analysis.maxSeverity >= 6 ? 'MEDIUM' : 'LOW';
    interventionDirective = `WEAKNESS DETECTED (${severityLabel}): ${analysis.summary}. Call this out explicitly. Do NOT validate the excuse. Quote their own words back to them and show why it is a lie. If they say "I\'m tired," remind them that the Sahaba fought battles on no sleep. If they say "I don\'t have time," remind them that the Prophet (SAW) built an empire while running a household and leading armies. If they say "I forgot," tell them that forgetting your purpose is the first sign of a dying soul.`;
  }

  if (pastExcuses >= 3) {
    interventionDirective += `\n\nPATTERN ALERT: This is the ${pastExcuses}th excuse in this session. The user is running a procrastination script. Call out the PATTERN: "You said something similar before. Here is what happened: nothing." Force them to commit to ONE action right now.`;
  }

  return {
    metrics,
    analysis,
    pastExcuses,
    toneDirective,
    interventionDirective,
    accountabilityString: `
PERFORMANCE AUDIT:
- Daily completion: ${Math.round(metrics.completionRate * 100)}% (${metrics.completedDaily}/${metrics.totalDaily})
- Average streak: ${metrics.avgStreak.toFixed(1)} days
- Days since active: ${metrics.daysSinceActive}
- Active debuffs: ${metrics.activeDebuffs}
- Recent 7-day completions: ${metrics.recentCompletions}

${interventionDirective}
${toneDirective}
`,
  };
}

// ─── SMART PREPROMPT INJECTION ───

export function injectToughnessPrompt(basePrompt, state, chatHistory) {
  const acc = buildAccountabilityContext(state, chatHistory);
  return `${basePrompt}\n\n${acc.accountabilityString}`;
}

// ─── CONVERSATION MEMORY FOR AI ───

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\[\[CMD\]\]/gi, '[CMD]').replace(/\[\[\/CMD\]\]/gi, '[/CMD]');
}

export function getConversationSummary(chatHistory, maxMessages = 10) {
  const recent = chatHistory.slice(-maxMessages);
  return recent.map(m => `[${m.role.toUpperCase()}]: ${sanitize(m.content).substring(0, 120)}`).join('\n');
}
