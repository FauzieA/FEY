import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import {
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Calendar,
  Compass,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type ComparePeriod = "30D" | "3M" | "1Y";

// Radar Chart Data Baseline vs Current
const ATHLETIC_RADAR_DATA = [
  { subject: "Grip", baseline: 25, current: 70 },
  { subject: "Upper Pull", baseline: 30, current: 68 },
  { subject: "Upper Push", baseline: 20, current: 55 },
  { subject: "Lower Body", baseline: 40, current: 75 },
  { subject: "Core", baseline: 35, current: 65 },
  { subject: "Mobility", baseline: 40, current: 52 },
];

// Sparkline datasets
const PULL_UP_SPARK = [
  { val: 92 }, { val: 88 }, { val: 82 }, { val: 77 }, { val: 70 }
];

const DEAD_HANG_SPARK = [
  { val: 0 }, { val: 5 }, { val: 12 }, { val: 16 }, { val: 21 }
];

export default function ProgressPage() {
  const navigate = useNavigate();
  const [comparePeriod, setComparePeriod] = useState<ComparePeriod>("30D");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("back");

  // Fetch real sessions and PRs from IndexedDB
  const sessions = useLiveQuery(() => db.sessions.toArray()) || [];

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] p-4 md:p-8 pb-32 max-w-4xl mx-auto space-y-10">
      
      {/* HEADER & COMPARISON TOGGLE */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#EAE3DE] pb-6 gap-4">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center text-xs text-[#6B2D3A] font-semibold mb-2 hover:underline cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-0.5" /> Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-serif text-[#1A1817] tracking-tight">
            Your Evolution
          </h1>
          <p className="text-xs text-[#8C7B75] italic mt-1">
            Proof of what you are becoming—not just numbers on a page.
          </p>
        </div>

        {/* Compare With Engine */}
        <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl p-2 flex items-center gap-2 self-start md:self-auto shadow-2xs">
          <span className="text-[10px] font-mono font-bold text-[#8C7B75] uppercase px-1">
            Compare Today With:
          </span>
          {(["30D", "3M", "1Y"] as ComparePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setComparePeriod(period)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                comparePeriod === period
                  ? "bg-[#6B2D3A] text-white shadow-xs"
                  : "bg-[#F8F5F2] text-[#8C7B75] hover:text-[#1A1817]"
              }`}
            >
              {period === "30D" ? "30 Days Ago" : period === "3M" ? "3 Months Ago" : "1 Year Ago"}
            </button>
          ))}
        </div>
      </header>

      {/* 1. DYNAMIC EVOLUTION SUMMARY */}
      <section className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs border-l-4 border-l-[#6B2D3A]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#6B2D3A]" />
          <span className="text-xs font-mono uppercase font-bold tracking-wider text-[#6B2D3A]">
            This Month's Evolution Narrative
          </span>
        </div>
        <p className="font-serif text-lg md:text-xl text-[#1A1817] leading-relaxed">
          "Your <span className="font-bold text-[#6B2D3A]">pulling strength & grip endurance</span> are improving faster than any other area. 
          Pulling capacity increased <span className="font-bold text-[#2E6B40]">+24%</span>, allowing you to reduce pull-up assistance by 22 kg. 
          Your dead hang hold has reached <span className="font-bold text-[#1A1817]">21 seconds</span>—you are approaching your first unassisted hang milestone."
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-[#8C7B75]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2E6B40]"></span> Top Growth: <strong>Grip Strength (+31%)</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C27D38]"></span> Needs Focus: <strong>Mobility (+6%)</strong>
          </span>
        </div>
      </section>

      {/* 2. THE EVOLUTION SCORE & RADAR + MOVEMENT CONFIDENCE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Radar Shape */}
        <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#1A1817]">Evolution Score</h2>
                <p className="text-xs text-[#8C7B75]">Shape expansion relative to {comparePeriod} baseline</p>
              </div>
              <span className="font-serif font-bold text-3xl text-[#6B2D3A]">81%</span>
            </div>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ATHLETIC_RADAR_DATA}>
                <PolarGrid stroke="#EAE3DE" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8C7B75', fontSize: 11 }} />
                <Radar name="Previous" dataKey="baseline" stroke="#D9B7BE" fill="#D9B7BE" fillOpacity={0.3} />
                <Radar name="Current" dataKey="current" stroke="#6B2D3A" fill="#6B2D3A" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center items-center gap-6 text-xs font-mono pt-2 border-t border-[#EAE3DE]">
            <span className="flex items-center gap-1.5 text-[#8C7B75]">
              <span className="w-3 h-3 rounded-xs bg-[#D9B7BE]/50 border border-[#D9B7BE]"></span> Baseline ({comparePeriod})
            </span>
            <span className="flex items-center gap-1.5 text-[#6B2D3A] font-bold">
              <span className="w-3 h-3 rounded-xs bg-[#6B2D3A] border border-[#6B2D3A]"></span> Current Today
            </span>
          </div>
        </div>

        {/* Movement Confidence & Next Targets */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Movement Confidence Card */}
          <div className="bg-[#6B2D3A] text-[#F8F5F2] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D9B7BE]" />
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#D9B7BE]">
                  Movement Confidence Index
                </h3>
              </div>
              <span className="font-serif font-bold text-2xl text-white">74%</span>
            </div>
            
            <p className="text-xs text-white/80 italic leading-relaxed">
              "Measures your ability to stand effortlessly, balance on one leg, move softly, and control your own body weight without hesitation."
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-white/10 p-2.5 rounded-xl">
                <span className="opacity-70 block text-[9px] uppercase font-mono">Deep Squat Hold</span>
                <span className="font-bold text-white">45s Controlled</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl">
                <span className="opacity-70 block text-[9px] uppercase font-mono">Single-Leg Balance</span>
                <span className="font-bold text-white">38s Steady</span>
              </div>
            </div>
          </div>

          {/* Predictions & Next Focus */}
          <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-[#C27D38]">
              <Compass className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Trajectory & Projection
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs border-b border-[#EAE3DE] pb-2">
                <span className="font-medium text-[#1A1817]">Projected Unassisted Pull-up:</span>
                <span className="font-bold font-mono text-[#2E6B40]">~18 Days</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#1A1817]">First Strict Push-up:</span>
                <span className="font-bold font-mono text-[#2E6B40]">~2 Weeks</span>
              </div>
            </div>

            <div className="bg-[#F8F5F2] p-3 rounded-2xl text-xs text-[#8C7B75] mt-2">
              <span className="font-bold text-[#1A1817] block mb-0.5">Recommendation:</span>
              Add 1 short mobility hold session this week to accelerate ankle depth for deep squats (+8% projected gain).
            </div>
          </div>

        </div>
      </section>

      {/* 3. THEN vs NOW COMPARISON TILES WITH SPARK LINES */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#6B2D3A]" />
          <h2 className="font-serif font-bold text-xl text-[#1A1817]">Capabilities & Micro-Trends</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tile 1: Pull-up */}
          <div className="bg-[#FFFCFA] border border-[#EAE3DE] p-5 rounded-3xl space-y-3 shadow-2xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7B75] block">Upper Pull Journey</span>
                <h3 className="font-serif font-bold text-base text-[#1A1817]">Pull-Up Assistance</h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#2E6B40] bg-[#2E6B40]/10 px-2 py-0.5 rounded-md">
                -22kg Assistance
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-[9px] text-[#8C7B75] block uppercase font-mono">THEN ({comparePeriod})</span>
                <span className="font-serif font-bold text-lg text-[#8C7B75]">92 kg</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6B2D3A]" />
              <div className="text-right">
                <span className="text-[9px] text-[#2E6B40] font-bold block uppercase font-mono">NOW TODAY</span>
                <span className="font-serif font-bold text-2xl text-[#1A1817]">70 kg</span>
              </div>
            </div>

            {/* Sparkline Trend */}
            <div className="h-10 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PULL_UP_SPARK}>
                  <Line type="monotone" dataKey="val" stroke="#6B2D3A" strokeWidth={2.5} dot={{ r: 3, fill: '#6B2D3A' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tile 2: Dead Hang */}
          <div className="bg-[#FFFCFA] border border-[#EAE3DE] p-5 rounded-3xl space-y-3 shadow-2xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7B75] block">Grip & Endurance</span>
                <h3 className="font-serif font-bold text-base text-[#1A1817]">Dead Hang Hold</h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#2E6B40] bg-[#2E6B40]/10 px-2 py-0.5 rounded-md">
                +21 sec Endurance
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-[9px] text-[#8C7B75] block uppercase font-mono">THEN ({comparePeriod})</span>
                <span className="font-serif font-bold text-lg text-[#8C7B75]">0 sec</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6B2D3A]" />
              <div className="text-right">
                <span className="text-[9px] text-[#2E6B40] font-bold block uppercase font-mono">NOW TODAY</span>
                <span className="font-serif font-bold text-2xl text-[#1A1817]">21 sec</span>
              </div>
            </div>

            {/* Sparkline Trend */}
            <div className="h-10 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DEAD_HANG_SPARK}>
                  <Line type="monotone" dataKey="val" stroke="#2E6B40" strokeWidth={2.5} dot={{ r: 3, fill: '#2E6B40' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </section>

      {/* 4. RECOVERY & MUSCLE DEVELOPMENT INSPECTOR */}
      <section className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 space-y-6 shadow-2xs">
        <div className="flex justify-between items-center border-b border-[#EAE3DE] pb-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1A1817]">Muscle Development & Recovery</h2>
            <p className="text-xs text-[#8C7B75]">Select a area to view volume, strength, and recovery state</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Selector */}
          <div className="space-y-2">
            {[
              { id: "back", name: "Back & Lats", status: "Recovered 🟢", strength: "+24%" },
              { id: "shoulders", name: "Shoulders", status: "Training Yesterday 🟡", strength: "+18%" },
              { id: "legs", name: "Quads & Glutes", status: "Recovered 🟢", strength: "+28%" },
              { id: "core", name: "Core & Posture", status: "Trained Today 🔴", strength: "+20%" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMuscle(m.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedMuscle === m.id
                    ? "bg-[#6B2D3A] text-white border-[#6B2D3A]"
                    : "bg-[#F8F5F2] border-[#EAE3DE] text-[#1A1817]"
                }`}
              >
                <div>
                  <span className="font-serif font-bold text-xs block">{m.name}</span>
                  <span className={`text-[10px] ${selectedMuscle === m.id ? "text-[#D9B7BE]" : "text-[#8C7B75]"}`}>
                    {m.status}
                  </span>
                </div>
                <span className={`font-mono font-bold text-xs ${selectedMuscle === m.id ? "text-white" : "text-[#2E6B40]"}`}>
                  {m.strength}
                </span>
              </button>
            ))}
          </div>

          {/* Deep-Dive Card */}
          <div className="md:col-span-2 bg-[#F8F5F2] border border-[#EAE3DE] rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#EAE3DE] pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1A1817]">Back & Lats Inspection</h3>
                <span className="text-xs text-[#2E6B40] font-bold">▲ 24% Strength Gain</span>
              </div>
              <span className="text-xs bg-[#2E6B40]/10 text-[#2E6B40] font-bold px-3 py-1 rounded-full border border-[#2E6B40]/20">
                Fully Recovered 🟢
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-[#EAE3DE]">
                <span className="text-[9px] uppercase font-mono text-[#8C7B75] block">Weekly Sets</span>
                <span className="font-serif font-bold text-base text-[#1A1817]">18 / 16 Target</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#EAE3DE]">
                <span className="text-[9px] uppercase font-mono text-[#8C7B75] block">Volume Status</span>
                <span className="font-serif font-bold text-base text-[#2E6B40]">Optimal</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#EAE3DE] col-span-2 sm:col-span-1">
                <span className="text-[9px] uppercase font-mono text-[#8C7B75] block">Next Session</span>
                <span className="font-serif font-bold text-base text-[#6B2D3A]">Tomorrow</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-[#8C7B75] block">Active Movements</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-white border border-[#EAE3DE] px-2.5 py-1 rounded-lg">✓ Lat Pulldown</span>
                <span className="bg-white border border-[#EAE3DE] px-2.5 py-1 rounded-lg">✓ Seated Cable Row</span>
                <span className="bg-white border border-[#EAE3DE] px-2.5 py-1 rounded-lg">✓ Assisted Pull-up</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GROWTH STORY / CHANGELOG TIMELINE */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#6B2D3A]" />
          <h2 className="font-serif font-bold text-xl text-[#1A1817]">Evolution Story Log</h2>
        </div>

        <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-3xl p-6 shadow-2xs">
          <div className="relative border-l-2 border-[#EAE3DE] ml-3 space-y-6 pl-6">
            
            <div className="relative">
              <div className="absolute -left-[31px] top-0 bg-[#2E6B40] text-white p-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#8C7B75] block">Aug 2</span>
              <h4 className="font-serif font-bold text-sm text-[#1A1817]">First Incline Push-up Set Cleared</h4>
              <p className="text-xs text-[#8C7B75] italic">Moved closer to full floor push-ups.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 bg-[#6B2D3A] text-white p-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#8C7B75] block">Jul 30</span>
              <h4 className="font-serif font-bold text-sm text-[#1A1817]">21-Second Dead Hang Achieved</h4>
              <p className="text-xs text-[#8C7B75] italic">Built grip control from a baseline of 0 seconds.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 bg-[#6B2D3A] text-white p-1 rounded-full">
                <Dumbbell className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#8C7B75] block">Jul 24</span>
              <h4 className="font-serif font-bold text-sm text-[#1A1817]">First 20kg Goblet Squat</h4>
              <p className="text-xs text-[#8C7B75] italic">Lower body structural depth milestone.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}