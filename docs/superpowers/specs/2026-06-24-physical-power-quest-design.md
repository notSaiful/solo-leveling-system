---
title: "Physical Power Quest — Forging a Strong Khalifa (Adventure → Physical Power + Real Strength System)"
date: 2026-06-24
status: approved
phases: [Phase 1 → 9/10, Phase 2 → 10/10]
builds_on: 2026-06-02-khalifa-alignment-design.md
---

# Physical Power Quest — Design Spec

## 1. Context & Motivation

"Adventure" is not a quest type or mode. It is the **display label of the `body` pillar** — one line, `src/utils/pillarDisplay.js:3` → `body: 'Adventure'`. Every "adventure quest" is a quest with `pillar: 'body'`, themed as outdoor roaming (hike, trek, scout, expedition, wilderness). The Forge-Master persona even states *"ADVENTURE: outdoor mastery… Not gym fitness."* The body pillar auto-feeds the existing `strength` + `agility` stats.

The prior `2026-06-02-khalifa-alignment-design.md` spec already reframed Body as a **"Warrior-King Forge"** — but that reframing never landed in code; the label and all body quest content remained outdoor-roaming. CLAUDE.md §4.18 also documents "Physics Gates" (Newton's Gate, Thermodynamics Gate, … half-marathon apex) that **do not exist in the code** — the docs are ahead of the code.

**This spec lands the Warrior-King Forge intent in code and gives it real mechanical teeth:** rename Adventure → Physical Power, retheme all body content from roaming to strength/speed/conditioning, build the documented Physics Gates as real benchmark test batteries, and — to actually forge a *strong* khalifa rather than a merely *fit* one — add a real strength-training subsystem (log, progressive overload, programming engine, autoregulation, recovery, applied capacity tests, spiritual integration).

**Honest rating target.** The previous content-only design rated ~5/10 for "strong like a khalifa" (calisthenics + running has a ceiling; maximal/explosive/applied strength under-programmed). This spec targets **10/10 for what an app can do toward that aim** — run for 2–3 years under the Forge-Master and the user becomes a genuinely formidable, operator-level human, strong in every physical quality, applied capacity tested, forged in service. It will not make anyone Ali bin Abi Talib (RA); that is never claimed.

## 2. Goals & Non-Goals

**Goals**
- Rename the body pillar display "Adventure" → "Physical Power" across the whole progression E→S, levels 1→999, including the S-rank Khalifa endgame.
- Retheme all body quest content from outdoor roaming to disciplined physical training across **four tracks**: Strength, Power, Endurance, Resilience.
- Build the Physics Gates as real, multi-event **test batteries** grounded in validated standards (Indian Army fitness tests, strength-standard tables by bodyweight, tactical/operator standards).
- Add a **strength log + progressive overload** so the user actually gets stronger over time (not just completes quests).
- Add **nutrition + recovery tracking** as a first-class part of the body system.
- Add **applied capacity tests** (loaded carries, ruck, grip, a capstone Khalifa Trial) — strong *in use*, the "carry the burden" dimension.
- Integrate **spiritually**: Fajr training, fasted training, Sahabi-archetype blocks, strength feeding the Ummah Burden / Khalifate gates — strength as ibadah-for-responsibility, zero vanity.
- Phase 2 adds a **periodized programming engine + autoregulation + deload/injury management + Khalifa Trial capstone** — the full S&C-app-inside-the-app.

**Non-Goals**
- Not changing the internal pillar key `body` (would break state, stats, sync, equipment, progression math). Display + content + theme only.
- Not replacing the body pillar XP/level flow — the strength system is **layered on** the body pillar; body quest completion still awards body XP → overall level. Minimal disruption to progression math.
- Not a nutrition app, a form-coaching AI, or a medical device. Recovery/nutrition are tracked targets + Forge-Master nudges, not clinical guidance.
- Not claiming to produce Ali (RA)-level strength.

## 3. Decisions Locked

1. **Depth:** full retheme + build the Physics Gates as real benchmark dungeons + a real strength subsystem. (Not content-only.)
2. **Structure:** four-track content (Strength / Power / Endurance / Resilience) covering all ten physical qualities, **no new UI sections** — flat list like today, rethemed content.
3. **Benchmarks:** progressive scaling — achievable at E, escalating to the documented S-rank apex. Grounded in validated standards, not invented numbers.
4. **Target:** 10/10 for what an app can do; built in two phases (Phase 1 → 9/10, Phase 2 → 10/10).
5. **Internal pillar key stays `body`.** Display label, content, theme, and the new strength subsystem change; the key does not.

## 4. Architecture — How It Fits the Existing App

The Solo Leveling System is React 18 + Vite + Tailwind, state in `useStore`/`src/data/store.js` (deep-merge, localStorage + canonical Vercel/Gist sync), logic in `src/logic/`, static data in `src/data/`, AI persona in `src/services/aiAssistant.js`, progression via `src/logic/progression.js` + `src/logic/endgame.js` (the `runEndgameCycle` state machine chained into quest completion in `Dashboard.jsx`).

The strength subsystem layers onto the **body pillar** without restructuring progression:

```
Body quest completed (Dashboard.jsx handler)
  → body XP awarded (existing) → pillars.body.level (existing) → recalculateOverallLevel (existing)
  → runEndgameCycle (existing) → seerah/job-gate/monarch/khalifate (existing)
  → NEW: strengthLog.update(...) if quest was a logged strength session
  → NEW: recovery.update(...) if quest touched nutrition/sleep/mobility
  → NEW: physicalPower.trackProgress bump by track
```

The body pillar still drives the overall level; the new `strengthLog`, `recovery`, and `physicalPower` state slices are **parallel tracked systems** that the Physics Gates test and the (Phase 2) programming engine consumes. Existing endgame chains are untouched.

## 5. Phase 1 Design (→ 9/10)

### 5.1 Frame — pillar identity, AI persona, stat descriptions, alias

- `src/utils/pillarDisplay.js:3` — `body: 'Adventure'` → `body: 'Physical Power'`.
- `src/components/QuestCard.jsx:8` — body icon `Compass` → `Dumbbell` (lucide-react). Color stays `khalifa-amber`.
- `src/logic/questEngine.js:367` — add `'power'`, `'physical'`, `'fitness'` to the body-pillar alias normalizer (so custom quests + AI output can use them).
- `src/services/aiAssistant.js:183` — replace the ADVENTURE persona block with a PHYSICAL POWER block:
  > *"PHYSICAL POWER: The user forges physical power — strength, speed, explosive power, endurance, and resilience. Barbell lifts, calisthenics progressions, sprints, jumps, rucks, loaded carries, mobility, nutrition, sleep. Getting stronger, faster, more capable as a future khalifa who can carry the burden of his family and Ummah. Not outdoor roaming — disciplined, progressive physical training forged for service, not vanity."*
  - Update the "output as body" rule references (~lines 494, 500) to use Physical Power framing.
- `src/data/stats.js:3` — Strength description "Outdoor endurance. Boosts Adventure quest XP." → "Raw physical power. Boosts Physical Power quest XP."; Health → "Conditioning, stamina, and durability. Reduces fatigue."; Agility stays "Speed and consistency. Enables Flow State faster."
- `src/data/stats.js:85` — body→strength+agility `reason` "Adventure endurance and terrain readiness" → "Physical power and speed".

### 5.2 Four-Track Content Model

All body content is authored across four tracks covering the ten general physical qualities:

| Track | Qualities | Examples |
|---|---|---|
| **Strength** | maximal strength, strength-endurance | barbell squat/deadlift/press/row; pull-up/push-up/squat progressions |
| **Power** | power, speed, agility | jumps, throws, hill sprints, plyometrics, explosive lifts |
| **Endurance** | aerobic endurance, anaerobic capacity | Zone-2 runs/rucks, intervals, shuttle |
| **Resilience** | mobility, stability, grip, recovery | mobility routines, core/plank, carries, dead hang, sleep, protein, hydration |

Daily pools mix all four per rank (no new UI sections — flat list, rethemed). The existing `strength`/`agility`/`health` stats remain the abstract progression stats; the new `strengthLog` tracks *actual* lift numbers separately.

### 5.3 Daily Quest Pools Rewrite (E→S)

`src/data/questCatalog.js` `DAILY_QUEST_POOLS.body` (~48 quests, lines ~136–196): rewrite each rank's pool from outdoor-exploration to four-track training, escalating volume/intensity by rank. Representative content per tier:

- **E (Seeker):** "First Forge — Push-ups 3×8", "Squat Foundation 3×10", "Incline Rows 3×6", "20m Sprint ×4", "1K Jog", "5-Min Mobility", "Plank 30s". (Beginner baseline; bodyweight-only friendly.)
- **D (Striver):** "Push-ups 3×15", "Pull-up Negatives 3×5", "Goblet Squat 4×10", "Broad Jump 5×3", "1.6K Run", "Dead Hang 20s", "Protein hit (target g/kg)".
- **C (Disciplined):** loaded lifts enter — "Squat 3×5 @ 80% TM", "Deadlift 3×5 @ 80% TM", "Press 3×5", "Hill Sprints ×6", "5K Run", "Mobility 10min", "Sleep ≥7h".
- **B (Scholar):** "Squat/Deadlift/Press 5×5 progression", "Pull-ups ×8", "Box Jumps 5×3", "Ruck 10kg/3km", "400m Intervals ×5", "Farmer's Carry ×20m", "Recovery audit".
- **A (Guide):** PR-oriented strength, plyo, 10K, heavy ruck, compete-in-an-event quest.
- **S (Monarch/Khalifa):** peak programming — 2×BW squat work, weighted pull-ups, half-marathon prep, heavy ruck, lead-community-fitness quest.

Quest IDs stay stable; titles/descriptions/steps change. Strength-track quests at C+ are **generated from `strengthLog`** (prescribed sets/reps/% of training max) rather than static text; Power/Endurance/Resilience quests stay pool-based until Phase 2.

### 5.4 Level Story Quests Retheme (1→999 — the khalifa's physical forging)

- `ADVENTURE_LEVEL_QUEST_OVERRIDES` (lines ~881–1118, ~60 overrides) + `getMissionQuestForLevel` body archetypes (lines ~1125–1200): rewrite from adventure framing to forging-the-khalifa's-body, escalating E "first forge / awakening" → S "The Khalifa's Apex" (half-marathon, peak strength, lead others). Frame each level quest as a step in forging a body worthy of bearing the Ummah's burden.
- `JOB_CHANGE_QUESTS` body steps (lines ~1256–1260) + `src/data/jobChangeGates.js` body steps ("Adventure Foundation", "Warrior Adventure", "Strategist's Adventure", "Adventure Mastery") → "Physical Power Foundation", "Warrior's Power", "Strategist's Power", "Power Mastery".
- `REDEMPTION_QUEST_TEMPLATES` body entry (line ~1304) rethemed to a physical-power redemption.

### 5.5 Physics Gates — Test Batteries on Validated Standards

Replace `WEEKLY_DUNGEON_TEMPLATES.*.body` (lines ~1325–1374, currently "The Seeker's Trail", "The Explorer's Gate", … "The Divine Crucible") with the Physics Gates as **multi-event test batteries** (3–4 benchmark quests per gate, one per track). New data module `src/data/physicsGates.js` defines the standards; `src/data/strengthStandards.js` holds the validated reference tables (Indian Army fitness tests, strength-standard novice→elite by bodyweight, tactical/operator norms). Numbers are **starting calibrations**, tunable, and adapt to the user's bodyweight + equipment setting (5.10).

| Rank | Gate | Strength | Power | Endurance | Resilience & Capacity |
|---|---|---|---|---|---|
| E | Newton's Gate | 3×10 BW squat, incline row ×8, push-up ×20 | broad jump ~1.5m, 20m sprint | 1.6K run < 9:00 | 30s plank, dead hang 15s, 7h sleep avg, 5min mobility |
| D | Newton's Gate II | pull-up ×5, push-up ×30, squat 4×12 (or 1.25×BW) | broad jump ~1.8m, 20m sprint <4s | 1.6K run < 7:30 | 60s plank, dead hang 30s, protein target met |
| C | Thermodynamics Gate | squat 1.5×BW, deadlift 1.75×BW, press 0.75×BW, pull-up ×8 | broad jump ~2.0m, hill sprints ×6 | 5K run < 28:00, fasted workout (sunnah) | 90s plank, dead hang 45s, mobility 10min, sleep >85% |
| B | Relativity Gate | squat 1.75×BW, deadlift 2×BW, press 0.9×BW, pull-up ×10, push-up ×50 | broad jump ~2.2m, 300m shuttle | 5K < 25:00, ruck 10kg/5km < 60min | 2min plank, dead hang 60s, farmer's carry BW ×20m, sleep >85% |
| A | Quantum Gate | squat 2×BW, deadlift 2.5×BW, press 1×BW, pull-up ×15, weighted pull-up | PR broad jump, 300m shuttle <60s | 10K < 50:00, ruck 15kg/8km, 400m intervals ×6 | 3min plank, dead hang 90s, farmer's carry 1.5×BW ×30m, compete in an event |
| S | The Monarch's Apex (Khalifa Trial) | squat 2×BW, deadlift 2.5–3×BW, press 1.25×BW, pull-up ×20+, weighted pull-up +50%BW | broad jump ~2.5m+, box jump 36in, explosive lifts | half-marathon < 2:00, ruck 20kg/10km, 5K < 22:00 | 90+ day elite composition, lead community fitness, **Khalifa Trial composite in one day**: heavy ruck + loaded carry + 2×BW squat + broad jump + run |

Each gate = that rank's body weekly dungeon. Pass = complete all events; fail = existing debuff. The S-rank Khalifa Trial is the capstone "carry the burden" composite — applied capacity, not just reps. (Phase 2 refines the Trial into a fully programmed test day with autoregulated loading.)

### 5.6 Strength Log + Progressive Overload

New state slice `state.strengthLog` and logic `src/logic/strengthLog.js`:
- Tracks core lifts: back squat, deadlift, overhead press, bench press, barbell row; plus bodyweight progressions: pull-up, push-up, squat (pistol/archer paths when no barbell).
- Per lift: `trainingMax` (kg), `history[]` (date, sets, reps, weight, RPE/RIR), `lastTested`.
- **Progressive overload rule (Phase 1, simple linear):** if the last session hit all target reps at ≤ target RIR, increase load next session +2.5% (lower body) / +5% (upper); bodyweight progressions advance to the harder variation when rep ceiling met. Rep-max tests (periodic) recompute `trainingMax`.
- **Phase 1 scope:** linear progression + rep-max recalibration. The full 5/3/1-style training-max cycling + block periodization is Phase 2.
- Strength-track daily quests at C+ are **generated from the log**: "Squat 3×5 @ {0.8 × trainingMax}kg, Press 3×5 @ {0.8 × TM}kg, Row 3×5 @ {0.8 × TM}kg".
- New UI: **Power Log** panel (`src/components/PowerLog.jsx`) — log sets/reps/weight per lift, see training max + progression chart, run a rep-max test. Lives in the Legion tab (always-on) alongside existing skills/equipment/shadows.

### 5.7 Nutrition & Recovery Tracking

New state slice `state.recovery` and a small logic module:
- `proteinTarget` (g/kg bodyweight, ~1.6–2.2), daily protein hit logging.
- `sleepLog[]` (hrs, quality %), rolling average; B-gate's sleep >85% generalized.
- `hydration`, `mobilityMinutes`, `deloadState` (Phase 2 drives scheduled deloads; Phase 1 tracks).
- Resilience-track daily quests include nutrition/sleep/mobility targets; completion updates `state.recovery`.
- Forge-Master flags under-recovery (low sleep avg, missed protein, high training load without deload) — a nudge, not a block.

### 5.8 Capacity Tests

Applied-capacity quests/events at each gate and as periodic Resilience-track quests:
- Loaded carry for distance (farmer's walk, sandbag carry) — the "carry the burden" archetype.
- Ruck (weighted march) for distance/time.
- Grip endurance (dead hang, timed hang).
- Combined capacity test at gates (see 5.5 Resilience column).
- The S-rank Khalifa Trial (5.5) is the capstone composite.

### 5.9 Job-Gate / Mission-Gate / Rewards / Equipment Retheme

- `src/data/missionGates.js` body objectives ("Body of the Khalifa" ~17, "Physical Standard" ~29, "Lifetime Fitness" ~66, "The Final Sujood" body language ~126) — already physical-power-flavored; refine wording to Physical Power, keep objectives. These are the L100–999 "as a khalifa" final-level body gates.
- `src/data/missionQuestCatalog.js:38–51` — "Adventure With Restraint" readiness template → "Physical Power With Restraint".
- `src/data/missionPlan.js`, `missionDoctrine.js`, `src/logic/missionReview.js`, `missionMetrics.js`, `readinessProtocol.js` — "Adventure" framing strings → "Physical Power".
- `src/data/rewards.js` — ~20 `category: 'adventure'` items → `category: 'physical-power'`, rethemed from outdoor gear (hiking socks, trekking shoes) to training gear (lifting straps, running shoes, foam roller, gym bag, weight belt). Family-umrah goal reward kept, recategorized.
- `src/data/equipment.js:27` — `wanderer-cloak` and body-slot items → power-themed names ("Forged Vest", "Power Belt", "Iron Straps"). Slot/durability/enchant mechanics unchanged.

### 5.10 Equipment-Availability Adaptation (barbell / bodyweight / mixed)

A new setting `state.physicalPower.equipment` ∈ `barbell | bodyweight | mixed | kettlebell` — essential for an India-based user who may train at home without a barbell. The Strength track + Physics Gate strength standards adapt:

- **barbell:** full barbell lifts + standards as written.
- **bodyweight:** barbell lifts replaced by progressions — squat → split squat → pistol → shrimp; hinge → glute bridge → single-leg RDL → Nordic curl; press → pike push-up → handstand push-up; pull → incline row → pull-up → weighted pull-up; push → push-up → archer → one-arm. Gate strength standards expressed as progression milestones + rep targets instead of %BW.
- **mixed / kettlebell:** blended standards (e.g., goblet squat, KB swing, single-arm press).
- A **baseline test quest** at first launch calibrates starting `trainingMax` / progression entry point from the user's actual current numbers (not assumed).

### 5.11 Migration (stale titles + state shape + BUILD_VERSION)

- `src/data/store.js` `STALE_ADVENTURE_DAILY_TITLES` + `src/logic/stateMerge.js` mirror (lines ~4, 119–125): add all current adventure daily/level/dungeon titles so the solo user's stale quests force-refresh to the new Physical Power content on next load (the codebase's established content-migration pattern).
- `normalizeStateShape()` deep-merge: add `strengthLog`, `recovery`, `physicalPower` defaults (no data loss for existing states).
- `BUILD_VERSION` bump → `2026-06-24-physical-power`; `upgradeStateForCurrentBuild` initializes new state slices + sets `physicalPower.equipment` default (prompt on first launch via baseline test) + forces the stale-title refresh.

### 5.12 Files Touched (Phase 1)

**Edit:**
- `src/utils/pillarDisplay.js`, `src/components/QuestCard.jsx`, `src/logic/questEngine.js`, `src/services/aiAssistant.js`, `src/data/stats.js`
- `src/data/questCatalog.js` (pools, level overrides, mission-quest generator, weekly dungeons, job-change quests, redemption)
- `src/data/jobChangeGates.js`, `src/data/missionGates.js`, `src/data/missionQuestCatalog.js`, `src/data/missionPlan.js`, `src/data/missionDoctrine.js`, `src/logic/missionReview.js`, `src/logic/missionMetrics.js`, `readinessProtocol.js`
- `src/data/rewards.js`, `src/data/equipment.js`
- `src/data/store.js`, `src/logic/stateMerge.js` (migration + state shape)
- `src/components/Dashboard.jsx` (completion handlers call new strengthLog/recovery updates), `src/components/Legion.jsx` (mount PowerLog), `src/components/MissionCommandCenter.jsx:752` placeholder
- `CLAUDE.md` (§4.18 Physics Gates now match code; AI persona note; quest-pillar description; completed-work entry)

**New:**
- `src/data/physicsGates.js`, `src/data/strengthStandards.js`
- `src/logic/strengthLog.js`, `src/logic/recovery.js`
- `src/components/PowerLog.jsx`
- Tests: `src/logic/strengthLog.test.js`, `src/data/physicsGates.test.js`

## 6. Phase 2 Design (→ 10/10)

### 6.1 Periodized Programming Engine

New `src/logic/strengthProgram.js` replaces the body-pillar random pool as the content source. Generates 4-week blocks (3 progressive + 1 deload), rotating focus:
- **Strength block** — heavy barbell/core lifts, 3–5 rep range, linear→periodized progression.
- **Power block** — jumps, throws, plyos, explosive lifts, sprints.
- **Endurance block** — Zone-2 base + interval protocols (polarized 80/20).
- **Test/Deload block** — recalibrate training maxes, run a Physics Gate test, Khalifa Trial prep.

The day's body "quest" becomes that day's *programmed session* (e.g., "Week 2 Day 2 — Squat 5×3 @ 85%, Press 3×5 @ 80%, Power: box jumps 5×3"). Block goals + week/day schedule stored in `state.physicalPower.program`.

### 6.2 Autoregulation (RPE/RIR, training-max cycling)

- Sessions prescribe load as % of training max + target RPE/RIR; the user logs actual RPE. If RPE exceeds target, next-session load auto-reduces; if under, it advances. (5/3/1-style + RPE-based.)
- Periodic 1RM/rep-max tests recalibrate training maxes (already seeded in Phase 1 log; Phase 2 automates the cycle).
- The engine adapts to how strong the user *actually is* that day, not an assumed linear ramp.

### 6.3 Deload & Injury Management

- Programmed deload weeks every 4th week (load ~60%, reduced volume).
- `state.recovery.injury` flag + Forge-Master response: if flagged, the engine substitutes mobility/recovery sessions and halts progression until cleared.
- Form cues per lift (data in `strengthStandards.js`) surfaced in the Power Log; "consult a coach/doctor if pain persists" guard.
- Sensible progression rates capped so a 19-year-old chasing elite doesn't wreck himself.

### 6.4 Khalifa Trial Capstone

The S-rank Khalifa Trial (5.5) becomes a fully programmed, autoregulated test day + a multi-week prep block: heavy ruck for distance + loaded carry + 2×BW squat + broad jump + run, scored as a composite. Completion is the physical capstone of the Khalifate endgame — "the body that can bear the Ummah's burden."

### 6.5 Spiritual Integration — khalifa strength, not gym strength

- **Fajr training** sessions: program option to schedule primary sessions at/after Fajr (sunnah + discipline).
- **Fasted training** option: align strength sessions to Monday/Thursday fasts (sunnah); the C-gate's fasted workout generalized.
- **Sahabi-archetype blocks**: each programming block tied to a Sahabi archetype / Prophetic trait (extends the existing `src/data/seerahChains.js` + Nabawi Trait system to *physical* traits — e.g., a "Strength of Ali" block, an "Endurance of Bilal" block, a "Discipline of Umar" block), awarding a physical Nabawi Trait on completion.
- **Ummah feed**: strength milestones (gate clears, PRs, Khalifa Trial) feed the existing `src/data/ummah.js` Ummah Burden score + the Khalifate mission gates — strength forged *for service*, never vanity.
- Forge-Master persona: strength as ibadah-for-responsibility; every command frames training as preparing to carry the burden of family and Ummah.

### 6.6 Files Touched (Phase 2)

**New:** `src/logic/strengthProgram.js`, `src/data/sahabiArchetypes.js` (physical-trait blocks), tests `src/logic/strengthProgram.test.js`.
**Edit:** `src/data/seerahChains.js` (physical Nabawi Traits), `src/data/ummah.js` (strength milestone feed), `src/services/aiAssistant.js` (Fajr/fasted/service framing), `src/components/PowerLog.jsx` (program view + autoregulation UI), `src/data/store.js` (program state shape), `src/logic/strengthLog.js` (autoregulation hooks), `CLAUDE.md`.

## 7. Data Model / State Additions

```js
// Added to DEFAULT_STATE via normalizeStateShape deep-merge
state.strengthLog = {
  bodyweightKg: null,            // set at baseline test
  lifts: {
    squat:       { trainingMax: null, history: [], lastTested: null },
    deadlift:    { trainingMax: null, history: [], lastTested: null },
    press:       { trainingMax: null, history: [], lastTested: null },
    bench:       { trainingMax: null, history: [], lastTested: null },
    row:         { trainingMax: null, history: [], lastTested: null },
    pullup:      { trainingMax: null, history: [], lastTested: null }, // BW progression
  },
  baselineTested: false,
};

state.recovery = {
  proteinTarget: null,           // g/kg
  proteinLog: [],                // [{date, grams}]
  sleepLog: [],                  // [{date, hours, quality}]
  hydrationLog: [],
  mobilityMinutes: 0,
  injury: null,                  // Phase 2: { flagged, since, note }
  deloadState: null,             // Phase 2
};

state.physicalPower = {
  equipment: null,               // 'barbell' | 'bodyweight' | 'mixed' | 'kettlebell' (set on first launch)
  trackProgress: { strength: 0, power: 0, endurance: 0, resilience: 0 },
  gateResults: [],               // [{ rank, gate, passed, date, events }]
  program: null,                 // Phase 2: { blockType, week, day, sessions[] }
};
```

All additions are additive + nullable-default so existing states upgrade with no data loss. Synced via the existing canonical snapshot (the full-state sync already covers new fields).

## 8. UI Additions

- **Power Log panel** (`src/components/PowerLog.jsx`, Phase 1) — mounted in the always-on Legion tab. Log sets/reps/weight per lift; view training max + progression; run a rep-max test; see equipment setting + bodyweight. Phase 2 adds the program view (current block/week/day) + autoregulation UI.
- **Baseline test quest** (first launch) — calibrates starting numbers + equipment setting.
- **Recovery widget** — small Dashboard/Legion widget: protein hit today, sleep avg, recovery flag. (Phase 1 minimal; Phase 2 richer.)
- Quest cards: body icon `Dumbbell`, label "Physical Power", `khalifa-amber` color. No new sections.

## 9. Testing Strategy

- `npm run build` clean (project rule: build must pass before done).
- `npm run test:e2e` (Playwright render-safety smoke) green — the retheme + new panels must not break render.
- New unit tests:
  - `src/logic/strengthLog.test.js` — progressive-overload math, training-max update from rep-max, bodyweight-progression advancement, equipment-adaptation of standards.
  - `src/data/physicsGates.test.js` — gate standards per rank, pass/fail thresholds, equipment-adapted standards, Khalifa Trial composite.
  - `src/logic/strengthProgram.test.js` (Phase 2) — block generation, deload scheduling, autoregulation load adjustment, injury substitution.
- Existing tests stay green: `coreSystems.test.js`, `endgame.test.js`, `stateMerge` behavior, etc. The pillar key staying `body` is what protects the existing suite.

## 10. Risks & Mitigations

- **Scope.** Phase 1 alone edits ~20 files + adds ~6 modules. Mitigation: two-phase staging; each phase builds clean before the next; pillar key unchanged so existing tests guard regressions.
- **Benchmark calibration.** Gate numbers are starting estimates. Mitigation: grounded in validated tables (Indian Army, strength-standard, tactical); exposed as data for easy tuning; baseline test calibrates to the individual; Phase 2 autoregulation adapts to actuals.
- **Equipment access.** An India-based user may lack a barbell. Mitigation: equipment setting (5.10) with full bodyweight-progression path; gates adapt.
- **Injury / overtraining.** A 19-year-old chasing elite standards unsupervised risks harm. Mitigation: deload weeks, progression-rate caps, form cues, injury flag, Forge-Master under-recovery flags, "consult a coach/doctor" guard. Honesty in the UI: standards are targets, not commands to force.
- **Content volume.** Authoring ~48 daily + ~60 level + 6 gates × ~4 events + job gates + rewards + equipment is large. Mitigation: authored in Phase 1 implementation against the structure here; strength-track C+ quests generated from the log reduce static authoring.
- **Sync shape.** New state slices must merge cleanly cross-device. Mitigation: additive nullable defaults; the existing canonical snapshot + `stateMerge` deep-merge already handle new fields; add a `stateMerge` test for the new slices.

## 11. Open Questions for Planning

1. **Baseline numbers** — the user's current lift numbers / run times are unknown; the baseline test quest (5.10/8) calibrates. Should gates also scale dynamically to the log rather than fixed rank thresholds? (Lean: fixed rank standards as targets + dynamic autoregulation in Phase 2.)
2. **Equipment default** — barbell vs bodyweight for the user's real situation; resolved at first launch, but plan should confirm the default prompt copy.
3. **Khalifa Trial exact composite** — finalize the S-rank event list + scoring (5.5/6.4) during Phase 2 planning.
4. **Sahabi-archetype blocks** — confirm the archetype→trait mapping (6.5) against the existing seerah chain design so they compose.
5. **BUILD_VERSION migration behavior** — confirm whether the retheme refresh should also reset in-progress body quests/seerah chains or only purge stale titles.

## 12. Out of Scope

- Changing the internal `body` pillar key.
- Replacing the body pillar XP/level → overall-level progression math.
- A nutrition app, form-coaching AI, or medical/clinical guidance.
- Claiming Ali (RA)-level strength.
- Multi-user features; this remains the solo private app.
- Any change to Deen or Money pillar content (only the body pillar + cross-pillar framing strings).