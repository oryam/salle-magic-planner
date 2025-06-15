import React, { useMemo, useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears } from "date-fns";
import { fr } from "date-fns/locale";
import StatisticSummary from "@/components/statistics/StatisticSummary";
import StatisticsChart from "@/components/statistics/StatisticsChart";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ReservationLineChart from "@/components/statistics/ReservationLineChart";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReservationHeatmap from "@/components/statistics/ReservationHeatmap";

const TIME_FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "morning", label: "Matin (6h-11h)" },
  { key: "midday", label: "Midi (11h01-15h)" },
  { key: "evening", label: "Soir (18h-23h30)" },
];

const PERIODS = [
  { key: "jour", label: "Jour" },
  { key: "semaine", label: "Semaine" },
  { key: "mois", label: "Mois" },
  { key: "annee", label: "Année" },
  { key: "12mois", label: "12 derniers mois" },
  { key: "custom", label: "Intervalle personnalisé" },
];

function filterByTimeSlot(hourStr?: string, selTimes?: string[]) {
  // Retourne true si la case horaire correspond à une case sélectionnée
  if (!selTimes || selTimes.length === 0 || selTimes.includes("all")) return true;
  if (!hourStr) return false;
  const [h, m] = hourStr.split(":").map(Number);
  // matin = 6h à 11h (inclus 11:00)
  if (selTimes.includes("morning") && h >= 6 && (h < 11 || (h === 11 && m === 0))) return true;
  // midi = 11:01 à 15:00
  if (selTimes.includes("midday") && (h > 11 || (h === 11 && m > 0)) && h < 15) return true;
  // soir = 18:00 à 23:30 inclus.
  if (selTimes.includes("evening") && ((h === 18 && m >= 0) || (h > 18 && (h < 23 || (h === 23 && m <= 30))))) {
    return true;
  }
  return false;
}

const Statistiques = () => {
  const { salles, tables, reservations } = useRestaurant();

  // Filtres d’état
  const [period, setPeriod] = useState<string>("mois");
  const [date, setDate] = useState<Date>(new Date());
  const [customRange, setCustomRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
  const [selectedSalleIds, setSelectedSalleIds] = useState<string[]>([]);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(["all"]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);

  // --- GESTION NAVIGATION PERIODIQUE ---
  const handleNavigate = (direction: "prev" | "next") => {
    let newDate = new Date(date);
    if (period === "jour") {
      newDate = direction === "prev" ? subDays(date, 1) : addDays(date, 1);
    } else if (period === "semaine") {
      newDate = direction === "prev" ? subWeeks(date, 1) : addWeeks(date, 1);
    } else if (period === "mois") {
      newDate = direction === "prev" ? subMonths(date, 1) : addMonths(date, 1);
    } else if (period === "annee") {
      newDate = direction === "prev" ? subYears(date, 1) : addYears(date, 1);
    } else if (period === "12mois") {
      newDate = direction === "prev" ? subMonths(date, 12) : addMonths(date, 12);
    }
    setDate(newDate);
  };

  // Ajout de la fonction pour déterminer le libellé
  function getPeriodLabel() {
    const opts = { locale: fr };
    if (period === "jour") {
      return `Période affichée : ${format(date, "EEEE dd MMMM yyyy", opts)}`;
    }
    if (period === "semaine") {
      const start = new Date(date);
      start.setDate(date.getDate() - date.getDay() + 1); // lundi
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `Période affichée : Semaine du ${format(start, "dd/MM/yyyy", opts)} au ${format(end, "dd/MM/yyyy", opts)}`;
    }
    if (period === "mois") {
      return `Période affichée : ${format(date, "MMMM yyyy", opts)}`;
    }
    if (period === "annee") {
      return `Période affichée : Année ${format(date, "yyyy", opts)}`;
    }
    if (period === "12mois") {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0,0,0,0);
      const end = now;
      return `Période affichée : Du ${format(start, "MMMM yyyy", opts)} à ${format(end, "MMMM yyyy", opts)}`;
    }
    if (period === "custom" && customRange.start && customRange.end) {
      return `Période affichée : Du ${format(customRange.start, "dd/MM/yyyy", opts)} au ${format(customRange.end, "dd/MM/yyyy", opts)}`;
    }
    return null;
  }

  // Calcul des filtres de période
  const now = new Date();
  let startDate: Date, endDate: Date;
  if (period === "jour") {
    startDate = new Date(date.setHours(0,0,0,0));
    endDate = new Date(date.setHours(23,59,59,999));
  } else if (period === "semaine") {
    const first = date.getDate() - date.getDay() + 1; // lundi
    startDate = new Date(date.getFullYear(), date.getMonth(), first, 0,0,0,0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23,59,59,999);
  } else if (period === "mois") {
    startDate = new Date(date.getFullYear(), date.getMonth(), 1, 0,0,0,0);
    endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23,59,59,999);
  } else if (period === "annee") {
    startDate = new Date(date.getFullYear(), 0, 1, 0,0,0,0);
    endDate = new Date(date.getFullYear(), 11, 31, 23,59,59,999);
  } else if (period === "12mois") {
    endDate = new Date();
    startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1, 0,0,0,0);
  } else if (period === "custom" && customRange.start && customRange.end) {
    startDate = new Date(customRange.start.setHours(0,0,0,0));
    endDate = new Date(customRange.end.setHours(23,59,59,999));
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0,0,0,0);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23,59,59,999);
  }

  // Filtrage des réservations
  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const isInDate =
        res.date >= startDate && res.date <= endDate;
      const salleValid =
        selectedSalleIds.length === 0 || tables.find(t => t.id === res.tableId && selectedSalleIds.includes(t.salleId));
      const tableValid =
        selectedTableIds.length === 0 || selectedTableIds.includes(res.tableId);
      const timeValid = filterByTimeSlot(res.heure, selectedTimes);

      return isInDate && salleValid && tableValid && timeValid;
    });
  }, [reservations, startDate, endDate, selectedSalleIds, selectedTableIds, tables, selectedTimes]);
  
  // Calcul du nombre de jours distincts avec réservation
  const distinctDaysWithReservation = useMemo(() => {
    const daysSet = new Set<string>();
    filteredReservations.forEach(reservation => {
      // Format de la date : yyyy-MM-dd
      daysSet.add(format(reservation.date, "yyyy-MM-dd"));
    });
    return daysSet.size;
  }, [filteredReservations]);

  // Génération des options pour salles/tables
  const salleOptions = salles.map(s => ({ value: s.id, label: s.nom }));
  const tableOptions = tables
    .filter(t => selectedSalleIds.length === 0 || selectedSalleIds.includes(t.salleId))
    .map(t => ({ value: t.id, label: `Table ${t.numero}` }));

  // Données chart : groupées par jour ou par mois selon la période
  const chartData = useMemo(() => {
    // --- NOUVELLE LOGIQUE pour périodes annee et 12mois ---
    if (period === "annee" || period === "12mois") {
      // Regrouper par mois entre startDate et endDate
      const months = [];
      let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0, 0);
      while (cursor <= endDate) {
        months.push({
          key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`,
          date: new Date(cursor),
          reservations: 0,
          personnes: 0,
        });
        // passe au 1er du mois suivant
        cursor.setMonth(cursor.getMonth() + 1);
      }
      // Créer un map pour accès rapide
      const monthMap = new Map(months.map(m => [m.key, m]));
      filteredReservations.forEach(res => {
        const y = res.date.getFullYear();
        const m = res.date.getMonth() + 1;
        const key = `${y}-${String(m).padStart(2, "0")}`;
        if (monthMap.has(key)) {
          monthMap.get(key)!.reservations += 1;
          monthMap.get(key)!.personnes += res.nombrePersonnes;
        }
      });
      return months;
    }
    // --- FIN DU TRAITEMENT SPÉCIFIQUE ---

    // Sinon, groupement par jour (comportement inchangé)
    const days: {
      [iso: string]: { date: Date; reservations: number; personnes: number }
    } = {};
    let cursor = new Date(startDate);
    while (cursor <= endDate) {
      const key = format(cursor, "yyyy-MM-dd");
      days[key] = { date: new Date(cursor), reservations: 0, personnes: 0 };
      cursor.setDate(cursor.getDate() + 1);
    }
    filteredReservations.forEach(res => {
      const resDayKey = format(res.date, "yyyy-MM-dd");
      if (days[resDayKey]) {
        days[resDayKey].reservations += 1;
        days[resDayKey].personnes += res.nombrePersonnes;
      }
    });
    return Object.values(days);
  }, [filteredReservations, startDate, endDate, period]);

  // Résumés
  const totalReservations = filteredReservations.length;
  const totalPersonnes = filteredReservations.reduce((sum, r) => sum + r.nombrePersonnes, 0);
  // const nbJours = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime())/(1000*60*60*24))); // <-- plus utilisé

  // Sélection multi pour salle/table/horaires (UI réactive)
  const handleSalleSelect = (id: string) => setSelectedSalleIds(ids => ids.includes(id) ? ids.filter(val => val !== id) : [...ids, id]);
  const handleTableSelect = (id: string) => setSelectedTableIds(ids => ids.includes(id) ? ids.filter(val => val !== id) : [...ids, id]);
  const handleTimeSelect = (key: string) => setSelectedTimes(times =>
    key === "all"
      ? ["all"]
      : times.includes(key) ? times.filter(t => t !== key) : [...times.filter(t => t !== "all"), key]
  );

  // --- GENERATION DES DONNÉES POUR LA HEATMAP GROUPEE  ---
  const slots = React.useMemo(() => {
    return ["Matin", "Midi", "Soir"];
  }, []);

  // Helper pour déterminer le créneau en texte à partir d'un horaire
  function slotForHour(hourStr?: string): string {
    if (!hourStr) return "";
    const [h, m] = hourStr.split(":").map(Number);
    if (h >= 6 && (h < 11 || (h === 11 && m === 0))) return "Matin";
    if ((h > 11 || (h === 11 && m > 0)) && h < 15) return "Midi";
    if ((h === 18 && m >= 0) || (h > 18 && (h < 23 || (h === 23 && m <= 30)))) return "Soir";
    return "";
  }

  // --- ADAPTATION DE LA LISTE DES COLONNES (jours ou mois selon la période) ---
  const daysList = React.useMemo(() => {
    if (period === "annee" || period === "12mois") {
      // Retourne la liste des mois du range sous forme 'YYYY-MM'
      const months: string[] = [];
      let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0, 0);
      while (cursor <= endDate) {
        months.push(
          `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`
        );
        cursor.setMonth(cursor.getMonth() + 1);
      }
      return months;
    } else {
      // Liste de jours classiques au format 'YYYY-MM-DD'
      const result: string[] = [];
      let cursor = new Date(startDate);
      while (cursor <= endDate) {
        result.push(format(cursor, "yyyy-MM-dd"));
        cursor.setDate(cursor.getDate() + 1);
      }
      return result;
    }
  }, [startDate, endDate, period]);

  // --- ADAPTATION DE L'AGGREGATION POUR LA HEATMAP ---
  const heatmapData = React.useMemo(() => {
    // key: 'YYYY-MM|slot' ou 'YYYY-MM-DD|slot'
    const countMap: { [key: string]: number } = {};
    if (period === "annee" || period === "12mois") {
      // Regroupement par mois + slot
      filteredReservations.forEach(res => {
        const month = `${res.date.getFullYear()}-${String(res.date.getMonth() + 1).padStart(2, "0")}`;
        const slot = slotForHour(res.heure);
        if (!slot) return;
        const key = `${month}|${slot}`;
        countMap[key] = (countMap[key] ?? 0) + 1;
      });
      // Générer le tableau pour chaque mois/slot
      const arr: { slot: string; date: string; count: number }[] = [];
      for (const month of daysList) {
        for (const slot of slots) {
          arr.push({
            slot,
            date: month, // Attention: ce sera 'YYYY-MM' ici
            count: countMap[`${month}|${slot}`] ?? 0,
          });
        }
      }
      return arr;
    } else {
      // Regroupement par jour + slot
      filteredReservations.forEach(res => {
        const day = format(res.date, "yyyy-MM-dd");
        const slot = slotForHour(res.heure);
        if (!slot) return;
        const key = `${day}|${slot}`;
        countMap[key] = (countMap[key] ?? 0) + 1;
      });
      // Générer le tableau pour chaque jour/slot
      const arr: { slot: string; date: string; count: number }[] = [];
      for (const day of daysList) {
        for (const slot of slots) {
          arr.push({
            slot,
            date: day,
            count: countMap[`${day}|${slot}`] ?? 0,
          });
        }
      }
      return arr;
    }
  }, [filteredReservations, daysList, slots, period]);

  return (
    <div className="px-2 sm:px-5 max-w-full w-full">
      {/* FILTRES */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0 whitespace-nowrap">
          Statistiques
        </h1>
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">Filtrer</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-w-xs sm:max-w-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Période</h4>
                <div className="flex flex-wrap gap-2">
                  {PERIODS.map(p => (
                    <Button
                      key={p.key}
                      variant={period === p.key ? "default" : "outline"}
                      onClick={() => setPeriod(p.key)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>

              {period === "custom" && (
                <div className="border rounded-md p-2">
                  <h4 className="text-sm font-medium">Choisir une date de début et de fin</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Début</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[150px] justify-start text-left font-normal",
                              !customRange.start && "text-muted-foreground"
                            )}
                          >
                            {customRange.start ? format(customRange.start, "dd/MM/yyyy") : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={customRange.start}
                            onSelect={(date) => setCustomRange({ ...customRange, start: date })}
                            disabled={false}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fin</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[150px] justify-start text-left font-normal",
                              !customRange.end && "text-muted-foreground"
                            )}
                          >
                            {customRange.end ? format(customRange.end, "dd/MM/yyyy") : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={customRange.end}
                            onSelect={(date) => setCustomRange({ ...customRange, end: date })}
                            disabled={false}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}

              <Button variant="link" onClick={() => setAdvancedFiltersVisible(!advancedFiltersVisible)}>
                {advancedFiltersVisible ? "Masquer" : "Afficher"} les filtres avancés
              </Button>

              {advancedFiltersVisible && (
                <div className="space-y-2">
                  {/* Salles */}
                  <div>
                    <h4 className="text-sm font-medium">Salles</h4>
                    <div className="flex flex-col gap-1">
                      {salleOptions.map(s => (
                        <label key={s.value} className="flex items-center space-x-2">
                          <Checkbox checked={selectedSalleIds.includes(s.value)} onCheckedChange={() => handleSalleSelect(s.value)} />
                          <span>{s.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tables */}
                  <div>
                    <h4 className="text-sm font-medium">Tables</h4>
                    <div className="flex flex-col gap-1">
                      {tableOptions.map(t => (
                        <label key={t.value} className="flex items-center space-x-2">
                          <Checkbox checked={selectedTableIds.includes(t.value)} onCheckedChange={() => handleTableSelect(t.value)} />
                          <span>{t.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Horaires */}
                  <div>
                    <h4 className="text-sm font-medium">Horaires</h4>
                    <div className="flex flex-col gap-1">
                      {TIME_FILTERS.map(t => (
                        <label key={t.key} className="flex items-center space-x-2">
                          <Checkbox checked={selectedTimes.includes(t.key)} onCheckedChange={() => handleTimeSelect(t.key)} />
                          <span>{t.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* NAVIGATION PERIOD */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate("prev")}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        <span className="text-xs text-muted-foreground text-center sm:text-sm">
          {getPeriodLabel()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate("next")}
          className="w-full sm:w-auto"
        >
          Suivant
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* RESUME STATS */}
      <div className="mb-5">
        <StatisticSummary
          reservations={totalReservations}
          personnes={totalPersonnes}
          jours={distinctDaysWithReservation}
        />
      </div>

      {/* CHART */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Nombre de réservations et de personnes par jour
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Responsive scroll horizontal sur mobile si overflow */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[350px]">
              <StatisticsChart data={chartData} period={period} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LINE CHART */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Évolution des réservations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[350px]">
              <ReservationLineChart data={chartData} period={period} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HEATMAP RÉPARTITION PAR CRÉNEAUX */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Heatmap des réservations par créneau (matin/midi/soir)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full overflow-x-auto">
            <ReservationHeatmap 
              data={heatmapData} 
              slots={slots} 
              days={daysList}
              isMonthlyView={period === "annee" || period === "12mois"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Statistiques;
