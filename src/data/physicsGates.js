import { getStrengthStandard } from './strengthStandards';

// Each gate = that rank's body weekly dungeon (spec §5.5). Pass = complete all events.
export const PHYSICS_GATES = [
  { rank: 'E', name: "Newton's Gate", events: [
    { track: 'strength',  label: 'Foundation Strength', standard: '3×10 bodyweight squat, incline row ×8, push-up ×20', metric: 'strength-foundation' },
    { track: 'power',     label: 'First Explosions',    standard: 'Standing broad jump ~1.5 m, 20 m sprint', metric: 'power-broad-jump' },
    { track: 'endurance', label: 'First Wind',          standard: '1.6 km run < 9:00', metric: 'endurance-run-1.6k' },
    { track: 'resilience',label: 'Base Durability',     standard: '30 s plank, 15 s dead hang, 7 h sleep avg, 5 min mobility', metric: 'resilience-base' },
  ]},
  { rank: 'D', name: "Newton's Gate II", events: [
    { track: 'strength',  label: 'Pulling Power',       standard: 'Pull-up ×5, push-up ×30, squat 4×12', metric: 'strength-pulling' },
    { track: 'power',     label: 'Acceleration',        standard: 'Broad jump ~1.8 m, 20 m sprint < 4 s', metric: 'power-accel' },
    { track: 'endurance', label: 'Faster Wind',         standard: '1.6 km run < 7:30', metric: 'endurance-run-1.6k-fast' },
    { track: 'resilience',label: 'Grip + Fuel',         standard: '60 s plank, 30 s dead hang, protein target met', metric: 'resilience-grip-fuel' },
  ]},
  { rank: 'C', name: 'Thermodynamics Gate', events: [
    { track: 'strength',  label: 'Loaded Strength',     standard: 'Squat 1.5×BW, deadlift 1.75×BW, press 0.75×BW, pull-up ×8', metric: 'strength-loaded' },
    { track: 'power',     label: 'Hill Power',          standard: 'Broad jump ~2.0 m, hill sprints ×6', metric: 'power-hill' },
    { track: 'endurance', label: 'Heat Work',           standard: '5 km run < 28:00, fasted workout (sunnah), cold shower', metric: 'endurance-5k' },
    { track: 'resilience',label: 'Recovery Standard',   standard: '90 s plank, 45 s dead hang, 10 min mobility, sleep > 85%', metric: 'resilience-recovery' },
  ]},
  { rank: 'B', name: 'Relativity Gate', events: [
    { track: 'strength',  label: 'Heavy Four',          standard: 'Squat 1.75×BW, deadlift 2×BW, press 0.9×BW, pull-up ×10, push-up ×50', metric: 'strength-heavy4' },
    { track: 'power',     label: 'Sharp Power',         standard: 'Broad jump ~2.2 m, 300 m shuttle', metric: 'power-shuttle' },
    { track: 'endurance', label: 'Ruck + Run',          standard: '5 km < 25:00, ruck 10 kg / 5 km < 60 min', metric: 'endurance-ruck' },
    { track: 'resilience',label: 'Carry Capacity',      standard: '2 min plank, 60 s dead hang, farmer’s carry BW × 20 m, sleep > 85%', metric: 'resilience-carry' },
  ]},
  { rank: 'A', name: 'Quantum Gate', events: [
    { track: 'strength',  label: 'PR Strength',         standard: 'Squat 2×BW, deadlift 2.5×BW, press 1×BW, pull-up ×15, weighted pull-up', metric: 'strength-pr' },
    { track: 'power',     label: 'PR Power',            standard: 'PR broad jump, 300 m shuttle < 60 s', metric: 'power-pr' },
    { track: 'endurance', label: 'Long + Interval',     standard: '10 km < 50:00, ruck 15 kg / 8 km, 400 m intervals ×6', metric: 'endurance-10k' },
    { track: 'resilience',label: 'Compete',             standard: '3 min plank, 90 s dead hang, farmer’s carry 1.5×BW × 30 m, compete in an event', metric: 'resilience-compete' },
  ]},
  { rank: 'S', name: "The Monarch's Apex", events: [
    { track: 'strength',  label: 'Khalifa Strength',    standard: 'Squat 2×BW, deadlift 2.5–3×BW, press 1.25×BW, pull-up ×20+, weighted pull-up +50% BW', metric: 'strength-khalifa' },
    { track: 'power',     label: 'Apex Power',          standard: 'Broad jump ~2.5 m+, 36 in box jump, explosive lifts', metric: 'power-apex' },
    { track: 'endurance', label: 'Apex Engine',         standard: 'Half-marathon < 2:00, ruck 20 kg / 10 km, 5 km < 22:00', metric: 'endurance-apex' },
    { track: 'resilience',label: 'Khalifa Trial',       standard: '90+ day elite composition, lead community fitness, Khalifa Trial composite in one day: heavy ruck + loaded carry + 2×BW squat + broad jump + run', metric: 'resilience-khalifa-trial' },
  ]},
];

export function getGateForRank(rank) {
  return PHYSICS_GATES.find(g => g.rank === rank) || PHYSICS_GATES[0];
}

// Turn a gate into body-pillar dungeon quests. Strength event pulls the equipment-
// adapted standard from strengthStandards so barbell users get kg, bodyweight users
// get a progression milestone (spec §5.10).
export function gateToDungeonQuests(gate, equipment, bodyweightKg = 70) {
  return gate.events.map((ev, i) => {
    let description = ev.standard;
    if (ev.track === 'strength') {
      const std = getStrengthStandard('squat', gate.rank, bodyweightKg, equipment);
      if (std.kg) description = `${ev.standard} (squat target ${std.kg} kg)`;
      else if (std.milestone) description = `${ev.standard} (bodyweight milestone: ${std.milestone})`;
    }
    return {
      id: `gate-${gate.rank}-${ev.metric}`,
      title: `${gate.name} — ${ev.label}`,
      description,
      pillar: 'body',
      baseXp: { E: 40, D: 70, C: 110, B: 160, A: 220, S: 300 }[gate.rank] || 40,
      track: ev.track,
      metric: ev.metric,
      estimatedMinutes: 25,
      tags: ['physics-gate', ev.track],
    };
  });
}