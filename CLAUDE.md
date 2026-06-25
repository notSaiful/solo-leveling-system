---
tags:
  - claude-instructions
  - solo-leveling-system
  - gamification
  - react
  - capacitor
  - ios
  - obsidian
aliases:
  - "SLS Project Brain"
  - "Forge Master System"
cssclasses:
  - cards
---

# Solo Leveling System — Claude Instruction File

> **Project Type:** Gamified Self-Development Web App (PWA + iOS)
> **Target User:** Muslim man, India, seeking disciplined self-improvement
> **Current Status:** Production-ready simplified web app + automated IPA builder (Schema v3 / Jargon-free UI)
> **Last Updated:** 2026-06-25
> **Vault Root:** This folder is an Obsidian vault. Open it in Obsidian to browse project knowledge.

---

## 1. Mission & Purpose

**The Solo Leveling System is NOT a game. It is a forge.**

The app gamifies Islamic self-development through three pillars — **Deen**, **Body**, and **Money** — using a rank-based progression system (E → S) inspired by the Solo Leveling universe. The user levels up by completing daily quests, surviving weekly dungeons, and enduring the Forge-Master AI's brutal accountability.

**Core Philosophy:**
- Zero excuses. Zero softness. Steel discipline.
- Every action is tracked. Every failure is penalized. Every victory is earned.
- The Prophet (SAW) and the Sahaba are the standard — not motivational quotes.
- The AI (Forge-Master) destroys excuses, not coddles them.

---

## 2. Target User Profile

| Attribute | Detail |
|-----------|--------|
| Identity | Muslim man, India, age 19, unmarried |
| Goal | Rapid self-development across spiritual, physical, and financial domains |
| Motivation | Discipline through gamification, Islamic framework; building capacity for future family/Ummah responsibility |
| Tech Level | Comfortable with web apps, wants iPhone native experience |
| Preferences | Dark Islamic aesthetic, no emojis unless requested, short concise responses |
| Business Context | Small investor focused on halal/Shariah-compliant stocks; runs AI ventures |
| Mission | Bearing the financial burden of the Ummah; becoming a role model like the Prophet (SAW) |

---

## 3. System Architecture

### Tech Stack
```
Frontend:     React 18 + Vite + Tailwind CSS + Framer Motion + Lucide React
State:        Custom hooks (useStore, useLevelUp, usePenaltyCheck)
Storage:      localStorage (offline cache) + Vercel API canonical snapshot
AI:           OpenRouter API (Forge-Master persona)
Mobile:       Capacitor iOS (IPA builds automated)
```

### Data Flow
```
User Action → useStore (localStorage) → Auto Cloud Sync (/api/sync-state)
                                             ↓
                                         Private GitHub Gist JSON snapshot
```

### Key Files
| File | Responsibility |
|------|---------------|
| `src/App.jsx` | Main app shell, tabs, error boundary, diagnostic panel |
| `src/hooks/useStore.js` | Central state management, localStorage persistence, deep-merge updates |
| `src/data/store.js` | Initial state, local persistence, canonical cloud init/reset |
| `src/services/aiAssistant.js` | Forge-Master API calls, synced chat context, OpenRouter integration, model fallback |
| `src/services/canonicalSync.js` | Client calls to the canonical sync API |
| `src/services/cloudSync.js` | Debounced sync wrapper and load/save bridge |
| `api/sync-state.js` | Vercel serverless sync endpoint backed by private GitHub Gist |
| `src/logic/questEngine.js` | Daily quest generation, completion, XP calculation, v3 system hooks |
| `src/logic/dungeons.js` | Weekly dungeon system |
| `src/logic/adminCommands.js` | AI-powered admin commands (`[[CMD]]` JSON blocks) |
| `src/logic/behaviorAnalyzer.js` | Accountability context, conversation summary |
| `src/logic/monarchTrials.js` | Monarch Ascension trials (stage 4 unlocks Ummah Command) |
| `src/data/questCatalog.js` | Quest templates, rank configs, level quests |
| `src/data/skills.js` | Skill templates, activation, cooldowns, effects |
| `src/data/equipment.js` | Equipment drops, durability, enchant, bonuses |
| `src/data/seerahChains.js` | Seerah Character Quest Chains, Nabawi Traits |
| `src/data/legacyShadows.js` | Manhood Forge Shadows (future child stat boosts) |
| `src/data/jobChangeGates.js` | Job Change Gates, rank locking, class unlocks |
| `src/data/ummah.js` | Ummah Burden score calculation and milestones |

### Related Design Documents
| File | Purpose |
|------|---------|
| `ULTIMATE-EVOLUTION-PLAN.md` | Full design doc for all 10 v3 gamification systems (executed 2026-05-31, before original level 50 trigger) |
| `docs/superpowers/specs/2026-06-02-khalifa-alignment-design.md` | Khalifa-alignment spec: Khalifate-framed quests, 4th Ummah weekly dungeon, 4 new job classes |

---

## 4. Core Systems

### 4.1 Three Pillars
- **Deen:** Islamic knowledge, prayers, Quran, charity
- **Body:** Physical training, diet, sleep discipline
- **Money:** Wealth generation, halal investing, ummah support

Each pillar has: Level, XP, Streak, Active Debuffs

### 4.2 Rank System (E → S)
| Rank | Name | Level Range | XP Mult | Stat Pts/Lvl |
|------|------|-------------|---------|--------------|
| E | Seeker | 0-10 | 1.0 | 1 |
| D | Striver | 11-25 | 1.3 | 2 |
| C | Disciplined | 26-45 | 1.6 | 3 |
| B | Scholar | 46-70 | 2.0 | 4 |
| A | Guide | 71-99 | 2.5 | 5 |
| S | Monarch | 100-999 | 3.0 | 6 |

XP is scaled by rank via `getEffectiveXp` (xpMultiplier column). Stat points awarded per level-up follow the statPointsPerLevel column.

### 4.3 Daily Quests
- Fisher-Yates shuffle selection from quest catalog
- Scales with rank and level
- Must be completed before midnight (local timezone, `en-CA` format)
- Flow state: 3+ quests within 60 min window = 1.5x XP multiplier

### 4.4 Weekly Dungeons
- Rank-specific challenge sets
- Resets every Monday
- Failure incurs debuffs

### 4.5 Penalty System
- Missed quests → pillar-specific debuffs
- Debuffs reduce XP gain, apply visual indicators
- Penalties checked on mount via `usePenaltyCheck`

### 4.6 Shadow Extraction
- Unlocks at higher ranks
- Shadow army grows as user progresses
- Visual representation in UI

### 4.7 Reward Store
- Gold currency earned from quests
- Purchasable rewards with cooldown timers
- Custom reward creation supported

### 4.8 Stat Distribution
- Stat points awarded on level-up
- Build system (Warrior, Scholar, Merchant, etc.)

### 4.9 Job Change Gates (v3)
- 7-day boss gates at levels 10 (D), 25 (C), 40 (B), 55 (A), 70 (S)
- Lock rank progression until gate is cleared
- Each day has a boss quest; fail any day = rank demotion + retry next week
- Pass = unlock class title + skills + gold + stat points
- UI shows current active step with "Complete Step" button in Dashboard

### 4.10 Skills (v3)
- 4 skill templates: Takbeer Sprint (2x Body XP), Iron Will (debuff immunity), Zakat Blast (3x gold), Shadow March (auto-complete)
- Cooldown system with `lastUsed` timestamps
- Activation UI in Legion tab with cooldown timer
- Effects applied in `completeDailyQuest` and `completeWeeklyDungeon`
- 1 Skill Point (SP) awarded per 5 overall levels

### 4.11 Equipment Drops (v3)
- 15 items across 3 tiers (durability 100/150/200)
- Slots: weapon, armor, ring
- 15% base drop chance per weekly dungeon claim; **guaranteed on Solo Clear**
- Durability: +5 on daily completion, -10 on missed day
- Enchant: +1 after every 30-day streak milestone
- XP bonuses applied in quest completion pipeline

### 4.12 Seerah Character Quest Chains (v3)
- 4 chains: As-Siddiq (15-25), As-Sabir (30-40), Al-Amin (50-60), Ar-Rasul (70-80)
- 21-day progression; failure on any day resets the chain
- Daily seerah quests injected into daily quest list automatically
- Completion awards **permanent Nabawi Trait** (irrevocable, soul-bound)
- Traits provide: XP bonuses, debuff immunity, debuff duration reduction

### 4.13 Manhood Forge Shadows (v3)
- 5 extractable shadows from mentoring/teaching quests
- Do NOT boost the user's stats — boost **future children's starting stats**
- Extraction UI in Legion tab with manual "Extract" buttons
- Shadows: Teacher (+2 INT), Presence (+2 MANA), Discipline (+2 STR), Provider (+2 SENSE), Character (+2 HEALTH)

### 4.14 Solo Clear Bonus (v3)
- Earned by using **0 AI prompts** in a calendar week
- Tracked via `weeklyStats.aiPromptsUsed` (increments on every AIAssistant send)
- Resets every Monday alongside weekly dungeons
- Effects: 2x XP on weekly dungeons + guaranteed equipment drop + guaranteed shadow extraction
- UI shows counter and solo clear status in WeeklyDungeon page

### 4.15 Monarch Ascension (v3)
- 4 capacity trials after level 76: Financial, Physical, Knowledge, Final (40-day mastery)
- Auto-progresses as overall level increases (stages 1-3)
- Stage 4 requires 40 consecutive days with 3+ pillar completions per day
- Completion unlocks **Ummah Command** tab
- Dashboard widget shows active stage and progress

### 4.16 Ummah Command (v3)
- Unlocked only after completing Monarch Ascension
- Conditional tab appears in bottom nav (crown icon)
- Future hub for family/team quest linking
- Currently shows placeholder for linked members

### 4.17 Ummah Burden Meter (v3)
- Score = (familySupported × 10) + (zakatPaid × 5) + (sadaqahJariyah × 3) + (muslimVentures × 20)
- Input form in Settings tab with live score calculation
- Milestones: Household Secured → Extended Family → Community Impact → Ummah Burden Bearer → Khalifa-Level Stewardship
- Dashboard widget shows score and current milestone badge

### 4.18 Physics Gates (v3)
- All Body weekly dungeons renamed with physics-themed names:
  - E: Newton's Gate (20 pull-ups, 50 push-ups, 2x BW squat)
  - D: Newton's Gate II (25 pull-ups, 75 push-ups, 2.5x BW squat)
  - C: Thermodynamics Gate (5K <25min, fasted workout, cold shower)
  - B: Relativity Gate (sleep >85%, mobility 20min, post-workday workout)
  - A: Quantum Gate (PR attempt, compete, train to D-rank)
  - S: The Monarch's Apex (half-marathon, elite composition 90+ days, lead community fitness)

### 4.19 Physical Power & Power Log (v9)
- **Power Log Component:** Mounted in Legion tab. Displays lifts (Squat, Deadlift, Press, Bench, Row, Pull-up) with training maxes, history, and bodyweight. Prompts for baseline seeding and equipment choice (barbell/bodyweight/mixed/kettlebell) on first launch.
- **Side Effects Integration:** Completing body-pillar daily/level/redemption/custom quests with tag `strength`/`nutrition`/`sleep` or track `strength`/`resilience` automatically updates `strengthLog` (advancing progression milestones) and `recovery` (protein/sleep logs).

---

## 5. AI Integration — The Forge-Master

**Model Configuration:**
```javascript
PRIMARY_MODEL   = 'openrouter/free'          // OpenRouter free-tier router (rotates free models)
FALLBACK_MODEL  = 'openai/gpt-4o-mini'       // Reliable small model fallback
```

**Temperature:** Fixed at `0.85` for all calls (OpenRouter free router performs best with moderate temperature).

**Why this configuration:** The `openrouter/free` endpoint routes to whatever free models are currently available on OpenRouter. While individual free models vary in quality, the fallback to `gpt-4o-mini` ensures reliability for critical structured output (quest forging, `[[CMD]]` parsing). `gpt-4o-mini` is extremely cost-efficient and serves as the safety net when the free router is overloaded or returning low-quality responses.

**Key Behaviors:**
- AI calls route via `src/services/aiAssistant.js`. When `getApiKey()` returns `''` (no `sk-` key in localStorage), requests go to the `/api/forge-master` proxy. Never hardcode keys.
- Custom key support via `localStorage.setItem('openrouter_api_key', key)`
- `sanitize()` strips `[[CMD]]` from user-influenced strings (prompt injection protection)
- Admin commands embedded in JSON inside `[[CMD]]` / `[[/CMD]]` markers
- Brutal, Islamic, zero-excuses personality
- Every response ends with a COMMAND, not a suggestion
- Temperature tuned per call type: 0.3 for structured output, 0.5 for chat, 0.6 for motivation

**Error Handling:**
- 429 → Rate limit, retry later
- 401 → Key rejected
- 402 → Credits exhausted
- 503 → Service unavailable, fallback triggers

**Diagnostic Panel:**
- Located in Settings tab
- Tests OpenRouter connection directly with `fetch()`
- Shows key status and real-time connection test

---

## 6. Cloud Sync (Canonical Snapshot)

**Status:** Auto-sync active. No manual toggle needed.

**Runtime Configuration:**
```javascript
// Client build-time secret
VITE_SLS_SYNC_SECRET

// Server runtime secrets
SLS_SYNC_SECRET
GITHUB_TOKEN
SLS_GIST_ID
```

**Synced Data:**
- One full JSON state snapshot containing all progress, quests, stats, rewards, history, dungeons, system messages, Forge-Master chat history, and AI-generated state
- localStorage remains the instant offline cache
- The Vercel API is the only cross-device source of truth

**Sync Strategy:**
- `initCloudSync`: loads the canonical snapshot before penalties, quest rotation, and dungeon initialization
- Newer `lastUpdated` wins so an old browser cannot overwrite newer progress
- Forge-Master chat lives in `state.aiChatHistory`; old `system_chat_history` localStorage is only a one-time migration source
- Daily quests keep the most recent `lastQuestDate` during merge
- `syncStateToCloud`: uploads the full normalized snapshot through `/api/sync-state`
- Old custom quests missing `id` are normalized to stable `uniqueId`/`id` keys

---

## 7. iOS Build System

### Local Build
```bash
bash build-ios-ipa.sh
```
- Builds web app → syncs Capacitor → compiles Xcode → packages IPA
- Tries device build (`iphoneos`) first, falls back to simulator
- Output: `SoloLevelingSystem.ipa` (521KB, unsigned)

### Cloud Build (Zero Effort)
- GitHub Actions workflow: `.github/workflows/build-ios-ipa.yml`
- Triggers on push to `main`/`master` or manual dispatch
- Runs on `macos-latest` with Xcode pre-installed
- Uploads IPA as downloadable artifact

### Installation Methods
1. **AltStore** (free, no jailbreak) — https://altstore.io
2. **Sideloadly** (free, no jailbreak) — https://sideloadly.io
3. **Apple Developer** ($99/year) — official signing

**Note:** Unsigned IPA expires every 7 days with free tools. AltStore/Sideloadly handle re-signing.

---

## 8. Completed Work (Chronological)

| # | Task | Status |
|---|------|--------|
| 1 | Project Scaffold | ✅ |
| 2 | Data Layer | ✅ |
| 3 | Game Logic (quest engine, XP, penalties) | ✅ |
| 4 | React Hooks (useStore, useLevelUp, usePenaltyCheck) | ✅ |
| 5 | Core UI Components | ✅ |
| 6 | Main Screens (Dashboard, Stats, Dungeons, Store, Build, Settings) | ✅ |
| 7 | App Assembly & Build | ✅ |
| 8 | Penalty System + Level-Unique Quests | ✅ |
| 9 | Advanced Gamification (shadows, flow state, debuffs) | ✅ |
| 10 | Solo Leveling Anime UI Redesign | ✅ |
| 11 | Rank System E→S with Quest Catalog | ✅ |
| 12 | OpenRouter Model Fix (switched to gpt-4o-mini primary) | ✅ |
| 13 | Critical/High Audit Fixes | ✅ |
| 14 | Cloud Auto-Preconnect (removed manual toggle) | ✅ |
| 15 | Custom Quest Completion Tracking Fix | ✅ |
| 16 | Custom Quest Reset Logic | ✅ |
| 17 | Bonus XP Level-Up Stat Points Fix | ✅ |
| 18 | Flow State Detection & Integration | ✅ |
| 19 | Consolidate Duplicate Rank Definitions | ✅ |
| 20 | Dead Code Removal | ✅ |
| 21 | UI & Input Validation Fixes | ✅ |
| 22 | Settings Cleanup (removed Cloud Sync & AI manual inputs) | ✅ |
| 23 | Cache-Busting Meta Tags + Clear Cache Button | ✅ |
| 24 | Full Snapshot Sync Coverage (all data types) | ✅ |
| 25 | Automated IPA Builder Script | ✅ |
| 26 | GitHub Actions Cloud Build Workflow | ✅ |
| 27 | Canonical Vercel/Gist Sync + Legacy Backend Removal | ✅ |
| 28 | Schema v3 Upgrade (Ultimate Evolution) | ✅ |
| 29 | Job Change Gates System | ✅ |
| 30 | Skills System with Cooldowns | ✅ |
| 31 | Equipment Drops + Durability + Enchant | ✅ |
| 32 | Seerah Character Quest Chains | ✅ |
| 33 | Manhood Forge Shadows | ✅ |
| 34 | Solo Clear Bonus (AI Prompt Counter) | ✅ |
| 35 | Monarch Ascension Trials | ✅ |
| 36 | Ummah Command Tab | ✅ |
| 37 | Ummah Burden Meter | ✅ |
| 38 | Physics Gates Renaming | ✅ |
| 39 | Legion Tab (Skills/Equipment/Shadows) | ✅ |
| 40 | Skill Activation UI | ✅ |
| 41 | Legacy Shadow Extraction UI | ✅ |
| 42 | Job Change Gate Step Completion UI | ✅ |
| 43 | Seerah Quest Auto-Injection + Auto-Fail Logic | ✅ |
| 44 | Khalifa-Alignment Design Spec (`docs/superpowers/specs/2026-06-02-khalifa-alignment-design.md`) | ✅ |
| 45 | Khalifate-Framed Quest Catalog (all 6 ranks × 3 pillars + 4th Ummah weekly dungeon) | ✅ |
| 46 | Job Change Classes Rewritten (Architect/Mujahid/Qa'id/Khalifa) | ✅ |
| 47 | Seerah Chains Refined + Defensive Guards + Test baseState v3 defaults | ✅ |
| 48 | Monday Reset Bug Fix (App.jsx) — single penalty path covers all 4 dungeons | ✅ |
| 49 | Production Deploy to Vercel (https://solo-leveling-system-psi.vercel.app) | ✅ |
| 50 | Khalifa Endgame Arc — Phase 1: reactivate v3 endgame in log loop + always-on Legion/Missions tabs + gate-capped leveling + `Zap` import fix in MissionCommandCenter | ✅ |
| 51 | Stats tab crash fix — add missing `Skull` lucide import to `StatsPanel.jsx` (Active Penalties block only threw once a debuff went live) | ✅ |
| 52 | Remove Log/voice pipeline — delete `LogTab`, `useVoiceLog`, `activityParser`, `activityCatalog`, `logEngine` (+tests); default landing tab → Missions | ✅ |
| 53 | Guided Mode default — `guidedMode.enabled` defaults `true` + BUILD_VERSION migration forces it on once for existing users (future manual toggles respected) | ✅ |
| 54 | Rewire endgame into quests — `runEndgameCycle` moved to `src/logic/endgame.js`, called from Dashboard.jsx quest-completion handlers (try/catch-wrapped) | ✅ |
| 55 | Fix cross-device sync XP/gold loss — `stateMerge.js` replayed missing history against the already-unioned `merged.history`, so `applyHistoryReward`'s "already in history" guard flagged every missing event as processed and skipped it. Reordered to replay against `base.history` only, then union. | ✅ |
| 56 | Physical Power retheme Phase 1 — body pillar renamed to 'Physical Power'; daily quest pools, level-story quests, weekly dungeons (Physics Gates), job-gate steps, and body redemption templates fully rethemed; created <PowerLog /> with equipment-adaptation (barbell/bodyweight/mixed/kettlebell) and baseline seeding; wired side effects linking body quest completion to strength logs (progressive overload) and recovery tracking (protein/sleep logs) in Dashboard.jsx | ✅ |
| 57 | Jargon-free UI Simplification — Reduced navigation to 4 main tabs (Quests, Workouts, Ummah Ledger, Settings); pruned RPG game jargon (Hunter Candidate, Knight, Monarch, etc.) from ranks and config; extracted workout logs into a dedicated "Workouts" tab; stripped the header of gaming currency/stats; updated Playwright E2E tests for the simplified layout | ✅ |

---

## 9. Known Issues & Pending Tasks

### Pending Tasks (from task tracker)
- [x] **#31: Fix timezone bug in date comparisons** — Date logic now uses `getLocalDateString()` from direct local Date components
- [x] **#32: Fix legacy sync gaps** — Old split sync path removed; canonical full snapshot is now the single sync path
- [x] **#33: Harden canonical sync security** — Current solo-use design is acceptable; no multi-user exposure

### Known Limitations
- **Chunk size warning:** Vite build produces JS chunk ~560KB. Consider code-splitting with dynamic imports if performance becomes an issue
- **Free model reliability:** `openrouter/free` routes to whatever free models are currently available on OpenRouter. Quality varies by model. The fallback to `gpt-4o-mini` ensures reliability for critical operations. The free router may experience rate limits (429) or temporary unavailability (503).
- **Unsigned IPA:** Must be re-signed every 7 days via AltStore/Sideloadly
- **Browser cache:** Users with old JS bundles may need "Clear Cache & Reload" from Settings
- **Client-visible sync secret:** Current design is acceptable only for a solo private app. A public multi-user version needs real authentication.

### Schema v3 Migration Notes
- Existing v2 states are automatically upgraded via `normalizeStateShape()` deep-merge
- New fields: `skills`, `skillPoints`, `equipment`, `seerahChains`, `nabawiTraits`, `legacyShadows`, `jobChangeGates`, `monarchTrials`, `ummahCommand`, `weeklyStats`, `ummahBurden`
- No data loss on upgrade — old states preserve all progress while gaining new defaults

### Required User Actions
1. **Use the Vercel URL as the canonical app entrypoint** so every browser/device hits the same sync API
2. **Push to GitHub** to activate cloud IPA builds
3. **Install IPA** via AltStore/Sideloadly for iPhone testing

---

## 10. Development Guidelines

### When Modifying This Project
1. **Always use deep-merge in `useStore`** — Never overwrite nested objects directly:
   ```javascript
   // CORRECT
   setState(prev => ({ ...prev, user: { ...prev.user, name: newName } }));
   
   // WRONG — loses other user fields
   setState(prev => ({ ...prev, user: { name: newName } }));
   ```

2. **Date comparisons use `toLocaleDateString('en-CA')`** — YYYY-MM-DD format, local timezone

3. **Never hardcode API keys in fetch calls** — Always import `getApiKey()` from `aiAssistant.js`

4. **Sanitize user input before embedding in AI prompts** — Use `sanitize()` to strip `[[CMD]]`

5. **Test `npm run build` before declaring done** — The build must pass cleanly

6. **Keep the Forge-Master persona intact** — No softness, no emojis, commands not suggestions

### v3 System Integration Guidelines
7. **State chaining in quest completion** — When multiple systems modify state (seerah → equipment → skills), always derive the next state from the *previous* modified state, not the original:
   ```javascript
   // CORRECT
   let seerahState = state;
   if (quest.source === 'seerah') seerahState = advanceSeerahChain(seerahState, ...);
   let durabilityState = updateDurability(seerahState, ...); // use seerahState, not state
   
   // WRONG — overwrites seerah changes
   let durabilityState = updateDurability(state, ...);
   ```

8. **Seerah quest lifecycle** — Seerah quests are injected into `dailyQuests` by `injectSeerahDailyQuests()`. They are regular daily quests with `source: 'seerah'` and `chainId`. On completion, `completeDailyQuest` detects the source and calls `advanceSeerahChain`. On missed days, `initializeDailyQuests` detects the failure and calls `failSeerahChain`.

9. **Solo Clear tracking** — `weeklyStats.aiPromptsUsed` increments in `AIAssistant.handleSend()` and `handleQuickAction()`. It resets every Monday in `App.jsx` alongside weekly dungeon reset. The bonus applies only when `aiPromptsUsed === 0` at weekly dungeon claim time.

10. **Job Change Gate state shape** — Gates use `gateId` (not `id`), `rank` (not `targetRank`), `day/totalDays` (not `currentStep/totalSteps`), and `steps[]` array with `completed` booleans. Always import from `jobChangeGates.js`, never hardcode the shape.

11. **No `require()` in Vite** — All modules must use ES6 `import`/`export`. Dynamic `require()` causes build failures.

### File Organization
- `src/components/` — React UI components
- `src/hooks/` — Custom React hooks
- `src/logic/` — Game logic, quest engine, analyzers
- `src/data/` — Static data, initial state, catalogs
- `src/services/` — External API integrations
- `ios/App/` — Capacitor iOS native project
- `api/` — Vercel serverless endpoints
- `.github/workflows/` — CI/CD automation

---

## 11. User Preferences (Do Not Forget)

- **Terse responses preferred** — User dislikes long summaries
- **No emojis unless explicitly requested**
- **Always test builds with `npm run build`** before reporting completion
- **Implement AND test until it works** — User expects working code, not "try this"
- **Muslim context matters** — All features should respect Islamic principles
- **India context** — Timezone, market references, cultural framing
- **Small investor background** — User understands business, AI, and tech

---

## 12. Quick Reference Commands

```bash
# Local dev
npm run dev

# Production build
npm run build

# E2E render-safety smoke (builds, serves via vite preview, headless Playwright)
npm run test:e2e

# iOS IPA build
bash build-ios-ipa.sh

# Capacitor sync
npx cap sync ios

# Open iOS project in Xcode
npx cap open ios
```

---

## 13. Related Projects (From User Memory)

All persistent memory files are stored in the `memory/` folder of this vault:

- [[memory/user_profile]] — User profile (role, goals, preferences)
- [[memory/solo-leveling-system]] — This project summary
- [[memory/agentive-platform]] — CRE AI platform
- [[memory/halal-stock-agent]] — Halal stock analysis AI agent
- [[memory/geowind-india-project]] — AI-powered VAWT turbine business
- [[memory/ai-personalized-medicine]] — AI custom medicine venture
- [[memory/langsmith-sarah-integration]] — VAPI voice agent (Sarah)
- [[memory/MEMORY]] — Master index of all memories

## 14. Guided Mode & Endgame (v8)

**Log/voice pipeline removed (2026-06-23).** The v8 "Listen & Level" log flow — `useVoiceLog` (Web Speech), `LogTab`, `activityParser`, `activityCatalog`, `logEngine` (`awardActivities` + `runEndgameCycle`), and all their tests — is fully deleted. XP now flows only through the quest/dungeon pipeline (Guided Mode).

**Guided Mode is the default XP path.** `state.guidedMode.enabled` defaults to `true` (DEFAULT_STATE + `?? true` in normalize) and is forced on once via a BUILD_VERSION migration in `upgradeStateForCurrentBuild`, so existing users flip on a single time and future manual toggles are respected. Quests, dungeons, and penalties are gated on it and now active by default. The Guided tab still appears in the nav only when enabled (toggling off hides it). Default landing tab is **Missions**.

**Endgame rewired into quest completion.** `runEndgameCycle` (chained idempotent initializers — seerah chain, job-change gate, monarch trials, khalifate objectives, job-gate auto-advance) moved out of the deleted log loop into `src/logic/endgame.js` and is now called from the four quest-completion handlers in `Dashboard.jsx` (daily, level-sub-quest, redemption, custom), each call try/catch-wrapped so an endgame throw can never crash quest completion (the Monday-crash lesson). History-based endgame checks (`autoAdvanceJobGate`, `checkMonarchTrialProgress`) are type-agnostic — they count any completed history entry with `xp > 0` for today, so they advance identically from quest completions (`type: 'daily'`/`'custom'`) as they previously did from log entries. `recalculateOverallLevel` re-enforces khalifate mission gates (L100/200/…/999): ascension pauses at the first incomplete gate until its objectives are done; below L100 levels climb freely (job gates L10-70 award class titles, non-capping). Monarch stage-4 counts 3 DISTINCT pillars with XP-earning history (not 3 same-pillar). Two always-on tabs (no Guided gate): **Legion** (`src/components/Legion.jsx` — shadow army, job gates, seerah, monarch trial, khalifate objectives, equipment, skills) and **Missions** (mounts `MissionCommandCenter.jsx` with all 6 mission ledgers). BUILD_VERSION bumped to `2026-06-23-remove-log-guided-default`. Tests: `src/logic/endgame.test.js` (idempotency + monarch stage-4 distinct-pillar + L10 job-gate init). Phases 2-4 outlined in `~/.claude/plans/fluffy-cuddling-lantern.md`.

**Cross-device sync XP/gold loss fixed (2026-06-23).** `mergeStatesForSync` (stateMerge.js) was silently dropping the non-base device's XP/gold when two devices completed *different* quests: it unioned `merged.history` (line ~300) *before* replaying `missingHistory`, so `applyHistoryReward`'s "already in history" guard flagged every missing event as processed and skipped it. Reordered to replay against `base.history` only, then union. This was a pre-existing regression from commit 06bc77b (the visual-overhaul commit added the guard and committed the test red); verified green on HEAD before my changes were restored. Affects the user's real browser↔iOS sync.

Seerah chains initialize and display but do not advance yet (advancement is wired to ibadah tracking in Phase 2).

---

*This file is the single source of truth for the Solo Leveling System project. Update it whenever major changes occur.*
