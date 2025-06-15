
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
            name === "personnes"
              ? [value, "Personnes"]
              : name === "reservations"
                ? [value, "Réservations"]
                : [value, name]
          }
        />
        <Legend />
        <Bar
          dataKey="personnes"
          fill="#60a5fa"
          name="Personnes"
          barSize={14}
          radius={[2, 2, 0, 0]}
        />
        <Line
          type="monotone"
          dataKey="reservations"
          stroke="#34d399"
          strokeWidth={3}
          dot={{ r: 3 }}
          name="Réservations"
          connectNulls={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CombinedReservationChart;
