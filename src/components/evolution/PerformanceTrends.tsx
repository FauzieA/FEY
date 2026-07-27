import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Zap, Activity, Calendar } from "lucide-react";

const TREND_DATA = [
  { date: "W1", volume: 14200, capacity: 52, consistency: 80 },
  { date: "W2", volume: 15800, capacity: 58, consistency: 90 },
  { date: "W3", volume: 15100, capacity: 61, consistency: 85 },
  { date: "W4", volume: 17400, capacity: 66, consistency: 95 },
  { date: "W5", volume: 18900, capacity: 72, consistency: 100 },
  { date: "W6", volume: 18200, capacity: 75, consistency: 90 },
  { date: "W7", volume: 21000, capacity: 81, consistency: 95 },
];

export default function PerformanceTrends() {
  const [activeMetric, setActiveMetric] = useState<"volume" | "capacity">("capacity");

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-8 border border-[#EAE3DE] shadow-xs space-y-6">
      {/* HEADER & METRIC TOGGLES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F8F5F2] pb-6">
        <div>
          <h2 className="font-serif font-bold text-xl md:text-2xl text-[#1A1817]">
            CAPABILITY & WORKLOAD TRENDS
          </h2>
          <p className="text-xs text-[#8C7B75] mt-0.5">
            Macro trends in movement quality, load capacity, and volume output
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="bg-[#FAF8F6] p-1 rounded-full border border-[#EAE3DE] flex self-start md:self-auto">
          <button
            onClick={() => setActiveMetric("capacity")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              activeMetric === "capacity"
                ? "bg-[#6B2D3A] text-white shadow-xs"
                : "text-[#8C7B75] hover:text-[#1A1817]"
            }`}
          >
            Capacity Score
          </button>
          <button
            onClick={() => setActiveMetric("volume")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              activeMetric === "volume"
                ? "bg-[#6B2D3A] text-white shadow-xs"
                : "text-[#8C7B75] hover:text-[#1A1817]"
            }`}
          >
            Total Workload (kg)
          </button>
        </div>
      </div>

      {/* STAT HIGHLIGHT STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF8F6] p-4 rounded-2xl border border-[#EAE3DE] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C7B75] block">
              Current Capacity Index
            </span>
            <span className="font-serif font-bold text-2xl text-[#1A1817]">
              81 / 100
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#6B2D3A]/10 text-[#6B2D3A] flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF8F6] p-4 rounded-2xl border border-[#EAE3DE] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C7B75] block">
              Weekly Workload
            </span>
            <span className="font-serif font-bold text-2xl text-[#1A1817]">
              21,000 kg
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2E6B40]/10 text-[#2E6B40] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF8F6] p-4 rounded-2xl border border-[#EAE3DE] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C7B75] block">
              Consistency Rating
            </span>
            <span className="font-serif font-bold text-2xl text-[#1A1817]">
              95% Optimal
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#6B2D3A]/10 text-[#6B2D3A] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CHART AREA */}
      <div className="h-[300px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B2D3A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6B2D3A" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8F5F2" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8C7B75", fontSize: 12, fontFamily: "sans-serif" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8C7B75", fontSize: 12, fontFamily: "sans-serif" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1817",
                borderRadius: "16px",
                border: "none",
                color: "#FFFFFF",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: any) => [
                activeMetric === "volume" ? `${value.toLocaleString()} kg` : `${value}%`,
                activeMetric === "volume" ? "Volume" : "Capacity",
              ]}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke="#6B2D3A"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorMetric)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-[#8C7B75] pt-2 border-t border-[#F8F5F2]">
        <span className="flex items-center gap-1.5 italic">
          <Calendar className="w-3.5 h-3.5" /> Showing trailing 7 weeks of continuous training
        </span>
        <span className="font-semibold text-[#6B2D3A]">+55.7% total progression rate</span>
      </div>
    </div>
  );
}