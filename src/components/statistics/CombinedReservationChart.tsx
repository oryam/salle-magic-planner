
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
          tick={{ fontSize: 12, fill: "#64748b" }}
          label={{ value: "Réservations", angle: -90, position: "insideLeft", offset: -5 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          allowDecimals={false}
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
        {/* Mettre la courbe (Réservations) AVANT les barres (Personnes) pour inverser l'ordre de la légende */}
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
