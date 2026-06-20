# Listen & Level Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the daily-quest/dungeon dashboard with a "tell the System what you did" log: voice or text input is parsed into activities, a deterministic engine awards XP and levels pillars using the existing E→S progression, and per-activity streaks reward consistency. Quests become an optional "Guided Mode."

**Architecture:** A pure `logEngine.awardActivities(state, activities, today)` computes XP deterministically (catalog base → rank scale → stat modifiers → activity-streak bonus → flow → weekly focus), updates a per-activity streak ledger, applies pillar level-ups, and recalculates overall rank. `activityParser.parseActivities(text)` uses the existing OpenRouter/proxy path with a minimal parsing prompt (crisis-scanned, JSON-from-content, retry-on-malformed, pending-log fallback). A new `LogTab` is the home screen; the old quest Dashboard is gated behind a `guidedMode` toggle. Two dormant mechanics (streak bonus, flow multiplier) are newly *applied*, not merely displayed.

**Tech Stack:** React 18 + Vite 8 + Tailwind 3.4 + Framer Motion 11 + lucide-react; Vitest 4 (`vitest run`); Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`); OpenRouter via `/api/forge-master` proxy; localStorage + canonical cloud sync.

## Global Constraints

- **Rank thresholds (verified from `src/data/questCatalog.js`, NOT CLAUDE.md's stale table):** E 0-10, D 11-25, C 26-45, B 46-70, A 71-99, S 100-999. `xpMultiplier`: E 1.0 / D 1.3 / C 1.6 / B 2.0 / A 2.5 / S 3.0. `statPointsPerLevel`: 1/2/3/4/5/6.
- **`xpForNextLevel(level)`:** `floor(100 * 1.12^level)` for level ≤99; `100000 + (level-100)*2000` for 100-299; `500000 + (level-300)*5000` for 300-599; `2000000 + (level-600)*10000` for 600+.
- **Dates:** always `getLocalDateString()` from `src/utils/dateUtils.js` (Asia/Kolkata, `en-CA`, `YYYY-MM-DD`). Streak gaps via `getDayDiff(startStr, endStr)`.
- **State mutation:** engine functions are pure `(state, ...) => state`; call them inside `setState(prev => engine(prev, ...))`. `useStore`'s `updateState` deep-merges top-level nested objects — never spread a partial nested object expecting keys to be preserved beyond one level.
- **Tests:** `npm test` = `npx vitest run`. Use `import { describe, expect, it } from 'vitest'` (no `vi`, no time mocking). Pass explicit `'YYYY-MM-DD'` strings to deterministic functions. Build a local `baseState(overrides)` fixture in each test file (the repo's existing fixture is not exported).
- **AI calls:** route through `src/services/aiAssistant.js`. When `getApiKey()` returns `''` (no `sk-` key in localStorage), fetches go to `/api/forge-master`. **Never hardcode API keys.** Request JSON in the prompt and parse it from the content string (no `response_format` — parity with existing `[[CMD]]` parsing). Run `containsCrisisSignal` *before* any parse; on hit, return `getCrisisResponse()` and award no XP.
- **Sanitize all user/AI text** fed back to the model via `sanitize()` (strips `[[CMD]]` markers).
- **UI text:** no emojis in rendered strings (user preference). Khalifa aesthetic classes: `bg-khalifa-void`, `glass-panel-khalifa`, `text-khalifa-gold`, `text-khalifa-steel`, `font-playfair`, `font-orbitron`.
- **Build gate:** `npm run build` must pass before any task is marked done.
- **Commits:** one commit per task on branch `feat/listen-and-level-redesign`. End messages with `Co-Authored-By: Claude <noreply@anthropic.com>`.
- **Halal context:** no riba/interest mechanics; `money` pillar = halal income, AI work, saving, giving.

---

## File Structure

| Path | Responsibility | Action |
|---|---|---|
| `src/logic/progression.js` | `getActivityStreakBonus`, `checkFlowState`, cleaned `recalculateOverallLevel` (no mission gate, no skill points) | Create |
| `src/data/activityCatalog.js` | Canonical `CATALOG`, `SYNONYMS`, `lookupActivity`, `promoteActivity`, `UNIT_XP` | Create |
| `src/logic/logEngine.js` | `awardActivities` — deterministic XP + per-activity streaks + pillar level-ups | Create |
| `src/services/aiAssistant.js` | Export `sanitize`/`containsCrisisSignal`/`getCrisisResponse`; add `callModelWithSystem` + private `callRawModel` | Modify |
| `src/services/activityParser.js` | `parseActivities` (crisis scan → AI parse → JSON validate → catalog pin) + exported pure helpers | Create |
| `src/utils/voice.js` | `getSpeechRecognition`, `isSpeechSupported` (pure, testable) | Create |
| `src/hooks/useVoiceLog.js` | React hook wrapping Web Speech API | Create |
| `src/data/store.js` | Schema v8: add `activities`, `logTargets`, `pendingLogs`, `guidedMode`, `catalogOverrides`; normalize | Modify |
| `src/components/LogTab.jsx` | New home tab: progress header, voice/text input, today's log, suggested target | Create |
| `src/App.jsx` | Add `log` tab (default), gate quest/dungeon tabs behind `guidedMode`, Guided toggle in Settings, Monday-reset gate | Modify |
| `src/logic/progression.test.js` | Unit tests | Create |
| `src/data/activityCatalog.test.js` | Unit tests | Create |
| `src/logic/logEngine.test.js` | Unit tests + migration test | Create |
| `src/services/activityParser.test.js` | Pure-helper + crisis/empty-path tests | Create |
| `src/utils/voice.test.js` | Pure helper tests | Create |

---

### Task 1: progression.js — streak bonus, flow, cleaned overall-level

**Files:**
- Create: `src/logic/progression.js`
- Test: `src/logic/progression.test.js`

**Interfaces:**
- Consumes: `getRankByLevel` from `src/data/questCatalog.js`; `getScaledFlowConfig` from `src/data/rankDifficulty.js`.
- Produces: `getActivityStreakBonus(streak) -> { multiplier, label }`; `checkFlowState(history, rankKey) -> { active, multiplier, expiresAt, questsInWindow, rankKey }`; `recalculateOverallLevel(state) -> state`.

- [ ] **Step 1: Write the failing test**

Create `src/logic/progression.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { getActivityStreakBonus, checkFlowState, recalculateOverallLevel } from './progression';

function baseState(overrides = {}) {
  return {
    user: { name: 'Seeker', currentRank: 'E', overallLevel: 0 },
    pillars: {
      deen: { level: 0, xp: 0, streak: 0 },
      body: { level: 0, xp: 0, streak: 0 },
      money: { level: 0, xp: 0, streak: 0 },
    },
    systemMessages: [],
    ...overrides,
  };
}

describe('getActivityStreakBonus', () => {
  it('returns tiers at the exact thresholds', () => {
    expect(getActivityStreakBonus(0)).toEqual({ multiplier: 1.0, label: 'COMMON' });
    expect(getActivityStreakBonus(6)).toEqual({ multiplier: 1.0, label: 'COMMON' });
    expect(getActivityStreakBonus(7)).toEqual({ multiplier: 1.15, label: 'UNCOMMON' });
    expect(getActivityStreakBonus(29)).toEqual({ multiplier: 1.15, label: 'UNCOMMON' });
    expect(getActivityStreakBonus(30)).toEqual({ multiplier: 1.3, label: 'RARE' });
    expect(getActivityStreakBonus(90)).toEqual({ multiplier: 1.5, label: 'EPIC' });
    expect(getActivityStreakBonus(180)).toEqual({ multiplier: 1.75, label: 'MYTHIC' });
    expect(getActivityStreakBonus(365)).toEqual({ multiplier: 2.0, label: 'LEGENDARY' });
  });
});

describe('checkFlowState', () => {
  it('is inactive when fewer than the rank threshold logs are in the window', () => {
    const history = [{ completed: true, date: new Date().toISOString() }];
    const state = checkFlowState(history, 'E');
    expect(state.active).toBe(false);
    expect(state.multiplier).toBe(1);
  });
});

describe('recalculateOverallLevel', () => {
  it('weights deen 0.5 / body 0.3 / money 0.2 and never drops below the strongest pillar', () => {
    const state = recalculateOverallLevel(baseState({
      pillars: { deen: { level: 5, xp: 0, streak: 0 }, body: { level: 3, xp: 0, streak: 0 }, money: { level: 2, xp: 0, streak: 0 } },
    }));
    // weighted = floor(5*0.5 + 3*0.3 + 2*0.2) = floor(3.8) = 3, but deen=5 is strongest
    expect(state.user.overallLevel).toBe(5);
    expect(state.user.currentRank).toBe('E'); // 0-10
  });

  it('never decreases overallLevel once earned', () => {
    const state = recalculateOverallLevel(baseState({
      user: { name: 'Seeker', currentRank: 'E', overallLevel: 10 },
      pillars: { deen: { level: 3, xp: 0, streak: 0 }, body: { level: 2, xp: 0, streak: 0 }, money: { level: 1, xp: 0, streak: 0 } },
    }));
    expect(state.user.overallLevel).toBe(10);
  });

  it('promotes currentRank into D at level 11', () => {
    const state = recalculateOverallLevel(baseState({
      pillars: { deen: { level: 11, xp: 0, streak: 0 }, body: { level: 0, xp: 0, streak: 0 }, money: { level: 0, xp: 0, streak: 0 } },
    }));
    expect(state.user.overallLevel).toBe(11);
    expect(state.user.currentRank).toBe('D');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/logic/progression.test.js`
Expected: FAIL — `Failed to resolve import './progression'` (module does not exist).

- [ ] **Step 3: Write minimal implementation**

Create `src/logic/progression.js`:

```js
import { getRankByLevel } from '../data/questCatalog';
import { getScaledFlowConfig } from '../data/rankDifficulty';

const STREAK_TIERS = [
  { min: 365, multiplier: 2.0, label: 'LEGENDARY' },
  { min: 180, multiplier: 1.75, label: 'MYTHIC' },
  { min: 90, multiplier: 1.5, label: 'EPIC' },
  { min: 30, multiplier: 1.3, label: 'RARE' },
  { min: 7, multiplier: 1.15, label: 'UNCOMMON' },
];

export function getActivityStreakBonus(streak) {
  for (const tier of STREAK_TIERS) {
    if (streak >= tier.min) return { multiplier: tier.multiplier, label: tier.label };
  }
  return { multiplier: 1.0, label: 'COMMON' };
}

export function checkFlowState(history, rankKey = 'E') {
  const config = getScaledFlowConfig(rankKey);
  const now = Date.now();
  const windowMs = config.window * 60 * 1000;
  const recent = (history || []).filter(
    (h) => h.completed && now - new Date(h.date).getTime() < windowMs
  );
  if (recent.length >= config.quests) {
    return {
      active: true,
      multiplier: config.multiplier,
      expiresAt: now + windowMs,
      questsInWindow: recent.length,
      rankKey,
    };
  }
  return { active: false, multiplier: 1, expiresAt: 0, questsInWindow: recent.length, rankKey };
}

// Cleaned version of questEngine.recalculateOverallLevel:
// no mission-gate level cap, no skill-point awarding.
export function recalculateOverallLevel(state) {
  const deenLevel = state.pillars.deen.level;
  const bodyLevel = state.pillars.body.level;
  const moneyLevel = state.pillars.money.level;
  const weightedOverall = Math.floor(deenLevel * 0.5 + bodyLevel * 0.3 + moneyLevel * 0.2);
  const prevLevel = state.user.overallLevel || 0;
  const overall = Math.max(prevLevel, weightedOverall, deenLevel, bodyLevel, moneyLevel);

  const currentRank = getRankByLevel(overall);
  const prevRank = getRankByLevel(prevLevel);

  const newState = {
    ...state,
    user: { ...state.user, overallLevel: overall, currentRank: currentRank.key },
  };

  if (currentRank.key !== prevRank.key && overall > prevLevel) {
    newState.systemMessages = [
      ...(state.systemMessages || []),
      {
        type: 'rankUp',
        title: `RANK UP: ${currentRank.key}-Rank`,
        subtitle: currentRank.title,
        message: 'Your power has awakened.',
      },
    ];
  }

  return newState;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/logic/progression.test.js`
Expected: PASS (all 4 `it` blocks).

- [ ] **Step 5: Commit**

```bash
git add src/logic/progression.js src/logic/progression.test.js
git commit -m "feat: add progression module (streak bonus, flow, cleaned overall level)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: activityCatalog.js — canonical activity keys + synonyms

**Files:**
- Create: `src/data/activityCatalog.js`
- Test: `src/data/activityCatalog.test.js`

**Interfaces:**
- Produces: `UNIT_XP = 8`; `CATALOG` (map of `key -> { key, name, pillar, baseXp, unit, difficulty }`); `SYNONYMS` (map of phrase -> catalog key); `lookupActivity(text) -> { key, ...entry } | null`; `getCatalogEntry(key, overrides) -> entry | null`; `promoteActivity(state, activityKey, fixedXp) -> state`.

- [ ] **Step 1: Write the failing test**

Create `src/data/activityCatalog.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { UNIT_XP, CATALOG, lookupActivity, getCatalogEntry, promoteActivity } from './activityCatalog';

describe('lookupActivity', () => {
  it('matches "push up" inside "I did 100 push ups" to the pushups key', () => {
    const hit = lookupActivity('I did 100 push ups today');
    expect(hit).not.toBeNull();
    expect(hit.key).toBe('pushups');
    expect(hit.pillar).toBe('body');
  });

  it('matches "prayed Fajr on time" to the fajr key', () => {
    const hit = lookupActivity('prayed Fajr on time');
    expect(hit.key).toBe('fajr');
    expect(hit.pillar).toBe('deen');
  });

  it('returns null for unrelated text', () => {
    expect(lookupActivity('the weather is nice today xyz')).toBeNull();
  });

  it('prefers the longest synonym match', () => {
    expect(lookupActivity('fajr on time').key).toBe('fajr');
    expect(lookupActivity('fajr').key).toBe('fajr');
  });
});

describe('UNIT_XP / CATALOG', () => {
  it('UNIT_XP is 8 and pushups has a fixed baseXp', () => {
    expect(UNIT_XP).toBe(8);
    expect(CATALOG.pushups.baseXp).toBe(15);
    expect(CATALOG.pushups.pillar).toBe('body');
  });
});

describe('promoteActivity', () => {
  it('stores a fixedXp override for a novel activity key', () => {
    const next = promoteActivity({ catalogOverrides: {} }, 'cold-shower', 25);
    expect(next.catalogOverrides['cold-shower'].fixedXp).toBe(25);
  });

  it('preserves existing overrides', () => {
    const next = promoteActivity({ catalogOverrides: { 'a': { fixedXp: 10 } } }, 'b', 20);
    expect(next.catalogOverrides.a.fixedXp).toBe(10);
    expect(next.catalogOverrides.b.fixedXp).toBe(20);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/activityCatalog.test.js`
Expected: FAIL — `Failed to resolve import './activityCatalog'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/data/activityCatalog.js`:

```js
export const UNIT_XP = 8;

export const CATALOG = {
  pushups:    { key: 'pushups',    name: 'Push-ups',          pillar: 'body',  baseXp: 15, unit: 'reps',    difficulty: 1 },
  pullups:    { key: 'pullups',    name: 'Pull-ups',          pillar: 'body',  baseXp: 20, unit: 'reps',    difficulty: 2 },
  run:        { key: 'run',        name: 'Running',           pillar: 'body',  baseXp: 20, unit: 'minutes', difficulty: 2 },
  hike:       { key: 'hike',       name: 'Hike / Trek',       pillar: 'body',  baseXp: 30, unit: 'minutes', difficulty: 3 },
  fajr:       { key: 'fajr',       name: 'Fajr on time',      pillar: 'deen',  baseXp: 15, unit: null,      difficulty: 1 },
  salah5:     { key: 'salah5',     name: 'All 5 prayers',     pillar: 'deen',  baseXp: 20, unit: null,      difficulty: 2 },
  adhkar:     { key: 'adhkar',     name: 'Adhkar',            pillar: 'deen',  baseXp: 10, unit: null,      difficulty: 1 },
  quran:      { key: 'quran',      name: 'Quran reading',     pillar: 'deen',  baseXp: 15, unit: 'minutes', difficulty: 2 },
  sadaqah:    { key: 'sadaqah',    name: 'Sadaqah',           pillar: 'deen',  baseXp: 10, unit: 'rupees',  difficulty: 1 },
  istighfar:  { key: 'istighfar',  name: 'Istighfar',         pillar: 'deen',  baseXp: 10, unit: 'count',   difficulty: 1 },
  aiTask:     { key: 'aiTask',     name: 'AI business task',  pillar: 'money', baseXp: 20, unit: null,      difficulty: 2 },
  aiLearn:    { key: 'aiLearn',    name: 'AI learning',       pillar: 'money', baseXp: 15, unit: 'minutes', difficulty: 1 },
  halalCheck: { key: 'halalCheck', name: 'Halal income check',pillar: 'money', baseXp: 15, unit: null,      difficulty: 1 },
  save:       { key: 'save',       name: 'Saved money',       pillar: 'money', baseXp: 15, unit: 'rupees',  difficulty: 1 },
};

export const SYNONYMS = {
  'push up': 'pushups', 'pushup': 'pushups', 'push-ups': 'pushups', 'pushups': 'pushups',
  'pull up': 'pullups', 'pullup': 'pullups', 'pull-ups': 'pullups',
  'running': 'run', 'run': 'run', 'jog': 'run', 'ran': 'run', 'walk': 'run', 'walking': 'run',
  'hike': 'hike', 'hiked': 'hike', 'trek': 'hike', 'trekking': 'hike',
  'fajr on time': 'fajr', 'prayed fajr': 'fajr', 'fajr': 'fajr',
  'all 5 prayers': 'salah5', '5 prayers': 'salah5', 'five prayers': 'salah5',
  'morning adhkar': 'adhkar', 'evening adhkar': 'adhkar', 'adhkar': 'adhkar',
  'read quran': 'quran', 'quran reading': 'quran', 'quran': 'quran',
  'gave sadaqah': 'sadaqah', 'charity': 'sadaqah', 'sadaqah': 'sadaqah',
  'astaghfirullah': 'istighfar', 'istighfar': 'istighfar',
  'ai business': 'aiTask', 'ai task': 'aiTask', 'business idea': 'aiTask', 'validated idea': 'aiTask',
  'studied ai': 'aiLearn', 'ai learning': 'aiLearn', 'ai paper': 'aiLearn',
  'halal income': 'halalCheck', 'halal check': 'halalCheck',
  'saved money': 'save', 'save money': 'save', 'saved': 'save', 'saving': 'save',
};

const SORTED_SYNONYMS = Object.keys(SYNONYMS).sort((a, b) => b.length - a.length);

export function lookupActivity(text) {
  const lower = String(text || '').toLowerCase();
  for (const phrase of SORTED_SYNONYMS) {
    if (lower.includes(phrase)) {
      const key = SYNONYMS[phrase];
      return { ...CATALOG[key] };
    }
  }
  return null;
}

export function getCatalogEntry(key, overrides = {}) {
  const base = CATALOG[key];
  if (!base) return null;
  return { ...base, ...overrides };
}

export function promoteActivity(state, activityKey, fixedXp) {
  const overrides = state.catalogOverrides || {};
  return {
    ...state,
    catalogOverrides: { ...overrides, [activityKey]: { fixedXp } },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/activityCatalog.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/activityCatalog.js src/data/activityCatalog.test.js
git commit -m "feat: add canonical activity catalog with synonyms

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: logEngine.js — deterministic XP + per-activity streaks

**Files:**
- Create: `src/logic/logEngine.js`
- Test: `src/logic/logEngine.test.js`

**Interfaces:**
- Consumes: `CATALOG`, `UNIT_XP` from `src/data/activityCatalog.js`; `getRankByLevel`, `getEffectiveXp`, `xpForNextLevel` from `src/data/questCatalog.js`; `applyStatModifiers`, `autoAssignStatPoints` from `src/data/stats.js`; `getLocalDateString`, `getDayDiff` from `src/utils/dateUtils.js`; `recalculateOverallLevel`, `getActivityStreakBonus` from `src/logic/progression.js`.
- Produces: `awardActivities(state, activities, today?) -> state`. Each activity in `activities` is `{ activityKey, name, pillar, quantity?, unit?, effortScore?, notes? }`. `state.activities[activityKey]` becomes `{ name, pillar, streak, bestStreak, totalSessions, totalReps, frozen, lastLoggedDate, createdAt }`.

- [ ] **Step 1: Write the failing test**

Create `src/logic/logEngine.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { awardActivities } from './logEngine';

function baseState(overrides = {}) {
  return {
    user: { name: 'Seeker', currentRank: 'E', overallLevel: 0 },
    pillars: {
      deen: { level: 0, xp: 0, streak: 0 },
      body: { level: 0, xp: 0, streak: 0 },
      money: { level: 0, xp: 0, streak: 0 },
    },
    stats: { strength: 10, agility: 10, intelligence: 10, sense: 10, health: 10, mana: 10 },
    gold: 0,
    activities: {},
    history: [],
    systemMessages: [],
    flowState: { active: false, multiplier: 1, expiresAt: 0, questsInWindow: 0 },
    weeklyFocus: null,
    catalogOverrides: {},
    ...overrides,
  };
}

const pushups = { activityKey: 'pushups', name: 'Push-ups', pillar: 'body', quantity: 100, unit: 'reps', effortScore: 6, notes: null };

describe('awardActivities — basic catalog award', () => {
  it('awards rank-scaled base XP and records a log entry', () => {
    const next = awardActivities(baseState(), [pushups], '2026-06-20');
    // base 15 -> getEffectiveXp(15,'E',0)=15 -> statmod(10,10,...)=15 -> streak COMMON x1.0 -> 15
    expect(next.pillars.body.xp).toBe(15);
    expect(next.pillars.body.streak).toBe(1);
    expect(next.gold).toBe(7); // floor(15 * 0.5)
    expect(next.activities.pushups.streak).toBe(1);
    expect(next.activities.pushups.totalSessions).toBe(1);
    const last = next.history.at(-1);
    expect(last.type).toBe('log');
    expect(last.activityKey).toBe('pushups');
    expect(last.xp).toBe(15);
    expect(last.localDate).toBe('2026-06-20');
  });
});

describe('awardActivities — per-activity streak bonus', () => {
  it('applies the UNCOMMON x1.15 bonus on the 7th consecutive day and grants a freeze', () => {
    const seeded = baseState({
      activities: {
        pushups: { name: 'Push-ups', pillar: 'body', streak: 6, bestStreak: 6, totalSessions: 6, frozen: false, lastLoggedDate: '2026-06-19', createdAt: '2026-06-14' },
      },
    });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.activities.pushups.streak).toBe(7);
    expect(next.activities.pushups.frozen).toBe(true);
    expect(next.pillars.body.xp).toBe(17); // floor(15 * 1.15)
  });
});

describe('awardActivities — Never Miss Twice', () => {
  it('forgives a single missed day when a freeze is held (gap=2)', () => {
    const seeded = baseState({
      activities: {
        pushups: { name: 'Push-ups', pillar: 'body', streak: 7, bestStreak: 7, totalSessions: 7, frozen: true, lastLoggedDate: '2026-06-18', createdAt: '2026-06-11' },
      },
    });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.activities.pushups.streak).toBe(8); // continued, freeze spent
    expect(next.activities.pushups.frozen).toBe(false);
  });

  it('resets the streak to 1 after a gap of more than one missed day', () => {
    const seeded = baseState({
      activities: {
        pushups: { name: 'Push-ups', pillar: 'body', streak: 10, bestStreak: 10, totalSessions: 10, frozen: false, lastLoggedDate: '2026-06-17', createdAt: '2026-06-07' },
      },
    });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.activities.pushups.streak).toBe(1);
  });
});

describe('awardActivities — daily cap', () => {
  it('records but awards 0 XP for a 4th same-activity log in one day', () => {
    const seeded = baseState({
      activities: {
        pushups: { name: 'Push-ups', pillar: 'body', streak: 1, bestStreak: 1, totalSessions: 3, frozen: false, lastLoggedDate: '2026-06-20', createdAt: '2026-06-20' },
      },
      history: [
        { type: 'log', activityKey: 'pushups', localDate: '2026-06-20', completed: true, xp: 15 },
        { type: 'log', activityKey: 'pushups', localDate: '2026-06-20', completed: true, xp: 15 },
        { type: 'log', activityKey: 'pushups', localDate: '2026-06-20', completed: true, xp: 15 },
      ],
    });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.pillars.body.xp).toBe(0); // no XP this log (seeded body.xp 0)
    expect(next.history.at(-1).xp).toBe(0);
    expect(next.activities.pushups.totalSessions).toBe(4);
  });
});

describe('awardActivities — novel activity uses effort score', () => {
  it('computes base XP from effortScore * UNIT_XP when no catalog entry exists', () => {
    const novel = { activityKey: 'cold-shower', name: 'Cold shower', pillar: 'body', quantity: null, unit: null, effortScore: 5, notes: null };
    const next = awardActivities(baseState(), [novel], '2026-06-20');
    // 5 * 8 = 40 -> getEffectiveXp(40,'E',0)=40 -> x1.0 -> 40
    expect(next.pillars.body.xp).toBe(40);
    expect(next.activities['cold-shower'].streak).toBe(1);
  });
});

describe('awardActivities — pillar + overall rank-up', () => {
  it('levels the pillar and promotes overall rank when enough XP is earned', () => {
    const seeded = baseState({
      pillars: { deen: { level: 0, xp: 0, streak: 0 }, body: { level: 10, xp: 300, streak: 0 }, money: { level: 0, xp: 0, streak: 0 } },
    });
    // xpForNextLevel(10) = floor(100 * 1.12^10) = 310; award 15 -> 315 -> level 11, xp 5
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.pillars.body.level).toBe(11);
    expect(next.pillars.body.xp).toBe(5);
    expect(next.user.overallLevel).toBe(11);
    expect(next.user.currentRank).toBe('D');
  });
});

describe('awardActivities — flow multiplier (newly applied)', () => {
  it('multiplies XP when state.flowState is active', () => {
    const seeded = baseState({ flowState: { active: true, multiplier: 1.5, expiresAt: 0, questsInWindow: 3 } });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    // 15 base * 1.5 flow = floor(22.5) = 22
    expect(next.pillars.body.xp).toBe(22);
  });
});

describe('awardActivities — weekly focus', () => {
  it('adds a 1.5x bonus when weeklyFocus matches the pillar', () => {
    const seeded = baseState({ weeklyFocus: 'body' });
    const next = awardActivities(seeded, [pushups], '2026-06-20');
    expect(next.pillars.body.xp).toBe(22); // 15 * 1.5
  });
});

describe('awardActivities — edge cases', () => {
  it('returns state unchanged for an empty activity list', () => {
    const state = baseState();
    expect(awardActivities(state, [], '2026-06-20')).toBe(state);
  });

  it('skips activities with no pillar', () => {
    const next = awardActivities(baseState(), [{ activityKey: 'x', name: 'X', pillar: 'body' }, { activityKey: 'y', name: 'Y', pillar: null }], '2026-06-20');
    expect(next.history).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/logic/logEngine.test.js`
Expected: FAIL — `Failed to resolve import './logEngine'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/logic/logEngine.js`:

```js
import { CATALOG, UNIT_XP } from '../data/activityCatalog';
import { getRankByLevel, getEffectiveXp, xpForNextLevel } from '../data/questCatalog';
import { applyStatModifiers, autoAssignStatPoints } from '../data/stats';
import { getLocalDateString, getDayDiff } from '../utils/dateUtils';
import { recalculateOverallLevel, getActivityStreakBonus } from './progression';

const MAX_SAME_ACTIVITY_LOGS_PER_DAY = 3;
const FREEZE_TIERS = [7, 30, 90, 180, 365];

function createEventId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function resolvePreBase(activity, state) {
  const key = activity.activityKey;
  if (CATALOG[key]) return CATALOG[key].baseXp;
  const override = state.catalogOverrides?.[key];
  if (override?.fixedXp) return override.fixedXp;
  const effort = Math.max(1, Math.min(10, activity.effortScore || 3));
  return effort * UNIT_XP;
}

function countSameDayLogs(state, activityKey, today) {
  return (state.history || []).filter(
    (h) => h.type === 'log' && h.activityKey === activityKey && h.localDate === today && h.completed
  ).length;
}

function updateActivityStreak(activityRecord, today) {
  const rec = activityRecord
    ? { ...activityRecord }
    : { streak: 0, bestStreak: 0, totalSessions: 0, frozen: false, lastLoggedDate: null, createdAt: today };

  if (rec.lastLoggedDate === today) {
    rec.totalSessions = (rec.totalSessions || 0) + 1;
    return rec; // same-day repeat: no streak change
  }

  const isFirstLog = rec.lastLoggedDate === null;
  const gap = rec.lastLoggedDate ? getDayDiff(rec.lastLoggedDate, today) : null;

  if (isFirstLog) {
    rec.streak = 1;
    rec.frozen = false;
  } else if (gap === 1) {
    rec.streak = (rec.streak || 0) + 1;
  } else if (gap === 2 && rec.frozen) {
    rec.streak = (rec.streak || 0) + 1; // Never Miss Twice: one missed day forgiven
    rec.frozen = false;
  } else {
    rec.streak = 1; // gap too large (or freeze already spent): reset
    rec.frozen = false;
  }

  rec.bestStreak = Math.max(rec.bestStreak || 0, rec.streak);
  rec.totalSessions = (rec.totalSessions || 0) + 1;
  rec.lastLoggedDate = today;
  if (FREEZE_TIERS.includes(rec.streak)) rec.frozen = true;
  return rec;
}

export function awardActivities(state, activities, today = getLocalDateString()) {
  if (!Array.isArray(activities) || activities.length === 0) return state;

  let next = { ...state };
  next.activities = { ...(state.activities || {}) };
  next.pillars = { ...state.pillars };
  next.history = [...(state.history || [])];
  next.systemMessages = [...(state.systemMessages || [])];
  next.stats = { ...(state.stats || {}) };
  let gold = state.gold || 0;

  const rank = getRankByLevel(state.user.overallLevel || 0);

  for (const activity of activities) {
    if (!activity || !activity.pillar || !next.pillars[activity.pillar]) continue;
    const pillar = activity.pillar;

    const sameDayCount = countSameDayLogs(next, activity.activityKey, today);
    const countsForXp = sameDayCount < MAX_SAME_ACTIVITY_LOGS_PER_DAY;

    // 1. catalog/effort base -> rank scale
    const preBase = resolvePreBase(activity, next);
    const base = getEffectiveXp(preBase, rank.key, state.user.overallLevel || 0);

    // 2. update the activity streak ledger FIRST so the bonus reflects today
    const prevRec = next.activities[activity.activityKey];
    const rec = updateActivityStreak(prevRec, today);
    rec.name = activity.name || rec.name || activity.activityKey;
    rec.pillar = pillar;
    if (activity.quantity != null) rec.totalReps = (rec.totalReps || 0) + Number(activity.quantity);
    next.activities[activity.activityKey] = rec;

    let final = base;
    if (countsForXp) {
      // 3. stat modifiers (body->strength, deen->intelligence, money->sense, +agility)
      final = applyStatModifiers(final, next.stats, pillar);
      // 4. per-activity streak bonus (newly applied)
      const bonus = getActivityStreakBonus(rec.streak);
      final = Math.floor(final * bonus.multiplier);
      // 5. flow multiplier (newly applied; reads pre-existing state.flowState)
      if (state.flowState?.active) final = Math.floor(final * (state.flowState.multiplier || 1));
      // 6. weekly focus
      if (state.weeklyFocus === pillar) final = Math.floor(final * 1.5);
    } else {
      final = 0; // beyond the daily cap: recorded, no XP
    }

    // 7. pillar XP + streak + level-up
    const pillarState = { ...next.pillars[pillar] };
    pillarState.xp = (pillarState.xp || 0) + final;
    pillarState.streak = (pillarState.streak || 0) + 1;
    pillarState.lastDailyQuestCompletionDate = today;

    let leveledUp = false;
    let autoStatResult = null;
    const needed = xpForNextLevel(pillarState.level || 0);
    if (pillarState.xp >= needed) {
      pillarState.level = (pillarState.level || 0) + 1;
      pillarState.xp -= needed;
      const pillarRank = getRankByLevel(pillarState.level);
      autoStatResult = autoAssignStatPoints(next.stats, pillar, pillarRank.statPointsPerLevel || 1);
      leveledUp = true;
    }
    next.pillars[pillar] = pillarState;

    if (autoStatResult) {
      next.stats = autoStatResult.stats;
      const assignments = autoStatResult.assignments.map((a) => `${a.stat.toUpperCase()} +${a.points}`).join(', ');
      next.systemMessages.push({
        type: 'levelUp',
        title: `${pillar.toUpperCase()} LEVEL UP`,
        subtitle: `Level ${pillarState.level}`,
        message: `SYSTEM auto-assigned: ${assignments}.`,
      });
    }

    // 8. gold
    const goldGain = Math.floor(final * 0.5);
    gold += goldGain;

    // 9. history
    next.history.push({
      eventId: createEventId('log'),
      type: 'log',
      activityKey: activity.activityKey,
      title: activity.name || activity.activityKey,
      description: activity.notes || '',
      pillar,
      quantity: activity.quantity ?? null,
      unit: activity.unit ?? null,
      xp: final,
      gold: goldGain,
      date: new Date().toISOString(),
      localDate: today,
      completed: true,
    });
  }

  next.gold = gold;
  next = recalculateOverallLevel(next);
  return next;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/logic/logEngine.test.js`
Expected: PASS (all `it` blocks).

- [ ] **Step 5: Commit**

```bash
git add src/logic/logEngine.js src/logic/logEngine.test.js
git commit -m "feat: add deterministic log engine with per-activity streaks

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: aiAssistant.js — export helpers + callModelWithSystem

**Files:**
- Modify: `src/services/aiAssistant.js`
- Test: `src/services/aiAssistant.test.js`

**Interfaces:**
- Produces (newly exported): `sanitize(str) -> str`; `containsCrisisSignal(str) -> bool`; `getCrisisResponse() -> str`; `callModelWithSystem(systemPrompt, userMessages, { maxTokens?, temperature? }) -> Promise<string>`.
- Notes: `callModelWithSystem` reuses the same primary→fallback routing (`openrouter/free` → `openai/gpt-4o-mini`) and the same endpoint selection (OpenRouter if `getApiKey()` else `/api/forge-master`) as the existing `tryModel`, but injects the caller-supplied `systemPrompt` instead of the Forge-Master prompt. It is a private helper `callRawModel` plus a public wrapper; the existing `tryModel` is **not** modified.

- [ ] **Step 1: Write the failing test**

Create `src/services/aiAssistant.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { sanitize, containsCrisisSignal, getCrisisResponse } from './aiAssistant';

describe('sanitize', () => {
  it('neutralizes [[CMD]]/[[/CMD]] markers into inert [CMD]/[/CMD] (keeps text)', () => {
    expect(sanitize('hello [[CMD]]evil[[/CMD]] world')).toBe('hello [CMD]evil[/CMD] world');
  });
  it('returns clean text unchanged', () => {
    expect(sanitize('I did 100 push ups')).toBe('I did 100 push ups');
  });
  it('returns empty string for non-string input', () => {
    expect(sanitize(42)).toBe('');
    expect(sanitize(null)).toBe('');
  });
});

describe('containsCrisisSignal', () => {
  it('flags explicit self-harm language', () => {
    expect(containsCrisisSignal('I want to end my life')).toBe(true);
    expect(containsCrisisSignal('feeling worthless and no reason to live')).toBe(true);
  });
  it('does not flag ordinary logs', () => {
    expect(containsCrisisSignal('I did 100 push ups and prayed fajr')).toBe(false);
  });
});

describe('getCrisisResponse', () => {
  it('returns a non-empty safety message', () => {
    const msg = getCrisisResponse();
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(20);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/aiAssistant.test.js`
Expected: FAIL — `sanitize`, `containsCrisisSignal`, `getCrisisResponse` are not exported (SyntaxError or `undefined`).

- [ ] **Step 3: Modify the implementation**

In `src/services/aiAssistant.js`, locate the three existing function declarations and add `export` to each (their bodies are unchanged):

- `function sanitize(str)` → `export function sanitize(str)`
- `function containsCrisisSignal(str)` → `export function containsCrisisSignal(str)`
- `function getCrisisResponse()` → `export function getCrisisResponse()`

Then add these two functions at the end of the file (they reference the module-level constants `PRIMARY_MODEL`, `FALLBACK_MODEL`, `OPENROUTER_API_URL`, `AI_PROXY_URL`, and the existing `getApiKey`):

```js
async function callRawModel(model, messages, maxTokens, temperature) {
  const apiKey = getApiKey();
  const payload = { model, messages, temperature, max_tokens: maxTokens, include_reasoning: false };
  const response = await fetch(apiKey ? OPENROUTER_API_URL : AI_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey
        ? { Authorization: `Bearer ${apiKey}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'Solo Leveling System' }
        : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = new Error(`AI request failed: ${response.status}`);
    err.status = response.status;
    throw err;
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function callModelWithSystem(systemPrompt, userMessages, { maxTokens = 1000, temperature = 0.3 } = {}) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...userMessages.map((m) => ({ role: m.role, content: sanitize(m.content) })),
  ];
  let lastError = null;
  for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    try {
      return await callRawModel(model, messages, maxTokens, temperature);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('AI service unavailable');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/aiAssistant.test.js`
Expected: PASS.

- [ ] **Step 5: Build to confirm no regressions**

Run: `npm run build`
Expected: build succeeds (the new exports/additions do not change existing call sites).

- [ ] **Step 6: Commit**

```bash
git add src/services/aiAssistant.js src/services/aiAssistant.test.js
git commit -m "feat: export sanitize/crisis helpers and add callModelWithSystem

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: activityParser.js — AI parse with crisis scan + fallback

**Files:**
- Create: `src/services/activityParser.js`
- Test: `src/services/activityParser.test.js`

**Interfaces:**
- Consumes: `callModelWithSystem`, `sanitize`, `containsCrisisSignal`, `getCrisisResponse` from `src/services/aiAssistant.js`; `lookupActivity` from `src/data/activityCatalog.js`.
- Produces: `parseActivities(text, context?) -> Promise<{ crisis, activities, error?, message?, raw? }>`; exported pure helpers `safeParseActivities(raw) -> array | null` and `normalizeActivity(a) -> activity | null`.

- [ ] **Step 1: Write the failing test**

Create `src/services/activityParser.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { parseActivities, safeParseActivities, normalizeActivity } from './activityParser';

describe('safeParseActivities', () => {
  it('parses a clean JSON array', () => {
    expect(safeParseActivities('[{"a":1}]')).toEqual([{ a: 1 }]);
  });
  it('parses JSON wrapped in ```json fences', () => {
    expect(safeParseActivities('```json\n[{"a":1}]\n```')).toEqual([{ a: 1 }]);
  });
  it('parses JSON embedded in surrounding prose', () => {
    expect(safeParseActivities('here you go: [{"x":2}] thanks')).toEqual([{ x: 2 }]);
  });
  it('returns null when no array is present', () => {
    expect(safeParseActivities('no json here')).toBeNull();
    expect(safeParseActivities('')).toBeNull();
  });
});

describe('normalizeActivity', () => {
  it('clamps effortScore, coerces quantity, slugifies the key, defaults pillar', () => {
    const a = normalizeActivity({ pillar: 'body', effortScore: 99, quantity: '10', activityKey: 'Push Ups!!' });
    expect(a).toEqual({ activityKey: 'push-ups', name: 'push-ups', pillar: 'body', quantity: 10, unit: null, effortScore: 10, notes: null });
  });
  it('defaults an invalid pillar to deen and effortScore to 1', () => {
    const a = normalizeActivity({ pillar: 'invalid', effortScore: 0 });
    expect(a.pillar).toBe('deen');
    expect(a.effortScore).toBe(1);
  });
  it('returns null for non-object input', () => {
    expect(normalizeActivity(null)).toBeNull();
    expect(normalizeActivity('hi')).toBeNull();
  });
});

describe('parseActivities — crisis and empty paths (no network)', () => {
  it('returns crisis:true for self-harm input without calling the model', async () => {
    const out = await parseActivities('I want to end my life');
    expect(out.crisis).toBe(true);
    expect(out.activities).toEqual([]);
    expect(typeof out.message).toBe('string');
  });

  it('returns an empty activity list for blank input', async () => {
    const out = await parseActivities('   ');
    expect(out.crisis).toBe(false);
    expect(out.activities).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/activityParser.test.js`
Expected: FAIL — `Failed to resolve import './activityParser'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/services/activityParser.js`:

```js
import { callModelWithSystem, sanitize, containsCrisisSignal, getCrisisResponse } from './aiAssistant';
import { lookupActivity } from '../data/activityCatalog';

const PILLARS = ['deen', 'body', 'money'];

const PARSER_SYSTEM_PROMPT = `You are the System's activity parser. The user tells you what they did today. Convert their input into a JSON array of activities.

For each activity return an object with EXACTLY these fields:
- activityKey: lowercase kebab-case slug (e.g. "pushups", "fajr", "ai-business-idea"). Reuse the same key for the same activity across days.
- name: short display name (max 40 chars)
- pillar: one of "deen", "body", "money" (deen = Islamic worship/character, body = physical/outdoor, money = wealth/AI work/halal income)
- quantity: number or null
- unit: string or null (e.g. "reps", "minutes", "rupees")
- effortScore: integer 1-10 (1 = trivial, 10 = extreme effort)
- notes: string or null

Rules:
- Output ONLY a JSON array. No prose, no markdown fences.
- If the input is ambiguous, make a single best guess.
- If the input is not an activity log (a question, a complaint), return [].
- Never include [[CMD]] markers.`;

export function safeParseActivities(raw) {
  if (!raw) return null;
  let text = String(raw).trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const arr = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

export function normalizeActivity(a) {
  if (!a || typeof a !== 'object') return null;
  const pillar = PILLARS.includes(a.pillar) ? a.pillar : 'deen';
  const rawEffort = a.effortScore == null ? 3 : Number(a.effortScore);
  const effortScore = Math.max(1, Math.min(10, Math.round(Number.isFinite(rawEffort) ? rawEffort : 3)));
  const quantity = a.quantity == null ? null : Number.isFinite(Number(a.quantity)) ? Number(a.quantity) : null;
  const key = String(a.activityKey || a.key || 'activity')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'activity';
  return {
    activityKey: key,
    name: String(a.name || key).slice(0, 40),
    pillar,
    quantity,
    unit: a.unit == null ? null : String(a.unit).slice(0, 20),
    effortScore,
    notes: a.notes == null ? null : String(a.notes).slice(0, 200),
  };
}

export async function parseActivities(text, context = {}) {
  const cleaned = sanitize(String(text || ''));
  if (containsCrisisSignal(cleaned)) {
    return { crisis: true, message: getCrisisResponse(), activities: [] };
  }
  if (!cleaned.trim()) {
    return { crisis: false, activities: [] };
  }

  const userMessages = [{ role: 'user', content: cleaned }];
  let raw;
  try {
    raw = await callModelWithSystem(PARSER_SYSTEM_PROMPT, userMessages, { maxTokens: 800, temperature: 0.3 });
  } catch (err) {
    // never lose the input: surface it for a pending log / manual tag
    return { crisis: false, activities: [], error: err.message, raw: cleaned };
  }

  let parsed = safeParseActivities(raw);
  if (!parsed && context.allowRetry !== false) {
    try {
      raw = await callModelWithSystem(
        PARSER_SYSTEM_PROMPT + '\n\nRespond with ONLY a JSON array. No other text.',
        userMessages,
        { maxTokens: 800, temperature: 0.2 }
      );
      parsed = safeParseActivities(raw);
    } catch (err) {
      return { crisis: false, activities: [], error: err.message, raw: cleaned };
    }
  }

  const normalized = (parsed || []).map(normalizeActivity).filter(Boolean);
  // catalog fast-path: pin a known synonym so the activity keeps a stable key + fixed base XP
  for (const a of normalized) {
    const hit = lookupActivity(`${a.name} ${a.quantity ?? ''}`);
    if (hit) {
      a.activityKey = hit.key;
      a.pillar = hit.pillar;
    }
  }
  return { crisis: false, activities: normalized };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/activityParser.test.js`
Expected: PASS. (The crisis and empty paths short-circuit before any network call, so no `callModelWithSystem` fetch is made.)

- [ ] **Step 5: Commit**

```bash
git add src/services/activityParser.js src/services/activityParser.test.js
git commit -m "feat: add activity parser (crisis scan, JSON parse, catalog pin)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: voice.js + useVoiceLog.js — Web Speech hook

**Files:**
- Create: `src/utils/voice.js`
- Create: `src/hooks/useVoiceLog.js`
- Test: `src/utils/voice.test.js`

**Interfaces:**
- Produces: `getSpeechRecognition() -> constructor | null`; `isSpeechSupported() -> bool`; React hook `useVoiceLog({ onTranscript }) -> { supported, listening, transcript, interim, error, start, stop, clear, submit, setTranscript }`.

- [ ] **Step 1: Write the failing test**

Create `src/utils/voice.test.js`:

```js
import { afterEach, describe, expect, it } from 'vitest';
import { getSpeechRecognition, isSpeechSupported } from './voice';

afterEach(() => {
  delete globalThis.window;
});

describe('isSpeechSupported / getSpeechRecognition', () => {
  it('reports unsupported when no SpeechRecognition is present', () => {
    delete globalThis.window;
    expect(isSpeechSupported()).toBe(false);
    expect(getSpeechRecognition()).toBeNull();
  });

  it('reports supported when webkitSpeechRecognition is present', () => {
    globalThis.window = { webkitSpeechRecognition: function MockRec() {} };
    expect(isSpeechSupported()).toBe(true);
    expect(getSpeechRecognition()).toBe(globalThis.window.webkitSpeechRecognition);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/voice.test.js`
Expected: FAIL — `Failed to resolve import './voice'`.

- [ ] **Step 3: Write the pure util**

Create `src/utils/voice.js`:

```js
export function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isSpeechSupported() {
  return getSpeechRecognition() != null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/voice.test.js`
Expected: PASS.

- [ ] **Step 5: Write the React hook (no unit test — DOM/React; verified by build + manual use in Task 8)**

Create `src/hooks/useVoiceLog.js`:

```jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { getSpeechRecognition, isSpeechSupported } from '../utils/voice';

export function useVoiceLog({ onTranscript } = {}) {
  const supported = isSpeechSupported();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* noop */ }
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setError('Voice input not supported on this device. Type instead.');
      return;
    }
    try {
      const rec = new Recognition();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.continuous = false;
      let finalText = '';
      rec.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) finalText += result[0].transcript;
          else interimText += result[0].transcript;
        }
        setInterim(interimText);
        if (finalText) {
          setTranscript((prev) => (prev ? prev + ' ' : '') + finalText.trim());
          finalText = '';
        }
      };
      rec.onerror = (e) => {
        setError(e?.error ? `voice: ${e.error}` : 'voice error');
        setListening(false);
      };
      rec.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setError('Could not start voice input.');
      setListening(false);
    }
  }, []);

  const clear = useCallback(() => {
    setTranscript('');
    setInterim('');
    setError(null);
  }, []);

  const submit = useCallback(() => {
    const text = transcript.trim();
    if (text && onTranscriptRef.current) onTranscriptRef.current(text);
    clear();
  }, [transcript, clear]);

  return { supported, listening, transcript, interim, error, start, stop, clear, submit, setTranscript };
}
```

- [ ] **Step 6: Build to confirm the hook compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/utils/voice.js src/utils/voice.test.js src/hooks/useVoiceLog.js
git commit -m "feat: add Web Speech voice util and useVoiceLog hook

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: store.js — schema v8 migration

**Files:**
- Modify: `src/data/store.js`
- Test: `src/logic/logEngine.test.js` (append a migration block — the file already imports pure helpers and is the natural home for a state-shape test)

**Interfaces:**
- Produces: `SCHEMA_VERSION = 8`; `DEFAULT_STATE` gains `activities: {}`, `logTargets: []`, `pendingLogs: []`, `guidedMode: { enabled: false, lastQuestDate: null }`, `catalogOverrides: {}`; `normalizeStateShape` normalizes these for any incoming state. Deprecated quest/equipment/skill/shadow fields remain in `DEFAULT_STATE` for one migration cycle (ignored by the new engine, retained so cloud sync deep-merges do not drop data).

- [ ] **Step 1: Write the failing test**

Append to `src/logic/logEngine.test.js` (add the import at the top of the file alongside the existing `import { awardActivities } from './logEngine';`):

```js
import { upgradeStateForCurrentBuild } from '../data/store';
```

Then append this `describe` block at the end of the file:

```js
describe('schema v8 migration', () => {
  it('adds new fields and preserves earned progress', () => {
    const oldState = {
      version: 7,
      buildVersion: 'old',
      user: { name: 'Saiful', currentRank: 'E', overallLevel: 5, joinedDate: '2026-01-01T00:00:00.000Z', jobClass: null },
      pillars: {
        deen: { level: 5, xp: 10, streak: 3 },
        body: { level: 3, xp: 0, streak: 0 },
        money: { level: 2, xp: 0, streak: 0 },
      },
      stats: { strength: 12, agility: 10, intelligence: 11, sense: 10, health: 10, mana: 10 },
      gold: 50,
      history: [{ type: 'log', activityKey: 'pushups', xp: 15, localDate: '2026-06-19', completed: true }],
    };
    const upgraded = upgradeStateForCurrentBuild(oldState);
    expect(upgraded.version).toBe(8);
    expect(upgraded.activities).toEqual({});
    expect(upgraded.guidedMode).toEqual({ enabled: false, lastQuestDate: null });
    expect(upgraded.pendingLogs).toEqual([]);
    expect(upgraded.catalogOverrides).toEqual({});
    expect(upgraded.user.overallLevel).toBe(5);
    expect(upgraded.pillars.deen.streak).toBe(3);
    expect(upgraded.gold).toBe(50);
    expect(upgraded.history.at(-1).activityKey).toBe('pushups');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/logic/logEngine.test.js`
Expected: FAIL on the migration block — `upgraded.version` is `7`, `upgraded.activities` is `undefined`.

- [ ] **Step 3: Modify the implementation**

In `src/data/store.js`:

1. Change the version constants (lines 7-8):

```js
const SCHEMA_VERSION = 8;
const BUILD_VERSION = '2026-06-20-listen-and-level-v1';
```

2. Add the five new fields to `DEFAULT_STATE`. Insert immediately after the `weeklyFocus: null,` line (line 79) and before `khalifateObjectives: []`:

```js
  // v8 Listen & Level fields
  activities: {},
  logTargets: [],
  pendingLogs: [],
  guidedMode: { enabled: false, lastQuestDate: null },
  catalogOverrides: {},
```

3. In `normalizeStateShape`, add normalization for the new fields. Insert immediately before `normalized.buildVersion = state.buildVersion || BUILD_VERSION;` (line 155):

```js
  // v8 Listen & Level normalization
  normalized.activities = state.activities && typeof state.activities === 'object' ? state.activities : {};
  normalized.logTargets = Array.isArray(state.logTargets) ? state.logTargets : [];
  normalized.pendingLogs = Array.isArray(state.pendingLogs) ? state.pendingLogs : [];
  normalized.guidedMode = {
    enabled: state.guidedMode?.enabled || false,
    lastQuestDate: state.guidedMode?.lastQuestDate || null,
  };
  normalized.catalogOverrides = state.catalogOverrides && typeof state.catalogOverrides === 'object' ? state.catalogOverrides : {};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/logic/logEngine.test.js`
Expected: PASS (the migration block and all prior `logEngine` blocks).

- [ ] **Step 5: Build to confirm nothing broke**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/data/store.js src/logic/logEngine.test.js
git commit -m "feat: schema v8 — activities, guidedMode, pendingLogs, catalogOverrides

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: LogTab.jsx — the new home screen

**Files:**
- Create: `src/components/LogTab.jsx`

**Interfaces:**
- Consumes: `useStore` via props `state`, `setState`; `useVoiceLog` from `src/hooks/useVoiceLog.js`; `parseActivities` from `src/services/activityParser.js`; `awardActivities` from `src/logic/logEngine.js`; `checkFlowState` from `src/logic/progression.js`; `getRankByLevel`, `xpForNextLevel` from `src/data/questCatalog.js`; `getActivityStreakBonus` from `src/logic/progression.js`; `getLocalDateString` from `src/utils/dateUtils.js`; lucide icons `Mic`, `Square`, `Send`, `Flame`, `Sparkles`.
- Produces: a self-contained screen with a compact progress header, a voice/text log input that calls `awardActivities` through `setState`, today's log list, and a suggested-target prompt. No new exports.

- [ ] **Step 1: Create the component**

Create `src/components/LogTab.jsx`:

```jsx
import { useMemo, useState } from 'react';
import { Mic, Square, Send, Flame, Sparkles, Loader2 } from 'lucide-react';
import { useVoiceLog } from '../hooks/useVoiceLog';
import { parseActivities } from '../services/activityParser';
import { awardActivities } from '../logic/logEngine';
import { checkFlowState, getActivityStreakBonus } from '../logic/progression';
import { getRankByLevel, xpForNextLevel } from '../data/questCatalog';
import { getLocalDateString } from '../utils/dateUtils';

function ProgressHeader({ state }) {
  const overall = state.user.overallLevel || 0;
  const rank = getRankByLevel(overall);
  const pillars = ['deen', 'body', 'money'];
  return (
    <div className="glass-panel-khalifa p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-orbitron text-2xl text-khalifa-gold">{rank.key}-RANK</div>
          <div className="text-khalifa-steel text-sm">{rank.title} · Level {overall}</div>
        </div>
        {state.flowState?.active && (
          <div className="text-khalifa-gold text-sm font-orbitron">FLOW x{state.flowState.multiplier}</div>
        )}
      </div>
      <div className="space-y-3">
        {pillars.map((p) => {
          const lvl = state.pillars[p].level || 0;
          const xp = state.pillars[p].xp || 0;
          const needed = xpForNextLevel(lvl);
          const pct = Math.min(100, Math.round((xp / needed) * 100));
          return (
            <div key={p}>
              <div className="flex justify-between text-xs text-khalifa-steel mb-1">
                <span className="uppercase tracking-wider">{p}</span>
                <span>L{lvl} · {xp}/{needed}</span>
              </div>
              <div className="h-2 rounded-full bg-khalifa-void/60 overflow-hidden">
                <div className="h-full bg-khalifa-gold/80" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LogRow({ entry }) {
  const bonus = getActivityStreakBonus(entry.streak || 0);
  return (
    <div className="flex items-center justify-between py-2 border-b border-khalifa-void/40 last:border-0">
      <div className="min-w-0">
        <div className="text-khalifa-steel text-sm truncate">{entry.title}</div>
        <div className="text-xs text-khalifa-steel/60 uppercase tracking-wider">
          {entry.pillar} · {entry.localDate}
          {entry.quantity != null ? ` · ${entry.quantity} ${entry.unit || ''}` : ''}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {entry.streak >= 7 && (
          <span className="flex items-center gap-1 text-xs text-khalifa-gold">
            <Flame size={12} /> {entry.streak} · {bonus.label}
          </span>
        )}
        <span className="text-khalifa-gold text-sm font-orbitron">+{entry.xp} XP</span>
      </div>
    </div>
  );
}

export default function LogTab({ state, setState }) {
  const today = getLocalDateString();
  const [text, setText] = useState('');
  const [status, setStatus] = useState(''); // '', 'parsing', 'crisis', 'empty', 'error'
  const [notice, setNotice] = useState('');

  const voice = useVoiceLog({ onTranscript: (t) => setText((prev) => (prev ? prev + ' ' : '') + t) });

  const todaysLogs = useMemo(() => {
    return (state.history || [])
      .filter((h) => h.type === 'log' && h.localDate === today)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [state.history, today]);

  const activityLedger = state.activities || {};

  async function handleLog(payload) {
    const input = (payload ?? text).trim();
    if (!input) return;
    setText('');
    setNotice('');
    setStatus('parsing');
    let result;
    try {
      result = await parseActivities(input);
    } catch (err) {
      setStatus('error');
      setNotice(err.message || 'The System could not parse your log. Saved for retry.');
      savePendingLog(input);
      return;
    }

    if (result.crisis) {
      setStatus('crisis');
      setNotice(result.message);
      return;
    }
    if (!result.activities || result.activities.length === 0) {
      if (result.error) {
        setStatus('error');
        setNotice(result.error);
        savePendingLog(result.raw || input);
      } else {
        setStatus('empty');
        setNotice('The System recognized no activities in that log. Try: "100 push-ups, prayed Fajr, studied AI 30 min".');
      }
      return;
    }

    setState((prev) => {
      let next = awardActivities(prev, result.activities, today);
      const rank = getRankByLevel(next.user.overallLevel || 0);
      const flow = checkFlowState(next.history, rank.key);
      next = { ...next, flowState: flow };
      if (result.error && result.raw) {
        next.pendingLogs = [...(next.pendingLogs || []), { raw: result.raw, at: today }];
      }
      return next;
    });

    const gained = result.activities.length;
    setStatus('');
    setNotice(`Logged ${gained} activit${gained === 1 ? 'y' : 'ies'}. The System acknowledges your effort.`);
  }

  function savePendingLog(raw) {
    setState((prev) => ({ ...prev, pendingLogs: [...(prev.pendingLogs || []), { raw, at: today }] }));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <ProgressHeader state={state} />

      <div className="glass-panel-khalifa p-4 mb-4">
        <div className="text-khalifa-gold font-orbitron text-sm mb-3 flex items-center gap-2">
          <Sparkles size={14} /> TELL THE SYSTEM WHAT YOU DID
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I did 100 push-ups, prayed Fajr on time, and spent 30 minutes studying AI."
          className="w-full bg-khalifa-void/60 text-khalifa-steel rounded-lg p-3 text-sm border border-khalifa-gold/20 focus:border-khalifa-gold/60 focus:outline-none min-h-24 resize-none"
        />
        {voice.interim && <div className="text-khalifa-steel/50 text-xs mt-1 italic">{voice.interim}</div>}
        <div className="flex items-center gap-2 mt-3">
          {voice.supported && (
            <button
              onClick={voice.listening ? voice.stop : voice.start}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-orbitron border ${
                voice.listening
                  ? 'border-red-500/60 text-red-400'
                  : 'border-khalifa-gold/40 text-khalifa-gold'
              }`}
            >
              {voice.listening ? <Square size={14} /> : <Mic size={14} />}
              {voice.listening ? 'STOP' : 'SPEAK'}
            </button>
          )}
          <button
            onClick={() => handleLog()}
            disabled={status === 'parsing' || !text.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-orbitron bg-khalifa-gold text-khalifa-void disabled:opacity-40"
          >
            {status === 'parsing' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            LOG
          </button>
        </div>
        {voice.error && <div className="text-red-400 text-xs mt-2">{voice.error}</div>}
        {notice && (
          <div
            className={`text-xs mt-3 p-2 rounded ${
              status === 'crisis'
                ? 'bg-red-500/10 text-red-300'
                : status === 'error'
                ? 'bg-khalifa-gold/10 text-khalifa-gold/80'
                : 'bg-khalifa-gold/5 text-khalifa-steel'
            }`}
          >
            {notice}
          </div>
        )}
      </div>

      <div className="glass-panel-khalifa p-4 mb-4">
        <div className="text-khalifa-gold font-orbitron text-sm mb-2">TODAY · {today}</div>
        {todaysLogs.length === 0 ? (
          <div className="text-khalifa-steel/60 text-sm py-4 text-center">No logs yet today. Tell the System what you did.</div>
        ) : (
          <div>
            {todaysLogs.map((h, i) => (
              <LogRow
                key={h.eventId || i}
                entry={{ ...h, streak: activityLedger[h.activityKey]?.streak || 0 }}
              />
            ))}
          </div>
        )}
      </div>

      {Object.keys(activityLedger).length > 0 && (
        <div className="glass-panel-khalifa p-4">
          <div className="text-khalifa-gold font-orbitron text-sm mb-2">YOUR STREAKS</div>
          <div className="space-y-2">
            {Object.entries(activityLedger)
              .sort((a, b) => (b[1].streak || 0) - (a[1].streak || 0))
              .slice(0, 6)
              .map(([key, rec]) => {
                const bonus = getActivityStreakBonus(rec.streak || 0);
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-khalifa-steel truncate">{rec.name || key}</span>
                    <span className="flex items-center gap-1 text-khalifa-gold shrink-0">
                      <Flame size={12} /> {rec.streak} · {bonus.label}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build to confirm it compiles**

Run: `npm run build`
Expected: build succeeds. (No unit test — the repo has no DOM test harness; the component is verified by build + manual use in Task 9.)

- [ ] **Step 3: Commit**

```bash
git add src/components/LogTab.jsx
git commit -m "feat: add LogTab — voice/text log home screen

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: App.jsx — wire Log as home, gate quests behind Guided Mode

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `LogTab` from `src/components/LogTab.jsx`; existing `Dashboard`, dungeon/stats/store/build/settings screens.
- Produces: `log` is the default tab and first in the nav; `dungeons` (and the quest `Dashboard`, exposed as a `guided` tab) appear only when `state.guidedMode.enabled` is true; the Monday-reset effect skips dungeon/penalty logic when Guided Mode is off; a Guided Mode toggle is added to the Settings panel.

- [ ] **Step 1: Add the import**

At the top of `src/App.jsx`, alongside the other component imports, add:

```jsx
import LogTab from './components/LogTab';
```

- [ ] **Step 2: Make `log` the default tab**

Find the `activeTab` state declaration (the line `const [activeTab, setActiveTab] = useState('dashboard');`) and change it to:

```jsx
const [activeTab, setActiveTab] = useState('log');
```

- [ ] **Step 3: Replace the tabs array**

Find the `tabs` array definition and replace it with this Guided-aware version (keep whatever variable name is currently used — the array object shape below is the replacement):

```jsx
const guidedEnabled = !!state.guidedMode?.enabled;
const tabs = [
  { id: 'log', label: 'Log' },
  { id: 'stats', label: 'Stats' },
  ...(guidedEnabled ? [{ id: 'guided', label: 'Guided' }] : []),
  ...(guidedEnabled ? [{ id: 'dungeons', label: 'Dungeons' }] : []),
  { id: 'store', label: 'Store' },
  { id: 'build', label: 'Build' },
  { id: 'settings', label: 'Settings' },
];
```

- [ ] **Step 4: Add the Log render branch and rename the dashboard branch to guided**

In the render section, add a `log` branch immediately before the existing `activeTab === 'dashboard'` branch:

```jsx
{activeTab === 'log' && <LogTab state={state} setState={setState} ready={cloudReady} />}
```

Change the existing `activeTab === 'dashboard'` condition to `activeTab === 'guided'` (the `Dashboard` component itself is unchanged — it only renders when Guided Mode is on):

```jsx
{activeTab === 'guided' && <Dashboard state={state} setState={setState} ready={cloudReady} />}
```

- [ ] **Step 5: Gate the Monday-reset dungeon/penalty block behind Guided Mode**

Find the Monday-reset `useEffect`. Wrap the dungeon/penalty-reset logic (the parts that reset `weeklyDungeons`, call `initializeWeeklyDungeon`/`checkAndApplyPenalties`, or read `weeklyStats.soloClear`) in an early guard so it only runs when Guided Mode is enabled. Keep the `weeklyFocus` reset outside the guard (it still applies in both modes). Concretely, structure the effect as:

```jsx
useEffect(() => {
  // weekly focus reset applies in all modes
  if (/* is Monday / new week boundary */) {
    setState((prev) => ({
      ...prev,
      weeklyFocus: null,
      ...(guidedEnabled
        ? {
            weeklyDungeons: { weekId: null, deenCompleted: false, bodyCompleted: false, moneyCompleted: false, ummahCompleted: false, bonusClaimed: false },
            weeklyStats: { soloClear: false, aiPromptsUsed: 0, weekId: null },
          }
        : {}),
    }));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [guidedEnabled]);
```

Match the existing effect's Monday/weekId detection expression verbatim where the comment `/* is Monday / new week boundary */` appears — do not invent new date logic. If the existing effect already calls engine initializers inside `setState`, leave those calls in place but guarded by `guidedEnabled`. Run `npm run build` after editing; if the linter or build flags the change, adjust to the surrounding style rather than reverting the guard.

- [ ] **Step 6: Add the Guided Mode toggle to Settings**

Locate the Settings panel's inline JSX (the block rendered when `activeTab === 'settings'`). Add this toggle block inside it, near the other settings controls:

```jsx
<div className="glass-panel-khalifa p-4">
  <div className="text-khalifa-gold font-orbitron text-sm mb-1">GUIDED MODE</div>
  <div className="text-khalifa-steel/70 text-xs mb-3">
    Optional daily quests and dungeons. Off by default — just log what you did.
  </div>
  <button
    onClick={() => setState((prev) => ({
      ...prev,
      guidedMode: { enabled: !prev.guidedMode?.enabled, lastQuestDate: prev.guidedMode?.lastQuestDate || null },
    }))}
    className={`px-4 py-2 rounded-lg text-sm font-orbitron border ${
      guidedEnabled ? 'border-khalifa-gold/60 text-khalifa-gold bg-khalifa-gold/10' : 'border-khalifa-steel/30 text-khalifa-steel'
    }`}
  >
    {guidedEnabled ? 'GUIDED: ON' : 'GUIDED: OFF'}
  </button>
</div>
```

- [ ] **Step 7: Build to confirm integration compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Smoke-check via the dev server**

Run: `npm run dev`
Open the app, confirm: the **Log** tab loads first; typing "100 push-ups, prayed Fajr, studied AI 30 min" and clicking LOG awards XP and updates the header; Settings shows the GUIDED MODE toggle; toggling it on reveals the Guided + Dungeons tabs. Stop the dev server (`Ctrl-C`) when done.

- [ ] **Step 9: Run the full test suite**

Run: `npx vitest run`
Expected: all test files PASS (no regressions from the App.jsx integration).

- [ ] **Step 10: Commit**

```bash
git add src/App.jsx
git commit -m "feat: Log is home; quests/dungeons gated behind Guided Mode toggle

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: update CLAUDE.md and finalize

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Correct the stale facts in CLAUDE.md**

In `CLAUDE.md`, make these corrections (find each existing line and update it in place — do not append a duplicate):

1. The rank-threshold table: replace any "E 1-5 / D 6-15 / C 16-30 / B 31-50 / A 51-75 / S 76+" table with the verified values:
   `E 0-10, D 11-25, C 26-45, B 46-70, A 71-99, S 100-999` (xpMultiplier E 1.0 / D 1.3 / C 1.6 / B 2.0 / A 2.5 / S 3.0; statPointsPerLevel 1/2/3/4/5/6).

2. The AI-key note: remove any claim of a `DEFAULT_API_KEY_B64` / base64-decoded key. Replace with:
   `AI calls route via src/services/aiAssistant.js. When getApiKey() returns '' (no sk- key in localStorage), requests go to the /api/forge-master proxy. Never hardcode keys.`

3. Add a short "v8 Listen & Level" section describing the new modules:
   `Log flow: useVoiceLog (Web Speech) or text -> parseActivities (crisis scan + AI parse + catalog pin) -> awardActivities (deterministic XP: catalog/effort base -> getEffectiveXp rank scale -> applyStatModifiers -> getActivityStreakBonus -> flowState -> weekly focus). Per-activity streaks in state.activities. Guided Mode (state.guidedMode.enabled) toggles optional quests/dungeons.`

- [ ] **Step 2: Run the full test suite**

Run: `npx vitest run`
Expected: all test files PASS.

- [ ] **Step 3: Final build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: correct rank thresholds/AI-key notes and document Listen & Level v8

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Self-Review Notes (read before executing)

**Spec coverage:** Spec §6 XP formula → Task 3 (`awardActivities`: base→rank→stat→streak→flow→focus, cap, gold). §5.3 streak-before-bonus → `updateActivityStreak` runs before the bonus read in Task 3. §7 per-activity streak ledger + Never-Miss-Twice + tiers 7/30/90/180/365 → Task 3 + tests. §8 error handling (crisis→safety+no XP, AI fail→pendingLogs, malformed→retry, empty→notice, daily cap→0 XP) → Tasks 5 + 8. §9 Guided Mode toggle + optional quests → Task 9. §4 module boundaries → File Structure. §14 implementation order → Tasks 1-10 in order. §10 schema v8 deprecation (keep fields one cycle, drop mission-gate cap + SP awarding) → Task 7 + Task 1.

**Placeholder scan:** No "TBD"/"TODO" steps. Task 9 Step 5 references an existing Monday-detection expression by intent rather than copying unknown code — it instructs the implementer to reuse the existing expression verbatim; this is a locate-and-reuse instruction with concrete guard code, not a placeholder.

**Type consistency:** `getActivityStreakBonus` returns `{ multiplier, label }` (Task 1) — used as `bonus.multiplier` in Task 3 and `bonus.label` in Task 8. `awardActivities(state, activities, today)` (Task 3) — called with `(prev, result.activities, today)` in Task 8. `parseActivities` returns `{ crisis, activities, error?, message?, raw? }` (Task 5) — destructured identically in Task 8. `checkFlowState(history, rankKey)` (Task 1) — called with `(next.history, rank.key)` in Task 8. `guidedMode` shape `{ enabled, lastQuestDate }` (Task 7) — read in Tasks 9 and written by the toggle in Task 9. `state.activities[key]` fields match across Task 3 (writer) and Task 8 (reader).