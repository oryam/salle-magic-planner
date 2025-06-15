
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

// Nouvelle prop period pour savoir quel format appliquer
type StatisticsChartProps = {
  data: StatChartDatum[];
  period?: string;
};

const formatMonthTickFR = (date: Date) =>
  date instanceof Date
    ? date.toLocaleDateString("fr-FR", { month: "short" })
    : String(date);

const formatTick = (date: Date, period?: string) => {
  // Année ou 12 derniers mois : afficher seulement le nom du mois (abrégé)
  if (period === "annee" || period === "12mois") {
    return formatMonthTickFR(date);
  }
  // Sinon : format d'origine (avec le jour)
  return date instanceof Date
    ? date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
    : String(date);
};

const StatisticsChart = ({
  data,
  period,
}: StatisticsChartProps) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="date"
        tickFormatter={(date) => formatTick(date, period)}
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
            ? (period === "annee" || period === "12mois"
                ? val.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                : val.toLocaleDateString("fr-FR"))
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
