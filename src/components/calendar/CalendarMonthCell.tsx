
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import CalendarReservationItem from "./CalendarReservationItem";

interface CalendarMonthCellProps {
  label: string;
  detailed: boolean;
  hasReservations: boolean;
  reservationCount: number;
  totalPersons: number;
  reservations: any[];
  onToggleDetail: () => void;
  onReservationClick?: (reservation: any) => void;
  onAddReservation?: () => void;
}

const groupReservationsByDay = (reservations: any[]) => {
  const grouped: { [date: string]: any[] } = {};
  reservations.forEach((res) => {
    const d = new Date(res.date);
    const dateKey = format(d, "yyyy-MM-dd"); // clé au format '2025-06-14'
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(res);
  });
  return grouped;
};

const CalendarMonthCell: React.FC<CalendarMonthCellProps> = ({
  label,
  detailed,
  hasReservations,
  reservationCount,
  totalPersons,
  reservations,
  onToggleDetail,
  onReservationClick,
  onAddReservation,
}) => {
  // Couleur : distingue la présence de résa
  const bgClass = hasReservations
    ? "bg-blue-300/80 dark:bg-blue-600/50"
    : "bg-muted/95";

  // Grouper par jour si détaillé
  let groupedByDay: { [date: string]: any[] } = {};
  let orderedDays: string[] = [];
  if (detailed && hasReservations) {
    groupedByDay = groupReservationsByDay(reservations);
    // Pour garder l'ordre, trions les jours
    orderedDays = Object.keys(groupedByDay).sort();
  }

  return (
    <div className={`rounded-lg p-3 transition-all ${bgClass}`}>
      <div className="font-semibold mb-2 text-sm flex items-center justify-between gap-2">
        <span
          className="cursor-pointer hover:underline"
          onClick={onAddReservation}
        >
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </span>
        {hasReservations && (
          <Button
            variant="ghost"
            size="sm"
            className="underline px-2 py-0 text-xs"
            onClick={onToggleDetail}
          >
            {detailed ? "Simple" : "Détail"}
          </Button>
        )}
      </div>
      {!detailed ? (
        hasReservations ? (
          <div>
            <div className="text-xs font-medium">
              {reservationCount} réservation{reservationCount > 1 ? "s" : ""}
            </div>
            <div className="text-xs text-muted-foreground">
              {totalPersons} personnes
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Aucune réservation</div>
        )
      ) : (
        hasReservations ? (
          <div>
            {orderedDays.map((dateKey) => (
              <div key={dateKey} className="mb-2">
                <div className="text-xs text-muted-foreground font-semibold mb-1">
                  {format(new Date(dateKey), "EEEE dd MMMM yyyy", { locale: fr })}
                </div>
                <ul className="space-y-1">
                  {groupedByDay[dateKey].map((res, idx) => (
                    <CalendarReservationItem
                      key={idx}
                      reservation={res}
                      tableNum={res.tableNum}
                      showDate={true}
                      isPast={new Date(res.date) < new Date()}
                      onClick={onReservationClick}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Aucune réservation</div>
        )
      )}
    </div>
  );
};

export default CalendarMonthCell;
