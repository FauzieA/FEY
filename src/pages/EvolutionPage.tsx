import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Evolution Components
import HeroOverview from "@/components/evolution/HeroOverview";
import MuscleMap from "@/components/evolution/MuscleMap";
import PerformanceTrends from "@/components/evolution/PerformanceTrends";



type TimeFilter = "30D" | "3M" | "1Y" | "ALL";

export default function EvolutionPage() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30D");

  return (
    <div className="min-h-screen bg-[#FAF8F6] text-[#2C2A29] p-4 sm:p-6 md:p-10 pb-32 font-sans selection:bg-[#6B2D3A] selection:text-white">
      
      {/* PAGE HEADER */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-sm font-medium text-[#8C7B75] hover:text-[#2C2A29] transition-colors mb-3 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </button>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1A1817] tracking-tight mb-1">
            YOUR EVOLUTION
          </h1>
          <p className="text-xs sm:text-sm text-[#8C7B75] italic font-serif">
            Proof of what you are becoming.
          </p>
        </div>

        {/* TIME FILTER SWITCHER */}
        <div className="bg-white rounded-full p-1 border border-[#EAE3DE] flex shadow-xs self-start md:self-auto">
          {(["30D", "3M", "1Y", "ALL"] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                timeFilter === filter
                  ? "bg-[#6B2D3A] text-white shadow-xs"
                  : "text-[#8C7B75] hover:text-[#2C2A29]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN EVOLUTION DASHBOARD STACK */}
      <main className="max-w-6xl mx-auto space-y-10">
        
        {/* 1. MERGED HERO & THEN VS. NOW OVERVIEW */}
        <section>
          <HeroOverview timeFilter={timeFilter} />
        </section>

        {/* 3. ANATOMICAL HEATMAP & MUSCLE DEVELOPMENT */}
        <section>
          <MuscleMap />
        </section>

        {/* 4. WORKLOAD & CAPACITY TRENDS */}
        <section>
          <PerformanceTrends />
        </section>

      


      </main>
    </div>
  );
}