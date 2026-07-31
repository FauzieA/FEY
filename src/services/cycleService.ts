import { daysBetween, addDays } from '@/utils/date';

export interface CyclePhase {
  name: string;
  dayRange: [number, number];
  biologicalState: string;
  expectedBehavior: string;
  symptoms: string[];
}

export interface CycleInsights {
  currentPhase: CyclePhase | null;
  cycleDay: number;
  daysUntilNext: number;
  averageCycleLength: number;
  isOvulation: boolean;
  isMenstruation: boolean;
}

const PHASES: Record<string, CyclePhase> = {
  menstrual: {
    name: "Menstrual Phase",
    dayRange: [1, 5],
    biologicalState: "Estrogen and progesterone are at their lowest baseline",
    expectedBehavior: "Lower physical energy, possible cramps, muscle aches, and a natural instinct toward rest and reflection",
    symptoms: ["fatigue", "cramps", "muscle aches", "lower energy", "need for rest"]
  },
  follicular: {
    name: "Follicular Phase", 
    dayRange: [6, 13],
    biologicalState: "Estrogen steadily rises, improving mood, focus, and brain plasticity",
    expectedBehavior: "Rising vitality, clearer mental focus, and expanding mental endurance",
    symptoms: ["rising energy", "better mood", "improved focus", "mental clarity"]
  },
  ovulation: {
    name: "Ovulation Phase",
    dayRange: [14, 17],
    biologicalState: "Estrogen peaks alongside a brief surge in testosterone and luteinizing hormone",
    expectedBehavior: "Peak physical strength, high sociability, vibrant energy, and maximum stamina",
    symptoms: ["peak energy", "high confidence", "sociability", "vibrant energy"]
  },
  luteal: {
    name: "Luteal Phase",
    dayRange: [18, 35], // Will be adjusted dynamically based on cycle length
    biologicalState: "Progesterone rises and then plummets sharply right before the cycle ends",
    expectedBehavior: "Gradual decline in energy, potential brain fog, cravings, mood sensitivity, and pre-period headaches or fatigue",
    symptoms: ["declining energy", "brain fog", "cravings", "mood sensitivity", "headaches", "fatigue"]
  }
};

export function calculateCycleInsights(
  startDate: string | null,
  _endDate: string | null,
  averageCycleLength: number = 28
): CycleInsights {
  if (!startDate) {
    return {
      currentPhase: null,
      cycleDay: 0,
      daysUntilNext: 0,
      averageCycleLength,
      isOvulation: false,
      isMenstruation: false
    };
  }

  const cycleDay = daysBetween(startDate) + 1;
  const normalizedDay = ((cycleDay - 1) % averageCycleLength) + 1;
  const daysUntilNext = averageCycleLength - cycleDay;

  let currentPhase: CyclePhase | null = null;
  let isOvulation = false;
  let isMenstruation = false;

  // Adjust luteal phase end based on cycle length
  const lutealEnd = averageCycleLength;
  const adjustedPhases: Record<string, CyclePhase> = {
    ...PHASES,
    luteal: {
      ...PHASES.luteal,
      dayRange: [18, lutealEnd] as [number, number]
    }
  };

  if (normalizedDay >= 1 && normalizedDay <= 5) {
    currentPhase = adjustedPhases.menstrual;
    isMenstruation = true;
  } else if (normalizedDay >= 6 && normalizedDay <= 13) {
    currentPhase = adjustedPhases.follicular;
  } else if (normalizedDay >= 14 && normalizedDay <= 17) {
    currentPhase = adjustedPhases.ovulation;
    isOvulation = true;
  } else if (normalizedDay >= 18 && normalizedDay <= lutealEnd) {
    currentPhase = adjustedPhases.luteal;
  }

  return {
    currentPhase,
    cycleDay,
    daysUntilNext,
    averageCycleLength,
    isOvulation,
    isMenstruation
  };
}

export function calculateAverageCycleLength(cycles: Array<{ startDate: string; endDate?: string }>): number {
  if (cycles.length < 2) return 28;

  const gaps: number[] = [];
  const sortedCycles = [...cycles].sort((a, b) => a.startDate.localeCompare(b.startDate));

  for (let i = 1; i < sortedCycles.length; i++) {
    const gap = daysBetween(sortedCycles[i - 1].startDate, sortedCycles[i].startDate);
    if (gap > 20 && gap < 45) { // Filter out unrealistic gaps
      gaps.push(gap);
    }
  }

  if (gaps.length === 0) return 28;

  const sum = gaps.reduce((acc, gap) => acc + gap, 0);
  return Math.round(sum / gaps.length);
}

export function getNextPeriodDate(startDate: string, averageCycleLength: number): string {
  return addDays(startDate, averageCycleLength);
}

export function getPhaseForDay(day: number, cycleLength: number = 28): CyclePhase | null {
  const normalizedDay = ((day - 1) % cycleLength) + 1;
  const lutealEnd = cycleLength;

  if (normalizedDay >= 1 && normalizedDay <= 5) {
    return PHASES.menstrual;
  } else if (normalizedDay >= 6 && normalizedDay <= 13) {
    return PHASES.follicular;
  } else if (normalizedDay >= 14 && normalizedDay <= 17) {
    return PHASES.ovulation;
  } else if (normalizedDay >= 18 && normalizedDay <= lutealEnd) {
    return PHASES.luteal;
  }

  return null;
}
