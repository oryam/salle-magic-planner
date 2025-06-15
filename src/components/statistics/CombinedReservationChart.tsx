
import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type StatChartDatum = {
  date: Date;
  reservations: number | null;
  personnes: number | null;
};

type CombinedReservationChartProps = {
  data: StatChartDatum[];
  period?: string;
};

const formatMonthTickFR = (date: Date) =>
  date instanceof Date
    ? date.toLocaleDateString("fr-FR", { month: "short" })
    : String(date);

const formatTick = (date: Date, period?: string) => {
  if (period === "annee" || period === "12mois") {
    return formatMonthTickFR(date);
  }
  return date instanceof Date
    ? date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
    : String(date);
};

const CombinedReservationChart = ({ data, period }: CombinedReservationChartProps) => {
  // Ignore slots vides
  const filteredData = data.filter(d => d.reservations !== null && d.personnes !== null);

  // Trouver min et max globaux pour reservations/personnes
  const allValues = filteredData.flatMap(d => 
    [d.reservations ?? 0, d.personnes ?? 0]
  );
  const minValue = Math.min(...allValues, 0); // Commencer à 0 au moins
  const maxValue = Math.max(...allValues, 5); // Si tout est à 0, avoir au moins 5

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={filteredData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => formatTick(date, period)}
          minTickGap={10}
          tick={{ fontSize: 12, fill: "#64748b" }}
        />
        <YAxis
          yAxisId="left"
          allowDecimals={false}
          domain={[minValue, maxValue]}
          tick={{ fontSize: 12, fill: "#64748b" }}
          label={{ value: "Réservations", angle: -90, position: "insideLeft", offset: -5 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          allowDecimals={false}
          domain={[minValue, maxValue]}
          tick={{ fontSize: 12, fill: "#64748b" }}
          label={{ value: "Personnes", angle: 90, position: "insideRight", offset: 10 }}
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
            name === "personnes"
              ? [value, "Personnes"]
              : name === "reservations"
                ? [value, "Réservations"]
                : [value, name]
          }
        />
        <Legend />
        {/* L'ordre définit celui de la légende */}
        <Line
          type="monotone"
          dataKey="reservations"
          stroke="#34d399"
          strokeWidth={3}
          dot={{ r: 3 }}
          name="Réservations"
          connectNulls={false}
          isAnimationActive={false}
          yAxisId="left"
        />
        <Bar
          dataKey="personnes"
          fill="#60a5fa"
          name="Personnes"
          barSize={14}
          radius={[2, 2, 0, 0]}
          yAxisId="right"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CombinedReservationChart;
