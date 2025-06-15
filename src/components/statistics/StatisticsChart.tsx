import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  CartesianGrid,
} from "recharts";

const COLORS = ["#3b82f6"];

type StatChartDatum = {
  date: Date;
  reservations: number;
  personnes: number;
};

const formatTick = (date: Date) => {
  return date instanceof Date
    ? date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
    : String(date);
};

const StatisticsChart = ({
  data,
}: {
  data: StatChartDatum[];
}) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="date"
        tickFormatter={formatTick}
        minTickGap={10}
        tick={{ fontSize: 12, fill: "#64748b" }}
      />
      <YAxis
        allowDecimals={false}
        tick={{ fontSize: 12, fill: "#64748b" }}
      />
      <Tooltip
        labelFormatter={val =>
          val instanceof Date
            ? val.toLocaleDateString("fr-FR")
            : String(val)
        }
        formatter={(value: any, name: string) =>
          [
            value,
            name === "personnes"
              ? "Personnes"
              : name,
          ] as [string, string]
        }
      />
      <Legend />
      <Bar
        dataKey="personnes"
        fill={COLORS[0]}
        name="Personnes"
        barSize={18}
        radius={[2, 2, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
);

export default StatisticsChart;
