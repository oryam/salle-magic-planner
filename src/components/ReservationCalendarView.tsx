import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval } from "date-fns";
import { fr } from "date-fns/locale";

type PeriodType = "jour" | "semaine" | "mois" | "annee";

interface ReservationCalendarViewProps {
  tablesWithReservations: any[];
  period: PeriodType;
  currentDate: Date;
}

/**
 * Affiche un calendrier simplifié en fonction de la période sélectionnée (jour, semaine, mois, année)
 * avec les réservations marquées dans les journées.
 */
const ReservationCalendarView = ({
  tablesWithReservations,
  period,
  currentDate,
}: ReservationCalendarViewProps) => {
  // Crée une carte des réservations groupées par (jour ou semaine...)
  const getDateRange = () => {
    if (period === "jour") {
      return [currentDate];
    }
    if (period === "semaine") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
    if (period === "mois") {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
    if (period === "annee") {
      const start = startOfYear(currentDate);
      const end = endOfYear(currentDate);
      // Ici on ne va pas afficher chaque jour sous forme de grille : on groupe par mois
      const months: Date[] = [];
      let m = new Date(start);
      while (m <= end) {
        months.push(new Date(m));
        m.setMonth(m.getMonth() + 1);
      }
      return months;
    }
    return [currentDate];
  };

  const dateRange = getDateRange();

  // Extrait les réservations pour une date donnée et les trie par date croissante
  const getReservationsForDate = (date: Date) => {
    const dayTs = date.setHours(0, 0, 0, 0);
    const réservations: any[] = [];
    tablesWithReservations.forEach(table => {
      table.reservations.forEach((res: any) => {
        const resDate = new Date(res.date);
        if (resDate.setHours(0, 0, 0, 0) === dayTs) {
          réservations.push({ ...res, tableNum: table.numero });
        }
      });
    });
    // TRI ici
    réservations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return réservations;
  };

  // pour savoir si la date de réservation est dans le passé
  const isPastDate = (date: Date) => {
    const now = new Date();
    return date.getTime() < now.setHours(0, 0, 0, 0); // comparé à aujourd'hui 00:00
  };

  // Pour simplification : Vue Mois / Semaine / Jour : grille par jour ; Vue An : grille 12 mois
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Calendrier des réservations</CardTitle>
      </CardHeader>
      <CardContent>
        {period === "annee" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {dateRange.map((month: Date) => {
              const monthLabel = format(month, "MMMM yyyy", { locale: fr });
              // Récupérer les réservations du mois courant
              const resForMonth: any[] = [];
              tablesWithReservations.forEach(table => {
                table.reservations.forEach((res: any) => {
                  const resDate = new Date(res.date);
                  if (
                    resDate.getMonth() === month.getMonth() &&
                    resDate.getFullYear() === month.getFullYear()
                  ) {
                    resForMonth.push({ ...res, tableNum: table.numero });
                  }
                });
              });
              // TRI ici
              resForMonth.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

              return (
                <div key={monthLabel} className="bg-muted rounded-lg p-3">
                  <div className="font-semibold mb-2 text-sm">{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</div>
                  {resForMonth.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Aucune réservation</div>
                  ) : (
                    <ul className="space-y-1">
                      {resForMonth.map((res, idx) => {
                        const resDateObj = new Date(res.date);
                        return (
                          <li
                            key={idx}
                            className={`text-xs ${isPastDate(resDateObj) ? "text-muted-foreground" : ""}`}
                          >
                            {format(resDateObj, "d MMM HH:mm", { locale: fr })} – Table {res.tableNum} – {res.nomClient}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {dateRange.map((date: Date) => {
              const resForDay = getReservationsForDate(date);
              return (
                <div
                  key={date.toISOString()}
                  className="bg-muted rounded-lg p-2 flex flex-col min-h-[96px]"
                >
                  <div className="font-semibold text-xs mb-1">
                    {format(date, period === "jour" ? "PPP" : "EEE d", { locale: fr })}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    {resForDay.length === 0 ? (
                      <span className="text-xs text-muted-foreground">Libre</span>
                    ) : (
                      <ul className="space-y-1">
                        {resForDay.map((res, idx) => {
                          const resDateObj = new Date(res.date);
                          return (
                            <li
                              key={idx}
                              className={`text-xs bg-primary/10 rounded px-1 py-0.5 ${isPastDate(resDateObj) ? "text-muted-foreground" : ""}`}
                            >
                              {format(resDateObj, "HH:mm", { locale: fr })} – T{res.tableNum}
                              {res.nomClient ? ` – ${res.nomClient}` : ""}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservationCalendarView;
