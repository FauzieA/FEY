import { useEffect, useState } from "react";
import { 
  Shield, 
  Award, 
  Compass, 
  Zap, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Lock 
} from "lucide-react";
import { db } from "@/db/dexie";
import { EXERCISE_DATABASE } from "@/db/workoutData";

// --- Types & Interfaces ---
interface CharacterStats {
  totalXp: number;
  level: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  levelProgressPercent: number;
  
  // Attributes
  strengthLevel: number;
  athleticismLevel: number;
  mobilityLevel: number;
  balanceLevel: number;
  enduranceLevel: number;
  gripLevel: number;
  coreLevel: number;

  // Identity
  primaryClass: string;
  secondaryClass: string;
  currentFocus: string;
  trainingStyle: string;

  // Lifetime Stats
  gymSessionsCount: number;
  strengthSessionsCount: number;
  classesCount: number;
  mobilitySessionsCount: number;
  prCount: number;
  milestonesCount: number;
  currentStreak: number;
  longestStreak: number;
  hoursTrained: number;
}

interface SkillNode {
  name: string;
  completed: boolean;
}

interface SkillTreeGroup {
  categoryName: string;
  skills: SkillNode[];
}

interface TitleItem {
  id: string;
  name: string;
  unlocked: boolean;
}

interface QuestItem {
  title: string;
  progressPercent: number;
}

// --- Helper Functions for Level & XP Thresholds ---
function getLevelAndXp(totalXp: number) {
  // Threshold table based on user guide
  let level = 1;
  let nextLevelXp = 100;
  let currentLevelBase = 0;

  if (totalXp >= 20000) {
    level = 50;
    nextLevelXp = 20000;
    currentLevelBase = 20000;
  } else if (totalXp >= 4200) {
    level = 20;
    nextLevelXp = 5000; // scaling past 20
    currentLevelBase = 4200;
  } else {
    // Dynamic bracket calculation matching the guide pattern
    // Level 1: 0 - 100
    // Level 2: 100 - 250 (span 150)
    // Level 3: 250 - 450 (span 200)
    let cumulative = 0;
    let base = 0;
    let span = 100;

    for (let l = 1; l <= 50; l++) {
      base = cumulative;
      span = 100 + (l - 1) * 50;
      cumulative += span;
      if (totalXp < cumulative) {
        level = l;
        nextLevelXp = cumulative;
        currentLevelBase = base;
        break;
      }
    }
  }

  const xpInLevel = Math.max(0, totalXp - currentLevelBase);
  const xpSpan = Math.max(1, nextLevelXp - currentLevelBase);
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInLevel / xpSpan) * 100)));

  return { level, xpInLevel, xpSpan, progressPercent };
}



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

        // If no data exists, keep everything cleanly at 0
        if (!sessions || sessions.length === 0) {
          setLoading(false);
          return;
        }

        // Sort sessions chronologically
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
          calculatedXp += 100; // Workout Completed

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
                calculatedXp += 50; // Progressive Overload
                prCount++;
                calculatedXp += 120; // PR Bonus
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

        // Calculate Streaks safely based on real logs
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

        // Attributes Normalization
        const avgScore = (arr: number[], target: number) => {
          if (arr.length === 0) return 0; // 0 for empty database
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

  const activeTreeData = skillTrees.find((t) => t.categoryName === activeSkillTab) || skillTrees[0];

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* ================= HERO CARD: RPG BANNER ================= */}
      <div className="bg-gradient-to-br from-[#1A1817] via-[#2C2826] to-[#1A1817] text-white rounded-[32px] p-6 sm:p-8 border border-[#3D3734] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#6B2D3A]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D9B7BE] block">
                Character Profile
              </span>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl tracking-tight text-white">
                FEY
              </h1>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-5 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6B2D3A] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                {stats.level}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/65 block">
                  Level {stats.level}
                </span>
                <span className="font-serif font-bold text-sm text-white">
                  "The Warrior"
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/70">XP {stats.xpInCurrentLevel.toLocaleString()} / {stats.xpNeededForNextLevel.toLocaleString()}</span>
              <span className="text-[#D9B7BE] font-bold">{stats.levelProgressPercent}% To Next Level</span>
            </div>
            <div className="w-full bg-black/40 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className="bg-gradient-to-r from-[#8C3A48] to-[#D9B7BE] h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${stats.levelProgressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-0.5">Primary Class</span>
              <span className="font-serif font-bold text-xs sm:text-sm text-white">{stats.primaryClass}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-0.5">Secondary Class</span>
              <span className="font-serif font-bold text-xs sm:text-sm text-white">{stats.secondaryClass}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-0.5">Current Focus</span>
              <span className="font-serif font-bold text-xs sm:text-sm text-[#D9B7BE]">{stats.currentFocus}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-0.5">Training Style</span>
              <span className="font-serif font-bold text-xs sm:text-sm text-white">{stats.trainingStyle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= OVERALL ATTRIBUTES ================= */}
      <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-[#EAE3DE] shadow-xs space-y-5">
        <div className="border-b border-[#F8F5F2] pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
              Attributes Breakdown
            </span>
            <h2 className="font-serif font-bold text-xl text-[#1A1817]">
              Overall Attributes
            </h2>
          </div>
          <Shield className="w-5 h-5 text-[#6B2D3A]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { name: "Strength", level: stats.strengthLevel },
            { name: "Athleticism", level: stats.athleticismLevel },
            { name: "Mobility", level: stats.mobilityLevel },
            { name: "Balance", level: stats.balanceLevel },
            { name: "Endurance", level: stats.enduranceLevel },
            { name: "Grip", level: stats.gripLevel },
            { name: "Core", level: stats.coreLevel },
          ].map((attr, idx) => (
            <div 
              key={idx} 
              className="bg-[#FAF8F6] border border-[#EAE3DE] p-4 rounded-2xl flex items-center justify-between shadow-2xs hover:border-[#D9B7BE] transition-all"
            >
              <span className="font-serif font-bold text-sm text-[#1A1817]">
                {attr.name}
              </span>
              <span className="font-mono font-bold text-sm bg-white border border-[#EAE3DE] px-3 py-1 rounded-xl text-[#6B2D3A] shadow-2xs">
                Lv.{attr.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= SKILL TREES ================= */}
      <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-[#EAE3DE] shadow-xs space-y-5">
        <div className="border-b border-[#F8F5F2] pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
              Progression Pathways
            </span>
            <h2 className="font-serif font-bold text-xl text-[#1A1817]">
              Skill Trees
            </h2>
          </div>
          <Compass className="w-5 h-5 text-[#6B2D3A]" />
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {skillTrees.map((tree) => (
            <button
              key={tree.categoryName}
              onClick={() => setActiveSkillTab(tree.categoryName)}
              className={`px-4 py-2.5 rounded-xl text-xs font-serif font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeSkillTab === tree.categoryName
                  ? "bg-[#6B2D3A] text-white shadow-sm"
                  : "bg-[#FAF8F6] text-[#8C7B75] border border-[#EAE3DE] hover:text-[#1A1817]"
              }`}
            >
              {tree.categoryName}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {activeTreeData && activeTreeData.skills.map((skill, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                skill.completed 
                  ? "bg-[#FAF8F6] border-[#EAE3DE]" 
                  : "bg-white border-[#EAE3DE] opacity-60"
              }`}
            >
              <span className={`font-serif text-sm ${skill.completed ? "font-bold text-[#1A1817]" : "text-[#8C7B75]"}`}>
                {skill.name}
              </span>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center">
                {skill.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#2E6B40]" />
                ) : (
                  <Circle className="w-5 h-5 text-[#EAE3DE]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= TITLES ================= */}
      <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-[#EAE3DE] shadow-xs space-y-5">
        <div className="border-b border-[#F8F5F2] pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
              Honors & Accolades
            </span>
            <h2 className="font-serif font-bold text-xl text-[#1A1817]">
              Titles
            </h2>
          </div>
          <Award className="w-5 h-5 text-[#6B2D3A]" />
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#2E6B40] block mb-2 font-bold">
              Unlocked Titles
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {titles.filter(t => t.unlocked).map((title) => (
                <div key={title.id} className="bg-[#FAF8F6] border border-[#EAE3DE] p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-[#2E6B40]/10 text-[#2E6B40] flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <span className="font-serif font-bold text-xs text-[#1A1817]">{title.name}</span>
                </div>
              ))}
              {titles.filter(t => t.unlocked).length === 0 && (
                <div className="col-span-3 text-xs text-[#8C7B75] py-2">
                  Complete more workouts and unlock milestones to earn titles!
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block mb-2 font-bold">
              Locked Titles
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {titles.filter(t => !t.unlocked).map((title) => (
                <div key={title.id} className="bg-white border border-[#EAE3DE] p-3.5 rounded-2xl flex items-center gap-3 opacity-60">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF8F6] text-[#8C7B75] flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="font-serif font-bold text-xs text-[#8C7B75]">{title.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= CURRENT QUEST ================= */}
      <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-[#EAE3DE] shadow-xs space-y-5">
        <div className="border-b border-[#F8F5F2] pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
              Active Objectives
            </span>
            <h2 className="font-serif font-bold text-xl text-[#1A1817]">
              Current Quest
            </h2>
          </div>
          <Zap className="w-5 h-5 text-[#6B2D3A]" />
        </div>

        <div className="bg-[#FAF8F6] border border-[#EAE3DE] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#1A1817]">
              {currentQuest.title}
            </h3>
            <span className="font-mono font-bold text-sm text-[#6B2D3A]">
              {currentQuest.progressPercent}%
            </span>
          </div>

          <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-[#EAE3DE] p-0.5">
            <div
              className="bg-[#6B2D3A] h-full rounded-full transition-all duration-700"
              style={{ width: `${currentQuest.progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ================= LIFETIME STATS ================= */}
      <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-[#EAE3DE] shadow-xs space-y-5">
        <div className="border-b border-[#F8F5F2] pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
              Account Ledger
            </span>
            <h2 className="font-serif font-bold text-xl text-[#1A1817]">
              Lifetime Stats
            </h2>
          </div>
          <Flame className="w-5 h-5 text-[#6B2D3A]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {[
            { label: "Total XP", value: stats.totalXp.toLocaleString() },
            { label: "Gym Sessions", value: stats.gymSessionsCount },
            { label: "Strength Sessions", value: stats.strengthSessionsCount },
            { label: "Classes", value: stats.classesCount },
            { label: "Mobility Sessions", value: stats.mobilitySessionsCount },
            { label: "Personal Records", value: stats.prCount },
            { label: "Milestones", value: stats.milestonesCount },
            { label: "Current Streak", value: `${stats.currentStreak} Days` },
            { label: "Longest Streak", value: `${stats.longestStreak} Days` },
            { label: "Hours Trained", value: `${stats.hoursTrained} Hours` },
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#FAF8F6] border border-[#EAE3DE] p-4 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7B75] block">
                {stat.label}
              </span>
              <span className="font-serif font-bold text-lg text-[#1A1817]">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}