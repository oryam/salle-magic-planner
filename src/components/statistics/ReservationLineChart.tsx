
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { fr } from "date-fns/locale";

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
  // Sinon mode jour par jour
  if (date instanceof Date) {
    return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
  }
  return String(date);
}

const ReservationLineChart = ({
  data,
}: {
  data: StatChartDatum[];
}) => (
  <ResponsiveContainer width="100%" height={260}>
    <LineChart data={data}>
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
            name === "reservations"
              ? "Réservations"
              : name,
          ] as [string, string]
        }
      />
      <Legend />
      <Line
        type="monotone"
        dataKey="reservations"
        stroke="#34d399"
        strokeWidth={3}
        dot={{ r: 3 }}
        name="Réservations"
        connectNulls
      />
    </LineChart>
  </ResponsiveContainer>
);

export default ReservationLineChart;
