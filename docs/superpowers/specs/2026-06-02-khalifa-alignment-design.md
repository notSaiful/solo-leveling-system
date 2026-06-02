---
title: "Khalifa Alignment — Rewriting Every Quest Around the Ummah Mission"
date: 2026-06-02
status: approved
---

# Khalifa Alignment Design

## Mission

Re-aim every quest, dungeon, gate, and chain in the Solo Leveling System at the user's true mission: forging a **Khalifa who bears the financial burden of the Ummah, leads Muslims toward Tawheed, and prepares to stand with Imam Mahdi (AS)**.

After this rewrite, no quest reads as generic self-help. Every action statement connects to the Khalifate mission.

## Pillar Framing (no new pillars)

| Pillar | Reframed Identity |
|---|---|
| Deen | Prophetic Leadership Engine |
| Body | Warrior-King Forge |
| Money | Ummah Treasury Builder (AI-first) |

The Ummah Service weekly dungeon is added as a **4th weekly dungeon card** (alongside the existing 3-pillar model), not a 4th pillar in `state.pillars`. The 3 daily pillars remain unchanged. This minimizes risk to XP, level-up, debuff, and stat-distribution systems while delivering the plan's "Ummah runs alongside" intent.

## Files Touched

| File | Action |
|---|---|
| `src/data/questCatalog.js` | Rewrite DAILY_QUEST_POOLS, LEVEL_QUESTS, JOB_CHANGE_QUESTS, REDEMPTION_QUEST_TEMPLATES, WEEKLY_DUNGEON_TEMPLATES (add 4th `ummah` key per rank), update helper `getWeeklyDungeonForRank` |
| `src/data/jobChangeGates.js` | Rewrite 5 gate definitions with new day-by-day content matching the plan |
| `src/data/seerahChains.js` | Refine description text on all 6 chains; align daily quest language to Khalifate framing |
| `src/data/equipment.js` | No change — already aligned |
| `src/data/skills.js` | No change — already aligned |
| `src/data/legacyShadows.js` | No change — already aligned |
| `src/data/rankDifficulty.js` | Rewrite `getScaledRedemptionQuest` to use Khalifate framing for live redemption titles/descriptions |
| `src/data/store.js` | Add `ummahCompleted` flag to default `weeklyDungeons` shape |
| `src/components/WeeklyDungeon.jsx` | Render 4th Ummah Service card; update bonus claim to require all 4 |
| `src/logic/questEngine.js` | Update `completeWeeklyDungeon` calls; weekly dungeon reset includes `ummah` |
| `src/logic/penalties.js` | Update `checkDungeonPenalty` to consider 4 dungeons instead of 3 |
| `src/App.jsx` | Pass `ummah` dungeon in weekly reset if needed |
| `src/components/Dashboard.jsx` | No hardcoded names — no change |
| `src/logic/coreSystems.test.js` | Update `weeklyDungeons` test shape if any test asserts on it |

## Schema Details

### `WEEKLY_DUNGEON_TEMPLATES` (per rank) — add `ummah` key

Each rank now has 4 dungeon templates: `deen`, `body`, `money`, `ummah`. The `ummah` template has the same shape as the others: `{ title, description, xp, steps[] }`. Content per the plan table.

### `weeklyDungeons` state shape

```js
{
  weekId: null,
  deenCompleted: false,
  bodyCompleted: false,
  moneyCompleted: false,
  ummahCompleted: false,   // NEW
  bonusClaimed: false,
}
```

Old states migrate automatically via the existing `normalizeStateShape` shallow merge in `store.js`.

### `getWeeklyDungeonForRank` helper

Now produces 4 dungeon objects instead of 3. The render loop in `WeeklyDungeon.jsx` iterates `['deen', 'body', 'money', 'ummah']` and applies the same `pillarMeta` UI mapping (with a new `ummah` meta entry — Crown icon, purple/gold theme, label "Ummah Service").

### All-4 bonus

`WeeklyDungeon.jsx` updates `allComplete` and `allClaimed` to include `ummahCompleted`. The "WEEKLY DUNGEON BONUS" claim still awards `xpMultiplier * 200` gold.

### Penalty check

`penalties.js:155` `checkDungeonPenalty` now considers all 4 completion flags.

## Daily Quest Pool (DAILY_QUEST_POOLS) Rewrite

For each of 6 ranks × 3 pillars × ~7-8 quests, every quest's `title` and `description` is rewritten to the Khalifate framing in the plan. Quest IDs stay stable (e.g., `d-deen-e-1`, `d-body-b-3`) so quest history and progress don't break. Only the `title` and `description` fields change.

Examples of changes (E-rank deen, currently generic):
- `d-deen-e-3` "Seerah Snapshot" → "Leadership Seed: Read 2 min on how the Prophet ﷺ handled pressure"
- `d-deen-e-4` "Evening Adhkar" → keeps meaning, updates description to "…you are training to lead"

Examples for Money E-rank (currently generic finance):
- `d-money-e-1` "Check Bank Balance" → "AI Foundation: Log expenses + identify one AI tool to learn"
- `d-money-e-4` "Read One Page" → "Study one AI concept (30 min: neural nets, transformers, etc.)"

## Level Quest Rewrite (LEVEL_QUESTS)

All 24 existing level entries are renamed to the plan's story-quest table:
- L1: "The System Awakens" → "The Khalifa Awakens"
- L5: "The Weakling's Gauntlet" → "The Aspirant's Trial"
- L10: "The Hunter's Threshold" → "The Apprentice's Oath" (includes first AI deployment)
- L15: "The Merchant's Mind" → "The Architect's Mind" (build first real AI system)
- L25: "The Elite Threshold" → "The Builder's Gate" (ship one AI product)
- L30: "The Knight's Oath" → "The Mujahid's Oath"
- L40: "Knight's Threshold" → "The Guardian's Gate"
- L50: "The Templar" → "The Qa'id's Command"
- L55: "The General's Threshold" → "The Strategist's Gate"
- L70: "The General's Threshold" → "The Khalifa's Ascension"
- Other levels: theme updates only

Quest `id` fields stay stable for backward compat.

## Job Change Quests (JOB_CHANGE_QUESTS) — Replace

Old 4: `job-merchant`, `job-knight`, `job-templar`, `job-monarch`.
New 4: `job-architect`, `job-mujahid`, `job-qa-id`, `job-khalifa`.

| Old | New | rank | levelRequired | newTitle |
|---|---|---|---|---|
| job-merchant | job-architect | D | 15 | Architect |
| job-knight | job-mujahid | C | 30 | Mujahid |
| job-templar | job-qa-id | B | 50 | Qa'id |
| job-monarch | job-khalifa | A | 76 | Khalifa |

The 5 gates in `jobChangeGates.js` already reward these exact titles (`Apprentice`, `Builder`, `Guardian`, `Strategist`, `Khalifa`). Gate reward.title will be updated to the new job name (Architect, Mujahid, Qa'id, Khalifa) so gate + job-change-quest names align.

Existing users with `completedJobChanges: ['job-merchant']` etc. in their state will retain that history (it's just an array of strings). The new jobs are still unlockable.

## Job Change Gate Rewrite (JOB_CHANGE_GATES)

Keep all 5 gates' `id`, `rank`, `levelRequired`, `days: 7` structure. Rewrite `title`, `steps[].title`, `steps[].description` to match the plan's day-by-day content. Update gate reward `title` to match the new job names.

## Seerah Chains Refinement

All 6 chains already exist with the right `levelRange`. Refinements:
- Each chain's `dailyQuests[i].description` is rewritten to be more explicit about Khalifate mission
- Al-Adl (5-15) — keep current "Stand for Justice / Fair Judgment / Protect the Weak" content, sharpen descriptions
- Al-Mujahid (85-95) — same

No new chains needed. Plan said "add 6 chains" but 6 already exist.

## Equipment + Skills

No code changes. Names already aligned with the plan.

## Legacy Shadows

No code changes. Already aligned.

## Tests

`src/logic/coreSystems.test.js` uses `weeklyDungeons: {}` in `baseState()` — this is a shallow empty object, so the new `ummahCompleted` flag is optional and tests still pass. No test changes needed unless a test asserts on a specific dungeon shape — none do.

## Build & Deploy

After all edits:
1. `npm run build` — must pass
2. `vercel --prod --yes` — deploy

## Out of Scope

- No new pillars in `state.pillars` (the 3-pillar model is preserved)
- No changes to the AI / Forge-Master persona
- No changes to the iOS build flow
- No changes to data sync, cloud sync, or canonical sync logic
- No changes to the Monarch Ascension trials, Ummah Command, or Ummah Burden Meter (already aligned)

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Existing quest history breaks when title/description changes | Low | Quest `id` fields preserved; only display strings change |
| WeeklyDungeon.jsx 4-card layout breaks mobile | Low | Cards stack vertically already; adding 1 more is fine |
| `getWeeklyDungeonForRank` change breaks `coreSystems.test.js` | Low | Tests use `weeklyDungeons: {}` empty object, no shape assertions |
| `normalizeStateShape` migration adds `ummahCompleted` to old states | None | Shallow merge is safe |
| Old `job-merchant` etc. references in cloud state | None | Array entries are inert strings; new gates just won't be triggered by them |

## Acceptance

- [ ] `npm run build` passes
- [ ] `vercel --prod --yes` succeeds
- [ ] All daily/weekly quests carry Khalifate mission language
- [ ] Weekly Dungeons screen shows 4 cards (Deen, Body, Money, Ummah Service)
- [ ] All-4 bonus claim requires Ummah dungeon completion
- [ ] No data loss for existing users
