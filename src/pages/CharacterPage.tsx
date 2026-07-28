import { useEffect, useState } from "react";
import { db } from "@/db/dexie";
import { EXERCISE_DATABASE } from "@/db/workoutData";
import { type CharacterStats, type SkillTreeGroup,type TitleItem,type QuestItem } from "@/types/character";
import { getLevelAndXp } from "@/utils/xpCalculations";

import CharacterHeader from "@/components/character/CharacterHeader";
import AttributeGrid from "@/components/character/AttributeGrid";
import SkillTreeSection from "@/components/character/SkillTreeSection";
import TitlesSection from "@/components/character/TitlesSection";
import CurrentQuest from "@/components/character/CurrentQuest";

export default function CharacterPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CharacterStats>({
    totalXp: 0,
    level: 1,
    xpInCurrentLevel: 0,
    xpNeededForNextLevel: 100,
    levelProgressPercent: 0,
    strengthLevel: 1,
    athleticismLevel: 1,
    mobilityLevel: 1,
    balanceLevel: 1,
    enduranceLevel: 1,
    gripLevel: 1,
    coreLevel: 1,
    primaryClass: "Novice Adventurer",
    secondaryClass: "General Trainee",
    currentFocus: "Foundation Building",
    trainingStyle: "Consistency + Movement",
    gymSessionsCount: 0,
    strengthSessionsCount: 0,
    classesCount: 0,
    mobilitySessionsCount: 0,
    prCount: 0,
    milestonesCount: 0,
    currentStreak: 0,
    longestStreak: 0,
    hoursTrained: 0,
  });

  const [activeSkillTab, setActiveSkillTab] = useState<string>("Upper Body");
  const [skillTrees, setSkillTrees] = useState<SkillTreeGroup[]>([]);
  const [titles, setTitles] = useState<TitleItem[]>([]);
  const [currentQuest] = useState<QuestItem>({
    title: "First Floor Push-up",
    progressPercent: 0,
  });

  useEffect(() => {
    async function calculateRealCharacterData() {
      try {
        const sessions = await db.sessions.toArray();

        if (!sessions || sessions.length === 0) {
          setLoading(false);
          return;
        }

        const sortedSessions = [...sessions].sort((a: any, b: any) => {
          const timeA = new Date(a.timestamp || a.startTime || 0).getTime();
          const timeB = new Date(b.timestamp || b.startTime || 0).getTime();
          return timeA - timeB;
        });

        let calculatedXp = 0;
        let gymSessionsCount = sortedSessions.length;
        let strengthSessionsCount = 0;
        let mobilitySessionsCount = 0;
        let classesCount = 0;
        let prCount = 0;

        let benchScores: number[] = [];
        let squatScores: number[] = [];
        let hipThrustScores: number[] = [];
        let rdlScores: number[] = [];
        let shoulderPressScores: number[] = [];
        let latPulldownScores: number[] = [];

        let deadHangScores: number[] = [];
        let farmerCarryScores: number[] = [];
        let suitcaseCarryScores: number[] = [];

        let cableCrunchScores: number[] = [];
        let legRaiseScores: number[] = [];
        let birdDogScores: number[] = [];
        let russianTwistScores: number[] = [];
        let plankScores: number[] = [];
        let sideLegLowerScores: number[] = [];

        let deepSquatScores: number[] = [];
        let butterflyScores: number[] = [];
        let ninetyNinetyScores: number[] = [];
        let hipFlexorScores: number[] = [];
        let wallAngelsScores: number[] = [];

        let singleLegStandScores: number[] = [];
        let singleLegRdlScores: number[] = [];
        let controlledDeepSquatScores: number[] = [];

        let previousSessionMaxValues = new Map<string, number>();
        let sessionDates = new Set<string>();

        sortedSessions.forEach((session: any) => {
          calculatedXp += 100;

          const rawDate = session.timestamp || session.startTime || Date.now();
          const dateKey = new Date(rawDate).toDateString();
          sessionDates.add(dateKey);

          const category = (session.category || session.type || "").toLowerCase();
          const isStrength = category.includes("strength") || category.includes("lifting");
          const isMobility = category.includes("mobility") || category.includes("stretch");
          const isClass = category.includes("class") || category.includes("hiit") || category.includes("intensity");

          if (isStrength) strengthSessionsCount++;
          if (isMobility) {
            mobilitySessionsCount++;
            calculatedXp += 40;
          }
          if (isClass) {
            classesCount++;
            calculatedXp += 80;
          }

          const exercises = session.exercises || [];
          const strengthExercises = exercises.filter((ex: any) => {
            const def = EXERCISE_DATABASE.find((e) => e.id === ex.exerciseId);
            const cat = def ? def.category : (ex.category || "");
            return isStrength || cat.includes("push") || cat.includes("pull") || cat.includes("lower");
          });

          calculatedXp += Math.min(strengthExercises.length, 8) * 15;

          exercises.forEach((ex: any) => {
            const exId = ex.exerciseId || ex.name;
            const sets = ex.sets || [];
            let sessionBestForExercise = 0;

            sets.forEach((set: any) => {
              const weight = set.weightKg || 0;
              const reps = set.reps || 0;
              const time = set.timeSeconds || 0;
              const metricVal = weight > 0 ? weight : (reps > 0 ? reps : time);

              if (metricVal > sessionBestForExercise) sessionBestForExercise = metricVal;

              if (exId === "bench" || (ex.name || "").toLowerCase().includes("bench")) benchScores.push(weight || reps);
              if (exId === "squat" || (ex.name || "").toLowerCase().includes("squat")) squatScores.push(weight || reps);
              if (exId === "hip_thrust" || (ex.name || "").toLowerCase().includes("hip thrust")) hipThrustScores.push(weight || reps);
              if (exId === "rdl" || (ex.name || "").toLowerCase().includes("rdl")) rdlScores.push(weight || reps);
              if (exId === "shoulder_press" || (ex.name || "").toLowerCase().includes("shoulder press")) shoulderPressScores.push(weight || reps);
              if (exId === "lat_pulldown" || (ex.name || "").toLowerCase().includes("lat pulldown")) latPulldownScores.push(weight || reps);

              if (exId === "dead_hang" || (ex.name || "").toLowerCase().includes("dead hang")) deadHangScores.push(time || reps);
              if (exId === "farmer_carry" || (ex.name || "").toLowerCase().includes("farmer carry")) farmerCarryScores.push(weight || reps);
              if (exId === "suitcase_carry" || (ex.name || "").toLowerCase().includes("suitcase carry")) suitcaseCarryScores.push(weight || reps);

              if (exId === "cable_crunch" || (ex.name || "").toLowerCase().includes("cable crunch")) cableCrunchScores.push(weight || reps);
              if (exId === "leg_raise" || (ex.name || "").toLowerCase().includes("leg raise")) legRaiseScores.push(reps || time);
              if (exId === "bird_dog" || (ex.name || "").toLowerCase().includes("bird dog")) birdDogScores.push(reps || time);
              if (exId === "russian_twist" || (ex.name || "").toLowerCase().includes("russian twist")) russianTwistScores.push(weight || reps);
              if (exId === "plank" || (ex.name || "").toLowerCase().includes("plank")) plankScores.push(time || reps);
              if (exId === "side_leg_lower" || (ex.name || "").toLowerCase().includes("side leg lower")) sideLegLowerScores.push(reps || time);

              if (exId === "deep_squat" || (ex.name || "").toLowerCase().includes("deep squat")) deepSquatScores.push(time || 1);
              if (exId === "butterfly" || (ex.name || "").toLowerCase().includes("butterfly")) butterflyScores.push(time || 1);
              if (exId === "ninety_ninety" || (ex.name || "").toLowerCase().includes("90/90")) ninetyNinetyScores.push(time || 1);
              if (exId === "hip_flexor" || (ex.name || "").toLowerCase().includes("hip flexor")) hipFlexorScores.push(time || 1);
              if (exId === "wall_angels" || (ex.name || "").toLowerCase().includes("wall angels")) wallAngelsScores.push(reps || 1);

              if (exId === "single_leg_stand" || (ex.name || "").toLowerCase().includes("single leg stand")) singleLegStandScores.push(time || reps);
              if (exId === "single_leg_rdl" || (ex.name || "").toLowerCase().includes("single leg rdl")) singleLegRdlScores.push(weight || reps);
              if (exId === "controlled_deep_squat" || (ex.name || "").toLowerCase().includes("controlled deep squat")) controlledDeepSquatScores.push(time || reps);
            });

            if (sessionBestForExercise > 0) {
              const previousBest = previousSessionMaxValues.get(exId) || 0;
              if (sessionBestForExercise > previousBest) {
                calculatedXp += 50; 
                prCount++;
                calculatedXp += 120; 
                previousSessionMaxValues.set(exId, sessionBestForExercise);
              }
            }
          });
        });

        const weeklyBuckets = new Map<string, number>();
        sortedSessions.forEach((s: any) => {
          const d = new Date(s.timestamp || s.startTime || Date.now());
          const yearWeek = `${d.getFullYear()}-W${Math.floor(d.getDate() / 7)}`;
          weeklyBuckets.set(yearWeek, (weeklyBuckets.get(yearWeek) || 0) + 1);
        });
        weeklyBuckets.forEach((count) => {
          if (count >= 3) calculatedXp += 250;
        });

        let currentStreak = 0;
        let longestStreak = 0;
        let streakBonus = 0;

        if (sessionDates.size > 0) {
          const sortedDates = Array.from(sessionDates).map(d => new Date(d).getTime()).sort((a, b) => a - b);
          let tempStreak = 0;

          for (let i = 0; i < sortedDates.length; i++) {
            if (i === 0) {
              tempStreak = 1;
            } else {
              const diffDays = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
              if (diffDays <= 1.5) {
                tempStreak++;
              } else {
                tempStreak = 1;
              }
            }
            if (tempStreak > longestStreak) longestStreak = tempStreak;
          }
          currentStreak = tempStreak;
          const streakBonusTable = [0, 10, 20, 30, 40, 50, 60, 70];
          streakBonus = streakBonusTable[Math.min(currentStreak, 7)] || 70;
        }

        calculatedXp += streakBonus;

        const avgScore = (arr: number[], target: number) => {
          if (arr.length === 0) return 0;
          const maxVal = Math.max(...arr);
          return Math.min(100, Math.round((maxVal / target) * 100));
        };

        const strengthNorm = avgScore(benchScores, 80) * 0.20 + avgScore(squatScores, 100) * 0.25 + avgScore(hipThrustScores, 120) * 0.20 + avgScore(rdlScores, 90) * 0.15 + avgScore(shoulderPressScores, 50) * 0.10 + avgScore(latPulldownScores, 60) * 0.10;
        const gripNorm = avgScore(deadHangScores, 60) * 0.50 + avgScore(farmerCarryScores, 40) * 0.30 + avgScore(suitcaseCarryScores, 30) * 0.20;
        const coreNorm = avgScore(cableCrunchScores, 40) * 0.20 + avgScore(legRaiseScores, 20) * 0.20 + avgScore(birdDogScores, 30) * 0.10 + avgScore(russianTwistScores, 40) * 0.10 + avgScore(plankScores, 90) * 0.20 + avgScore(sideLegLowerScores, 20) * 0.20;
        const mobilityNorm = avgScore(deepSquatScores, 60) * 0.30 + avgScore(butterflyScores, 60) * 0.15 + avgScore(ninetyNinetyScores, 60) * 0.20 + avgScore(hipFlexorScores, 60) * 0.20 + avgScore(wallAngelsScores, 20) * 0.15;
        const balanceNorm = avgScore(singleLegStandScores, 60) * 0.40 + avgScore(singleLegRdlScores, 50) * 0.40 + avgScore(controlledDeepSquatScores, 30) * 0.20;
        const bodyweightNorm = (strengthNorm * 0.5 + mobilityNorm * 0.5);
        const athleticismNorm = strengthNorm * 0.25 + mobilityNorm * 0.20 + balanceNorm * 0.15 + coreNorm * 0.15 + bodyweightNorm * 0.15 + gripNorm * 0.10;
        const enduranceNorm = Math.min(100, (classesCount * 10 + gymSessionsCount * 2));

        const scoreToLevelAccurate = (score: number) => (score === 0 ? 1 : Math.max(1, Math.floor(score / 10) + 1));

        const strengthLvl = scoreToLevelAccurate(strengthNorm);
        const athleticismLvl = scoreToLevelAccurate(athleticismNorm);
        const mobilityLvl = scoreToLevelAccurate(mobilityNorm);
        const balanceLvl = scoreToLevelAccurate(balanceNorm);
        const enduranceLvl = scoreToLevelAccurate(enduranceNorm);
        const gripLvl = scoreToLevelAccurate(gripNorm);
        const coreLvl = scoreToLevelAccurate(coreNorm);

        const { level, xpInLevel, xpSpan, progressPercent } = getLevelAndXp(calculatedXp);

        setSkillTrees([
          {
            categoryName: "Upper Body",
            skills: [
              { name: "Wall Push-up", completed: gymSessionsCount >= 1 },
              { name: "Incline Push-up", completed: gymSessionsCount >= 3 },
              { name: "Knee Push-up", completed: gymSessionsCount >= 5 },
              { name: "Floor Push-up", completed: strengthSessionsCount >= 3 },
              { name: "Diamond Push-up", completed: strengthSessionsCount >= 8 },
              { name: "Decline Push-up", completed: strengthSessionsCount >= 15 },
            ],
          },
          {
            categoryName: "Lower Body",
            skills: [
              { name: "Bodyweight Squat", completed: gymSessionsCount >= 1 },
              { name: "Goblet Squat", completed: strengthSessionsCount >= 2 },
              { name: "Barbell Back Squat", completed: strengthSessionsCount >= 6 },
              { name: "Bulgarian Split Squat", completed: strengthSessionsCount >= 10 },
              { name: "Romanian Deadlift", completed: strengthSessionsCount >= 14 },
            ],
          },
          {
            categoryName: "Bodyweight",
            skills: [
              { name: "Dead Hang (30s)", completed: deadHangScores.some(s => s >= 30) },
              { name: "Assisted Pull-up", completed: gymSessionsCount >= 5 },
              { name: "Negative Pull-up", completed: gymSessionsCount >= 10 },
              { name: "Unassisted Pull-up", completed: gymSessionsCount >= 20 },
              { name: "Muscle-up", completed: false },
            ],
          },
          {
            categoryName: "Mobility",
            skills: [
              { name: "Touch Toes", completed: mobilitySessionsCount >= 1 },
              { name: "Deep Squat (30s)", completed: mobilitySessionsCount >= 3 },
              { name: "Deep Squat (60s)", completed: mobilitySessionsCount >= 8 },
              { name: "Front Split", completed: false },
              { name: "Middle Split", completed: false },
            ],
          },
          {
            categoryName: "Movement",
            skills: [
              { name: "Single Leg Stand (30s)", completed: singleLegStandScores.some(s => s >= 30) },
              { name: "Single Leg Stand (60s)", completed: singleLegStandScores.some(s => s >= 60) },
              { name: "Eyes Closed Balance", completed: false },
              { name: "Single Leg Pistol Squat", completed: false },
            ],
          },
        ]);

        setTitles([
          { id: "1", name: "Foundation Builder", unlocked: gymSessionsCount >= 25 },
          { id: "2", name: "Iron Grip", unlocked: deadHangScores.some(s => s >= 30) },
          { id: "3", name: "First Blood", unlocked: gymSessionsCount >= 1 },
          { id: "4", name: "Master of Gravity", unlocked: balanceLvl >= 10 },
          { id: "5", name: "Shadow Walker", unlocked: mobilityLvl >= 10 },
          { id: "6", name: "The Athlete", unlocked: (strengthLvl >= 10 && athleticismLvl >= 10 && mobilityLvl >= 10 && balanceLvl >= 10 && enduranceLvl >= 10 && gripLvl >= 10 && coreLvl >= 10) },
        ]);

        setStats({
          totalXp: calculatedXp,
          level,
          xpInCurrentLevel: xpInLevel,
          xpNeededForNextLevel: xpSpan,
          levelProgressPercent: progressPercent,
          strengthLevel: strengthLvl,
          athleticismLevel: athleticismLvl,
          mobilityLevel: mobilityLvl,
          balanceLevel: balanceLvl,
          enduranceLevel: enduranceLvl,
          gripLevel: gripLvl,
          coreLevel: coreLvl,
          primaryClass: strengthSessionsCount >= mobilitySessionsCount ? "Strength Athlete" : "Mobility Specialist",
          secondaryClass: athleticismLvl >= 8 ? "Movement Artist" : "Conditioning Adept",
          currentFocus: strengthSessionsCount > mobilitySessionsCount ? "Pulling Strength" : "Joint Mobility",
          trainingStyle: "Progressive Overload + Mobility",
          gymSessionsCount,
          strengthSessionsCount,
          classesCount,
          mobilitySessionsCount,
          prCount,
          milestonesCount: Math.max(0, Math.floor(gymSessionsCount * 0.4)),
          currentStreak,
          longestStreak,
          hoursTrained: Math.round(gymSessionsCount * 1.2),
        });

      } catch (err) {
        console.error("Error computing real character profile:", err);
      } finally {
        setLoading(false);
      }
    }

    calculateRealCharacterData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] p-12 text-center border border-[#EAE3DE] shadow-xs">
        <div className="w-8 h-8 border-2 border-[#6B2D3A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span className="font-serif text-sm text-[#8C7B75]">Summoning real character sheet from workout logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      <CharacterHeader stats={stats} />
      <AttributeGrid stats={stats} />
      <SkillTreeSection 
        skillTrees={skillTrees} 
        activeSkillTab={activeSkillTab} 
        setActiveSkillTab={setActiveSkillTab} 
      />
      <TitlesSection titles={titles} />
      <CurrentQuest currentQuest={currentQuest} />
    </div>
  );
}