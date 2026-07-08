"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

// Bar chart, never line (Decision 1): monthly totals are discrete, finished
// measurements. Current month carries the green signal; past months are
// muted — green stays sparing (§04).
type TrendPoint = {
  label: string;
  cents: number;
  isCurrentMonth: boolean;
};

const MONO_TICK = {
  fontFamily: "var(--font-dm-mono)",
  fontSize: 11,
  fill: "#8A877F",
};

export function TrendChart({
  points,
  color = "#1A6B45",
}: {
  points: TrendPoint[];
  color?: string;
}) {
  const data = points.map((p) => ({ ...p, dollars: p.cents / 100 }));
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="#EDEAE4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={MONO_TICK}
          />
          <YAxis
            width={44}
            tickLine={false}
            axisLine={false}
            tick={MONO_TICK}
            allowDecimals={false}
            tickFormatter={(dollars: number) => `$${dollars}`}
          />
          <Bar dataKey="dollars" radius={[4, 4, 0, 0]} maxBarSize={32}>
            {data.map((point) => (
              <Cell
                key={point.label}
                fill={point.isCurrentMonth ? color : "#D8D4CC"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
