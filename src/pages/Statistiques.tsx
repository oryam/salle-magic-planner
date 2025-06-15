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

  // Données chart : groupées par jour selon la période
  const chartData = useMemo(() => {
    const days: { [iso: string]: { date: Date; reservations: number; personnes: number } } = {};
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
  }, [filteredReservations, startDate, endDate]);

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

  // --- GENERATION DES DONNÉES POUR LA HEATMAP ---
  const slots = React.useMemo(() => {
    // Génère les tranches horaires 00:00 à 23:30 par 30 min (["00:00", "00:30", ...])
    const res: string[] = [];
    for (let h = 0; h < 24; h++) {
      res.push(`${h.toString().padStart(2, "0")}:00`);
      res.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return res;
  }, []);

  const daysList = React.useMemo(() => {
    // Liste des jours à afficher = jours du graphique (période sélectionnée)
    const result: string[] = [];
    let cursor = new Date(startDate);
    while (cursor <= endDate) {
      result.push(format(cursor, "yyyy-MM-dd"));
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }, [startDate, endDate]);

  const heatmapData = React.useMemo(() => {
    // Map: { [day + '|' + slot]: count }
    const countMap: { [key: string]: number } = {};
    filteredReservations.forEach(res => {
      const day = format(res.date, "yyyy-MM-dd");
      let [h, m] = res.heure ? res.heure.split(":").map(Number) : [0, 0];

      // arrondi à la 1/2h la plus proche vers le bas
      const minuteRounded = m < 30 ? "00" : "30";
      const slot = `${h.toString().padStart(2, "0")}:${minuteRounded}`;

      const key = `${day}|${slot}`;
      countMap[key] = (countMap[key] ?? 0) + 1;
    });

    // Construction du tableau d'objets
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
  }, [filteredReservations, daysList, slots]);

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <h2 className="font-bold text-2xl mb-2">Statistiques des réservations</h2>
      
      {/* SECTION 1 : Filtres de date/période - toujours visibles */}
      <div className="mb-4 flex flex-wrap gap-4 items-center bg-muted py-3 px-4 rounded-lg">
        <div className="flex gap-2 flex-wrap items-center">
          {/* Boutons navigation période */}
          <div className="flex gap-1">
            <Button variant="secondary" size="sm" onClick={() => handleNavigate("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleNavigate("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          {/* Choix de période */}
          {PERIODS.map((p) => (
            <Button
              key={p.key}
              variant={period === p.key ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        {/* Sélection de date ou intervalle personnalisé */}
        {period === "custom" ? (
          <div className="flex gap-3 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={cn("w-[130px] justify-start", !customRange.start && "text-muted-foreground")}>
                  {customRange.start ? format(customRange.start, "dd/MM/yyyy") : "Début"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={customRange.start}
                  onSelect={(v) => setCustomRange(cr => ({...cr, start: v ?? null }))}
                />
              </PopoverContent>
            </Popover>
            <span>&rarr;</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={cn("w-[130px] justify-start", !customRange.end && "text-muted-foreground")}>
                  {customRange.end ? format(customRange.end, "dd/MM/yyyy") : "Fin"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={customRange.end}
                  onSelect={(v) => setCustomRange(cr => ({...cr, end: v ?? null }))}
                />
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">Date</Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={d => d && setDate(d)}
              />
            </PopoverContent>
          </Popover>
        )}

        {/* BOUTON POUR AFFICHER/MASQUER LES FILTRES AVANCÉS */}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => setAdvancedFiltersVisible(v => !v)}
        >
          {advancedFiltersVisible ? "Masquer les filtres avancés" : "Afficher les filtres avancés"}
        </Button>
      </div>

      {/* Libellé période affichée */}
      {getPeriodLabel() && (
        <div className="mb-3 text-muted-foreground text-sm font-medium">
          {getPeriodLabel()}
        </div>
      )}

      {/* SECTION 2 : Filtres avancés - salles, tables, horaires... */} 
      {advancedFiltersVisible && (
        <div className="flex flex-wrap gap-4 items-center bg-muted py-3 px-4 mb-4 rounded-lg">
          {/* Salles */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Salles&nbsp;:</span>
            <div className="flex gap-2 flex-wrap">
              {salleOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-1">
                  <Checkbox checked={selectedSalleIds.includes(opt.value)}
                    onCheckedChange={() => handleSalleSelect(opt.value)}
                    id={`salle-${opt.value}`} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Tables */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Tables&nbsp;:</span>
            <div className="flex gap-2 flex-wrap">
              {tableOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-1">
                  <Checkbox checked={selectedTableIds.includes(opt.value)}
                    onCheckedChange={() => handleTableSelect(opt.value)}
                    id={`table-${opt.value}`}/>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Plage horaire */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Horaires&nbsp;:</span>
            <div className="flex gap-2">
              {TIME_FILTERS.map(opt => (
                <label key={opt.key} className="flex items-center gap-1">
                  <Checkbox checked={selectedTimes.includes(opt.key)}
                    onCheckedChange={() => handleTimeSelect(opt.key)}
                    id={`time-${opt.key}`}/>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Indicateurs principaux */}
      <StatisticSummary
        reservations={totalReservations}
        personnes={totalPersonnes}
        jours={distinctDaysWithReservation}
      />

      {/* Graphe courbe réservations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Historique du nombre de réservations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReservationLineChart data={chartData} />
        </CardContent>
      </Card>

      {/* Graphe barres personnes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            Historique du nombre de personnes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatisticsChart data={chartData} />
        </CardContent>
      </Card>

      {/* HEATMAP RÉPARTITION PAR CRÉNEAUX */}
      <Card>
        <CardHeader>
          <CardTitle>
            Heatmap des réservations par créneau de 30 min
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReservationHeatmap data={heatmapData} slots={slots} days={daysList} />
        </CardContent>
      </Card>
    </div>
  );
}

export default Statistiques;
