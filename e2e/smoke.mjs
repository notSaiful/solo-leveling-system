// End-to-end render-safety smoke test.
//
// Catches the one class of bug unit tests and `npm run build` cannot: a
// component that renders with a real/default state but throws at render time
// (e.g. a missing lucide import — the `Zap` bug this test was created to
// guard). Mounts the production build via `vite preview` and exercises the
// always-on Legion/Missions tabs plus the LogTab endgame row on both a fresh
// state and a seeded endgame state.
//
// Run: `npm run test:e2e` (builds, then runs this script).

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const STORAGE_KEY = 'soloLevelingData';

if (!existsSync('dist/index.html')) {
  console.error('dist/ not found — run `npm run build` first (npm run test:e2e does this).');
  process.exit(2);
}

const results = [];
function check(name, cond, detail = '') {
  const ok = !!cond;
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

async function load(page, stateObj) {
  if (stateObj) {
    await page.addInitScript(([k, v]) => {
      try { localStorage.setItem(k, v); } catch (e) {}
    }, [STORAGE_KEY, JSON.stringify(stateObj)]);
  }
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(600);
}

async function healthy(page) {
  return (await page.getByText('SYSTEM COLLAPSE').count()) === 0;
}

async function clickNav(page, re) {
  await page.locator('nav button').filter({ hasText: re }).first().click();
  await page.waitForTimeout(250);
}

async function waitForReady(timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE, { signal: AbortSignal.timeout(1500) });
      if (res.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

// Start vite preview serving the production build. --strictPort fails fast if
// 4173 is already taken instead of silently incrementing to 4174 (which would
// leave this script waiting on the wrong port).
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
const serverBuf = [];
server.stdout.on('data', (d) => serverBuf.push(d));
server.stderr.on('data', (d) => serverBuf.push(d));
const cleanup = () => { try { server.kill('SIGTERM'); } catch {} };
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });
process.on('SIGTERM', () => { cleanup(); process.exit(143); });

(async () => {
  if (!(await waitForReady())) {
    console.error(`vite preview did not become ready on :${PORT}:\n${Buffer.concat(serverBuf).toString()}`);
    process.exit(2);
  }

  const browser = await chromium.launch({ headless: true });
  let exitCode = 0;
  try {
    // ── 1. FRESH STATE ──
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await load(page, null);
    check('app boots (fresh state)', await healthy(page));
    const navTexts = (await page.locator('nav button').allTextContents()).map((t) => t.trim()).filter(Boolean);
    check('7 bottom-nav tabs', navTexts.length >= 7, navTexts.join('|'));
    check('Missions tab present', navTexts.some((l) => /^missions$/i.test(l)));
    check('Legion tab present', navTexts.some((l) => /^legion$/i.test(l)));

    await clickNav(page, /^Legion$/);
    check('Legion renders (fresh)', (await healthy(page)) && (await page.getByText('SHADOW ARMY').count()) > 0);
    check('Legion: JOB CHANGE GATES section', (await page.getByText('JOB CHANGE GATES').count()) > 0);
    check('Legion: KHALIFATE OBJECTIVES section', (await page.getByText('KHALIFATE OBJECTIVES').count()) > 0);

    await clickNav(page, /^Missions$/);
    check('Missions renders (fresh, no collapse)', await healthy(page));

    await clickNav(page, /^Log$/);
    check('Log renders (fresh, no collapse)', await healthy(page));
    await ctx.close();

    // ── 2. SEEDED ENDGAME STATE ──
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page2 = await ctx2.newPage();
    await load(page2, makeSeededState());
    check('app boots (seeded endgame)', await healthy(page2));

    await clickNav(page2, /^Legion$/);
    check('Legion renders (seeded)', await healthy(page2));
    check('Legion: extracted shadow chip', (await page2.getByText('Shadow of Movement').count()) > 0);
    check('Legion: active gate Day 2/7', (await page2.getByText(/Day 2\/7/).count()) > 0);
    check('Legion: MONARCH TRIAL section', (await page2.getByText('MONARCH TRIAL').count()) > 0);

    await clickNav(page2, /^Log$/);
    check('Log: endgame status row (1 shadow)', (await page2.getByText(/1 shadow/).count()) > 0);
    await ctx2.close();
  } catch (err) {
    console.error('SMOKE SCRIPT ERROR:', err);
    exitCode = 2;
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length || exitCode) {
    if (failed.length) console.error('FAILURES:\n' + failed.map((f) => `  - ${f.name}${f.detail ? ' (' + f.detail + ')' : ''}`).join('\n'));
    process.exit(exitCode || 1);
  }
})();

// Seeded endgame state. buildVersion is intentionally omitted so the app's
// normalizeStateShape fills defaults; if BUILD_VERSION drifts, the upgrade
// path only clears dailyQuests (unused here) — the endgame fields below
// survive and the assertions hold.
function makeSeededState() {
  return {
    user: { name: 'Seeker', currentRank: 'E', overallLevel: 10, joinedDate: '2026-01-01T00:00:00.000Z', jobClass: null },
    pillars: {
      deen: { level: 0, xp: 0, streak: 0, shadowsUnlocked: [], activeDebuff: null },
      body: { level: 0, xp: 0, streak: 7, shadowsUnlocked: [], activeDebuff: null },
      money: { level: 0, xp: 0, streak: 0, shadowsUnlocked: [], activeDebuff: null },
    },
    stats: { strength: 10, agility: 10, intelligence: 10, sense: 10, health: 10, mana: 10 },
    gold: 0,
    shadows: [
      { id: 'basic-fitness', name: 'Shadow of Movement', description: 'Daily outdoor movement becomes automatic. +5% Adventure XP.', grade: 'NORMAL', pillar: 'body', passiveBonus: 0.05, effect: 'bodyXpBonus', extractedAt: '2026-01-01T00:00:00.000Z' },
    ],
    jobChangeGates: [
      {
        gateId: 'gate-d-10', rank: 'D', levelRequired: 10, title: "The Apprentice's Threshold",
        day: 2, totalDays: 7,
        steps: [
          { day: 1, title: 'Fajr Warrior', description: 'Pray Fajr', pillar: 'deen', xp: 100, completed: true, completedAt: '2026-06-22T05:00:00.000Z' },
          { day: 2, title: 'Adventure Foundation', description: 'Walk 5k steps', pillar: 'body', xp: 100, completed: false, completedAt: null },
          { day: 3, title: 'AI First Step', description: 'AI tool', pillar: 'money', xp: 100, completed: false, completedAt: null },
          { day: 4, title: 'All Prayers Perfect', description: '5 prayers', pillar: 'deen', xp: 120, completed: false, completedAt: null },
          { day: 5, title: 'Trail Gauntlet', description: 'hike', pillar: 'body', xp: 120, completed: false, completedAt: null },
          { day: 6, title: 'AI Discipline', description: 'AI study', pillar: 'money', xp: 120, completed: false, completedAt: null },
          { day: 7, title: "BOSS: The Apprentice's Awakening", description: 'all', pillar: 'all', xp: 200, completed: false, completedAt: null },
        ],
        completed: false, completedAt: null, failed: false, failedAt: null, startedAt: '2026-06-21T00:00:00.000Z',
      },
    ],
    monarchTrials: { active: true, stage: 4, startedAt: '2026-05-14T00:00:00.000Z', completedAt: null },
    ummahCommand: { unlocked: false, linkedMembers: [] },
    history: [],
    systemMessages: [],
    skills: [],
    skillPoints: 0,
    equipment: { weapon: null, armor: null, ring: null },
    seerahChains: [],
    nabawiTraits: [],
    khalifateObjectives: [],
    activities: {},
    lastActiveDate: '2026-06-22',
    lastUpdated: Date.now(),
    syncRevision: 1,
    guidedMode: { enabled: false, lastQuestDate: null },
  };
}