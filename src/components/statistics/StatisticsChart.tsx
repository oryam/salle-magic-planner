
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  CartesianGrid,
} from "recharts";

const COLORS = ["#3b82f6", "#34d399"];

type StatChartDatum = {
  date: Date;
  reservations: number;
  personnes: number;
};

const formatTick = (date: Date) => {
  // Format date pour l'axe X
  return date instanceof Date
    ? date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
    : String(date);
};

const StatisticsChart = ({
  data,
  showLines,
}: {
  data: StatChartDatum[];
  showLines?: boolean;
}) => (
  <ResponsiveContainer width="100%" height={340}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="date"
        tickFormatter={formatTick}
        minTickGap={10}
        tick={{ fontSize: 12, fill: "#64748b" }}
      />
      <YAxis
        yAxisId="right"
        orientation="right"
        allowDecimals={false}
        tick={{ fontSize: 12, fill: "#64748b" }}
      />
      <YAxis
        yAxisId="left"
        orientation="left"
        hide={true}
        allowDecimals={false}
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
            name === "reservations"
              ? "Réservations"
              : name === "personnes"
              ? "Personnes"
              : name,
          ] as [string, string]
        }
      />
      <Legend />
      <Bar
        yAxisId="right"
        dataKey="personnes"
        fill={COLORS[0]}
        name="Personnes"
        barSize={18}
        radius={[2, 2, 0, 0]}
      />
      {showLines && (
        <Line
          yAxisId="left"
          dataKey="reservations"
          type="monotone"
          stroke={COLORS[1]}
          strokeWidth={3}
          dot={{ r: 3 }}
          name="Réservations"
        />
      )}
    </BarChart>
  </ResponsiveContainer>
);

export default StatisticsChart;
