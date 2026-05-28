/** ============================================================
 *  AI ASSISTANT — OpenRouter Integration (kimi-k2.6)
 *  ============================================================
 *  Provides quest guidance, motivation, and custom quest
 *  evaluation aligned with the Solo Leveling System objectives.
 *  ============================================================ */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'moonshot-ai/kimi-k2.6';

function getApiKey() {
  return localStorage.getItem('openrouter_api_key') || '';
}

export function setApiKey(key) {
  localStorage.setItem('openrouter_api_key', key);
}

export function hasApiKey() {
  return !!getApiKey();
}

function buildSystemPrompt(state) {
  const rank = state.user.currentRank;
  const level = state.user.overallLevel;
  const deen = state.pillars.deen;
  const body = state.pillars.body;
  const money = state.pillars.money;
  const bestStreak = Math.max(deen.streak, body.streak, money.streak);

  return `You are the SYSTEM — the AI assistant of a Solo Leveling-inspired gamified self-development app for a Muslim user.

USER PROFILE:
- Rank: ${rank}-Rank
- Overall Level: ${level}
- Deen: Level ${deen.level} (${deen.xp} XP, streak: ${deen.streak})
- Body: Level ${body.level} (${body.xp} XP, streak: ${body.streak})
- Money: Level ${money.level} (${money.xp} XP, streak: ${money.streak})
- Best Streak: ${bestStreak} days
- Gold: ${state.gold}

THE THREE PILLARS:
1. DEEN — Islamic knowledge, prayer, dhikr, Quran, character, community
2. BODY — Physical strength, health, nutrition, sleep, mental fitness
3. MONEY — Halal wealth generation, investment, sadaqah, skill-building, ummah support

THE OBJECTIVE:
The user is on a journey from Rank E to Rank S (Monarch). The ultimate goal is to become a complete Muslim: spiritually deep, physically strong, and financially empowered to serve the ummah. Every quest, habit, and action must bring the user closer to this objective.

YOUR ROLE:
- Guide the user through their quests with Islamic wisdom and Solo Leveling motivation
- Evaluate custom quests for: pillar alignment, specificity, measurability, difficulty fit for current rank, and Shariah compliance
- Provide tactical advice (e.g., "Attach this habit to Fajr for better consistency")
- Encourage with references to Quran, Sunnah, and Islamic history
- Be concise but powerful. Speak like a System from the anime — direct, analytical, but spiritually rooted
- When evaluating quests, use this format:
  ✅ ALIGNMENT: [Deen/Body/Money] — [score]/10
  ✅ SPECIFICITY: [score]/10
  ✅ DIFFICULTY FIT: [score]/10 (for ${rank}-Rank)
  ✅ SHARIAH COMPLIANCE: [Approved/Needs Review/Rejected]
  📊 VERDICT: [Approved / Approved with modifications / Rejected]
  💡 SUGGESTION: [how to improve]

IMPORTANT:
- Always keep responses under 200 words unless evaluating a quest
- For quest evaluation, be thorough but structured
- Never suggest anything haram
- When the user is struggling, remind them of the Prophet's perseverance
- Use phrases like "The System acknowledges your effort" or "Your power grows" for motivation`;
}

async function callOpenRouter(messages, state) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenRouter API key not set. Go to Settings → AI Assistant.');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Solo Leveling System',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt(state) },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'The System is silent...';
}

// ─── PUBLIC API ───

export async function sendMessage(userMessage, chatHistory, state) {
  const messages = chatHistory.map(m => ({
    role: m.role,
    content: m.content,
  }));
  messages.push({ role: 'user', content: userMessage });

  const reply = await callOpenRouter(messages, state);
  return reply;
}

export async function evaluateCustomQuest(questTitle, questDescription, state) {
  const prompt = `Evaluate this custom quest for alignment with my objective:

QUEST TITLE: ${questTitle}
DESCRIPTION: ${questDescription}

Provide a full evaluation using the SYSTEM format.`;

  const reply = await callOpenRouter([{ role: 'user', content: prompt }], state);
  return reply;
}

export async function getDailyMotivation(state) {
  const prompt = `I'm a ${state.user.currentRank}-Rank Seeker at Level ${state.user.overallLevel}. Give me a short, powerful motivational message for today. Include one tactical tip for my next quest. Keep it under 80 words.`;

  const reply = await callOpenRouter([{ role: 'user', content: prompt }], state);
  return reply;
}

export async function analyzeProgress(state) {
  const prompt = `Analyze my current progress and tell me:
1. Which pillar is lagging and needs attention
2. One specific action I should take today
3. A warning if I'm at risk of losing a streak

Keep it under 100 words.`;

  const reply = await callOpenRouter([{ role: 'user', content: prompt }], state);
  return reply;
}
