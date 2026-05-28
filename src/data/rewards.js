export const REWARD_ITEMS = [
  { id: 'reward-anime', name: 'Watch 1 Episode', cost: 500, category: 'entertainment', description: 'Relax with one episode of your favorite anime' },
  { id: 'reward-book', name: 'Buy a Book', cost: 1000, category: 'education', description: 'Purchase any book you want' },
  { id: 'reward-coffee', name: 'Premium Coffee', cost: 300, category: 'food', description: 'Treat yourself to a nice coffee' },
  { id: 'reward-meal', name: 'Eat Out', cost: 2000, category: 'food', description: 'Dinner at a restaurant of your choice' },
  { id: 'reward-weekend', name: 'Weekend Trip', cost: 5000, category: 'travel', description: 'Short getaway for the weekend' },
  { id: 'reward-gadget', name: 'New Gadget', cost: 10000, category: 'tech', description: 'Buy a gadget you have been eyeing' },
  { id: 'reward-charity', name: 'Extra Sadaqah', cost: 1500, category: 'charity', description: 'Give beyond your normal sadaqah' },
  { id: 'reward-rest', name: 'Rest Day', cost: 800, category: 'wellness', description: 'Skip non-mandatory quests for one day' },
  { id: 'reward-course', name: 'Online Course', cost: 3000, category: 'education', description: 'Enroll in a course to level up skills' },
  { id: 'reward-gym', name: 'Gym Membership', cost: 2500, category: 'fitness', description: 'Month of gym access' },
];

export function calculateGoldReward(quest, rank) {
  const baseGold = quest.xp || quest.baseXp || 10;
  const rankMultiplier = { E: 1, D: 1.2, C: 1.5, B: 2, A: 2.5, S: 3 };
  const multiplier = rankMultiplier[rank] || 1;
  return Math.floor(baseGold * 0.5 * multiplier);
}

export function purchaseReward(gold, itemId, purchasedItems) {
  const item = REWARD_ITEMS.find(i => i.id === itemId);
  if (!item) return { success: false, message: 'Item not found' };
  if (gold < item.cost) return { success: false, message: 'Not enough gold' };

  const newGold = gold - item.cost;
  const newPurchased = [...purchasedItems, { ...item, purchasedAt: new Date().toISOString() }];

  return { success: true, gold: newGold, purchasedItems: newPurchased, message: `Purchased: ${item.name}` };
}
