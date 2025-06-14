import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval } from "date-fns";
import { fr } from "date-fns/locale";

type PeriodType = "jour" | "semaine" | "mois" | "annee";

interface ReservationCalendarViewProps {
  tablesWithReservations: any[];
  period: PeriodType;
  currentDate: Date;
}

const ReservationCalendarView = ({
  tablesWithReservations,
  period,
  currentDate,
}: ReservationCalendarViewProps) => {
  // Pour basculer "simple" <-> "détail" sur chaque mois individuellement
  const [detailedMonths, setDetailedMonths] = useState<{ [key: string]: boolean }>({});

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

  // Permet de calculer l'agrégat d'un mois : nombre de réservations, nombre total de personnes
  const getAggregateForMonth = (month: Date) => {
    let reservationCount = 0;
    let totalPersons = 0;
    tablesWithReservations.forEach(table => {
      table.reservations.forEach((res: any) => {
        const resDate = new Date(res.date);
        if (
          resDate.getMonth() === month.getMonth() &&
          resDate.getFullYear() === month.getFullYear()
        ) {
          reservationCount++;
          totalPersons += res.nombrePersonnes || 0;
        }
      });
    });
    return { reservationCount, totalPersons };
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
              // Stock pour le mode de vue du mois courant (par défaut : simple)
              const detailed = detailedMonths[monthLabel] ?? false;

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

              const hasReservations = resForMonth.length > 0;
              const { reservationCount, totalPersons } = getAggregateForMonth(month);

              // Couleur de fond contrastée :
              // - vive si réservation, très claire sinon
              const bgClass = hasReservations
                ? "bg-blue-300/80 dark:bg-blue-600/50"
                : "bg-muted/95";

              // Gestion du mode d'affichage simplifié / détaillé
              return (
                <div
                  key={monthLabel}
                  className={`rounded-lg p-3 transition-all ${bgClass}`}
                >
                  <div className="font-semibold mb-2 text-sm flex items-center gap-2">
                    {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
                    {hasReservations && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto underline px-2 py-0 text-xs"
                        onClick={() =>
                          setDetailedMonths(prev => ({
                            ...prev,
                            [monthLabel]: !detailed,
                          }))
                        }
                      >
                        {detailed ? "Simple" : "Détail"}
                      </Button>
                    )}
                  </div>
                  {/* Mode simple (agrégé) */}
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
                    // Mode détaillé (liste complète)
                    hasReservations ? (
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
                    ) : (
                      <div className="text-xs text-muted-foreground">Aucune réservation</div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {dateRange.map((date: Date) => {
              const resForDay = getReservationsForDate(date);
              const hasReservations = resForDay.length > 0;
              return (
                <div
                  key={date.toISOString()}
                  className={`rounded-lg p-2 flex flex-col min-h-[96px] transition-all
                    ${hasReservations ? "bg-muted" : "bg-muted/60"}`}
                >
                  <div className="font-semibold text-xs mb-1">
                    {format(date, period === "jour" ? "PPP" : "EEE d", { locale: fr })}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    {!hasReservations ? (
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
