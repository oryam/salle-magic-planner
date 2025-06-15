
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
import { fr } from "date-fns/locale";

const COLORS = ["#3b82f6"];

type StatChartDatum = {
  date: Date | string;
  reservations: number;
  personnes: number;
};

function formatTick(date: Date | string) {
  // Si string au format YYYY-MM (mois), afficher mois abrégé ("Janv")
  if (typeof date === "string" && /^\d{4}-\d{2}$/.test(date)) {
    const d = new Date(`${date}-01`);
    return d.toLocaleDateString("fr-FR", { month: "short" });
  }
  // Si date standard, afficher au format jour mois
  if (date instanceof Date) {
    return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
  }
  return String(date);
}

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
        labelFormatter={val => {
          if (typeof val === "string" && /^\d{4}-\d{2}$/.test(val)) {
            // format mois abrégé
            const d = new Date(`${val}-01`);
            return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
          }
          if (val instanceof Date) {
            return val.toLocaleDateString("fr-FR");
          }
          return String(val);
        }}
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

