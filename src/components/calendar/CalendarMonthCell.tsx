
import React from "react";
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
}

const CalendarMonthCell: React.FC<CalendarMonthCellProps> = ({
  label,
  detailed,
  hasReservations,
  reservationCount,
  totalPersons,
  reservations,
  onToggleDetail,
  onReservationClick,
}) => {
  // Couleur : distingue la présence de résa
  const bgClass = hasReservations
    ? "bg-blue-300/80 dark:bg-blue-600/50"
    : "bg-muted/95";

  return (
    <div className={`rounded-lg p-3 transition-all ${bgClass}`}>
      <div className="font-semibold mb-2 text-sm flex items-center gap-2">
        {label.charAt(0).toUpperCase() + label.slice(1)}
        {hasReservations && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto underline px-2 py-0 text-xs"
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
          <ul className="space-y-1">
            {reservations.map((res, idx) => (
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
        ) : (
          <div className="text-xs text-muted-foreground">Aucune réservation</div>
        )
      )}
    </div>
  );
};

export default CalendarMonthCell;

