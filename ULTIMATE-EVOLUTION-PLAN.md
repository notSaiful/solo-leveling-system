# SOLO LEVELING SYSTEM — ULTIMATE EVOLUTION PLAN
## (Deferred until Level 50 / B-Rank Knight)

---

## 0. EXECUTION TRIGGER

**When to run this plan:** `state.user.overallLevel >= 50` (B-Rank Knight threshold)

**How to activate:** Tell Claude: "Execute the Ultimate Evolution Plan from ULTIMATE-EVOLUTION-PLAN.md"

**Context at execution time:** The user will be older, with months of proven consistency, real business progress, and updated life context. Systems added must serve the user's real mission: bearing the Ummah's financial burden, maintaining elite physical condition, and becoming a role model like the Prophet (SAW).

---

## 1. PHASE 1: FOUNDATION & SCHEMA (Data Layer)

### 1.1 State Schema Expansion (`src/data/store.js`)

Add these fields to `DEFAULT_STATE`:

```javascript
ummahBurden: {
  score: 0,
  familySupported: 0,
  zakatPaid: 0,
  sadaqahJariyah: 0,
  muslimVentures: 0,
},
skills: [],
skillPoints: 0,
equipment: { weapon: null, armor: null, ring: null },
seerahChains: [],
nabawiTraits: [],
legacyShadows: [],
jobChangeGates: [],
monarchTrials: { active: false, stage: 0, startedAt: null, completedAt: null },
ummahCommand: { unlocked: false, linkedMembers: [] },
weeklyStats: { soloClear: false, aiPromptsUsed: 0, weekId: null },
```

**Actions:**
- Change `SCHEMA_VERSION` from `2` to `3`
- Update `loadState()` to deep-merge new default fields for v2 → v3 upgrade
- Update `saveState()`, `importData()`, `exportData()` to handle new fields
- Update `initCloudSync()` and `reinitCloudSyncAfterLogin()` to preserve new arrays during merge

### 1.2 Supabase Sync Updates (`src/services/supabaseSync.js`)

**`serializeState()` additions:**
```javascript
ummah_burden: state.ummahBurden || {},
skill_points: state.skillPoints || 0,
equipment: state.equipment || { weapon: null, armor: null, ring: null },
monarch_unlocked: state.monarchTrials?.active || false,
ummah_command_unlocked: state.ummahCommand?.unlocked || false,
weekly_stats: state.weeklyStats || {},
```

**`syncStateToCloud()` new upserts (order matters for FKs):**
1. `skills` table — `user_id, skill_id, name, pillar, cooldown_hours, last_used, unlocked_at`
2. `equipment` table — `user_id, slot, item_id, name, pillar_boost, durability, max_durability, enchant_level, acquired_at`
3. `seerah_chains` table — `user_id, chain_id, trait_name, day, total_days, completed, failed, failed_at`
4. `legacy_shadows` table — `user_id, shadow_id, name, source_quest, child_name, boost_type, boost_value, extracted_at`
5. `job_change_gates` table — `user_id, gate_id, rank, level_required, steps (JSONB), completed, completed_at, failed, failed_at`
6. `monarch_trials` table — `user_id, stage, active, started_at, completed_at`
7. `profiles` additions: `ummah_burden_score`, `skill_points`, `monarch_unlocked`, `ummah_command_unlocked`

**`loadStateFromCloud()` reconstruction:**
- After snapshot check, fetch new granular tables and reconstruct arrays
- Fallback to snapshot if any table missing (backward compatibility)

### 1.3 Database Schema (`supabase/schema.sql`)

Add these `CREATE TABLE IF NOT EXISTS` blocks at end of schema file:

```sql
-- Skills
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id text NOT NULL,
  name text NOT NULL,
  pillar text CHECK (pillar IN ('deen','body','money','all')) NOT NULL,
  cooldown_hours integer DEFAULT 24,
  last_used timestamptz,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Equipment
CREATE TABLE IF NOT EXISTS public.equipment (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slot text CHECK (slot IN ('weapon','armor','ring')) NOT NULL,
  item_id text NOT NULL,
  name text NOT NULL,
  pillar text CHECK (pillar IN ('deen','body','money','all')),
  pillar_boost numeric(3,2) DEFAULT 0.05,
  durability integer DEFAULT 100,
  max_durability integer DEFAULT 100,
  enchant_level integer DEFAULT 0,
  acquired_at timestamptz DEFAULT now(),
  UNIQUE(user_id, slot)
);

-- Seerah Chains
CREATE TABLE IF NOT EXISTS public.seerah_chains (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  chain_id text NOT NULL,
  trait_name text NOT NULL,
  day integer DEFAULT 1,
  total_days integer DEFAULT 21,
  completed boolean DEFAULT false,
  failed boolean DEFAULT false,
  failed_at timestamptz,
  UNIQUE(user_id, chain_id)
);

-- Legacy Shadows (Manhood Forge)
CREATE TABLE IF NOT EXISTS public.legacy_shadows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  shadow_id text NOT NULL,
  name text NOT NULL,
  source_quest text NOT NULL,
  child_name text,
  boost_type text NOT NULL,
  boost_value integer DEFAULT 1,
  extracted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, shadow_id)
);

-- Job Change Gates
CREATE TABLE IF NOT EXISTS public.job_change_gates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  gate_id text NOT NULL,
  rank text NOT NULL,
  level_required integer DEFAULT 0,
  steps jsonb DEFAULT '[]',
  completed boolean DEFAULT false,
  completed_at timestamptz,
  failed boolean DEFAULT false,
  failed_at timestamptz,
  UNIQUE(user_id, gate_id)
);

-- Monarch Trials
CREATE TABLE IF NOT EXISTS public.monarch_trials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stage integer DEFAULT 0,
  active boolean DEFAULT false,
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(user_id)
);

-- Profiles additions (run as ALTER TABLE)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ummah_burden_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS skill_points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monarch_unlocked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ummah_command_unlocked boolean DEFAULT false;
```

**User action required:** Run this SQL in Supabase SQL Editor after deployment.

---

## 2. PHASE 2: CORE SOLO LEVELING SYSTEMS (Logic Layer)

### 2.1 Job Change Dungeons (`src/data/questCatalog.js` + `src/logic/questEngine.js`)

**New constants in `questCatalog.js`:**
```javascript
export const JOB_CHANGE_GATES = [
  { id: 'gate-d-10', rank: 'D', levelRequired: 10, title: "The Hunter's Threshold", days: 7,
    steps: [
      { day: 1, title: 'Fajr Warrior', description: 'Pray Fajr on time + 30 min seerah study', pillar: 'deen', xp: 100 },
      { day: 2, title: 'Body Test', description: '50 push-ups + 50 squats + 15 min jog', pillar: 'body', xp: 100 },
      { day: 3, title: 'Wealth Proof', description: 'Track all expenses + identify one income source', pillar: 'money', xp: 100 },
      { day: 4, title: 'All Prayers Perfect', description: 'All 5 prayers on time + rawatib', pillar: 'deen', xp: 120 },
      { day: 5, title: 'Strength Gauntlet', description: '100 bodyweight reps + perfect sleep', pillar: 'body', xp: 120 },
      { day: 6, title: 'Financial Discipline', description: 'No impulse spending + budget review', pillar: 'money', xp: 120 },
      { day: 7, title: 'BOSS: The Awakening', description: 'Complete all daily quests + 1-hour deep work session', pillar: 'all', xp: 200 },
    ],
    reward: { gold: 500, statPoints: 5, title: 'Hunter', skills: ['takbeer-sprint'] }
  },
  // Additional gates at 25 (C), 40 (B), 55 (A), 70 (S thresholds) follow same pattern
  // Scale difficulty and rewards with rank
];
```

**New functions in `questEngine.js`:**
- `initializeJobChangeGate(state)` — checks overallLevel against `JOB_CHANGE_GATES`, creates active gate if not present
- `checkGateProgress(state)` — verifies if current day's step is completed
- `completeGateDay(state, gateId, dayIndex)` — marks step complete, checks for gate completion
- `failGate(state, gateId)` — sets `failed: true`, applies rank drop (one sub-tier), adds system message

**UI lock:** In `recalculateOverallLevel()`, check if next rank threshold is gated. If active gate exists and not completed, block rank-up message.

### 2.2 Skill System (`src/data/skills.js` + `questEngine.js`)

**New file `src/data/skills.js`:**
```javascript
export const SKILL_TEMPLATES = {
  'takbeer-sprint': {
    id: 'takbeer-sprint', name: 'Takbeer Sprint', pillar: 'body',
    description: '2x Body XP for 24 hours. The body is an amanah.',
    cooldownHours: 72, durationHours: 24,
    effect: { type: 'xpMultiplier', pillar: 'body', multiplier: 2.0 },
  },
  'iron-will': {
    id: 'iron-will', name: 'Iron Will', pillar: 'body',
    description: 'Immune to debuffs for 48 hours. Steel discipline.',
    cooldownHours: 168, durationHours: 48,
    effect: { type: 'debuffImmunity', durationHours: 48 },
  },
  'zakat-blast': {
    id: 'zakat-blast', name: 'Zakat Blast', pillar: 'money',
    description: 'One Money quest pays 3x gold. Wealth flows.',
    cooldownHours: 168, durationHours: 0,
    effect: { type: 'goldMultiplier', pillar: 'money', multiplier: 3.0, uses: 1 },
  },
  'shadow-march': {
    id: 'shadow-march', name: 'Shadow March', pillar: 'all',
    description: 'Auto-complete one daily quest per week.',
    cooldownHours: 168, durationHours: 0,
    effect: { type: 'autoComplete', count: 1 },
  },
};

export function getAvailableSkills(state) {
  return Object.values(SKILL_TEMPLATES).filter(s => {
    const unlocked = state.skills.some(us => us.id === s.id);
    return !unlocked;
  });
}

export function activateSkill(state, skillId) {
  const skill = SKILL_TEMPLATES[skillId];
  if (!skill) return state;
  const userSkill = state.skills.find(s => s.id === skillId);
  if (!userSkill) return state;
  const now = Date.now();
  const cooldownMs = skill.cooldownHours * 3600000;
  if (userSkill.lastUsed && (now - new Date(userSkill.lastUsed).getTime()) < cooldownMs) {
    return state; // On cooldown
  }
  const newSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, lastUsed: new Date().toISOString(), active: true, expiresAt: skill.durationHours ? now + skill.durationHours * 3600000 : null } : s
  );
  return { ...state, skills: newSkills };
}

export function isSkillActive(state, skillId) {
  const userSkill = state.skills.find(s => s.id === skillId);
  if (!userSkill || !userSkill.active) return false;
  if (userSkill.expiresAt && Date.now() > userSkill.expiresAt) return false;
  return true;
}

export function applySkillEffects(xp, gold, pillar, state) {
  let result = { xp, gold };
  state.skills.forEach(s => {
    if (!isSkillActive(state, s.id)) return;
    const template = SKILL_TEMPLATES[s.id];
    if (!template) return;
    const effect = template.effect;
    if (effect.type === 'xpMultiplier' && effect.pillar === pillar) {
      result.xp = Math.floor(result.xp * effect.multiplier);
    }
    if (effect.type === 'goldMultiplier' && effect.pillar === pillar && effect.uses > 0) {
      result.gold = Math.floor(result.gold * effect.multiplier);
      s.usesRemaining = (s.usesRemaining || effect.uses) - 1;
      if (s.usesRemaining <= 0) s.active = false;
    }
  });
  return result;
}
```

**Integration into `questEngine.js`:**
- In `completeDailyQuest()` and `completeWeeklyDungeon()`, call `applySkillEffects()` after shadow bonuses, before final XP assignment
- Award 1 Skill Point per 5 overall levels in `recalculateOverallLevel()`
- Auto-unlock skills when Job Change Gate completed

### 2.3 Shadow Hierarchy & Legions (`src/data/shadows.js`)

**Expand `SHADOW_GRADES`:**
```javascript
export const SHADOW_GRADES = {
  SOLDIER:   { key: 'soldier',   name: 'Soldier Shadow',   color: 'text-gray-400',  passiveBonus: 0.05 },
  KNIGHT:    { key: 'knight',    name: 'Knight Shadow',    color: 'text-cyan-400',  passiveBonus: 0.10 },
  ELITE:     { key: 'elite',     name: 'Elite Shadow',     color: 'text-blue-400',  passiveBonus: 0.15 },
  GENERAL:   { key: 'general',   name: 'General Shadow',   color: 'text-purple-400', passiveBonus: 0.30 },
  MARSHAL:   { key: 'marshal',   name: 'Marshal Shadow',   color: 'text-orange-400', passiveBonus: 0.40 },
  MONARCH:   { key: 'monarch',   name: 'Monarch Shadow',   color: 'text-yellow-400', passiveBonus: 0.50 },
};
```

**Add legion assignment to `extractShadow()`:**
- When extracting, user must assign to Deen, Body, or Money legion (or 'all')
- Store `legion` field on shadow object

**New function `getLegionPassiveXp(state, pillar)`:**
```javascript
const legionShadows = state.shadows.filter(s => s.legion === pillar || s.legion === 'all');
const baseBonus = legionShadows.reduce((sum, s) => sum + (s.passiveBonus || 0), 0);
// Consistency factor: check last 7 days of history for completions in this pillar
const last7Days = getLast7Days();
const completionsPerDay = last7Days.map(day => {
  return state.history.some(h => {
    const hDate = new Date(h.date).toLocaleDateString('en-CA');
    return hDate === day && h.pillar === pillar && h.completed;
  });
});
const consistentDays = completionsPerDay.filter(Boolean).length;
const consistencyFactor = consistentDays === 7 ? 1.0 : consistentDays >= 4 ? 0.5 : 0.1;
return baseBonus * consistencyFactor;
```

**Apply in `questEngine.js`:** Multiply XP by `1 + getLegionPassiveXp()` before shadow bonuses.

### 2.4 Solo Clear Bonus (`src/logic/questEngine.js` + `App.jsx`)

**Track in `App.jsx`:**
- In `AIAssistant.jsx` `handleSend()`, increment `state.weeklyStats.aiPromptsUsed`
- Reset `weeklyStats` every Monday alongside weekly dungeons reset
- Check `state.weeklyStats.aiPromptsUsed === 0` when claiming weekly dungeon

**Effect in `completeWeeklyDungeon()`:**
```javascript
if (state.weeklyStats.soloClear) {
  statModifiedXp *= 2;
  // Guaranteed shadow extraction
  const available = getUnlockedShadows(state).filter(s => !s.extracted);
  if (available.length > 0) {
    const highest = available.sort((a, b) => b.passiveBonus - a.passiveBonus)[0];
    nextState = extractShadow(nextState, highest.id);
  }
}
```

**UI indicator:** Badge in WeeklyDungeon header: "SOLO CLEAR: 2x XP + Shadow Drop" if `aiPromptsUsed === 0`.

### 2.5 Equipment Drops (`src/data/equipment.js` + `questEngine.js`)

**New file `src/data/equipment.js`:**
```javascript
export const EQUIPMENT_SLOTS = ['weapon', 'armor', 'ring'];

export const EQUIPMENT_TEMPLATES = {
  // E-D rank gear
  'wooden-sword': { id: 'wooden-sword', name: 'Wooden Sword', slot: 'weapon', pillar: 'body', boost: 0.05, maxDurability: 100 },
  'leather-armor': { id: 'leather-armor', name: 'Leather Armor', slot: 'armor', pillar: 'body', boost: 0.05, maxDurability: 100 },
  'copper-ring': { id: 'copper-ring', name: 'Copper Ring', slot: 'ring', pillar: 'all', boost: 0.03, maxDurability: 100 },
  // C-B rank gear
  'steel-blade': { id: 'steel-blade', name: 'Steel Blade', slot: 'weapon', pillar: 'body', boost: 0.15, maxDurability: 150 },
  'iron-mail': { id: 'iron-mail', name: 'Iron Mail', slot: 'armor', pillar: 'body', boost: 0.15, maxDurability: 150 },
  'silver-ring': { id: 'silver-ring', name: 'Silver Ring', slot: 'ring', pillar: 'all', boost: 0.10, maxDurability: 150 },
  // A-S rank gear
  'monarch-blade': { id: 'monarch-blade', name: "Monarch's Blade", slot: 'weapon', pillar: 'all', boost: 0.30, maxDurability: 200 },
  'shadow-armor': { id: 'shadow-armor', name: 'Shadow Armor', slot: 'armor', pillar: 'all', boost: 0.30, maxDurability: 200 },
  'golden-ring': { id: 'golden-ring', name: 'Golden Ring', slot: 'ring', pillar: 'all', boost: 0.20, maxDurability: 200 },
};

export function dropEquipment(rankKey) {
  const pool = Object.values(EQUIPMENT_TEMPLATES).filter(e => {
    if (['E','D'].includes(rankKey) && e.maxDurability === 100) return true;
    if (['C','B'].includes(rankKey) && e.maxDurability === 150) return true;
    if (['A','S'].includes(rankKey) && e.maxDurability === 200) return true;
    return false;
  });
  if (pool.length === 0) return null;
  return { ...pool[Math.floor(Math.random() * pool.length)], durability: item.maxDurability, enchantLevel: 0, acquiredAt: new Date().toISOString() };
}

export function applyEquipmentBonuses(xp, pillar, state) {
  let multiplier = 1.0;
  Object.values(state.equipment || {}).forEach(item => {
    if (!item) return;
    if (item.pillar === pillar || item.pillar === 'all') {
      let boost = item.boost + (item.enchantLevel * 0.05);
      multiplier += boost;
    }
  });
  return Math.floor(xp * multiplier);
}

export function updateDurability(state, missedDaily = false, completedDaily = false) {
  const newEquipment = { ...state.equipment };
  Object.keys(newEquipment).forEach(slot => {
    const item = newEquipment[slot];
    if (!item) return;
    if (missedDaily) item.durability = Math.max(0, item.durability - 10);
    if (completedDaily) item.durability = Math.min(item.maxDurability, item.durability + 5);
  });
  return { ...state, equipment: newEquipment };
}

export function checkEnchant(state, pillar) {
  // +1 enchant after 30-day streak on a pillar
  const streak = state.pillars[pillar]?.streak || 0;
  if (streak >= 30 && streak % 30 === 0) {
    const newEquipment = { ...state.equipment };
    Object.keys(newEquipment).forEach(slot => {
      const item = newEquipment[slot];
      if (item && (item.pillar === pillar || item.pillar === 'all')) {
        item.enchantLevel = (item.enchantLevel || 0) + 1;
      }
    });
    return { ...state, equipment: newEquipment };
  }
  return state;
}
```

**Integration:**
- Drop equipment in `completeWeeklyDungeon()` after claim
- Apply bonuses in `completeDailyQuest()` after shadow bonuses, before skill effects
- Update durability in `usePenaltyCheck()` (on missed quests) and `completeDailyQuest()` (on completions)
- Check enchant in `completeDailyQuest()` when streak milestones hit

---

## 3. PHASE 3: MISSION-ALIGNED SYSTEMS (Logic Layer)

### 3.1 Ummah Burden Meter (`src/data/ummah.js` + Dashboard)

**New file `src/data/ummah.js`:**
```javascript
export function calculateUmmahBurden(ummahBurden) {
  const { familySupported, zakatPaid, sadaqahJariyah, muslimVentures } = ummahBurden || {};
  return (familySupported * 10) + (zakatPaid * 5) + (sadaqahJariyah * 3) + (muslimVentures * 20);
}

export const UMMAH_MILESTONES = [
  { score: 100, label: 'Household Secured', color: '#22d3ee' },
  { score: 500, label: 'Extended Family Supported', color: '#60a5fa' },
  { score: 1000, label: 'Community Impact', color: '#c084fc' },
  { score: 5000, label: 'Ummah Burden Bearer', color: '#fb923c' },
  { score: 10000, label: 'Khalifa-Level Stewardship', color: '#facc15' },
];

export function getCurrentMilestone(score) {
  const passed = UMMAH_MILESTONES.filter(m => score >= m.score);
  return passed[passed.length - 1] || null;
}

export function getNextMilestone(score) {
  return UMMAH_MILESTONES.find(m => score < m.score) || null;
}
```

**Input methods:**
- Manual entry form in Settings tab (or dedicated Ummah widget)
- AI Assistant `[[CMD]]` blocks for batch updates
- Auto-calculate from Money quest tags (`zakat`, `sadaqah`, `ummah`, `charity`)

**Display:** Prominent meter in Dashboard header, below rank badge. Color shifts at milestones.

### 3.2 Seerah Character Quest Chains (`src/data/seerahChains.js` + questEngine)

**New file `src/data/seerahChains.js`:**
```javascript
export const SEERAH_CHAINS = [
  {
    id: 'as-siddiq',
    name: 'As-Siddiq',
    traitName: 'Siddiq',
    levelRange: [15, 25],
    totalDays: 21,
    dailyQuests: [
      { title: 'Absolute Truth', description: 'No white lies, exaggerations, or excuses today. In speech and text.', pillar: 'deen', xp: 30 },
      { title: 'Contract Integrity', description: 'Honor every promise and deadline. No delays without communication.', pillar: 'money', xp: 30 },
      { title: 'Investment Honesty', description: 'Review one financial decision for riba or haram. Purify it.', pillar: 'money', xp: 30 },
    ],
    reward: { nabawiTrait: 'Siddiq', deenXpBonus: 0.10, penaltyImmunity: 'missedDaily' },
  },
  {
    id: 'as-sabir',
    name: 'As-Sabir',
    traitName: 'Sabir',
    levelRange: [30, 40],
    totalDays: 21,
    dailyQuests: [
      { title: 'Patience in Delay', description: 'Accept one delay or cancellation without complaint. Plan B execution.', pillar: 'deen', xp: 40 },
      { title: 'Market Loss Grace', description: 'If any investment declined, do not panic. Hold with tawakkul.', pillar: 'money', xp: 40 },
      { title: 'Physical Pain Endurance', description: 'Complete workout despite discomfort. No excuses.', pillar: 'body', xp: 40 },
    ],
    reward: { nabawiTrait: 'Sabir', allXpBonusDuringDebuff: 0.15, debuffDurationReduction: 0.50 },
  },
  {
    id: 'al-amin',
    name: 'Al-Amin',
    traitName: 'Amin',
    levelRange: [50, 60],
    totalDays: 21,
    dailyQuests: [
      { title: 'Trustworthiness Test', description: 'Handle someone else\'s money or data with absolute care.', pillar: 'money', xp: 50 },
      { title: 'Secret Keeper', description: 'Someone confides in you. Protect it.', pillar: 'deen', xp: 50 },
      { title: 'Consistent Presence', description: 'Show up exactly when and where you promised.', pillar: 'body', xp: 50 },
    ],
    reward: { nabawiTrait: 'Amin', allXpBonus: 0.10, trustMultiplier: 2.0 },
  },
  {
    id: 'ar-rasul',
    name: 'Ar-Rasul',
    traitName: 'Rasul',
    levelRange: [70, 80],
    totalDays: 21,
    dailyQuests: [
      { title: 'Prophetic Leadership', description: 'Lead one family or community action today.', pillar: 'deen', xp: 60 },
      { title: 'Mercy in Strength', description: 'Forgive someone who wronged you. No conditions.', pillar: 'deen', xp: 60 },
      { title: 'Strategic Sacrifice', description: 'Give up one personal comfort for someone else\'s need.', pillar: 'money', xp: 60 },
    ],
    reward: { nabawiTrait: 'Rasul', allXpBonus: 0.15, mentorshipMultiplier: 2.0 },
  },
];

export function initializeSeerahChain(state) {
  const level = state.user.overallLevel;
  const active = state.seerahChains.find(c => !c.completed && !c.failed);
  if (active) return state;

  const chainTemplate = SEERAH_CHAINS.find(c => level >= c.levelRange[0] && level <= c.levelRange[1]);
  if (!chainTemplate) return state;
  const alreadyDone = state.seerahChains.some(c => c.chainId === chainTemplate.id);
  if (alreadyDone) return state;

  return {
    ...state,
    seerahChains: [
      ...state.seerahChains,
      {
        chainId: chainTemplate.id,
        traitName: chainTemplate.traitName,
        day: 1,
        totalDays: chainTemplate.totalDays,
        completed: false,
        failed: false,
        startedAt: new Date().toISOString(),
      },
    ],
  };
}

export function advanceSeerahChain(state) {
  const active = state.seerahChains.find(c => !c.completed && !c.failed);
  if (!active) return state;

  const nextDay = active.day + 1;
  if (nextDay > active.totalDays) {
    // Complete — award trait
    const template = SEERAH_CHAINS.find(c => c.id === active.chainId);
    return {
      ...state,
      seerahChains: state.seerahChains.map(c =>
        c.chainId === active.chainId ? { ...c, completed: true, completedAt: new Date().toISOString() } : c
      ),
      nabawiTraits: [...state.nabawiTraits, template.reward],
      systemMessages: [
        ...state.systemMessages,
        {
          type: 'trait',
          title: `NAWABI TRAIT UNLOCKED: ${template.reward.nabawiTrait}`,
          subtitle: 'Permanent. Irrevocable.',
          message: `You have embodied ${template.name}. The trait is now part of your soul.`,
        },
      ],
    };
  }

  return {
    ...state,
    seerahChains: state.seerahChains.map(c =>
      c.chainId === active.chainId ? { ...c, day: nextDay } : c
    ),
  };
}

export function failSeerahChain(state) {
  const active = state.seerahChains.find(c => !c.completed && !c.failed);
  if (!active) return state;
  return {
    ...state,
    seerahChains: state.seerahChains.map(c =>
      c.chainId === active.chainId ? { ...c, failed: true, failedAt: new Date().toISOString() } : c
    ),
    systemMessages: [
      ...state.systemMessages,
      {
        type: 'penalty',
        title: 'SEERAH CHAIN FAILED',
        subtitle: 'The chain breaks.',
        message: 'You failed one day of the prophetic character quest. The chain resets. Start again when ready.',
      },
    ],
  };
}
```

**Integration:**
- `initializeSeerahChain()` called in Dashboard `useEffect` alongside daily quest init
- Chain daily quests **replace** some normal Deen quest slots while active
- On chain quest completion → `advanceSeerahChain()`
- On chain quest miss → `failSeerahChain()`, resets to day 1
- `nabawiTraits` apply permanent passive effects in `completeDailyQuest()`

### 3.3 Manhood Forge Shadows (`src/data/legacyShadows.js` + questEngine)

**Reframing note:** User is 19, unmarried, not a father yet. These shadows are "Manhood Forge" — preparing the man your future children will inherit.

**New file `src/data/legacyShadows.js`:**
```javascript
export const LEGACY_SHADOW_QUESTS = [
  {
    id: 'legacy-quran-teacher',
    title: 'Quran Teacher',
    description: 'Teach Quran to a younger sibling, cousin, or mentee for 7 consecutive days.',
    requiredDays: 7,
    pillar: 'deen',
    xp: 50,
    shadow: { id: 'shadow-quran', name: 'Shadow of the Teacher', boostType: 'intelligence', boostValue: 2 },
  },
  {
    id: 'legacy-presence',
    title: 'Undivided Presence',
    description: 'No phone during family time for 14 consecutive days. Be fully there.',
    requiredDays: 14,
    pillar: 'deen',
    xp: 50,
    shadow: { id: 'shadow-presence', name: 'Shadow of Presence', boostType: 'mana', boostValue: 2 },
  },
  {
    id: 'legacy-discipline-model',
    title: 'Discipline Model',
    description: 'Have someone witness and document your full morning routine for 21 days.',
    requiredDays: 21,
    pillar: 'body',
    xp: 60,
    shadow: { id: 'shadow-discipline', name: 'Shadow of Discipline', boostType: 'strength', boostValue: 2 },
  },
];

export function checkLegacyShadowExtraction(state, questId) {
  const template = LEGACY_SHADOW_QUESTS.find(q => q.id === questId);
  if (!template) return state;

  const alreadyExtracted = state.legacyShadows.some(s => s.shadowId === template.shadow.id);
  if (alreadyExtracted) return state;

  return {
    ...state,
    legacyShadows: [
      ...state.legacyShadows,
      {
        ...template.shadow,
        sourceQuest: questId,
        extractedAt: new Date().toISOString(),
      },
    ],
    systemMessages: [
      ...state.systemMessages,
      {
        type: 'shadow',
        title: 'MANHOOD FORGE SHADOW EXTRACTED',
        subtitle: template.shadow.name,
        message: `This shadow does not boost you. It boosts the starting stats of the children you will one day raise. "Arise."`,
      },
    ],
  };
}

export function calculateChildStartingBoosts(legacyShadows) {
  const boosts = { strength: 0, agility: 0, intelligence: 0, sense: 0, health: 0, mana: 0 };
  legacyShadows.forEach(s => {
    if (boosts[s.boostType] !== undefined) {
      boosts[s.boostType] += s.boostValue;
    }
  });
  return boosts;
}
```

**Integration:**
- Legacy shadow quests appear as special daily quests (rare spawn, or triggered by level)
- On completion → `checkLegacyShadowExtraction()`
- `calculateChildStartingBoosts()` is future-proofing for when the user clones the app for family

### 3.4 Physics Gates (`src/data/questCatalog.js` + WeeklyDungeon)

**Update `WEEKLY_DUNGEON_TEMPLATES.body` entries:**

Rename and add pass/fail standards:
```javascript
E: {
  body: {
    title: "Newton's Gate",
    description: 'Boss: Complete ALL standards. No partial credit.',
    xp: 200,
    steps: [
      { id: 'ng-1', text: '20 pull-ups (or assisted equivalent)', completed: false },
      { id: 'ng-2', text: '50 push-ups with full ROM', completed: false },
      { id: 'ng-3', text: '2x bodyweight squat OR 100 bodyweight squats', completed: false },
    ],
  },
},
D: {
  body: {
    title: "Newton's Gate II",
    description: 'Boss: Complete ALL standards.',
    xp: 300,
    steps: [
      { id: 'ng2-1', text: '25 pull-ups', completed: false },
      { id: 'ng2-2', text: '75 push-ups', completed: false },
      { id: 'ng2-3', text: '2.5x bodyweight squat OR 150 squats', completed: false },
    ],
  },
},
C: {
  body: {
    title: "Thermodynamics Gate",
    description: 'Boss: Energy systems test.',
    xp: 400,
    steps: [
      { id: 'tg-1', text: '5K run under 25 minutes', completed: false },
      { id: 'tg-2', text: 'Fast 18+ hours with workout in fasted state', completed: false },
      { id: 'tg-3', text: 'Cold shower finish 5+ min', completed: false },
    ],
  },
},
B: {
  body: {
    title: "Relativity Gate",
    description: 'Boss: Recovery and mobility under stress.',
    xp: 500,
    steps: [
      { id: 'rg-1', text: 'Sleep score >85% (track with app or journal)', completed: false },
      { id: 'rg-2', text: 'Full mobility routine: hips, shoulders, ankles (20 min)', completed: false },
      { id: 'rg-3', text: 'Stress test: workout after 6+ hour workday', completed: false },
    ],
  },
},
A: {
  body: {
    title: "Quantum Gate",
    description: 'Boss: Competitive-level performance.',
    xp: 600,
    steps: [
      { id: 'qg-1', text: 'Max-effort strength test: PR attempt in any lift', completed: false },
      { id: 'qg-2', text: 'Compete: race, spar, or sport event this week', completed: false },
      { id: 'qg-3', text: 'Train someone to D-rank physical standards', completed: false },
    ],
  },
},
S: {
  body: {
    title: "The Monarch's Apex",
    description: 'Boss: Elite performance across all domains.',
    xp: 800,
    steps: [
      { id: 'ma-1', text: 'Complete a half-marathon or equivalent endurance feat', completed: false },
      { id: 'ma-2', text: 'Maintain elite body composition for 90+ days', completed: false },
      { id: 'ma-3', text: 'Lead a community fitness program for one month', completed: false },
    ],
  },
},
```

**Integration:** In `WeeklyDungeon.jsx`, rename Body cards to gate names. Add pass/fail standard text. Failure = standard dungeon penalty + `updateDurability(state, true)`.

### 3.5 Monarch Ascension (`src/logic/monarchTrials.js` + App)

**New file `src/logic/monarchTrials.js`:**
```javascript
export const MONARCH_STAGES = [
  { stage: 1, levelRange: [76, 85], name: 'Financial Capacity', description: 'Can you support the Ummah without strain?' },
  { stage: 2, levelRange: [86, 95], name: 'Physical Capacity', description: 'Can you serve others without exhaustion?' },
  { stage: 3, levelRange: [96, 99], name: 'Knowledge Capacity', description: 'Can you teach and lead?' },
  { stage: 4, levelRange: [100, 100], name: 'The Final Trial', description: '40 days of complete system mastery. Zero misses.' },
];

export function initializeMonarchTrials(state) {
  if (state.user.overallLevel < 76) return state;
  if (state.monarchTrials.active || state.monarchTrials.completedAt) return state;

  const stage = MONARCH_STAGES.find(s => state.user.overallLevel >= s.levelRange[0] && state.user.overallLevel <= s.levelRange[1]);
  if (!stage) return state;

  return {
    ...state,
    monarchTrials: {
      active: true,
      stage: stage.stage,
      startedAt: new Date().toISOString(),
      completedAt: null,
    },
    systemMessages: [
      ...state.systemMessages,
      {
        type: 'rankUp',
        title: 'MONARCH TRIAL BEGINS',
        subtitle: stage.name,
        message: `${stage.description} The final ascension has begun.`,
      },
    ],
  };
}

export function checkMonarchTrialProgress(state) {
  if (!state.monarchTrials.active) return state;

  const trial = state.monarchTrials;
  if (trial.stage < 4) {
    // Stages 1-3: auto-complete when level reaches top of range
    const stageDef = MONARCH_STAGES.find(s => s.stage === trial.stage);
    if (state.user.overallLevel >= stageDef.levelRange[1]) {
      return advanceMonarchStage(state);
    }
    return state;
  }

  // Stage 4: 40 days of complete mastery
  const daysSinceStart = Math.floor((Date.now() - new Date(trial.startedAt).getTime()) / (24 * 3600000));
  if (daysSinceStart >= 40) {
    // Check if any missed days in last 40
    const last40Days = getLastNDays(40);
    const allDaysPerfect = last40Days.every(day => {
      const dayCompletions = state.history.filter(h => {
        const hDate = new Date(h.date).toLocaleDateString('en-CA');
        return hDate === day && h.completed;
      });
      return dayCompletions.length >= 3; // All 3 pillars completed
    });
    if (allDaysPerfect) {
      return completeMonarchAscension(state);
    }
  }
  return state;
}

export function advanceMonarchStage(state) {
  const nextStage = state.monarchTrials.stage + 1;
  return {
    ...state,
    monarchTrials: { ...state.monarchTrials, stage: nextStage },
    systemMessages: [
      ...state.systemMessages,
      {
        type: 'rankUp',
        title: `MONARCH STAGE ${nextStage}`,
        subtitle: MONARCH_STAGES.find(s => s.stage === nextStage)?.name || 'The Final Trial',
        message: 'You advance. The trial deepens.',
      },
    ],
  };
}

export function completeMonarchAscension(state) {
  return {
    ...state,
    monarchTrials: { ...state.monarchTrials, active: false, completedAt: new Date().toISOString() },
    ummahCommand: { unlocked: true, linkedMembers: [] },
    systemMessages: [
      ...state.systemMessages,
      {
        type: 'rankUp',
        title: 'UMMAH COMMAND UNLOCKED',
        subtitle: 'You are the Shadow Monarch.',
        message: 'Your quests now generate linked quests for family members you invite. The Ummah is your responsibility.',
      },
    ],
  };
}

function getLastNDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-CA'));
  }
  return days;
}
```

**Integration:**
- `initializeMonarchTrials()` called in Dashboard init when level >= 76
- `checkMonarchTrialProgress()` called daily (e.g., in penalty check or quest init)
- When `ummahCommand.unlocked`, App.jsx shows new **Ummah Command** tab
- Linked members' progress feeds into Ummah Burden score (future feature)

---

## 4. PHASE 4: UI INTEGRATION

### 4.1 Dashboard Updates (`src/components/Dashboard.jsx`)

**Below rank badge, above Overall XP bar:**
- `UmmahBurden` component: horizontal bar, score + milestone label
- `SkillBar` component: 4 slots, active skills highlighted, cooldown timers as text
- `EquipmentPanel` component: 3 mini-slots (weapon, armor, ring), durability as thin bar

**Replace Level Quest display when active Seerah Chain exists:**
- `SeerahChain` component: day counter (Day X/21), trait preview, failure warning text

**Solo Clear Badge:** Small text indicator near daily quests header if `weeklyStats.aiPromptsUsed === 0`.

### 4.2 WeeklyDungeon Updates (`src/components/WeeklyDungeon.jsx`)

**Body card changes:**
- Title = Physics Gate name (e.g., "Newton's Gate")
- Subtitle = "Boss Fight — Pass/Fail Standard"
- Description = gate description + step list
- Add "SOLO CLEAR ACTIVE" banner if `weeklyStats.aiPromptsUsed === 0` and `soloClear === true`
- On claim: show equipment drop preview (name + boost %)

### 4.3 New Components

Create these files in `src/components/`:

| File | Purpose | Props |
|------|---------|-------|
| `UmmahBurden.jsx` | Meter + milestone tracker | `ummahBurden`, `onUpdate` |
| `SkillBar.jsx` | 4 skill slots, activate button | `skills`, `onActivate` |
| `EquipmentPanel.jsx` | 3 slots, durability bars | `equipment` |
| `SeerahChain.jsx` | Day counter, trait preview | `activeChain` |
| `JobChangeGate.jsx` | 7-day progress, lock reason | `activeGate`, `state` |
| `LegacyShadows.jsx` | List of manhood shadows | `legacyShadows` |
| `MonarchTrial.jsx` | Stage progress, countdown | `monarchTrials` |

### 4.4 App.jsx Updates

**New tabs:**
```javascript
const tabs = [
  { id: 'dashboard', label: 'Status', icon: LayoutDashboard },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'dungeons', label: 'Dungeons', icon: Swords },
  { id: 'legion', label: 'Legion', icon: Skull }, // NEW: Shadow legion management
  { id: 'store', label: 'Store', icon: ShoppingBag },
  { id: 'build', label: 'Build', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];
```

**Conditional tab (after ascension):**
```javascript
if (state.ummahCommand?.unlocked) {
  tabs.splice(4, 0, { id: 'ummah', label: 'Ummah', icon: Crown });
}
```

**Header update:**
- Show Ummah Burden score next to gold:
  ```
  [Gold: X] | [Ummah: Y] | [Name]
  ```

---

## 5. PHASE 5: TESTING, SYNC & MIGRATION

### 5.1 Build Verification

After each phase:
```bash
cd /Users/saiful/solo-leveling-system && npm run build
```

Fix all warnings/errors before proceeding. No unused variable warnings.

### 5.2 Supabase Migration SQL

Add this block at the very end of `supabase/schema.sql`:

```sql
-- ============================================================
-- MIGRATION: v2 → v3 (Ultimate Evolution)
-- Run this in Supabase SQL Editor after deploying the new code
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ummah_burden_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS skill_points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monarch_unlocked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ummah_command_unlocked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS flow_state jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_quest_date date,
  ADD COLUMN IF NOT EXISTS last_active_date date;

-- New tables (all with IF NOT EXISTS for idempotency)
CREATE TABLE IF NOT EXISTS public.skills (...); -- (full definitions from 1.4 above)
CREATE TABLE IF NOT EXISTS public.equipment (...);
CREATE TABLE IF NOT EXISTS public.seerah_chains (...);
CREATE TABLE IF NOT EXISTS public.legacy_shadows (...);
CREATE TABLE IF NOT EXISTS public.job_change_gates (...);
CREATE TABLE IF NOT EXISTS public.monarch_trials (...);
```

### 5.3 Backward Compatibility

- `loadState()` must deep-merge new v3 defaults into v2-loaded data without data loss
- `syncStateToCloud()` must not fail if new tables do not exist yet (graceful degradation)
- `loadStateFromCloud()` must use snapshot fallback if granular tables are empty/missing
- Old shadows, quests, history, streaks fully preserved

### 5.4 Order of Implementation

When executing this plan, implement in this exact order:

1. **Phase 1 first** — Schema expansion, migration, sync. Test build.
2. **Phase 2 second** — Job Change Gates, Skills, Shadow Legions, Solo Clear, Equipment. Test build.
3. **Phase 3 third** — Ummah Burden, Seerah Chains, Legacy Shadows, Physics Gates, Monarch Trials. Test build.
4. **Phase 4 fourth** — All UI components, App.jsx updates. Test build.
5. **Phase 5 last** — Final build, migration SQL verification, backward compat testing.

---

## 6. EXECUTION CHECKLIST

When the user says "Execute the Ultimate Evolution Plan", verify:

- [ ] User's current overallLevel >= 50 (or they explicitly override)
- [ ] Read this file completely before touching code
- [ ] Update `SCHEMA_VERSION` to 3 in `store.js`
- [ ] Deep-merge new defaults in `loadState()`
- [ ] Update Supabase sync for all new tables
- [ ] Add migration SQL to `supabase/schema.sql`
- [ ] Implement all 10 systems per phases above
- [ ] Create all 7 new UI components
- [ ] Update Dashboard, WeeklyDungeon, App.jsx
- [ ] Test `npm run build` after each phase
- [ ] Verify backward compatibility with v2 states
- [ ] Update `CLAUDE.md` with new systems and status

---

## 7. FRAMING FOR YOUNGER USER

The user executing this will likely be 20-25. He may be married or close to it. His AI ventures may be generating income. The framing should be:

- **Job Change Gates** = "You are now strong enough to be tested."
- **Manhood Forge Shadows** = "Forge the man your children will inherit."
- **Ummah Burden** = "Your wealth is not for you. It is a trust from Allah."
- **Seerah Chains** = "The Prophet (SAW) is the standard. Not motivational quotes."
- **Monarch Ascension** = "The Ummah needs men who can carry weight. Are you one of them?"

Forge-Master persona must remain brutal, Islamic, zero-excuses. No emojis. Commands, not suggestions.

---

*Plan version: 1.0*
*Created: 2026-05-31*
*Trigger: state.user.overallLevel >= 50*
*File location: /Users/saiful/solo-leveling-system/ULTIMATE-EVOLUTION-PLAN.md*
