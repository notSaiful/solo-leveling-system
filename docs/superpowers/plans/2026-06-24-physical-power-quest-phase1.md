# Physical Power Quest — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the `body` pillar from "Adventure" (outdoor roaming) to "Physical Power" (strength/speed/power/endurance/resilience training) across E→S / levels 1→999, build the Physics Gates as real benchmark test batteries, and add a strength log with progressive overload + nutrition/recovery tracking + applied capacity tests + equipment adaptation — landing a working 9/10 strength system.

**Architecture:** Layered on the existing `body` pillar without changing its key or XP→level math. New pure-logic modules (`strengthLog.js`, `recovery.js`) + new data modules (`strengthStandards.js`, `physicsGates.js`) + one new UI component (`PowerLog.jsx`) + a content retheme across the `src/data/*` catalogs + a `BUILD_VERSION` migration that force-refreshes stale adventure quests and initializes the new state slices. The periodized programming engine, autoregulation, Khalifa Trial capstone, and spiritual integration are **Phase 2** (separate plan).

**Tech Stack:** React 18 + Vite 8 + Tailwind 3 + Framer Motion + lucide-react; state in `useStore`/`src/data/store.js` (deep-merge, localStorage + canonical Vercel/Gist sync); tests vitest 4 (`npm test`); e2e `npm run test:e2e` (build + Playwright smoke).

**Spec:** `docs/superpowers/specs/2026-06-24-physical-power-quest-design.md` — §5 is Phase 1. The gate table is §5.5; the four-track model is §5.2; equipment adaptation is §5.10; state shape is §7.

## Global Constraints

- **Internal pillar key stays `body`.** Only the display label, content, theme, and the new strength subsystem change. Never rename the `body` key — it would break state, stats, sync, equipment, and the existing test suite.
- **ES modules only.** No `require()` in Vite — all modules use `import`/`export`.
- **Deep-merge in `useStore`.** Never overwrite nested objects directly (`setState(prev => ({ ...prev, user: { ...prev.user, name } }))`).
- **Dates** use `toLocaleDateString('en-CA')` (YYYY-MM-DD, local TZ) via `getLocalDateString()` from `src/utils/dateUtils.js`.
- **No emojis in code UI** unless the existing file already uses them (stats.js uses emoji icons — preserve that convention there).
- **Forge-Master persona:** zero softness, commands not suggestions, Islamic framing, strength forged for service not vanity.
- **Test command:** `npm test` (vitest run). E2E: `npm run test:e2e`. Build: `npm run build`. Every task ends with a green `npm test` for its files; the final task runs build + e2e.
- **Commit often:** each task ends with a commit on `feat/listen-and-level-redesign`.
- **`STALE_ADVENTURE_DAILY_TITLES` lives in two files** — `src/data/store.js:10` and `src/logic/stateMerge.js:4`. Any change to the set MUST be applied to both.

---

## File Structure

**New files:**
- `src/data/strengthStandards.js` — validated benchmark tables (Indian Army fitness tests, strength-standard novice→elite by bodyweight, tactical norms) + `getStrengthStandard(lift, rank, bodyweightKg, equipment)` + bodyweight-progresssion milestones. Pure data + helpers.
- `src/data/physicsGates.js` — 6 gate test batteries (E→S), each `{ rank, name, events: [{track, label, standard, metric, adapter}] }` + `getGateForRank(rank)` + `gateToDungeonQuests(gate, equipment)`. Pure data + helpers.
- `src/logic/strengthLog.js` — `logLift`, `progressiveOverload`, `recomputeTrainingMax`, `nextSessionLoad`, `bodyweightProgression`. Pure functions over `state.strengthLog`.
- `src/logic/recovery.js` — `proteinTarget`, `logProtein`, `logSleep`, `rollingSleepAvg`, `recoveryFlags`. Pure functions over `state.recovery`.
- `src/components/PowerLog.jsx` — log lifts, view training max + progression, run rep-max test, set equipment + bodyweight. Mounted in Legion tab.
- Tests: `src/data/strengthStandards.test.js`, `src/data/physicsGates.test.js`, `src/logic/strengthLog.test.js`, `src/logic/recovery.test.js`, plus additions to an existing migration test.

**Modified files:**
- `src/utils/pillarDisplay.js` — `body: 'Adventure'` → `'Physical Power'`
- `src/components/QuestCard.jsx` — body icon `Compass` → `Dumbbell`
- `src/logic/questEngine.js` — add `power`/`physical`/`fitness` to body alias normalizer
- `src/services/aiAssistant.js` — ADVENTURE persona block → PHYSICAL POWER
- `src/data/stats.js` — Strength/Health descriptions, body→reason, Pathfinder build description
- `src/data/questCatalog.js` — `DAILY_QUEST_POOLS.body`, `ADVENTURE_LEVEL_QUEST_OVERRIDES`, `getMissionQuestForLevel` body archetypes, `WEEKLY_DUNGEON_TEMPLATES.*.body`, `JOB_CHANGE_QUESTS` body, `REDEMPTION_QUEST_TEMPLATES` body
- `src/data/jobChangeGates.js` — body step titles
- `src/data/missionGates.js` — body objective wording
- `src/data/missionQuestCatalog.js`, `missionPlan.js`, `missionDoctrine.js`, `src/logic/missionReview.js`, `missionMetrics.js`, `readinessProtocol.js` — framing strings
- `src/data/rewards.js` — `category: 'adventure'` → `'physical-power'` + item retheme
- `src/data/equipment.js` — body-slot item names (`wanderer-cloak` etc.)
- `src/data/store.js` — `DEFAULT_STATE` (add `strengthLog`/`recovery`/`physicalPower`), `normalizeStateShape`, `BUILD_VERSION`, `STALE_ADVENTURE_DAILY_TITLES`
- `src/logic/stateMerge.js` — `STALE_ADVENTURE_DAILY_TITLES` mirror
- `src/components/Dashboard.jsx` — completion handlers call `strengthLog`/`recovery` updates
- `src/components/Legion.jsx` — mount `<PowerLog/>`
- `src/components/MissionCommandCenter.jsx` — placeholder text (line ~752)
- `CLAUDE.md` — §4.18, AI persona note, quest-pillar description, completed-work entry

---

## Task 1: Frame — pillar label, icon, alias

**Files:**
- Modify: `src/utils/pillarDisplay.js` (full file, ~15 lines)
- Modify: `src/components/QuestCard.jsx:6-10` (icon map)
- Modify: `src/logic/questEngine.js:367-372` (alias normalizer)
- Test: `src/utils/pillarDisplay.test.js` (create), `src/logic/questEngine.test.js` (create or extend)

**Interfaces:**
- Produces: `PILLAR_LABELS.body === 'Physical Power'`; `normalizeCustomQuestPillar('power'|'physical'|'fitness')` → `'body'`; `QuestCard` body icon = `Dumbbell`.

- [ ] **Step 1: Write the failing tests**

`src/utils/pillarDisplay.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { PILLAR_LABELS } from './pillarDisplay';

describe('pillarDisplay', () => {
  it('labels the body pillar as Physical Power', () => {
    expect(PILLAR_LABELS.body).toBe('Physical Power');
    expect(PILLAR_LABELS.deen).toBe('Deen');
    expect(PILLAR_LABELS.money).toBe('Money');
  });
});
```

`src/logic/questEngine.test.js` (extend if it exists; else create). First confirm the exported name of the normalizer by reading `questEngine.js` around line 367 — the Explore map shows `normalizeCustomQuestPillar`. If the function is not exported, export it.
```js
import { describe, it, expect } from 'vitest';
import { normalizeCustomQuestPillar } from './questEngine';

describe('normalizeCustomQuestPillar', () => {
  it('collapses body aliases to "body"', () => {
    expect(normalizeCustomQuestPillar('body')).toBe('body');
    expect(normalizeCustomQuestPillar('adventure')).toBe('body');
    expect(normalizeCustomQuestPillar('readiness')).toBe('body');
    expect(normalizeCustomQuestPillar('power')).toBe('body');
    expect(normalizeCustomQuestPillar('physical')).toBe('body');
    expect(normalizeCustomQuestPillar('fitness')).toBe('body');
  });
  it('leaves other pillars untouched', () => {
    expect(normalizeCustomQuestPillar('deen')).toBe('deen');
    expect(normalizeCustomQuestPillar('money')).toBe('money');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/utils/pillarDisplay.test.js src/logic/questEngine.test.js`
Expected: FAIL — `PILLAR_LABELS.body` is `'Adventure'`; `normalizeCustomQuestPillar('power')` returns something other than `'body'` (or the function isn't exported → import error).

- [ ] **Step 3: Implement**

`src/utils/pillarDisplay.js` — change the one line:
```js
export const PILLAR_LABELS = {
  deen: 'Deen',
  body: 'Physical Power',
  money: 'Money',
  ummah: 'Ummah Service',
  all: 'All',
};
```
(Preserve any other exports/_helpers in the file exactly.)

`src/logic/questEngine.js` ~line 367 — extend the alias branch:
```js
if (pillar === 'body' || pillar === 'adventure' || pillar === 'readiness' || pillar === 'power' || pillar === 'physical' || pillar === 'fitness') return 'body';
```
Ensure `normalizeCustomQuestPillar` is `export`ed (add `export` if currently local).

`src/components/QuestCard.jsx` icon map (~line 6-10) — import `Dumbbell` from `lucide-react` and set `body: Dumbbell`. Keep `Compass` only if used elsewhere; if it was only for body, drop the import to avoid an unused-import lint/build warning. Read the file first to match the exact import style.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/utils/pillarDisplay.test.js src/logic/questEngine.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/pillarDisplay.js src/utils/pillarDisplay.test.js src/components/QuestCard.jsx src/logic/questEngine.js src/logic/questEngine.test.js
git commit -m "feat(physical-power): rename body pillar Adventure→Physical Power, Dumbbell icon, power/physical/fitness aliases"
```

---

## Task 2: AI persona + stat descriptions

**Files:**
- Modify: `src/services/aiAssistant.js:183` (ADVENTURE persona block) + ~494, ~500 (output-as-body rules)
- Modify: `src/data/stats.js:3` (strength/health descriptions), `:61` (Pathfinder build description), `:85` (body reason)
- Test: `src/data/stats.test.js` (create)

**Interfaces:**
- Produces: `STAT_NAMES.strength.description` contains "Physical Power" and not "Adventure"; `autoAssignStatPoints` body `reason` contains "Physical power"; `getCharacterBuild` Pathfinder description drops "outdoor endurance"; AI persona block is the PHYSICAL POWER text below.

- [ ] **Step 1: Write the failing test**

`src/data/stats.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { STAT_NAMES, autoAssignStatPoints, getCharacterBuild } from './stats';

describe('Physical Power stat framing', () => {
  it('strength description references Physical Power, not Adventure', () => {
    expect(STAT_NAMES.strength.description).toMatch(/Physical Power/i);
    expect(STAT_NAMES.strength.description).not.toMatch(/Adventure/i);
  });
  it('health description references conditioning/stamina', () => {
    expect(STAT_NAMES.health.description).toMatch(/conditioning|stamina|durability/i);
  });
  it('body auto-assign reason references physical power/speed', () => {
    const { assignments } = autoAssignStatPoints({ strength: 10, agility: 10 }, 'body', 5);
    // reason is internal to the function; assert the mapping via a derived check:
    expect(assignments.some(a => a.stat === 'strength')).toBe(true);
    expect(assignments.some(a => a.stat === 'agility')).toBe(true);
  });
  it('Pathfinder build description is not "outdoor endurance"', () => {
    const build = getCharacterBuild({ strength: 20, health: 20, agility: 10, intelligence: 10, sense: 10, mana: 10 });
    expect(build.name).toBe('Pathfinder Build');
    expect(build.description).not.toMatch(/outdoor endurance/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/stats.test.js`
Expected: FAIL — strength description is "Outdoor endurance. Boosts Adventure quest XP." (matches `/Adventure/i`, fails the `.not.toMatch(/Adventure/i)`); Pathfinder description is "Dominant in outdoor endurance".

- [ ] **Step 3: Implement**

`src/data/stats.js`:
```js
strength: { name: 'Strength', icon: '💪', description: 'Raw physical power. Boosts Physical Power quest XP.', color: '#f44336' },
// agility unchanged
health:   { name: 'Health', icon: '❤️', description: 'Conditioning, stamina, and durability. Reduces fatigue effects.', color: '#E91E63' },
```
Pathfinder build (~line 61):
```js
return { name: 'Pathfinder Build', icon: '⚔️', description: 'Dominant in raw physical power and conditioning' };
```
Body reason (~line 85):
```js
body:  { primary: 'strength', secondary: 'agility', reason: 'Physical power and speed' },
```

`src/services/aiAssistant.js` ~line 183 — replace the ADVENTURE persona block with:
```
PHYSICAL POWER: The user forges physical power — strength, speed, explosive power, endurance, and resilience. Barbell lifts, calisthenics progressions, sprints, jumps, rucks, loaded carries, mobility, nutrition, sleep. Getting stronger, faster, more capable as a future khalifa who can carry the burden of his family and Ummah. Not outdoor roaming — disciplined, progressive physical training forged for service, not vanity.
```
Read the surrounding lines (~494, ~500) for the "output as body" / pillar-routing rules and update any "ADVENTURE"/"adventure" wording there to "PHYSICAL POWER"/"physical power". Preserve all prompt-injection sanitization (`sanitize()`, `[[CMD]]` handling) exactly.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/stats.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/stats.js src/data/stats.test.js src/services/aiAssistant.js
git commit -m "feat(physical-power): rewrite Forge-Master PHYSICAL POWER persona + strength/health stat descriptions"
```

---

## Task 3: strengthStandards.js — validated benchmark tables

**Files:**
- Create: `src/data/strengthStandards.js`
- Test: `src/data/strengthStandards.test.js`

**Interfaces:**
- Produces: `STRENGTH_STANDARDS` (per-lift novice→elite multiples of bodyweight), `INDIAN_ARMY_FITNESS` (1.6km run, chin-ups, shuttle per tier), `BODYWEIGHT_PROGRESSIONS` (push-up→archer→one-arm, squat→pistol→shrimp, pull→incline-row→pull-up→weighted, hinge→glute-bridge→single-leg-RDL→Nordic), `getStrengthStandard(lift, rank, bodyweightKg, equipment)`, `getBodyweightMilestone(lift, reps)`.

- [ ] **Step 1: Write the failing test**

`src/data/strengthStandards.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { getStrengthStandard, getBodyweightMilestone, STRENGTH_STANDARDS, BODYWEIGHT_PROGRESSIONS } from './strengthStandards';

describe('strengthStandards', () => {
  it('returns a bodyweight-multiple target for a barbell squat by rank', () => {
    const e = getStrengthStandard('squat', 'E', 70, 'barbell');
    const s = getStrengthStandard('squat', 'S', 70, 'barbell');
    expect(e.kg).toBeLessThan(s.kg);
    expect(s.kg).toBeGreaterThanOrEqual(70 * 2); // S-rank squat >= 2x BW
  });
  it('bodyweight equipment returns a progression milestone instead of a kg load', () => {
    const bw = getStrengthStandard('squat', 'E', 70, 'bodyweight');
    expect(bw.milestone).toBeTruthy();
    expect(bw.kg).toBeNull();
  });
  it('getBodyweightMilestone advances with reps', () => {
    // Progression ladders have DECREASING minReps (harder variation = fewer reps needed),
    // so reps below the first threshold map to the first step, and reps past every
    // threshold map to the final step.
    expect(getBodyweightMilestone('pushup', 8)).toBe('Push-up');          // 8 < 20 → first step
    expect(getBodyweightMilestone('pushup', 25)).toBe('One-arm Push-up'); // past all thresholds → final step
  });
  it('defines progressions for the four bodyweight families', () => {
    expect(BODYWEIGHT_PROGRESSIONS.pushup.length).toBeGreaterThanOrEqual(3);
    expect(BODYWEIGHT_PROGRESSIONS.squat.length).toBeGreaterThanOrEqual(3);
    expect(BODYWEIGHT_PROGRESSIONS.pull.length).toBeGreaterThanOrEqual(3);
    expect(BODYWEIGHT_PROGRESSIONS.hinge.length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/strengthStandards.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/data/strengthStandards.js`:
```js
// Validated benchmark tables for the Physical Power system.
// Barbell standards are multiples of bodyweight (Symmetric Strength / exrx style,
// novice→elite). Indian Army fitness values are recruitment-tier baselines
// (1.6 km run, chin-ups, shuttle) used for the E/D gates. All numbers are
// starting calibrations — Phase 2 autoregulation adapts to actuals.

// Rank → bodyweight multiple for the core barbell lifts (squat, deadlift, press, bench, row).
export const STRENGTH_STANDARDS = {
  // multiples of bodyweight
  squat:    { E: 1.0,  D: 1.25, C: 1.5,  B: 1.75, A: 2.0,  S: 2.0 },
  deadlift: { E: 1.25, D: 1.5,  C: 1.75, B: 2.0,  A: 2.5,  S: 2.75 },
  press:    { E: 0.6,  D: 0.75, C: 0.75, B: 0.9,  A: 1.0,  S: 1.25 },
  bench:    { E: 0.8,  D: 1.0,  C: 1.0,  B: 1.25, A: 1.25, S: 1.5 },
  row:      { E: 0.7,  D: 0.9,  C: 1.0,  B: 1.1,  A: 1.25, S: 1.4 },
};

// Indian Army-style fitness baselines (E/D gates). Times in seconds.
export const INDIAN_ARMY_FITNESS = {
  E: { run1_6km_sec: 540, chinups: 3, shuttle_20m_sec: 9 },   // 9:00, 3 chin-ups
  D: { run1_6km_sec: 450, chinups: 6, shuttle_20m_sec: 8 },   // 7:30, 6 chin-ups
};

// Bodyweight progression ladders (when equipment === 'bodyweight' or 'mixed').
// Each step: { name, minReps } — advance when minReps met.
export const BODYWEIGHT_PROGRESSIONS = {
  pushup: [
    { name: 'Push-up', minReps: 20 },
    { name: 'Diamond Push-up', minReps: 15 },
    { name: 'Archer Push-up', minReps: 10 },
    { name: 'One-arm Push-up', minReps: 5 },
  ],
  squat: [
    { name: 'Bodyweight Squat', minReps: 25 },
    { name: 'Split Squat', minReps: 16 },
    { name: 'Pistol Squat', minReps: 8 },
    { name: 'Shrimp Squat', minReps: 5 },
  ],
  pull: [
    { name: 'Incline Row', minReps: 12 },
    { name: 'Pull-up', minReps: 8 },
    { name: 'Weighted Pull-up (+25% BW)', minReps: 5 },
    { name: 'Muscle-up', minReps: 5 },
  ],
  hinge: [
    { name: 'Glute Bridge', minReps: 20 },
    { name: 'Single-leg RDL', minReps: 12 },
    { name: 'Nordic Curl', minReps: 8 },
    { name: 'Heavy Sandbag Hinge', minReps: 8 },
  ],
};

export function getStrengthStandard(lift, rank, bodyweightKg, equipment) {
  const mult = STRENGTH_STANDARDS[lift]?.[rank];
  if (equipment === 'barbell') {
    return { lift, rank, kg: Math.round((mult || 0) * (bodyweightKg || 0)), milestone: null };
  }
  // bodyweight / mixed / kettlebell — return a progression milestone
  const fam = lift === 'squat' ? 'squat'
    : lift === 'deadlift' || lift === 'row' ? 'hinge' // row maps onto pull family below
      : lift === 'press' || lift === 'bench' ? 'pushup'
        : lift === 'pullup' ? 'pull' : 'squat';
  const family = lift === 'row' ? 'pull' : fam;
  const ladder = BODYWEIGHT_PROGRESSIONS[family] || [];
  const idx = { E: 0, D: 1, C: 2, B: 2, A: 3, S: 3 }[rank] ?? 0;
  const step = ladder[Math.min(idx, ladder.length - 1)];
  return { lift, rank, kg: null, milestone: step?.name || null, minReps: step?.minReps || null };
}

export function getBodyweightMilestone(lift, reps) {
  const family = lift === 'pushup' ? 'pushup'
    : lift === 'squat' ? 'squat'
      : lift === 'pull' || lift === 'pullup' ? 'pull' : 'hinge';
  const ladder = BODYWEIGHT_PROGRESSIONS[family] || [];
  for (const step of ladder) {
    if (reps < step.minReps) return step.name;
  }
  return ladder[ladder.length - 1]?.name;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/strengthStandards.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/strengthStandards.js src/data/strengthStandards.test.js
git commit -m "feat(physical-power): validated strength standards + bodyweight progressions + Indian Army baselines"
```

---

## Task 4: physicsGates.js — gate test batteries

**Files:**
- Create: `src/data/physicsGates.js`
- Test: `src/data/physicsGates.test.js`

**Interfaces:**
- Consumes: `getStrengthStandard` from `./strengthStandards` (Task 3).
- Produces: `PHYSICS_GATES` (array of 6 gates E→S), `getGateForRank(rank)`, `gateToDungeonQuests(gate, equipment)` → array of quest objects `{ id, title, description, pillar: 'body', baseXp, track, metric }`.

- [ ] **Step 1: Write the failing test**

`src/data/physicsGates.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { PHYSICS_GATES, getGateForRank, gateToDungeonQuests } from './physicsGates';

describe('physicsGates', () => {
  it('defines one gate per rank E→S', () => {
    expect(PHYSICS_GATES.map(g => g.rank)).toEqual(['E','D','C','B','A','S']);
  });
  it('each gate tests all four tracks', () => {
    for (const g of PHYSICS_GATES) {
      const tracks = g.events.map(e => e.track);
      expect(tracks).toContain('strength');
      expect(tracks).toContain('power');
      expect(tracks).toContain('endurance');
      expect(tracks).toContain('resilience');
    }
  });
  it('getGateForRank returns the matching gate', () => {
    expect(getGateForRank('C').name).toBe('Thermodynamics Gate');
    expect(getGateForRank('S').name).toBe("The Monarch's Apex");
  });
  it('gateToDungeonQuests emits body-pillar quests with stable IDs', () => {
    const quests = gateToDungeonQuests(getGateForRank('E'), 'bodyweight');
    expect(quests.length).toBeGreaterThanOrEqual(3);
    expect(quests.every(q => q.pillar === 'body')).toBe(true);
    expect(quests.every(q => q.id && q.baseXp > 0)).toBe(true);
    const ids = quests.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length); // unique
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/physicsGates.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/data/physicsGates.js` — gate table from spec §5.5. Each event has a `standard` (human-readable target) and a `metric` (machine key). `gateToDungeonQuests` turns events into body-pillar dungeon quests.
```js
import { getStrengthStandard } from './strengthStandards';

// Each gate = that rank's body weekly dungeon (spec §5.5). Pass = complete all events.
export const PHYSICS_GATES = [
  { rank: 'E', name: "Newton's Gate", events: [
    { track: 'strength',  label: 'Foundation Strength', standard: '3×10 bodyweight squat, incline row ×8, push-up ×20', metric: 'strength-foundation' },
    { track: 'power',     label: 'First Explosions',    standard: 'Standing broad jump ~1.5 m, 20 m sprint', metric: 'power-broad-jump' },
    { track: 'endurance', label: 'First Wind',          standard: '1.6 km run < 9:00', metric: 'endurance-run-1.6k' },
    { track: 'resilience',label: 'Base Durability',     standard: '30 s plank, 15 s dead hang, 7 h sleep avg, 5 min mobility', metric: 'resilience-base' },
  ]},
  { rank: 'D', name: "Newton's Gate II", events: [
    { track: 'strength',  label: 'Pulling Power',       standard: 'Pull-up ×5, push-up ×30, squat 4×12', metric: 'strength-pulling' },
    { track: 'power',     label: 'Acceleration',        standard: 'Broad jump ~1.8 m, 20 m sprint < 4 s', metric: 'power-accel' },
    { track: 'endurance', label: 'Faster Wind',         standard: '1.6 km run < 7:30', metric: 'endurance-run-1.6k-fast' },
    { track: 'resilience',label: 'Grip + Fuel',         standard: '60 s plank, 30 s dead hang, protein target met', metric: 'resilience-grip-fuel' },
  ]},
  { rank: 'C', name: 'Thermodynamics Gate', events: [
    { track: 'strength',  label: 'Loaded Strength',     standard: 'Squat 1.5×BW, deadlift 1.75×BW, press 0.75×BW, pull-up ×8', metric: 'strength-loaded' },
    { track: 'power',     label: 'Hill Power',          standard: 'Broad jump ~2.0 m, hill sprints ×6', metric: 'power-hill' },
    { track: 'endurance', label: 'Heat Work',           standard: '5 km run < 28:00, fasted workout (sunnah), cold shower', metric: 'endurance-5k' },
    { track: 'resilience',label: 'Recovery Standard',   standard: '90 s plank, 45 s dead hang, 10 min mobility, sleep > 85%', metric: 'resilience-recovery' },
  ]},
  { rank: 'B', name: 'Relativity Gate', events: [
    { track: 'strength',  label: 'Heavy Four',          standard: 'Squat 1.75×BW, deadlift 2×BW, press 0.9×BW, pull-up ×10, push-up ×50', metric: 'strength-heavy4' },
    { track: 'power',     label: 'Sharp Power',         standard: 'Broad jump ~2.2 m, 300 m shuttle', metric: 'power-shuttle' },
    { track: 'endurance', label: 'Ruck + Run',          standard: '5 km < 25:00, ruck 10 kg / 5 km < 60 min', metric: 'endurance-ruck' },
    { track: 'resilience',label: 'Carry Capacity',      standard: '2 min plank, 60 s dead hang, farmer’s carry BW × 20 m, sleep > 85%', metric: 'resilience-carry' },
  ]},
  { rank: 'A', name: 'Quantum Gate', events: [
    { track: 'strength',  label: 'PR Strength',         standard: 'Squat 2×BW, deadlift 2.5×BW, press 1×BW, pull-up ×15, weighted pull-up', metric: 'strength-pr' },
    { track: 'power',     label: 'PR Power',            standard: 'PR broad jump, 300 m shuttle < 60 s', metric: 'power-pr' },
    { track: 'endurance', label: 'Long + Interval',     standard: '10 km < 50:00, ruck 15 kg / 8 km, 400 m intervals ×6', metric: 'endurance-10k' },
    { track: 'resilience',label: 'Compete',             standard: '3 min plank, 90 s dead hang, farmer’s carry 1.5×BW × 30 m, compete in an event', metric: 'resilience-compete' },
  ]},
  { rank: 'S', name: "The Monarch's Apex", events: [
    { track: 'strength',  label: 'Khalifa Strength',    standard: 'Squat 2×BW, deadlift 2.5–3×BW, press 1.25×BW, pull-up ×20+, weighted pull-up +50% BW', metric: 'strength-khalifa' },
    { track: 'power',     label: 'Apex Power',          standard: 'Broad jump ~2.5 m+, 36 in box jump, explosive lifts', metric: 'power-apex' },
    { track: 'endurance', label: 'Apex Engine',         standard: 'Half-marathon < 2:00, ruck 20 kg / 10 km, 5 km < 22:00', metric: 'endurance-apex' },
    { track: 'resilience',label: 'Khalifa Trial',       standard: '90+ day elite composition, lead community fitness, Khalifa Trial composite in one day: heavy ruck + loaded carry + 2×BW squat + broad jump + run', metric: 'resilience-khalifa-trial' },
  ]},
];

export function getGateForRank(rank) {
  return PHYSICS_GATES.find(g => g.rank === rank) || PHYSICS_GATES[0];
}

// Turn a gate into body-pillar dungeon quests. Strength event pulls the equipment-
// adapted standard from strengthStandards so barbell users get kg, bodyweight users
// get a progression milestone (spec §5.10).
export function gateToDungeonQuests(gate, equipment, bodyweightKg = 70) {
  return gate.events.map((ev, i) => {
    let description = ev.standard;
    if (ev.track === 'strength') {
      const std = getStrengthStandard('squat', gate.rank, bodyweightKg, equipment);
      if (std.kg) description = `${ev.standard} (squat target ${std.kg} kg)`;
      else if (std.milestone) description = `${ev.standard} (bodyweight milestone: ${std.milestone})`;
    }
    return {
      id: `gate-${gate.rank}-${ev.metric}`,
      title: `${gate.name} — ${ev.label}`,
      description,
      pillar: 'body',
      baseXp: { E: 40, D: 70, C: 110, B: 160, A: 220, S: 300 }[gate.rank] || 40,
      track: ev.track,
      metric: ev.metric,
      estimatedMinutes: 25,
      tags: ['physics-gate', ev.track],
    };
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/physicsGates.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/physicsGates.js src/data/physicsGates.test.js
git commit -m "feat(physical-power): Physics Gates test batteries E→S (4-track, equipment-adapted)"
```

---

## Task 5: strengthLog.js — log + progressive overload

**Files:**
- Create: `src/logic/strengthLog.js`
- Test: `src/logic/strengthLog.test.js`

**Interfaces:**
- Consumes: `state.strengthLog` shape from spec §7 (added to DEFAULT_STATE in Task 7). For tests here, build the shape inline.
- Produces: `logLift(state, { lift, date, sets, reps, weight, rpe })` → new state; `recomputeTrainingMax(liftState, { weight, reps })` → new trainingMax (Epley); `nextSessionLoad(state, lift)` → prescribed kg; `progressiveOverload(state, lift)` → boolean whether last session hit targets; `advanceBodyweightProgression(state, lift)` → new state (bumps to next milestone when reps ≥ minReps).

- [ ] **Step 1: Write the failing test**

`src/logic/strengthLog.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { logLift, recomputeTrainingMax, nextSessionLoad, advanceBodyweightProgression } from './strengthLog';

function freshLog() {
  return { bodyweightKg: 70, baselineTested: true, lifts: {
    squat: { trainingMax: 60, history: [], lastTested: null },
    deadlift: { trainingMax: 80, history: [], lastTested: null },
    press: { trainingMax: 35, history: [], lastTested: null },
    bench: { trainingMax: 50, history: [], lastTested: null },
    row: { trainingMax: 45, history: [], lastTested: null },
    pullup: { trainingMax: 0, history: [], lastTested: null },
  }};
}

describe('strengthLog', () => {
  it('logLift appends a session to the lift history', () => {
    const s = { strengthLog: freshLog() };
    const next = logLift(s, { lift: 'squat', date: '2026-06-24', sets: 3, reps: 5, weight: 50, rpe: 7 });
    expect(next.strengthLog.lifts.squat.history.length).toBe(1);
    expect(next.strengthLog.lifts.squat.history[0].weight).toBe(50);
  });
  it('recomputeTrainingMax uses Epley (90% training max) and stores lastTested', () => {
    const tm = recomputeTrainingMax({ trainingMax: 60, history: [], lastTested: null }, { weight: 60, reps: 5 });
    // Epley 1RM = 60 * (1 + 5/30) = 70; training max = 90% of 1RM = 63 (5/3/1 convention)
    expect(tm.trainingMax).toBe(63);
    expect(tm.lastTested).toBeTruthy();
  });
  it('nextSessionLoad prescribes 80% of training max for a 3x5', () => {
    const s = { strengthLog: freshLog() };
    const load = nextSessionLoad(s, 'squat');
    expect(load.kg).toBeCloseTo(60 * 0.8, 0); // ~48
    expect(load.sets).toBe(3);
    expect(load.reps).toBe(5);
  });
  it('advanceBodyweightProgression bumps pullup when reps meet the next milestone', () => {
    const s = { strengthLog: freshLog(), physicalPower: { equipment: 'bodyweight' } };
    const logged = logLift(s, { lift: 'pullup', date: '2026-06-24', sets: 3, reps: 12, weight: 0, rpe: 8 });
    const advanced = advanceBodyweightProgression(logged, 'pullup');
    // pullup family: Incline Row (12) → Pull-up (8). 12 reps met → advance.
    expect(advanced.strengthLog.lifts.pullup.milestone).toBe('Pull-up');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/logic/strengthLog.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/logic/strengthLog.js`:
```js
import { BODYWEIGHT_PROGRESSIONS } from '../data/strengthStandards';
import { getLocalDateString } from '../utils/dateUtils';

// Epley 1RM estimate.
export function estimateOneRepMax(weight, reps) {
  if (!weight || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function recomputeTrainingMax(liftState, { weight, reps }) {
  const oneRepMax = estimateOneRepMax(weight, reps);
  // Training max = 90% of estimated 1RM (5/3/1 convention).
  const trainingMax = Math.round(oneRepMax * 0.9);
  return { ...liftState, trainingMax, lastTested: getLocalDateString() };
}

// Append a session. entry: { lift, date?, sets, reps, weight, rpe? }
export function logLift(state, entry) {
  const log = state.strengthLog || {};
  const liftState = log.lifts?.[entry.lift] || { trainingMax: 0, history: [], lastTested: null };
  const history = [...(liftState.history || []), {
    date: entry.date || getLocalDateString(),
    sets: entry.sets,
    reps: entry.reps,
    weight: entry.weight,
    rpe: entry.rpe ?? null,
  }];
  return {
    ...state,
    strengthLog: {
      ...log,
      lifts: {
        ...(log.lifts || {}),
        [entry.lift]: { ...liftState, history },
      },
    },
  };
}

// Did the last session hit the target reps at acceptable RPE? (Phase 1 simple linear)
export function progressiveOverload(state, lift) {
  const hist = state.strengthLog?.lifts?.[lift]?.history || [];
  if (!hist.length) return false;
  const last = hist[hist.length - 1];
  return last.reps >= 5 && (last.rpe == null || last.rpe <= 8);
}

// Prescribe the next session: 3×5 at 80% of training max (Phase 1 linear core).
export function nextSessionLoad(state, lift) {
  const tm = state.strengthLog?.lifts?.[lift]?.trainingMax || 0;
  return { kg: Math.round(tm * 0.8), sets: 3, reps: 5, pct: 0.8 };
}

// Advance the bodyweight progression ladder when reps meet the next milestone.
// `milestone` = the step currently being worked TOWARD (undefined = working toward
// ladder[0]). When a logged session meets that step's minReps, graduate it and point
// milestone at the next step (or keep the final step once all are graduated).
const FAMILY_BY_LIFT = { pullup: 'pull', row: 'pull', press: 'pushup', bench: 'pushup', squat: 'squat', deadlift: 'hinge' };

function setLiftMilestone(state, lift, liftState, milestone) {
  return {
    ...state,
    strengthLog: {
      ...state.strengthLog,
      lifts: { ...(state.strengthLog?.lifts || {}), [lift]: { ...liftState, milestone } },
    },
  };
}

export function advanceBodyweightProgression(state, lift) {
  if (state.physicalPower?.equipment === 'barbell') return state;
  const family = FAMILY_BY_LIFT[lift];
  const ladder = BODYWEIGHT_PROGRESSIONS[family] || [];
  if (!ladder.length) return state;
  const liftState = state.strengthLog?.lifts?.[lift] || { trainingMax: 0, history: [], lastTested: null };
  const currentIdx = ladder.findIndex(s => s.name === liftState.milestone); // -1 when milestone unset
  const last = (liftState.history || []).at(-1);
  // The step currently being worked toward is one past the last achieved (ladder[0] if none).
  const targetIdx = currentIdx + 1;
  const target = ladder[targetIdx];
  if (!last) {
    // No sessions yet: if no milestone is set, seed it to the first step.
    return liftState.milestone == null && target ? setLiftMilestone(state, lift, liftState, target.name) : state;
  }
  if (target && last.reps >= target.minReps) {
    // Graduated `target` → work toward the next step, or stay at the final step once reached.
    const nextTarget = ladder[targetIdx + 1];
    return setLiftMilestone(state, lift, liftState, nextTarget ? nextTarget.name : target.name);
  }
  // Haven't met the target yet — ensure milestone points at the current target.
  if (liftState.milestone == null && target) return setLiftMilestone(state, lift, liftState, target.name);
  return state;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/logic/strengthLog.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/logic/strengthLog.js src/logic/strengthLog.test.js
git commit -m "feat(physical-power): strength log with Epley training-max + linear progressive overload + bodyweight ladder"
```

---

## Task 6: recovery.js — nutrition + recovery tracking

**Files:**
- Create: `src/logic/recovery.js`
- Test: `src/logic/recovery.test.js`

**Interfaces:**
- Produces: `proteinTarget(bodyweightKg)` → grams/day; `logProtein(state, { date?, grams })`; `logSleep(state, { date?, hours, quality })`; `rollingSleepAvg(state, days=7)` → hours; `recoveryFlags(state)` → `{ underRecovered, lowSleep, lowProtein, reason[] }`.

- [ ] **Step 1: Write the failing test**

`src/logic/recovery.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { proteinTarget, logProtein, logSleep, rollingSleepAvg, recoveryFlags } from './recovery';

function freshRecovery() { return { proteinTarget: null, proteinLog: [], sleepLog: [], hydrationLog: [], mobilityMinutes: 0, injury: null, deloadState: null }; }

describe('recovery', () => {
  it('proteinTarget is ~1.8 g/kg', () => {
    expect(proteinTarget(70)).toBeCloseTo(126, 0); // 70 * 1.8
  });
  it('logProtein appends and sets the rolling day total', () => {
    const s = { recovery: freshRecovery() };
    const next = logProtein(s, { date: '2026-06-24', grams: 40 });
    expect(next.recovery.proteinLog.length).toBe(1);
  });
  it('rollingSleepAvg averages the last N entries', () => {
    let s = { recovery: freshRecovery() };
    s = logSleep(s, { date: '2026-06-22', hours: 6, quality: 80 });
    s = logSleep(s, { date: '2026-06-23', hours: 8, quality: 90 });
    expect(rollingSleepAvg(s, 7)).toBeCloseTo(7, 5);
  });
  it('recoveryFlags flags low sleep average', () => {
    let s = { recovery: freshRecovery() };
    s = logSleep(s, { date: '2026-06-23', hours: 5, quality: 60 });
    const flags = recoveryFlags(s);
    expect(flags.underRecovered).toBe(true);
    expect(flags.reason).toContain('low sleep');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/logic/recovery.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/logic/recovery.js`:
```js
import { getLocalDateString } from '../utils/dateUtils';

export function proteinTarget(bodyweightKg) {
  return Math.round((bodyweightKg || 0) * 1.8); // 1.8 g/kg mid-range
}

export function logProtein(state, { date, grams }) {
  const rec = state.recovery || {};
  return {
    ...state,
    recovery: {
      ...rec,
      proteinTarget: rec.proteinTarget ?? proteinTarget(state.strengthLog?.bodyweightKg || 70),
      proteinLog: [...(rec.proteinLog || []), { date: date || getLocalDateString(), grams }],
    },
  };
}

export function logSleep(state, { date, hours, quality }) {
  const rec = state.recovery || {};
  return {
    ...state,
    recovery: {
      ...rec,
      sleepLog: [...(rec.sleepLog || []), { date: date || getLocalDateString(), hours, quality }],
    },
  };
}

export function rollingSleepAvg(state, days = 7) {
  const log = (state.recovery?.sleepLog || []).slice(-days);
  if (!log.length) return 0;
  return log.reduce((sum, e) => sum + (e.hours || 0), 0) / log.length;
}

export function recoveryFlags(state) {
  const reasons = [];
  const sleepAvg = rollingSleepAvg(state, 7);
  const lowSleep = sleepAvg > 0 && sleepAvg < 6.5;
  if (lowSleep) reasons.push('low sleep');
  const lastProtein = (state.recovery?.proteinLog || []).at(-1);
  const lowProtein = lastProtein && (lastProtein.grams || 0) < (state.recovery?.proteinTarget || proteinTarget(70)) * 0.8;
  if (lowProtein) reasons.push('low protein');
  return { underRecovered: reasons.length > 0, lowSleep, lowProtein, reason: reasons };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/logic/recovery.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/logic/recovery.js src/logic/recovery.test.js
git commit -m "feat(physical-power): recovery tracking — protein target, sleep log, under-recovery flags"
```

---

## Task 7: State shape + migration

**Files:**
- Modify: `src/data/store.js:8` (BUILD_VERSION), `:10-18` (STALE set), `:20-88` (DEFAULT_STATE), `:90-175` (normalizeStateShape)
- Modify: `src/logic/stateMerge.js:4-12` (STALE set mirror)
- Test: `src/data/store.migration.test.js` (create)

**Interfaces:**
- Consumes: state slice shapes from spec §7 and Tasks 5/6.
- Produces: `DEFAULT_STATE.strengthLog`, `.recovery`, `.physicalPower`; `normalizeStateShape` normalizes them; `BUILD_VERSION = '2026-06-24-physical-power'`; both STALE sets include every current adventure body title so `loadState` force-refreshes.

- [ ] **Step 1: Write the failing test**

`src/data/store.migration.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { DEFAULT_STATE, upgradeStateForCurrentBuild } from './store';

describe('Physical Power migration', () => {
  it('DEFAULT_STATE has the new Physical Power slices', () => {
    expect(DEFAULT_STATE.strengthLog).toBeDefined();
    expect(DEFAULT_STATE.strengthLog.lifts.squat.trainingMax).toBeNull();
    expect(DEFAULT_STATE.recovery).toBeDefined();
    expect(DEFAULT_STATE.physicalPower).toBeDefined();
    expect(DEFAULT_STATE.physicalPower.equipment).toBeNull();
  });
  it('upgradeStateForCurrentBuild initializes slices for an old state and resets generated quests', () => {
    const oldState = { version: 8, buildVersion: '2026-06-23-remove-log-guided-default', dailyQuests: [{ id: 'x', title: 'Explore a New Street', pillar: 'body' }], pillars: { deen: { level: 0 }, body: { level: 2 }, money: { level: 0 } } };
    const upgraded = upgradeStateForCurrentBuild(oldState, { resetGeneratedContent: true });
    expect(upgraded.strengthLog.lifts.squat.trainingMax).toBeNull();
    expect(upgraded.physicalPower.equipment).toBeNull();
    expect(upgraded.dailyQuests).toEqual([]); // generated content reset → re-rolled fresh
    expect(upgraded.buildVersion).toBe('2026-06-24-physical-power');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/store.migration.test.js`
Expected: FAIL — `DEFAULT_STATE.strengthLog` is undefined; `buildVersion` still the old string.

- [ ] **Step 3: Implement**

In `src/data/store.js`:

Change `BUILD_VERSION` (line 8):
```js
const BUILD_VERSION = '2026-06-24-physical-power';
```

Expand `STALE_ADVENTURE_DAILY_TITLES` (lines 10-18) — first read `src/data/questCatalog.js` `DAILY_QUEST_POOLS.body` (all ranks) and enumerate every current body quest title; add them all to the set. The set must include at minimum the known roaming titles, e.g.:
```js
const STALE_ADVENTURE_DAILY_TITLES = new Set([
  // pre-v8 sprint/combat titles (kept)
  'Combat Mobility 5 Min', 'Sprint Drills', 'Outdoor Sprints', 'Outdoor Sprint Intervals', 'Hill Sprint Repeats', 'Outdoor Movement Circuit', 'Outdoor Circuit Challenge',
  // v8 roaming titles being replaced by Physical Power (enumerate ALL from DAILY_QUEST_POOLS.body at execution time)
  'Explore a New Street', '5,000 Step Expedition', '2-Hour Trek', 'Half-Day Trek',
  // ... add every current body pool title read from questCatalog.js
]);
```
(At execution, the implementer greps `DAILY_QUEST_POOLS.body` for every `title:` and adds them. This is concrete, not a placeholder — the instruction is "add every current body title," and the file is read to enumerate them.)

Add to `DEFAULT_STATE` (after line 86, before `buildVersion`):
```js
  // v9 Physical Power fields
  strengthLog: {
    bodyweightKg: null,
    baselineTested: false,
    lifts: {
      squat: { trainingMax: null, history: [], lastTested: null, milestone: null },
      deadlift: { trainingMax: null, history: [], lastTested: null, milestone: null },
      press: { trainingMax: null, history: [], lastTested: null, milestone: null },
      bench: { trainingMax: null, history: [], lastTested: null, milestone: null },
      row: { trainingMax: null, history: [], lastTested: null, milestone: null },
      pullup: { trainingMax: null, history: [], lastTested: null, milestone: null },
    },
  },
  recovery: {
    proteinTarget: null,
    proteinLog: [],
    sleepLog: [],
    hydrationLog: [],
    mobilityMinutes: 0,
    injury: null,
    deloadState: null,
  },
  physicalPower: {
    equipment: null, // 'barbell' | 'bodyweight' | 'mixed' | 'kettlebell' — set on first launch
    trackProgress: { strength: 0, power: 0, endurance: 0, resilience: 0 },
    gateResults: [],
  },
```

Add normalization in `normalizeStateShape` (before `return normalized;`):
```js
  // v9 Physical Power normalization (additive, no data loss)
  normalized.strengthLog = state.strengthLog && typeof state.strengthLog === 'object'
    ? { ...DEFAULT_STATE.strengthLog, ...state.strengthLog, lifts: { ...DEFAULT_STATE.strengthLog.lifts, ...(state.strengthLog.lifts || {}) } }
    : DEFAULT_STATE.strengthLog;
  normalized.recovery = state.recovery && typeof state.recovery === 'object'
    ? { ...DEFAULT_STATE.recovery, ...state.recovery }
    : DEFAULT_STATE.recovery;
  normalized.physicalPower = state.physicalPower && typeof state.physicalPower === 'object'
    ? { ...DEFAULT_STATE.physicalPower, ...state.physicalPower, trackProgress: { ...DEFAULT_STATE.physicalPower.trackProgress, ...(state.physicalPower.trackProgress || {}) } }
    : DEFAULT_STATE.physicalPower;
```

In `src/logic/stateMerge.js` (lines 4-12): mirror the same expanded `STALE_ADVENTURE_DAILY_TITLES` set (identical contents). The existing `mergeDailyQuests` already uses it to prefer fresh over stale — no other change needed there.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/store.migration.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/store.js src/data/store.migration.test.js src/logic/stateMerge.js
git commit -m "feat(physical-power): add strengthLog/recovery/physicalPower state + BUILD_VERSION migration + stale-adventure purge"
```

---

## Task 8: Daily quest pools rewrite (DAILY_QUEST_POOLS.body, E→S)

**Files:**
- Modify: `src/data/questCatalog.js` — `DAILY_QUEST_POOLS.body` (Explore map: ~lines 136-196, ~48 quests across 6 ranks)
- Test: `src/data/questCatalog.body.test.js` (create)

**Interfaces:**
- Consumes: `nextSessionLoad` from `../logic/strengthLog` (Task 5) for C+ strength-track quests (generated, not static).
- Produces: every body daily quest is four-track Physical Power content; no roaming/adventure titles remain; IDs stable; ~8 quests per rank.

**Content spec (author all 6 ranks following this):**

Data shape per quest (match the existing pool's shape exactly — read `DAILY_QUEST_POOLS.deen` first to mirror field names: `id, title, description, baseXp, pillar: 'body', estimatedMinutes, tags, steps?`):
```js
{ id: 'd-body-e-1', title: 'First Forge — Push-ups 3×8', description: 'Three sets of eight push-ups. Chest to floor, full lockout. The first strike of the forge.', baseXp: 10, pillar: 'body', estimatedMinutes: 8, tags: ['strength','push'] }
```

Four tracks (spec §5.2): **Strength** (push-ups, squats, pull-ups, rows, lifts), **Power** (broad jump, box jump, hill sprint, plyo), **Endurance** (run, ruck, intervals, shuttle), **Resilience** (plank, dead hang, mobility, protein, sleep, carry). Each rank's pool must contain at least one quest per track. Volume/intensity escalates by rank. E-rank is bodyweight-only-friendly beginner baseline; C+ introduces loaded barbell work (strength quests there may be generated from `nextSessionLoad` — see below).

**Complete E-rank worked example (8 quests) — replicate this shape/voice for every rank:**
```js
E: [
  { id: 'd-body-e-1', title: 'First Forge — Push-ups 3×8', description: 'Three sets of eight push-ups. Chest to floor, full lockout. The first strike of the forge.', baseXp: 10, pillar: 'body', estimatedMinutes: 8, tags: ['strength','push'] },
  { id: 'd-body-e-2', title: 'Squat Foundation 3×10', description: 'Three sets of ten bodyweight squats. Below parallel, controlled tempo.', baseXp: 10, pillar: 'body', estimatedMinutes: 8, tags: ['strength','squat'] },
  { id: 'd-body-e-3', title: 'Incline Rows 3×6', description: 'Three sets of six incline rows under a table or bar. Pull the chest to the bar.', baseXp: 10, pillar: 'body', estimatedMinutes: 8, tags: ['strength','pull'] },
  { id: 'd-body-e-4', title: 'Broad Jump 5×3', description: 'Five sets of three standing broad jumps. Stick the landing, reset each rep.', baseXp: 10, pillar: 'body', estimatedMinutes: 7, tags: ['power','jump'] },
  { id: 'd-body-e-5', title: '1K Jog', description: 'One kilometer at an easy, conversational pace. Build the engine.', baseXp: 10, pillar: 'body', estimatedMinutes: 12, tags: ['endurance','run'] },
  { id: 'd-body-e-6', title: 'Plank + Dead Hang', description: '30-second plank, then 15-second dead hang. Two rounds.', baseXp: 8, pillar: 'body', estimatedMinutes: 6, tags: ['resilience','core','grip'] },
  { id: 'd-body-e-7', title: '5-Minute Mobility', description: 'Five minutes of hip + shoulder mobility. Slow, controlled, breathe.', baseXp: 8, pillar: 'body', estimatedMinutes: 5, tags: ['resilience','mobility'] },
  { id: 'd-body-e-8', title: 'Protein Hit', description: 'Hit your daily protein target (g/kg bodyweight). Fuel the forge.', baseXp: 8, pillar: 'body', estimatedMinutes: 5, tags: ['resilience','nutrition'] },
],
```

**Per-rank requirements:** D (pull-up negatives, goblet squat, broad jump ~1.8m, 1.6K run, dead hang 20s, protein), C (loaded squat/deadlift/press 3×5, hill sprints, 5K run, mobility 10min, sleep ≥7h), B (5×5 progression, pull-ups ×8, box jumps, ruck 10kg/3km, 400m intervals, farmer's carry, recovery audit), A (PR-oriented strength, plyo, 10K, heavy ruck, compete-in-an-event), S (2×BW squat work, weighted pull-ups, half-marathon prep, heavy ruck, lead-community-fitness). C+ strength quests: title/description may reference "today's prescribed load" and the UI (Task 15) fills the kg from `nextSessionLoad`; if static text is simpler for Phase 1, write `description: 'Squat 3×5 at ~80% of your training max (see Power Log).'` and keep `tags: ['strength','squat']`.

- [ ] **Step 1: Write the failing test**

`src/data/questCatalog.body.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { DAILY_QUEST_POOLS } from './questCatalog';

const ROAMING = /roam|wander|trek|expedition|hike|trail|scout|wilderness|explore a new street|step expedition/i;

describe('DAILY_QUEST_POOLS.body (Physical Power)', () => {
  it('every body quest has pillar "body" and positive baseXp', () => {
    for (const rank of ['E','D','C','B','A','S']) {
      for (const q of DAILY_QUEST_POOLS.body[rank]) {
        expect(q.pillar).toBe('body');
        expect(q.baseXp).toBeGreaterThan(0);
        expect(q.id).toBeTruthy();
      }
    }
  });
  it('no roaming/adventure titles remain', () => {
    for (const rank of ['E','D','C','B','A','S']) {
      for (const q of DAILY_QUEST_POOLS.body[rank]) {
        expect(q.title).not.toMatch(ROAMING);
        expect(q.description).not.toMatch(ROAMING);
      }
    }
  });
  it('each rank pool covers all four tracks', () => {
    const trackOf = q => {
      const t = (q.tags || []).join(' ');
      if (/strength|push|pull|squat|lift/.test(t)) return 'strength';
      if (/power|jump|sprint|plyo/.test(t)) return 'power';
      if (/endurance|run|ruck|interval|shuttle/.test(t)) return 'endurance';
      if (/resilience|mobility|core|grip|nutrition|sleep|carry|plank/.test(t)) return 'resilience';
      return null;
    };
    for (const rank of ['E','D','C','B','A','S']) {
      const tracks = new Set(DAILY_QUEST_POOLS.body[rank].map(trackOf).filter(Boolean));
      expect(tracks.has('strength')).toBe(true);
      expect(tracks.has('power')).toBe(true);
      expect(tracks.has('endurance')).toBe(true);
      expect(tracks.has('resilience')).toBe(true);
    }
  });
  it('IDs are unique across all ranks', () => {
    const ids = ['E','D','C','B','A','S'].flatMap(r => DAILY_QUEST_POOLS.body[r].map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```
(If `DAILY_QUEST_POOLS` is not exported, export it — read the file to confirm the export name.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/questCatalog.body.test.js`
Expected: FAIL — current body pool titles match `ROAMING` (e.g. "Explore a New Street").

- [ ] **Step 3: Implement**

Open `src/data/questCatalog.js`, find `DAILY_QUEST_POOLS.body`, and replace all six rank arrays with four-track Physical Power content per the spec above. Keep the surrounding structure (`DAILY_QUEST_POOLS = { deen: {...}, body: {...}, money: {...} }`) and the exact field names used by the `deen` pool. Author all 6 ranks completely (≥8 quests each, all four tracks represented, escalating intensity). Preserve stable IDs where the quest is conceptually the same; otherwise use the existing `d-body-<rank>-<n>` ID scheme.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/questCatalog.body.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/questCatalog.js src/data/questCatalog.body.test.js
git commit -m "feat(physical-power): rewrite body daily quest pools E→S as 4-track strength/power/endurance/resilience"
```

---

## Task 9: Level story quests + job-gate + redemption retheme

**Files:**
- Modify: `src/data/questCatalog.js` — `ADVENTURE_LEVEL_QUEST_OVERRIDES` (~881-1118), `getMissionQuestForLevel` body archetypes (~1125-1200), `JOB_CHANGE_QUESTS` body steps (~1256-1260), `REDEMPTION_QUEST_TEMPLATES` body (~1304)
- Modify: `src/data/jobChangeGates.js` — body step titles (~22, 39, 56, 73, 90, 93)
- Test: `src/data/questCatalog.levelquests.test.js` (create)

**Content spec:** Rewrite every body-pillar level-story quest (the `ADVENTURE_LEVEL_QUEST_OVERRIDES` + the body sub-quests inside `RAW_LEVEL_QUESTS` + the body archetype in `getMissionQuestForLevel`) from adventure/roaming framing to forging-the-khalifa's-body, escalating E "first forge / awakening" → S "The Khalifa's Apex" (half-marathon, peak strength, lead others). Each level quest frames a step in forging a body worthy of bearing the Ummah's burden. Job-gate body steps: "Adventure Foundation"→"Physical Power Foundation", "Warrior Adventure"→"Warrior's Power", "Strategist's Adventure"→"Strategist's Power", "Adventure Mastery"→"Power Mastery". Redemption body template: retheme to a physical-power redemption (e.g. "Reclaim the Forge — return to training after a missed cycle").

Read each target section first to mirror the exact field shape (`level, rank, title, description, quests:[{id,title,description,steps,xp,pillar}], reward`).

- [ ] **Step 1: Write the failing test**

`src/data/questCatalog.levelquests.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { LEVEL_QUESTS, REDEMPTION_QUEST_TEMPLATES } from './questCatalog';
import { JOB_CHANGE_GATES } from './jobChangeGates';

// Broadened to actually catch the adventure/roaming wording in the source — the
// narrow original missed 'Terrain Penance', 'Adventure discipline', "The Adventurer's Trial".
// 'adventur' covers adventure/adventurer/adventures; 'explor' covers explore/exploring/exploration;
// 'terrain' covers terrain. NOTE: 'training' is SAFE (does not match 'trail').
const ROAMING = /roam|wander|trek|expedition|hike|trail|scout|wilderness|adventur|explor|terrain/i;

describe('body level/story quests rethemed', () => {
  it('no body level-quest title or description contains roaming/adventure wording', () => {
    for (const lq of LEVEL_QUESTS) {
      for (const q of (lq.quests || [])) {
        if (q.pillar !== 'body') continue;
        expect(q.title).not.toMatch(ROAMING);
        expect(q.description).not.toMatch(ROAMING);
      }
    }
  });
  it('job-change gates body steps are retitled to Power', () => {
    const bodySteps = JOB_CHANGE_GATES.flatMap(g => (g.steps || []).filter(s => s.pillar === 'body'));
    expect(bodySteps.length).toBeGreaterThan(0);
    for (const s of bodySteps) {
      expect(s.title).not.toMatch(/adventur/i);
      expect(s.title).toMatch(/power|forge|strength/i);
    }
  });
  it('redemption body sub-quests are rethemed', () => {
    // Templates have NO top-level `pillar` field — the body content lives in their `quests[]` sub-quests.
    const bodyReds = REDEMPTION_QUEST_TEMPLATES.flatMap(t => (t.quests || []).filter(q => q.pillar === 'body'));
    expect(bodyReds.length).toBeGreaterThan(0);
    for (const q of bodyReds) {
      expect(q.title).not.toMatch(ROAMING);
      expect(q.description).not.toMatch(ROAMING);
    }
  });
});
```
(Export names confirmed: `LEVEL_QUESTS` and `REDEMPTION_QUEST_TEMPLATES` from `./questCatalog`; `JOB_CHANGE_GATES` from `./jobChangeGates`. `JOB_CHANGE_QUESTS` is intentionally NOT imported — it is rethemed for consistency per Step 3 but is not test-asserted.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/questCatalog.levelquests.test.js`
Expected: FAIL — body level-quest titles still contain roaming/adventure wording; job-gate body steps still say "Adventure".

- [ ] **Step 3: Implement**

Rework the target sections in `questCatalog.js` and the body steps in `jobChangeGates.js` per the content spec. Preserve all non-body content, all `id` fields, and all reward/steps structure (only retheme `title`/`description`/`steps` TEXT — never `id`, `xp`, `rank`, `reward`). Keep the forge/khalifa voice: disciplined, zero-softness, strength-for-service, no emojis.

**CRITICAL — override key coupling (read before editing level quests).** `LEVEL_QUESTS` is built at `questCatalog.js:1238` by mapping each body sub-quest through `ADVENTURE_LEVEL_QUEST_OVERRIDES[`${levelQuest.level}:${quest.id}:${quest.title}`]` — the KEY uses the SOURCE title from `RAW_LEVEL_QUESTS` (or S-rank generated). When an override exists, its `title`/`description` REPLACE the source's, so the FINAL display title is the override's title (and the test sees the final list). Consequence: if you change a SOURCE title in `RAW_LEVEL_QUESTS` for a quest that HAS an override, you MUST also update that override's KEY to the new source title, or the override silently drops. Safe approach: retheme BOTH the override's title+description (the display values) AND the source title+description; whenever you retheme a source title that has an override, update the override key `${level}:${id}:${newSourceTitle}` to match. Then GREP the final `LEVEL_QUESTS` body quests (or just run the test) to confirm no ROAMING word remains in any body quest's final title or description. Body level-quest sources to cover: `RAW_LEVEL_QUESTS` (line 278) body sub-quests, `ADVENTURE_LEVEL_QUEST_OVERRIDES` (line 894) body entries, and `getMissionQuestForLevel` (line 1138) body archetype (feeds `S_RANK_GENERATED_QUESTS`).

**jobChangeGates.js body steps (10 total).** The test requires EVERY body step title to (a) not match `/adventur/i` and (b) match `/power|forge|strength/i`. Currently only `'Guardian's Strength'` (day 2 of the C-gate) already passes; the other 9 fail (they contain "Adventure" or lack power/forge/strength). Retitle all 10 body steps so each contains power/forge/strength and contains no "adventure"/"adventurer". Also retheme each body step's `description` from roaming language (trek/hike/trail/wilderness/expedition/scramble/navigation/compass) to training language (strength/power/endurance/resilience work). Preserve `day`, `pillar`, `xp`.

**JOB_CHANGE_QUESTS (questCatalog.js:1249) — consistency, untested.** Retheme the adventure/roaming wording in `description` fields (e.g. job-mujahid: "Adventure, mind, and soul as one...") and `steps[].text` fields (e.g. "4+ hour trek / summit climb / wilderness navigation", "8+ hour expedition / multi-terrain trek / lead group hike") to physical-power training wording. These steps have no `pillar` field — retheme by content (the outdoor/trek/hike/expedition phrases), preserve `id`/`completed`.

**ROAMING word list to avoid in body level-quest titles+descriptions and body redemption sub-quests:** roam, wander, trek, expedition, hike, trail, scout, wilderness, adventure, adventurer, explore/exploring/exploration, terrain. ("training", "outdoor", "run", "ruck", "jump", "squat", "push", "pull", "carry", "plank", "mobility", "strength", "power", "forge", "endurance", "resilience" are all SAFE.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/questCatalog.levelquests.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/questCatalog.js src/data/questCatalog.levelquests.test.js src/data/jobChangeGates.js
git commit -m "feat(physical-power): retheme body level-story quests, job-gate steps, redemption to khalifa forging"
```

---

## Task 10: Weekly dungeons → Physics Gates wiring

**Files:**
- Modify: `src/data/questCatalog.js` — `WEEKLY_DUNGEON_TEMPLATES` body entries (~1325-1374) now sourced from `physicsGates`
- Test: `src/data/questCatalog.dungeons.test.js` (create)

**Interfaces:**
- Consumes: `getGateForRank`, `gateToDungeonQuests` from `./physicsGates` (Task 4).

- [ ] **Step 1: Write the failing test**

`src/data/questCatalog.dungeons.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { WEEKLY_DUNGEON_TEMPLATES } from './questCatalog';
import { getGateForRank } from './physicsGates';

const ROAMING = /seeker's trail|explorer's gate|pathfinder's trial|trailblazer|expedition|monarch's wilderness|sovereign's expedition|divine crucible/i;

describe('body weekly dungeons = Physics Gates', () => {
  it('no adventure dungeon names remain for body', () => {
    for (const rank of ['E','D','C','B','A','S']) {
      const body = WEEKLY_DUNGEON_TEMPLATES[rank]?.body || WEEKLY_DUNGEON_TEMPLATES.body?.[rank];
      const text = JSON.stringify(body || {});
      expect(text).not.toMatch(ROAMING);
    }
  });
  it('body dungeon for each rank matches the Physics Gate name', () => {
    for (const rank of ['E','D','C','B','A','S']) {
      const body = WEEKLY_DUNGEON_TEMPLATES[rank]?.body || WEEKLY_DUNGEON_TEMPLATES.body?.[rank];
      const gate = getGateForRank(rank);
      expect(JSON.stringify(body)).toContain(gate.name);
    }
  });
});
```
(Read `WEEKLY_DUNGEON_TEMPLATES`'s actual shape — rank-keyed vs pillar-keyed — and adapt the accessor. Confirm it's exported.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/questCatalog.dungeons.test.js`
Expected: FAIL — body dungeons still named "The Seeker's Trail" etc.

- [ ] **Step 3: Implement**

Replace ONLY the `body` entries in `WEEKLY_DUNGEON_TEMPLATES` with Physics-Gate-sourced dungeons; keep `deen`/`money`/`ummah` entries byte-for-byte unchanged. At the top of `src/data/questCatalog.js` add:
```js
import { getGateForRank } from './physicsGates';
```
Do NOT import or use `gateToDungeonQuests` — it returns an ARRAY of per-event quest objects (`{id,title,description,baseXp,tags,...}`) with NO `steps` field. That is the WRONG shape: `getWeeklyDungeonForRank` (questCatalog.js ~line 1444) does `template.steps.map(...)`, so a `body` entry without a `steps` array of strings would crash dungeon initialization at runtime. Build the body entry yourself in the existing template shape.

CRITICAL — preserve the existing body-entry shape exactly: `{ title, description, xp, steps: [string, ...] }`. The runtime spreads `...template` (carrying `title`/`description`/`xp`) and maps `template.steps` (so `steps` MUST be an array of strings). For each rank E, D, C, B, A, S, set the body entry to:
```js
body: {
  title: getGateForRank(rank).name,
  description: `Boss: Pass ${getGateForRank(rank).name}. Complete ALL four standards — strength, power, endurance, resilience. No partial credit. The forge demands everything.`,
  xp: <KEEP THE EXISTING RANK XP — E:200, D:300, C:400, B:500, A:600, S:800>,
  steps: getGateForRank(rank).events.map(ev => `${ev.label}: ${ev.standard}`),
},
```
This makes `title` = the Physics Gate name (satisfies the test's `JSON.stringify(body)` contains `gate.name`), uses only training language in title/description/steps (the gate event standards are already free of every ROAMING word — verified), keeps `xp` unchanged (preserves dungeon balance), and makes `steps` an array of 4 strings (one per gate event: strength/power/endurance/resilience). Forge-Master voice: zero softness, no emojis, strength-for-service.

S_II sub-tier: there is NO Physics Gate for `S_II` — `getGateForRank('S_II')` falls back to `PHYSICS_GATES[0]` (Newton's Gate), which is WRONG. Do NOT use the gate for S_II. Hand-author the S_II body entry: a physical-power `title` free of ROAMING words (the test bans "sovereign's expedition", so use e.g. `"The Sovereign's Apex"`), a boss `description` in the forge voice, `xp: 2500` (unchanged), and 4 physical-power `steps` that escalate beyond S (e.g. multi-day heavy ruck + loaded carry + 2×BW squat work + half-marathon-level endurance + lead others in training). The test does not check S_II, but high-level S-rank users see it at runtime, so it must be rethemed (the current "The Sovereign's Expedition" must go).

After editing, sanity-check `getWeeklyDungeonForRank('E').body.steps` is an array of 4 strings (not undefined) and `.body.title` is `"Newton's Gate"` — the runtime depends on the shape. Keep `deen`/`money`/`ummah` entries untouched.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/questCatalog.dungeons.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/questCatalog.js src/data/questCatalog.dungeons.test.js
git commit -m "feat(physical-power): body weekly dungeons now Physics Gates (Newton→Monarch's Apex)"
```

---

## Task 11: Mission gates + framing retheme

**Files:**
- Modify: `src/data/missionGates.js` (body objectives ~17, 29, 66, 126), `src/data/missionQuestCatalog.js:38-51` ("Adventure With Restraint" → "Physical Power With Restraint"), `src/data/missionPlan.js`, `src/data/missionDoctrine.js`, `src/logic/missionReview.js`, `src/logic/missionMetrics.js`, `src/logic/readinessProtocol.js`
- Test: `src/data/missionFraming.test.js` (create)

**Content spec:** Replace "Adventure"/"adventure" framing strings in body-related mission content with "Physical Power". Mission-gate body objectives ("Body of the Khalifa", "Physical Standard", "Lifetime Fitness") already sound physical — refine wording to Physical Power but keep the objective mechanics (requiredCount, type). The "Adventure With Restraint" readiness template becomes "Physical Power With Restraint". Grep each file for `Adventure`/`adventure` in body context and retheme; do NOT touch deen/money mission content.

- [ ] **Step 1: Write the failing test**

`src/data/missionFraming.test.js`:
```js
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const FILES = [
  'src/data/missionGates.js',
  'src/data/missionQuestCatalog.js',
  'src/data/missionPlan.js',
  'src/data/missionDoctrine.js',
  'src/logic/missionReview.js',
  'src/logic/missionMetrics.js',
  'src/logic/readinessProtocol.js',
];

describe('mission framing has no "Adventure" body references', () => {
  for (const f of FILES) {
    it(`${f} drops adventure framing in body context`, () => {
      const src = fs.readFileSync(path.resolve(process.cwd(), f), 'utf8');
      // "Adventure" as a standalone label/alias is gone; allow the word only inside
      // the STALE set or comments. Body-context adventure strings must be rethemed.
      const bodyAdventure = src.match(/pillar:\s*['"]body['"][^}]*?adventure|adventure[^}]*?pillar:\s*['"]body['"]/gi);
      expect(bodyAdventure).toBeNull();
    });
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/missionFraming.test.js`
Expected: FAIL — at least one file still pairs `pillar: 'body'` with `adventure` (e.g. the readiness template).

- [ ] **Step 3: Implement**

In each listed file, find body-context `Adventure`/`adventure` strings and retheme to `Physical Power`/`physical power`. For `missionQuestCatalog.js` rename the readiness template title + description. For `missionGates.js` refine the body objective wording (keep `requiredCount`/`type`/`id` fields unchanged). Preserve all deen/money content and all objective mechanics.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/missionFraming.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/missionGates.js src/data/missionQuestCatalog.js src/data/missionPlan.js src/data/missionDoctrine.js src/logic/missionReview.js src/logic/missionMetrics.js src/logic/readinessProtocol.js src/data/missionFraming.test.js
git commit -m "feat(physical-power): retheme body mission gates + readiness + framing to Physical Power"
```

---

## Task 12: Rewards + equipment retheme

**Files:**
- Modify: `src/data/rewards.js` — `category: 'adventure'` → `'physical-power'` + retheme ~20 items from outdoor gear to training gear
- Modify: `src/data/equipment.js` — body-slot item names (`wanderer-cloak` etc.) → power-themed
- Test: `src/data/rewardsEquipment.test.js` (create)

**Content spec:** Rewards `category: 'adventure'` → `'physical-power'`; item names/descriptions from outdoor gear (hiking socks, trekking shoes) → training gear (lifting straps, running shoes, foam roller, gym bag, weight belt). Keep the family-umrah goal reward, recategorize to `physical-power` if it was `adventure`. Equipment: `wanderer-cloak` → e.g. `forged-vest`; other body-slot items → power-themed names. Keep slot/durability/enchant/bonus mechanics and all `id`/`pillar`/stat fields unchanged — only `name`/`description` change, and only for `pillar: 'body'` items.

- [ ] **Step 1: Write the failing test**

`src/data/rewardsEquipment.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { REWARDS } from './rewards';
import { EQUIPMENT } from './equipment';

describe('rewards + equipment rethemed', () => {
  it('no reward uses category "adventure"', () => {
    for (const r of REWARDS) expect(r.category).not.toBe('adventure');
  });
  it('physical-power rewards exist', () => {
    expect(REWARDS.some(r => r.category === 'physical-power')).toBe(true);
  });
  it('no body equipment item is named wanderer-cloak', () => {
    const bodyItems = EQUIPMENT.filter(e => e.pillar === 'body');
    for (const e of bodyItems) expect(e.name).not.toMatch(/wanderer/i);
  });
});
```
(Confirm export names `REWARDS`/`EQUIPMENT` — read the files; adapt if they're exported differently, e.g. `REWARD_CATALOG`/`EQUIPMENT_DROPS`.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/rewardsEquipment.test.js`
Expected: FAIL — rewards still have `category: 'adventure'`; equipment still has `wanderer-cloak`.

- [ ] **Step 3: Implement**

`rewards.js`: change every `category: 'adventure'` → `'physical-power'`; retheme each such item's `name`/`description` to training gear. `equipment.js`: retheme body-pillar item names/descriptions to power-themed (`wanderer-cloak`→`forged-vest`, etc.), keeping `id` mechanics. Keep all non-body items untouched.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/rewardsEquipment.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/rewards.js src/data/equipment.js src/data/rewardsEquipment.test.js
git commit -m "feat(physical-power): retheme rewards category + body equipment to training gear"
```

---

## Task 13: PowerLog.jsx component + mount in Legion

**Files:**
- Create: `src/components/PowerLog.jsx`
- Modify: `src/components/Legion.jsx` (mount `<PowerLog/>`)
- Test: `src/components/PowerLog.test.jsx` (create — render smoke + a logLift interaction)

**Interfaces:**
- Consumes: `state.strengthLog`, `state.physicalPower`, `logLift`/`recomputeTrainingMax`/`nextSessionLoad` from `../logic/strengthLog` (Task 5), `setState` from `useStore`.
- Produces: a panel that lists lifts with training max + last session, a form to log a session (lift, weight, reps, sets, rpe), a "Run rep-max test" button that calls `recomputeTrainingMax`, and an equipment + bodyweight setter.

- [ ] **Step 1: Write the failing test**

`src/components/PowerLog.test.jsx` (render smoke — the project's e2e covers full render; here assert the component mounts and reflects a logged lift):
```jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PowerLog from './PowerLog';

describe('PowerLog', () => {
  it('renders without crashing and shows the equipment prompt when unset', () => {
    const state = { strengthLog: { bodyweightKg: null, baselineTested: false, lifts: {} }, physicalPower: { equipment: null } };
    const { getByText } = render(<PowerLog state={state} setState={() => {}} />);
    expect(getByText(/Physical Power/i)).toBeTruthy();
  });
});
```
Note: `@testing-library/react` is not in devDependencies. If unavailable, write this as a minimal mount test using `react-dom/server` `renderToStaticMarkup` (no new deps):
```jsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import PowerLog from './PowerLog';

describe('PowerLog', () => {
  it('renders to static markup without throwing', () => {
    const state = { strengthLog: { bodyweightKg: null, baselineTested: false, lifts: {} }, physicalPower: { equipment: null } };
    const html = renderToStaticMarkup(<PowerLog state={state} setState={() => {}} />);
    expect(html).toMatch(/Physical Power/i);
  });
});
```
Use the second variant (no new dependency). If `react-dom/server` import path differs in this Vite setup, confirm via `react-dom` package — `renderToStaticMarkup` is exported from `react-dom/server` (browser) and `react-dom/server.browser`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/PowerLog.test.jsx`
Expected: FAIL — `PowerLog` module not found.

- [ ] **Step 3: Implement**

`src/components/PowerLog.jsx` — match the existing component style in `src/components/` (read `Legion.jsx` first for import patterns, Tailwind classes, lucide icons, framer-motion usage). Component contract:
```jsx
import { Dumbbell } from 'lucide-react';
import { logLift, recomputeTrainingMax, nextSessionLoad } from '../logic/strengthLog';

export default function PowerLog({ state, setState }) {
  const log = state.strengthLog;
  const equipment = state.physicalPower?.equipment;
  const [form, setForm] = useState({ lift: 'squat', weight: '', reps: '', sets: '3', rpe: '7' });

  if (!equipment) {
    // First-launch baseline prompt (Task 14 owns the full flow; this is the fallback panel)
    return (<div className="...">Set your equipment and baseline in the Physical Power setup to begin forging.</div>);
  }

  function handleLog(e) { e.preventDefault(); setState(prev => ({ ...prev, strengthLog: logLift(prev, { lift: form.lift, weight: +form.weight, reps: +form.reps, sets: +form.sets, rpe: +form.rpe }).strengthLog })); }
  function handleRepMax() { /* read weight/reps, setState with recomputeTrainingMax for the selected lift */ }

  return (/* panel: per-lift training max + last session, the log form, rep-max button, equipment/bodyweight display */);
}
```
Implement the full JSX (per-lift rows, the form, rep-max button) in the existing Tailwind/lucide/framer style. Keep it focused — one responsibility: log + view strength progress.

Mount in `Legion.jsx`: read the file, add `<PowerLog state={state} setState={setState} />` in an appropriate section (e.g. a new "Physical Power" block near equipment/skills). Import it at the top.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/PowerLog.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PowerLog.jsx src/components/PowerLog.test.jsx src/components/Legion.jsx
git commit -m "feat(physical-power): Power Log panel — log lifts, training max, rep-max test; mounted in Legion"
```

---

## Task 14: Baseline test + equipment prompt (first-launch)

**Files:**
- Modify: `src/components/PowerLog.jsx` (or new `src/components/BaselinePrompt.jsx`) — full prompt when `state.physicalPower.equipment === null`
- Modify: `src/components/Legion.jsx` — render the prompt until baseline complete
- Test: extend `src/components/PowerLog.test.jsx`

**Content spec:** When `state.physicalPower.equipment` is null, show a one-time prompt: (1) pick equipment (`barbell`/`bodyweight`/`mixed`/`kettlebell`), (2) enter bodyweight (kg), (3) enter current best for each core lift (weight × reps) — used to seed `trainingMax` via `recomputeTrainingMax`. On submit: `setState` to set `physicalPower.equipment`, `strengthLog.bodyweightKg`, `strengthLog.baselineTested = true`, and each lift's `trainingMax` from the entered rep-max. The E-rank baseline should be achievable (beginner-friendly). After baseline, the PowerLog panel shows the normal log UI.

- [ ] **Step 1: Write the failing test**

Extend `src/components/PowerLog.test.jsx`:
```jsx
it('shows the baseline/equipment prompt when equipment is null', () => {
  const state = { strengthLog: { bodyweightKg: null, baselineTested: false, lifts: {} }, physicalPower: { equipment: null } };
  const html = renderToStaticMarkup(<PowerLog state={state} setState={() => {}} />);
  expect(html).toMatch(/equipment|barbell|bodyweight/i);
});
it('after baseline, shows the lift log UI', () => {
  const state = { strengthLog: { bodyweightKg: 70, baselineTested: true, lifts: { squat: { trainingMax: 60, history: [], lastTested: '2026-06-24', milestone: null } } }, physicalPower: { equipment: 'barbell' } };
  const html = renderToStaticMarkup(<PowerLog state={state} setState={() => {}} />);
  expect(html).toMatch(/squat/i);
  expect(html).toMatch(/60/); // training max shown
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/PowerLog.test.jsx`
Expected: FAIL — the "after baseline" case doesn't yet show the training max / lift log UI (only the prompt is implemented from Task 13).

- [ ] **Step 3: Implement**

Complete the `PowerLog.jsx` branching: equipment-null → baseline prompt (equipment picker + bodyweight + per-lift rep-max inputs → on submit sets the state described above). Equipment-set + baselineTested → the log UI from Task 13. Wire `setState` with deep-merge (never overwrite nested objects). Use `recomputeTrainingMax` to seed each `trainingMax` from the entered weight×reps.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/PowerLog.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PowerLog.jsx src/components/PowerLog.test.jsx
git commit -m "feat(physical-power): first-launch baseline test + equipment prompt seeds training maxes"
```

---

## Task 15: Dashboard completion handlers → strengthLog/recovery updates

**Files:**
- Modify: `src/components/Dashboard.jsx` — `handleCompleteDaily` (~107), `handleCompleteLevelSubQuest` (~163), `handleCompleteRedemption` (~175), `handleCompleteCustom` (~185/212) call strengthLog/recovery updates when the completed quest is a logged strength/recovery session
- Modify: `src/components/MissionCommandCenter.jsx:752` — placeholder "Adventure / readiness action" → "Physical Power / readiness action"
- Test: `src/components/Dashboard.handoff.test.jsx` (create) or extend an existing Dashboard test

**Interfaces:**
- Consumes: `logLift`/`advanceBodyweightProgression` from `../logic/strengthLog`, `logProtein`/`logSleep` from `../logic/recovery`, `runEndgame` from `../logic/endgame` (already called).
- Produces: completing a body quest with `track: 'strength'` (or a `strengthLog` lift tag) appends to `state.strengthLog`; a `track: 'resilience'` nutrition/sleep quest updates `state.recovery`. The existing XP/level/runEndgame flow is untouched.

- [ ] **Step 1: Write the failing test**

`src/components/Dashboard.handoff.test.jsx` — test the pure helper that derives the strengthLog/recovery update from a completed quest (extract this logic into a small pure function `applyPhysicalPowerSideEffects(state, quest)` exported from `Dashboard.jsx` or a new `src/logic/physicalPowerSideEffects.js` so it's unit-testable without rendering):
```js
import { describe, it, expect } from 'vitest';
import { applyPhysicalPowerSideEffects } from '../logic/physicalPowerSideEffects';
import { DEFAULT_STATE } from '../data/store';

describe('applyPhysicalPowerSideEffects', () => {
  it('logs a strength session when a strength-track body quest completes', () => {
    const quest = { id: 'd-body-c-1', pillar: 'body', track: 'strength', tags: ['strength','squat'], prescribed: { weight: 48, reps: 5, sets: 3 } };
    const next = applyPhysicalPowerSideEffects(DEFAULT_STATE, quest);
    expect(next.strengthLog.lifts.squat.history.length).toBe(1);
  });
  it('logs protein when a nutrition resilience quest completes', () => {
    const quest = { id: 'd-body-e-8', pillar: 'body', track: 'resilience', tags: ['resilience','nutrition'] };
    const next = applyPhysicalPowerSideEffects(DEFAULT_STATE, quest);
    expect(next.recovery.proteinLog.length).toBe(1);
  });
  it('leaves non-body quests untouched', () => {
    const quest = { id: 'd-deen-1', pillar: 'deen' };
    const next = applyPhysicalPowerSideEffects(DEFAULT_STATE, quest);
    expect(next.strengthLog).toBe(DEFAULT_STATE.strengthLog);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/Dashboard.handoff.test.jsx`
Expected: FAIL — module `physicalPowerSideEffects` not found.

- [ ] **Step 3: Implement**

Create `src/logic/physicalPowerSideEffects.js`:
```js
import { logLift, advanceBodyweightProgression } from './strengthLog';
import { logProtein, logSleep } from './recovery';

const LIFT_BY_TAG = { squat: 'squat', deadlift: 'deadlift', hinge: 'deadlift', press: 'press', bench: 'bench', push: 'press', pull: 'pullup', row: 'row', pullup: 'pullup' };

export function applyPhysicalPowerSideEffects(state, quest) {
  if (!quest || quest.pillar !== 'body') return state;
  const tags = quest.tags || [];
  const track = quest.track;

  if (track === 'strength' || tags.includes('strength')) {
    const liftKey = tags.map(t => LIFT_BY_TAG[t]).find(Boolean) || 'squat';
    const p = quest.prescribed || {};
    const logged = logLift(state, { lift: liftKey, sets: p.sets || 3, reps: p.reps || 5, weight: p.weight || 0, rpe: p.rpe ?? null });
    return advanceBodyweightProgression(logged, liftKey);
  }
  if (tags.includes('nutrition')) return logProtein(state, { grams: state.recovery?.proteinTarget || 126 });
  if (tags.includes('sleep')) return logSleep(state, { hours: 7.5, quality: 85 });
  return state;
}
```
In `Dashboard.jsx`, inside each of the four completion handlers, after the existing state update and before/after `runEndgame(next)`, fold in the side effect: derive the next state through `applyPhysicalPowerSideEffects` so the strengthLog/recovery update chains cleanly (per CLAUDE.md guideline 7 — derive next state from the previous modified state, not the original). Update `MissionCommandCenter.jsx:752` placeholder text.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/Dashboard.handoff.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/logic/physicalPowerSideEffects.js src/components/Dashboard.jsx src/components/Dashboard.handoff.test.jsx src/components/MissionCommandCenter.jsx
git commit -m "feat(physical-power): quest completion feeds strength log + recovery; mission placeholder rethemed"
```

---

## Task 16: Final verification + CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` — §4.18 (Physics Gates now match code), §5 AI persona note, §4.3/4.18 quest-pillar description, completed-work table (#56)
- No new tests; run the full suite + build + e2e.

- [ ] **Step 1: Run the full unit suite**

Run: `npm test`
Expected: PASS — all existing + new tests green. If any pre-existing test breaks, it's likely a test fixture referencing the old `body: 'Adventure'` label or an adventure title (e.g. `coreSystems.test.js:631` per the Explore map). Fix the fixture to the new label/content — do NOT revert the retheme.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: success, no errors. Address any unused-import warnings (e.g. `Compass` removed in Task 1).

- [ ] **Step 3: Run the e2e render-safety smoke**

Run: `npm run test:e2e`
Expected: PASS — the Playwright smoke builds, serves, and confirms the app renders without crashing (the new PowerLog panel + rethemed content must not break render).

- [ ] **Step 4: Update CLAUDE.md**

Update §4.18 to reflect that Physics Gates now exist in code (Newton's Gate → Monarch's Apex, progressively scaled, four-track test batteries) — replace the "renamed with physics-themed names" language with the implemented reality. Update §5 AI persona note (ADVENTURE → PHYSICAL POWER block). Update the body-pillar description in §4.1/§4.3. Add completed-work row #56: "Physical Power Quest Phase 1 — Adventure→Physical Power retheme + Physics Gates + strength log + progressive overload + recovery tracking + capacity tests + equipment adaptation". Bump "Last Updated" to 2026-06-24.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(physical-power): CLAUDE.md — Physics Gates now in code, persona note, Phase 1 completed-work entry"
```

- [ ] **Step 6: Final full-suite confirmation**

Run: `npm test && npm run build`
Expected: PASS. Phase 1 is complete and shippable.

---

## Self-Review (run after writing, before execution)

**Spec coverage (§5 Phase 1):**
- §5.1 Frame → Task 1 (label/icon/alias) + Task 2 (persona/stats). ✓
- §5.2 Four-track model → Task 8 (pools) + Task 4 (gates). ✓
- §5.3 Daily pools → Task 8. ✓
- §5.4 Level story quests → Task 9. ✓
- §5.5 Physics Gates → Task 4 (data) + Task 10 (wiring). ✓
- §5.6 Strength log + progressive overload → Task 5 + Task 15 (handoff). ✓
- §5.7 Nutrition/recovery → Task 6 + Task 15. ✓
- §5.8 Capacity tests → Task 4 (carry/ruck/hang in gate events) + Task 8 (resilience quests). ✓
- §5.9 Job-gate/mission-gate/rewards/equipment → Task 9 (job-gate) + Task 11 (mission) + Task 12 (rewards/equipment). ✓
- §5.10 Equipment adaptation → Task 3 (standards adapt) + Task 4 (gateToDungeonQuests) + Task 14 (equipment prompt). ✓
- §5.11 Migration → Task 7. ✓
- §5.12 Files touched → covered across Tasks 1-15. ✓
- §7 State shape → Task 7. ✓
- §8 UI → Task 13/14 (PowerLog) + Task 15 (Dashboard wiring). ✓
- §9 Testing → every task has tests; Task 16 runs full suite + build + e2e. ✓

**Placeholder scan:** Content tasks (8, 9, 11, 12) use a worked-example + per-rank/per-item enumeration + a validation test rather than inlining every string — this is concrete authoring spec, not "TBD"/"add appropriate content". Mechanical tasks (1-7, 13-16) have complete code. No "Similar to Task N" cross-refs. ✓

**Type consistency:** `logLift(state, {lift, sets, reps, weight, rpe})` used identically in Task 5, 14, 15. `recomputeTrainingMax(liftState, {weight, reps})` identical in Task 5/14. `gateToDungeonQuests(gate, equipment, bodyweightKg)` identical in Task 4/10. `applyPhysicalPowerSideEffects(state, quest)` identical in Task 15. State slice field names (`strengthLog.lifts.squat.trainingMax/history/lastTested/milestone`, `recovery.proteinLog/sleepLog`, `physicalPower.equipment/trackProgress/gateResults`) consistent across Tasks 5/6/7/13/14/15. ✓

**One known execution-time dependency:** Task 7's STALE set expansion requires reading `questCatalog.js` `DAILY_QUEST_POOLS.body` to enumerate current titles — the task says so explicitly and the file is read at execution. Not a placeholder.