import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";

export interface TrendPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  kind?: "line" | "area" | "bar";
  height?: number;
  emptyLabel?: string;
  /** Unit suffix shown in the tooltip. */
  unit?: string;
}

const axisStyle = { fontSize: 10, fill: "#8C7B75" } as const;

export function TrendChart({ data, kind = "line", height = 200, emptyLabel = "Not enough data yet", unit = "" }: TrendChartProps) {
  if (data.length === 0) return <EmptyState title={emptyLabel} />;

  const shared = (
    <>
      <CartesianGrid strokeDasharray="2 4" stroke="#EAE3DE" vertical={false} />
      <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
      <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={34} />
      <Tooltip
        contentStyle={{
          borderRadius: 12,
          border: "1px solid #EAE3DE",
          backgroundColor: "#FFFCFA",
          fontSize: 12,
        }}
        formatter={(value) => [`${value ?? ""}${unit}`, ""] as [string, string]}
      />
    </>
  );

  return (
    <div className="rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {kind === "bar" ? (
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            {shared}
            <Bar dataKey="value" fill="#6B2D3A" radius={[6, 6, 0, 0]} />
          </BarChart>
        ) : kind === "area" ? (
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            {shared}
            <Area dataKey="value" stroke="#6B2D3A" fill="#F2E8EA" strokeWidth={2} />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            {shared}
            <Line dataKey="value" stroke="#6B2D3A" strokeWidth={2} dot={{ r: 2, fill: "#6B2D3A" }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
