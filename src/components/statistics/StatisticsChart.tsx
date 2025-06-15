
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
  Label,
} from "recharts";

// Blue = personnes, Green = réservations
const COLORS = ["#3b82f6", "#34d399"];

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
      {/* Axe Y gauche : nb de réservations */}
      <YAxis
        yAxisId="left"
        orientation="left"
        allowDecimals={false}
        tick={{ fontSize: 12, fill: COLORS[1] }}
        axisLine={{ stroke: COLORS[1] }}
        tickLine={{ stroke: COLORS[1] }}
        label={{
          value: "Réservations",
          angle: -90,
          position: "insideLeft",
          fill: COLORS[1],
          style: { textAnchor: "middle", fontSize: 13 },
        }}
      />
      {/* Axe Y droit : nb de personnes */}
      <YAxis
        yAxisId="right"
        orientation="right"
        allowDecimals={false}
        tick={{ fontSize: 12, fill: COLORS[0] }}
        axisLine={{ stroke: COLORS[0] }}
        tickLine={{ stroke: COLORS[0] }}
        label={{
          value: "Personnes",
          angle: 90,
          position: "insideRight",
          fill: COLORS[0],
          style: { textAnchor: "middle", fontSize: 13 },
        }}
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
      {/* Barres : personnes (axe droit) */}
      <Bar
        yAxisId="right"
        dataKey="personnes"
        fill={COLORS[0]}
        name="Personnes"
        barSize={18}
        radius={[2, 2, 0, 0]}
      />
      {/* Courbe : réservations (axe gauche) */}
      {showLines && (
        <Line
          yAxisId="left"
          dataKey="reservations"
          type="monotone"
          stroke={COLORS[1]}
          strokeWidth={3}
          dot={{ r: 3, fill: COLORS[1], stroke: "#fff" }}
          name="Réservations"
          activeDot={{ r: 5 }}
        />
      )}
    </BarChart>
  </ResponsiveContainer>
);

export default StatisticsChart;
