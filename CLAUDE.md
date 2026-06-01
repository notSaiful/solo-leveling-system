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
> **Current Status:** Production-ready web app + automated IPA builder
> **Last Updated:** 2026-05-29
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
| Identity | Muslim man, India |
| Goal | Rapid self-development across spiritual, physical, and financial domains |
| Motivation | Discipline through gamification, Islamic framework |
| Tech Level | Comfortable with web apps, wants iPhone native experience |
| Preferences | Dark Islamic aesthetic, no emojis unless requested, short concise responses |
| Business Context | Small investor focused on halal/Shariah-compliant stocks; runs AI ventures |

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
| `src/logic/questEngine.js` | Daily quest generation, completion, XP calculation |
| `src/logic/dungeons.js` | Weekly dungeon system |
| `src/logic/adminCommands.js` | AI-powered admin commands (`[[CMD]]` JSON blocks) |
| `src/logic/behaviorAnalyzer.js` | Accountability context, conversation summary |
| `src/data/questCatalog.js` | Quest templates, rank configs, level quests |

---

## 4. Core Systems

### 4.1 Three Pillars
- **Deen:** Islamic knowledge, prayers, Quran, charity
- **Body:** Physical training, diet, sleep discipline
- **Money:** Wealth generation, halal investing, ummah support

Each pillar has: Level, XP, Streak, Active Debuffs

### 4.2 Rank System (E → S)
| Rank | Name | Requirement |
|------|------|-------------|
| E | Seeker | Level 1-5 |
| D | Striver | Level 6-15 |
| C | Disciplined | Level 16-30 |
| B | Scholar | Level 31-50 |
| A | Guide | Level 51-75 |
| S | Monarch | Level 76+ |

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

---

## 5. AI Integration — The Forge-Master

**Model Configuration:**
```javascript
PRIMARY_MODEL   = 'openai/gpt-4o-mini'      // Reliable, always try first
FALLBACK_MODEL  = 'moonshotai/kimi-k2.6:free' // Often 503 from Crucible
```

**Key Behaviors:**
- Embedded default API key in `DEFAULT_API_KEY_B64` (base64)
- Custom key support via `localStorage.setItem('openrouter_api_key', key)`
- `sanitize()` strips `[[CMD]]` from user-influenced strings (prompt injection protection)
- Admin commands embedded in JSON inside `[[CMD]]` / `[[/CMD]]` markers
- Brutal, Islamic, zero-excuses personality
- Every response ends with a COMMAND, not a suggestion

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

---

## 9. Known Issues & Pending Tasks

### Pending Tasks (from task tracker)
- [x] **#31: Fix timezone bug in date comparisons** — Date logic now uses `getLocalDateString()` from direct local Date components
- [x] **#32: Fix legacy sync gaps** — Old split sync path removed; canonical full snapshot is now the single sync path
- [ ] **#33: Harden canonical sync security** — Add real owner auth or deployment protection if the app ever stops being private/solo-use

### Known Limitations
- **Chunk size warning:** Vite build produces JS chunk >500KB. Consider code-splitting with dynamic imports if performance becomes an issue
- **Free model fallback:** `moonshotai/kimi-k2.6:free` is often 503 from Crucible. Primary model (`gpt-4o-mini`) is reliable
- **Unsigned IPA:** Must be re-signed every 7 days via AltStore/Sideloadly
- **Browser cache:** Users with old JS bundles may need "Clear Cache & Reload" from Settings
- **Client-visible sync secret:** Current design is acceptable only for a solo private app. A public multi-user version needs real authentication.

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

---

*This file is the single source of truth for the Solo Leveling System project. Update it whenever major changes occur.*
