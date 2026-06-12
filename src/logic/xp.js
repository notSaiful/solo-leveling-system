export function xpForNextLevel(level) {
  return Math.floor(100 * Math.pow(1.15, level) + (Math.floor(level / 10) * 50));
}

export function getLevelProgress(level, xp) {
  const needed = xpForNextLevel(level);
  const prevNeeded = level === 0 ? 0 : xpForNextLevel(level - 1);
  const progress = Math.min(1, Math.max(0, (xp - prevNeeded) / (needed - prevNeeded)));
  return { progress, needed, remaining: needed - xp };
}

export function addXp(pillarState, amount) {
  let { level, xp } = pillarState;
  xp += amount;
  let levelUps = 0;
  while (xp >= xpForNextLevel(level)) {
    level++;
    levelUps++;
  }
  return { ...pillarState, level, xp, levelUps };
}

export function calculateOverallLevel(pillars) {
  const deen = pillars.deen.level || 0;
  const body = pillars.body.level || 0;
  const money = pillars.money.level || 0;
  const weighted = Math.floor((deen * 0.5) + (body * 0.3) + (money * 0.2));
  return Math.max(weighted, deen, body, money);
}
