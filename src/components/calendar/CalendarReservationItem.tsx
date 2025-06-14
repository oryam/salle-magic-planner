
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarReservationItemProps {
  reservation: any;
  tableNum?: number | string;
  showDate?: boolean;
  isPast?: boolean;
  onClick?: (reservation: any) => void;
}

/**
 * Affiche une ligne de réservation pour le calendrier
 */
const CalendarReservationItem: React.FC<CalendarReservationItemProps> = ({
  reservation,
  tableNum,
  showDate = false,
  isPast = false,
  onClick,
}) => {
  const resDateObj = new Date(reservation.date);

  // Formatage pour le nombre de personnes
  const personnesText = reservation.nombrePersonnes
    ? `${reservation.nombrePersonnes} ${reservation.nombrePersonnes > 1 ? "pers." : "pers."}`
    : "";

  return (
    <li
      className={`text-xs bg-primary/10 hover:bg-primary/20 rounded px-1 py-0.5 cursor-pointer transition-colors duration-100 ${isPast ? "text-muted-foreground" : ""}`}
      onClick={() => onClick && onClick(reservation)}
      title="Modifier la réservation"
    >
      {showDate
        ? `${format(resDateObj, "d MMM HH:mm", { locale: fr })} – Table ${tableNum ?? reservation.tableNum}${personnesText ? ` – ${personnesText}` : ""}${reservation.nomClient ? ` – ${reservation.nomClient}` : ""}`
        : `${format(resDateObj, "HH:mm", { locale: fr })} – T${tableNum ?? reservation.tableNum}${personnesText ? ` – ${personnesText}` : ""}${reservation.nomClient ? ` – ${reservation.nomClient}` : ""}`
      }
    </li>
  );
};

export default CalendarReservationItem;

