
import React from "react";
import { cn } from "@/lib/utils";

type HeatmapDatum = {
  slot: string;  // Matin/Midi/Soir
  date: string;  // formatted yyyy-MM-dd
  count: number;
};

type Props = {
  data: HeatmapDatum[];
  slots: string[];    // ["Matin", "Midi", "Soir"]
  days: string[];     // ["2024-06-10", ...]
};

const COLORS = [
  "#f0fdf4", // 0 réservation
  "#bbf7d0", // 1-2
  "#6ee7b7", // 3-4
  "#34d399", // 5-7
  "#059669", // 8+
];

function colorForCount(count: number): string {
  if (count === 0) return COLORS[0];
  if (count <= 2) return COLORS[1];
  if (count <= 4) return COLORS[2];
  if (count <= 7) return COLORS[3];
  return COLORS[4];
}

const LABELS: {[x: string]: string} = {
  "Matin": "Matin (6h-11h)",
  "Midi": "Midi (11h-15h)",
  "Soir": "Soir (18h-23h30)",
};

const ReservationHeatmap: React.FC<Props> = ({ data, slots, days }) => {
  // Map for fast lookup
  const map = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const d of data) {
      m.set(`${d.date}|${d.slot}`, d.count);
    }
    return m;
  }, [data]);

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <th className="border bg-muted px-1 py-2 text-xs sticky left-0 bg-muted z-10">Créneau</th>
            {days.map((day) => (
              <th key={day} className="border bg-muted px-1 py-2 text-xs">
                {(() => {
                  const d = new Date(day);
                  return d.toLocaleDateString("fr-FR", { weekday: "short", month: "short", day: "numeric" });
                })()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot}>
              <th className="border bg-muted px-1 py-1 text-xs sticky left-0 bg-muted z-10">{LABELS[slot] ?? slot}</th>
              {days.map((day) => {
                const cnt = map.get(`${day}|${slot}`) || 0;
                return (
                  <td
                    key={day}
                    className={cn(
                      "border px-1 py-2 text-center text-xs transition-colors duration-200 cursor-pointer",
                      cnt === 0 ? "text-gray-400" : "font-bold",
                    )}
                    style={{
                      background: colorForCount(cnt),
                      minWidth: 32,
                      minHeight: 28,
                    }}
                    title={`${cnt} réservation${cnt > 1 ? "s" : ""} (${LABELS[slot] ?? slot}) le ${day}`}
                  >
                    {cnt === 0 ? "" : cnt}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-3 items-center mt-2 ml-1">
        <span className="text-xs text-muted-foreground">Réservations&nbsp;:</span>
        {COLORS.map((c, i) => (
          <span key={i} className="flex items-center gap-1 text-xs">
            <span className="inline-block w-5 h-4 rounded" style={{ background: c }} />
            {i === 0 ? "0" : i === 1 ? "1-2" : i === 2 ? "3-4" : i === 3 ? "5-7" : "8+"}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ReservationHeatmap;
