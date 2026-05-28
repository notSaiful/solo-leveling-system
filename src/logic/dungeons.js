import { startOfWeek, endOfWeek, format } from 'date-fns';

export function getCurrentWeekId() {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function generateWeeklyDungeons() {
  return {
    weekId: getCurrentWeekId(),
    deen: {
      title: "The Seeker's Trial",
      description: 'Complete 1 Juz of Quran + Write 1-page reflection + Teach someone 1 thing you learned',
      xp: 200,
      steps: [
        { id: 'deen-dungeon-1', text: 'Read 1 Juz', completed: false },
        { id: 'deen-dungeon-2', text: 'Write reflection', completed: false },
        { id: 'deen-dungeon-3', text: 'Teach someone', completed: false },
      ],
    },
    body: {
      title: "The Warrior's Gauntlet",
      description: 'Complete full workout + Perfect nutrition day + Sleep by 9:30pm',
      xp: 200,
      steps: [
        { id: 'body-dungeon-1', text: 'Full workout (30+ min)', completed: false },
        { id: 'body-dungeon-2', text: 'Zero sugar, 2L water', completed: false },
        { id: 'body-dungeon-3', text: 'Sleep by 9:30pm', completed: false },
      ],
    },
    money: {
      title: "The Merchant's Challenge",
      description: 'Full financial review + Make 1 investment action + Give sadaqah beyond normal',
      xp: 200,
      steps: [
        { id: 'money-dungeon-1', text: 'Review all accounts', completed: false },
        { id: 'money-dungeon-2', text: 'Execute 1 investment', completed: false },
        { id: 'money-dungeon-3', text: 'Extra sadaqah', completed: false },
      ],
    },
  };
}

export function checkDungeonCompletion(dungeon) {
  return dungeon.steps.every(s => s.completed);
}

export function checkAllDungeonsComplete(dungeons) {
  return checkDungeonCompletion(dungeons.deen) &&
         checkDungeonCompletion(dungeons.body) &&
         checkDungeonCompletion(dungeons.money);
}
