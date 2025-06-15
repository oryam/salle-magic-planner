
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
