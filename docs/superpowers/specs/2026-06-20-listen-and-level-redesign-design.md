# Listen & Level Redesign — Design Spec

- **Date:** 2026-06-20
- **Status:** Approved design (pending spec review)
- **Project:** Solo Leveling System (`/Users/saiful/solo-leveling-system/`)
- **Supersedes:** Quest-issuing model defined in `CLAUDE.md` §4 and the v3 Ultimate Evolution systems
- **Author:** Claude, with Saiful

---

## 1. Problem & Goals

### Problem
The current app is a **quest-issuing** system: it auto-generates daily quests (Fisher-Yates shuffle) and weekly dungeons and requires the user to complete them. This fails the user on two counts:

1. **Misalignment** — the predefined quests/dungeons do not match the user's actual daily work.
2. **No consistency on a task** — because quests are shuffled daily, the same activity never repeats day-to-day, so no per-task streak can form.

### Goals
1. **Log-and-level primary loop** — the user *tells* the app what they did (voice or text); the app parses it into activities and awards XP using the **same rank-scaled progression math** that already takes the user from E rank to S rank and beyond.
2. **Per-activity consistency** — each distinct activity the user repeats (e.g. "100 push-ups") builds its own streak and consistency score, feeding pillar XP.
3. **Adaptive difficulty** — when an activity is logged with a healthy streak, the system can suggest a harder version so the user can reach new heights (optional, one-tap accept).
4. **Quests become optional** — a "Guided Mode" toggle lets the user switch the old quests/dungeons back on only when they want structure. Off by default.
5. **Preserve the core** — rank E→S, levels, XP, 3 pillars, stats, gold, Forge-Master persona, Khalifa aesthetic, cloud sync, iOS build, and the history audit log all remain.

### Non-goals
- Multi-user, auth, monetization, analytics.
- Re-introducing the cut v3 systems in this cycle (seerah chains, job gates, equipment, skills, shadows, monarch trials, Ummah Command). They may be revisited later as separate specs.

---

## 2. Approach Decision

**Chosen: Canonical activity keys + AI effort-estimation fallback (option C).**

- A small seed catalog canonicalizes common activities to a stable `activityKey` + fixed base XP. This guarantees that logging "100 push-ups" two different ways maps to the **same** activity record → stable streak identity (the consistency fix).
- Anything not in the catalog gets an AI-generated `activityKey` + an `effortScore` (1-10) that drives XP. The user can one-tap "promote" a novel activity into the catalog so it gets fixed XP next time.
- The AI only **parses** (understands input, classifies pillar, estimates effort). A **deterministic engine** computes XP and mutates state. This keeps XP fair, consistent, and testable, and prevents AI mood/cost from affecting progression — matching the user's locked "Hybrid" decision.

**Rejected:**
- *Pure AI effort-estimation (A)* — flexible, but the same activity logged differently becomes multiple streak records, breaking consistency.
- *AI directly patches state (B)* — non-deterministic, contradicts the Hybrid decision.

---

## 3. Scope — Kept vs. Cut

### Kept (load-bearing core)
| System | Notes |
|---|---|
| Rank E→S + levels + `recalculateOverallLevel` | Weighted `deen*0.5 + body*0.3 + money*0.2`, never below strongest pillar. **Modified:** remove mission-gate level cap and skill-point awarding (see §10). |
| 3 pillars (deen/body/money) | level, xp, streak. |
| `xpForNextLevel`, pillar level-ups, `autoAssignStatPoints` | Stat points still auto-assigned by performance on pillar level-up. |
| 6 RPG stats + statPoints (pillar-derived) | Kept. |
| Streak bonus tiers, flow state, gold, reward store | Kept. |
| Forge-Master AI persona + OpenRouter/fallback | Kept; doubles as the parser brain. |
| Khalifa aesthetic, cloud sync, Capacitor iOS, history log | Kept. |
| Ummah Burden Meter | Kept — values-aligned manual tracker, not quest-coupled. |

### Cut (removed from UI + active logic; fields kept one migration cycle, then pruned)
| System | Reason |
|---|---|
| Auto daily quests (shuffle) | The model being replaced; becomes optional Guided Mode. |
| Weekly dungeons / Physics Gates | Becomes optional Guided Mode. |
| Seerah chains, Nabawi traits | Quest-coupled, elaborate. |
| Job-change gates | Quest-coupled boss fights. |
| Equipment, skills, shadows, legacy shadows | RPG fluff; doesn't serve log-and-level. |
| Monarch trials, Ummah Command | Endgame quest-coupled; UC was a placeholder. |
| Missed-quest/dungeon penalty + pillar debuffs | No required quests to miss. Replaced by per-activity streak resets + Never-Miss-Twice (less punitive, consistency-positive). |
| Mission gates / `khalifateObjectives` level cap **(judgment call)** | Was quest-fed. Logging alone now advances rank. *Reversible at spec review.* |
| Solo Clear bonus (0 AI prompts/week) **(judgment call)** | Every log calls AI to parse, so "0 AI prompts" no longer makes sense. *Reversible at spec review.* |
| Skill points + skills **(judgment call)** | Skills removed → SP has no use; `recalculateOverallLevel` stops awarding SP. *Reversible at spec review.* |

---

## 4. Core Loop & Primary Screen

The home tab becomes **Log** (replaces the old quest Dashboard).

```
+---------------------------------------+
|  KHALIFA                 E · Lv 7     |
|  [====.....] 320/450 to Lv 8         |
|  Deen [==..] Body [===.] Money [=..]  |
+---------------------------------------+
|                                       |
|   +---------------------------+       |
|   |  [ MIC ]  HOLD TO SPEAK   |       |
|   |  or type what you did...  |       |
|   +---------------------------+       |
|                                       |
|   -- Today's Log --                   |
|   [v] 100 push-ups   Body  +45 XP    |
|       Streak 6  ·  RARE               |
|   [v] Fajr on time   Deen  +30 XP    |
|       Streak 12 ·  UNCOMMON           |
|   [v] Validated 1    Money +60 XP    |
|       AI business idea                |
|                                       |
|   > Suggested next: 120 push-ups     |
|     (+12 XP)  [Accept] [Skip]         |
+---------------------------------------+
```

**Loop:** voice/text → `activityParser` produces structured activities → `logEngine.awardActivities` applies the preserved XP math → pillars/level/rank update → optional `suggestProgression` stretch goal → UI shows the breakdown and any level/rank-up.

No quests are shown unless Guided Mode is ON.

---

## 5. Module Design

### 5.1 `src/services/activityParser.js` (new)
```
parseActivities(text, { rankKey, level, catalog })
  -> Promise<{ activities: ParsedActivity[], crisis: false }
           | { crisis: true, message }>
```
- **Crisis scan first** — reuse the Forge-Master self-harm detection. If triggered, return the crisis branch (no parse, no XP) so the UI routes to the safety message + 112.
- Catalog fast-path: match the text against the synonym map to pre-fill `activityKey`/`pillar`/`baseXp`; the AI call still runs to split multi-activity sentences and score effort, but canonical keys reduce XP variance.
- Strict JSON schema, temperature 0.3, model fallback `openrouter/free` → `gpt-4o-mini`.
- Sanitize input (strip `[[CMD]]` markers) before sending.

```
ParsedActivity = {
  activityKey: string,    // canonical slug, e.g. "pushups"
  name: string,           // display name
  pillar: 'deen' | 'body' | 'money',
  quantity: number | null,
  unit: string | null,
  effortScore: number,    // 1-10
  notes: string | null,
}
```

### 5.2 `src/data/activityCatalog.js` (new)
```
CATALOG: { [activityKey]: { key, name, pillar, baseXp, unit, difficulty } }
SYNONYMS: { [phrase]: activityKey }    // "hundred pushups" -> "pushups"
lookupActivity(text) -> { key, pillar, baseXp } | null
promoteActivity(state, activityKey, fixedXp) -> state
```
Seed ~15-20 common activities across the three pillars (Fajr, Quran reading, adhkar, sadaqah, push-ups, pull-ups, run/hike, AI business task, halal income action, etc.). User-promoted activities live in `state.catalogOverrides`.

### 5.3 `src/logic/logEngine.js` (new) — the deterministic core
```
awardActivities(state, activities, today = getLocalDateString()) -> newState
```
Pure, no AI, fully unit-testable. For each activity (see §6 for the formula):
1. Resolve pre-base XP (catalog `baseXp`, or `effortScore × UNIT_XP` for novel); rank-scale via `getEffectiveXp`.
2. Update `state.activities[activityKey]` streak **first** (consecutive-day logic + Never-Miss-Twice, §7) so today's log counts toward the tier.
3. `applyStatModifiers(base, stats, pillar)`.
4. × activity streak bonus tier (§7), using the just-incremented streak.
5. × flow multiplier if active.
6. × 1.5 if `pillar === weeklyFocus`.
7. Apply daily cap per `activityKey` (§9).
8. `pillar.xp += final`, `pillar.streak += 1`, pillar level-up via `xpForNextLevel` + `autoAssignStatPoints`.
9. `gold += floor(final × 0.5)`.
10. Push `history` entry with `type: 'log'`.
11. After all activities: `recalculateOverallLevel`.
12. Return state + `systemMessages` (level-ups, rank-ups, streak milestones).

### 5.4 `src/logic/progression.js` (new) — shared progression math
Houses the cleaned canonical versions so both the log engine and (optional) Guided Mode share one source of truth:
```
recalculateOverallLevel(state) -> state          // MODIFIED: no mission-gate cap, no SP awarding
getActivityStreakBonus(streak) -> { multiplier, label }   // ported tiers (7/30/90/180/365)
checkFlowState(history, rankKey)                 // moved from questEngine
```
`questEngine.js` is gutted to only what Guided Mode needs and delegates progression to `progression.js`.

### 5.5 `src/hooks/useVoiceLog.js` (new)
```
useVoiceLog() -> { supported, listening, transcript, interim, start(), stop(), error }
```
Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), `continuous=false`, interim results shown. When `supported` is false (some iOS Safari), the UI surfaces the text field as primary with a clear notice.

### 5.6 `suggestProgression(activity, state)` (new, in logEngine or a helper)
```
suggestProgression(activity, state)
  -> Promise<{ suggestedName, suggestedQuantity, xpDelta, rationale } | null>
```
After awarding XP, if the activity has a streak ≥ 3 (or is cataloged), the AI proposes a stretch version (higher quantity/intensity) with the XP delta shown. One-tap **Accept for tomorrow** writes a soft target to `state.logTargets` (displayed in the Log tab, not forced). Skip = dismiss. Only suggests for cataloged or repeatedly-logged activities so the proposal is grounded.

### 5.7 Guided Mode (optional quests)
- `state.guidedMode.enabled` toggle in Settings, **OFF by default**.
- ON: existing `initializeDailyQuests` / `initializeWeeklyDungeon` run; a "Guided" tab shows quests/dungeons. Completion still flows through the shared pillar/level math in `progression.js`.
- OFF: those initializers are skipped; Log is home; no quest nagging.

---

## 6. XP Formula (preserved math, reused)

Built on the existing engine, fed by logged activities instead of shuffled quests. Of the multipliers below, **stat modifiers, rank scaling (`getEffectiveXp`), and `weeklyFocus ×1.5` are preserved from `completeDailyQuest` today** (verified in code — these are the only multipliers actually applied to XP now). **The streak-bonus and flow multipliers are newly activated** — both were already defined in the code (`getStreakBonus`, `checkFlowState`) but only ever *displayed*, never applied to XP. Activating them is precisely what makes consistency and flow pay.

```
preBase   = catalog[key].baseXp
           OR (effortScore * UNIT_XP)                            // novel; UNIT_XP = 8
base      = getEffectiveXp(preBase, rankKey, level)              // rank-scaled (preserved)

final     = floor(
              applyStatModifiers(base, stats, pillar)            // preserved
              * getActivityStreakBonus(activity.streak).multiplier  // newly applied (ported tiers)
              * (flowState.active ? flowState.multiplier : 1)    // newly applied (was display-only)
              * (weeklyFocus === pillar ? 1.5 : 1)               // preserved
            )

final     = min(final, dailyCapRemaining(activityKey))          // anti-gaming, §9

pillar.xp += final
pillar.streak += 1
gold      += floor(final * 0.5)
```

The activity streak is incremented (consecutive-day + Never-Miss-Twice logic, §7) **before** the bonus is read, so logging on day 7 earns the 7-day tier on that same log.

Then pillar level-up via `xpForNextLevel`, and `recalculateOverallLevel` → rank E..S.

**Removed multipliers** (systems cut): equipment, Nabawi traits, skills, debuffs, extreme-mode. **Removed from `recalculateOverallLevel`:** mission-gate level cap, skill-point awarding.

**Constants (explicit to remove ambiguity):**
- `UNIT_XP = 8` (so a 5-effort novel activity ≈ 40 XP pre-scale at E rank).
- Gold = `floor(final × 0.5)`.

---

## 7. Consistency Model (the heart of the request)

New state `state.activities[activityKey]`:
```
{
  name, pillar,
  streak,            // consecutive-day count
  bestStreak,
  lastLoggedDate,    // 'YYYY-MM-DD' (en-CA)
  totalSessions,
  totalReps,         // sum of quantity, if unit is countable
  consistencyPct,    // sessions / expected days since first log
  fixedXp,           // set when promoted to catalog; null if AI-estimated each time
  frozen,            // Never-Miss-Twice freeze
  createdAt
}
```

- **Streak increment:** logging `activityKey` on a date where `lastLoggedDate` is yesterday → `streak += 1`. Same-day repeat → no streak change (counts as another session, see daily cap).
- **Streak reset:** a gap > 1 day resets `streak` to 0 — **unless** `frozen` is true (Never-Miss-Twice): the first miss after a streak ≥ 7 consumes the freeze and preserves the streak; the next miss resets it.
- **Freeze earned:** a streak reaching a new tier (7/30/90/...) grants one `frozen = true`.
- **Bonus tiers** (ported from `getStreakBonus`): 7 → 1.15× UNCOMMON, 30 → 1.3× RARE, 90 → 1.5× EPIC, 180 → 1.75× MYTHIC, 365 → 2.0× LEGENDARY. The activity's own streak tier multiplies its XP.
- Pillar streaks still exist (any activity in that pillar bumps them), but the headline consistency the user sees and protects is **per-activity**.

This replaces the old punitive missed-quest debuff system with consistency-rewarding streaks — directly addressing the user's consistency complaint, and (per prior guidance) reducing the self-punishment psychology.

---

## 8. Adaptive Difficulty

After `awardActivities`, the UI calls `suggestProgression` for eligible activities (streak ≥ 3 or cataloged). The AI returns a grounded stretch (e.g. 100 → 120 push-ups) with the XP delta. Accept → `state.logTargets.push({ activityKey, targetQuantity, byDate })`, shown next day in the Log tab as a soft prompt. Skip → dismissed. No forced quests, no penalty for ignoring.

---

## 9. Error Handling & Anti-gaming

- **AI parse failure / 503 / 429** → fallback model → if all fail, save the raw text as a **pending log** (`state.pendingLogs`); user can retry or manually tag pillar + effort. **Never lose the user's input.**
- **Malformed AI JSON** → validate against schema, retry once, then best-effort single-activity entry with user confirmation.
- **Voice unsupported** → text input primary, clear notice.
- **Crisis detected** → short-circuit to safety message + 112, no XP, no parse.
- **Anti-gaming daily cap** — max **3 logs of the same `activityKey` per day** count for XP; beyond that the activity is recorded in history but awards 0 XP. This permits legitimate multiple sessions (two workouts) while capping "1000 push-ups" exploitation. The AI also sanity-checks unreasonable quantities (flags >2× the activity's prior max for review rather than awarding blindly).

---

## 10. Data Model — Schema v8 & Migration

### New fields
- `state.activities` — per-activity streak ledger (§7).
- `state.logTargets` — accepted stretch suggestions.
- `state.pendingLogs` — un-parsed/raw logs awaiting retry or manual tag.
- `state.guidedMode = { enabled: false, lastQuestDate: null }`.
- `state.catalogOverrides` — user-promoted activities with fixed XP.

### Reused
- `history` — add entries with `type: 'log'` (fields: `eventId, type:'log', activityKey, title, pillar, quantity, unit, xp, gold, localDate, completed`).
- `pillars`, `user`, `stats`, `gold`, `flowState`, `weeklyFocus`. The Never-Miss-Twice freeze moves to the activity record (`activities[activityKey].frozen`, §7); the old pillar-level `streakFrozen`/`failureStreaks` are deprecated and unused.

### Deprecated (keep with defaults for one cycle, remove from UI + active logic, then prune)
`dailyQuests`, `levelQuests`, `redemptionQuests`, `lastQuestDate` (top-level), `weeklyDungeons`, `aiDungeons`, `seerahChains`, `nabawiTraits`, `jobChangeGates`, `jobChangeQuests`, `completedJobChanges`, `equipment`, `skills`, `skillPoints`, `shadows`, `legacyShadows`, `legacyShadowProgress`, `monarchTrials`, `ummahCommand`, `weeklyStats.soloClear`, `khalifateObjectives`, `jobClass`, and the mission ledgers (`ummahImpactLedger`, `justiceResponseLedger`, `teachingPipelineLedger`, `familyCovenantLedger`, `livelihoodPipelineLedger`, `readinessProtocolLedger`, `missionWeeklyReviews`). `ummahBurden` is **kept**.

### Migration (`normalizeStateShape`, schema bump 7 → 8)
- Deep-merge new defaults; **existing rank/level/pillars/stats/gold/history are preserved with zero loss.**
- One-time pass: for each pillar with an existing `streak`, seed a synthetic `activities` entry (e.g. `__legacy_<pillar>`) carrying that streak so the user doesn't lose ongoing streak credit; or simply keep pillar streaks as-is and let per-activity streaks start fresh. **Decision: keep pillar streaks as-is; per-activity streaks start fresh on first log** (cleaner, no fake identity).
- Old quest/dungeon/v3 arrays are left in place but ignored (pruned in a follow-up cleanup commit).

---

## 11. Testing

Vitest, building on the existing test base:
- `logEngine.awardActivities` — deterministic: XP math (catalog + novel paths), stat modifiers, streak bonus tiers, flow multiplier, weekly focus, daily cap (3/day then 0 XP), pillar + overall level-up, rank-up, gold, Never-Miss-Twice freeze consume/preserve, streak reset on gap.
- `activityParser` — inject a fake AI: valid schema, multi-activity split, catalog fast-path mapping, malformed-JSON fallback, crisis-scan short-circuit.
- `useVoiceLog` — fallback path when `SpeechRecognition` is undefined.
- Migration — load a v7 state fixture, assert progress preserved, new fields defaulted, deprecated fields ignored.
- `npm run build` must pass clean (and the existing ~560KB chunk warning should shrink as cut systems are removed).

---

## 12. Out of Scope / Future

- Re-introducing any cut v3 system as a separate, optional spec (seerah chains, job gates, etc.).
- A public/multi-user version (would need real auth, real backend — explicitly not this cycle).
- Replacing the GitHub-Gist canonical sync with a granular backend.
- richer voice (Whisper/high-accuracy STT) — deferred; Web Speech first.

---

## 13. Resolved Judgment Calls (decided on "continue"; reversible at spec review)

1. **Mission gates / `khalifateObjectives` level cap** — CUT. Logging alone advances rank.
2. **Solo Clear bonus (0 AI prompts)** — DROPPED. Incompatible with AI-parsed logging.
3. **Skill points + skills** — CUT. No skills → no SP use; `recalculateOverallLevel` stops awarding SP. Stat points (pillar-derived, auto-assigned) remain.

---

## 14. Implementation Order (preview — full plan via writing-plans skill)

1. `progression.js` — extract + clean `recalculateOverallLevel`, port streak tiers, move flow check.
2. `activityCatalog.js` — seed catalog + synonym map.
3. `logEngine.js` — `awardActivities` + per-activity streak logic + daily cap.
4. `activityParser.js` — AI parse + crisis scan + fallbacks.
5. `useVoiceLog.js` — Web Speech + fallback.
6. Schema v8 migration in `store.js`.
7. New `Log` tab UI + wire to engine; gut old quest/dungeon UI; add Guided Mode toggle.
8. `suggestProgression` + targets UI.
9. Tests + `npm run build`.
10. Update `CLAUDE.md` to reflect the new model.