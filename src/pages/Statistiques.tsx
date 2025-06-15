import React, { useMemo, useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears } from "date-fns";
import { fr } from "date-fns/locale";
import StatisticSummary from "@/components/statistics/StatisticSummary";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ReservationHeatmap from "@/components/statistics/ReservationHeatmap";
import ReservationTable from "@/components/statistics/ReservationTable";
import FiltersBar from "@/components/FiltersBar";
import CombinedReservationChart from "@/components/statistics/CombinedReservationChart";

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
  if (!selTimes || selTimes.length === 0 || selTimes.includes("all")) return true;
  if (!hourStr) return false;
  const [h, m] = hourStr.split(":").map(Number);
  if (selTimes.includes("morning") && h >= 6 && (h < 11 || (h === 11 && m === 0))) return true;
  if (selTimes.includes("midday") && (h > 11 || (h === 11 && m > 0)) && h < 15) return true;
  if (selTimes.includes("evening") && ((h === 18 && m >= 0) || (h > 18 && (h < 23 || (h === 23 && m <= 30))))) {
    return true;
  }
  return false;
}

type PeriodType = 'jour' | 'semaine' | 'mois' | 'annee' | '12mois' | 'custom';

const ALL_SALLES_VALUE = "all";

const Statistiques = () => {
  const { salles, tables, reservations } = useRestaurant();

  // États de filtre
  
  const [period, setPeriod] = useState<PeriodType>("mois");
  const [date, setDate] = useState<Date>(new Date());

  // FIX: Properly initialize customRange with start: null, end: null
  const [customRange, setCustomRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });

  const [selectedSalleIds, setSelectedSalleIds] = useState<string[]>([]);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(["all"]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);

  // Nouvel état pour la sélection de salle principale (barre du haut)
  const [selectedSalleId, setSelectedSalleId] = useState<string>(ALL_SALLES_VALUE);

  // Nouvel état pour le filtre sur le nom du client
  const [clientNameFilter, setClientNameFilter] = useState<string>("");

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

  function getPeriodLabel() {
    const opts = { locale: fr };
    if (period === "jour") {
      return `Période affichée : ${format(date, "EEEE dd MMMM yyyy", opts)}`;
    }
    if (period === "semaine") {
      const start = new Date(date);
      start.setDate(date.getDate() - date.getDay() + 1);
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

  const now = new Date();
  let startDate: Date, endDate: Date;
  if (period === "jour") {
    startDate = new Date(date.setHours(0,0,0,0));
    endDate = new Date(date.setHours(23,59,59,999));
  } else if (period === "semaine") {
    const first = date.getDate() - date.getDay() + 1;
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

  // Synchroniser la sélection de salle principale avec la liste de salle avancée (filtres avancés)
  React.useEffect(() => {
    if (selectedSalleId === ALL_SALLES_VALUE) {
      setSelectedSalleIds([]);
    } else if (selectedSalleIds.length !== 1 || selectedSalleIds[0] !== selectedSalleId) {
      setSelectedSalleIds([selectedSalleId]);
    }
  }, [selectedSalleId]);

  // --- Filtrage des réservations ---
  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      // Filtre période/dates (inchangé)
      const isInDate = res.date >= startDate && res.date <= endDate;
      // Filtre salle (logique harmonisée : soit ALL, soit la salle sélectionnée dans filtre principal OU en filtre avancé)
      const salleValid =
        selectedSalleIds.length === 0 || tables.find(t => t.id === res.tableId && selectedSalleIds.includes(t.salleId));
      const tableValid =
        selectedTableIds.length === 0 || selectedTableIds.includes(res.tableId);
      const timeValid = filterByTimeSlot(res.heure, selectedTimes);
      // Nouveau filtre : nom du client
      const clientValid =
        !clientNameFilter ||
        (res.nomClient && res.nomClient.toLowerCase().includes(clientNameFilter.trim().toLowerCase()));

      return isInDate && salleValid && tableValid && timeValid && clientValid;
    });
  }, [reservations, startDate, endDate, selectedSalleIds, selectedTableIds, tables, selectedTimes, clientNameFilter]);
  
  const distinctDaysWithReservation = useMemo(() => {
    const daysSet = new Set<string>();
    filteredReservations.forEach(reservation => {
      daysSet.add(format(reservation.date, "yyyy-MM-dd"));
    });
    return daysSet.size;
  }, [filteredReservations]);

  const salleOptions = salles.map(s => ({ value: s.id, label: s.nom }));
  const tableOptions = tables
    .filter(t => selectedSalleIds.length === 0 || selectedSalleIds.includes(t.salleId))
    .map(t => ({ value: t.id, label: `Table ${t.numero}` }));

  // ------ Nettoyage des slots vides pour les graphiques --------
  // Nouvelle structure: on produit d'abord la data avec slots vides pour le heatmap, mais pour les charts, on nettoie les slots vides :
  const chartData = useMemo(() => {
    let resultArr = [];
    if (period === "annee" || period === "12mois") {
      const months = [];
      let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0, 0);
      while (cursor <= endDate) {
        months.push({
          key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`,
          date: new Date(cursor),
          reservations: 0,
          personnes: 0,
        });
        cursor.setMonth(cursor.getMonth() + 1);
      }
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
      resultArr = months;
    } else {
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
      resultArr = Object.values(days);
    }
    return resultArr;
  }, [filteredReservations, startDate, endDate, period]);

  // MOVE totalReservations and totalPersonnes here ONLY ONCE
  const totalReservations = filteredReservations.length;
  const totalPersonnes = filteredReservations.reduce((sum, r) => sum + r.nombrePersonnes, 0);

  const handleSalleSelect = (id: string) => setSelectedSalleIds(ids => ids.includes(id) ? ids.filter(val => val !== id) : [...ids, id]);
  const handleTableSelect = (id: string) => setSelectedTableIds(ids => ids.includes(id) ? ids.filter(val => val !== id) : [...ids, id]);
  const handleTimeSelect = (key: string) => setSelectedTimes(times =>
    key === "all"
      ? ["all"]
      : times.includes(key) ? times.filter(t => t !== key) : [...times.filter(t => t !== "all"), key]
  );

  const slots = React.useMemo(() => {
    return ["Matin", "Midi", "Soir"];
  }, []);

  function slotForHour(hourStr?: string): string {
    if (!hourStr) return "";
    const [h, m] = hourStr.split(":").map(Number);
    if (h >= 6 && (h < 11 || (h === 11 && m === 0))) return "Matin";
    if ((h > 11 || (h === 11 && m > 0)) && h < 15) return "Midi";
    if ((h === 18 && m >= 0) || (h > 18 && (h < 23 || (h === 23 && m <= 30)))) return "Soir";
    return "";
  }

  const daysList = React.useMemo(() => {
    if (period === "annee" || period === "12mois") {
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
      const result: string[] = [];
      let cursor = new Date(startDate);
      while (cursor <= endDate) {
        result.push(format(cursor, "yyyy-MM-dd"));
        cursor.setDate(cursor.getDate() + 1);
      }
      return result;
    }
  }, [startDate, endDate, period]);

  const heatmapData = React.useMemo(() => {
    const countMap: { [key: string]: number } = {};
    if (period === "annee" || period === "12mois") {
      filteredReservations.forEach(res => {
        const month = `${res.date.getFullYear()}-${String(res.date.getMonth() + 1).padStart(2, "0")}`;
        const slot = slotForHour(res.heure);
        if (!slot) return;
        const key = `${month}|${slot}`;
        countMap[key] = (countMap[key] ?? 0) + 1;
      });
      const arr: { slot: string; date: string; count: number }[] = [];
      for (const month of daysList) {
        for (const slot of slots) {
          arr.push({
            slot,
            date: month,
            count: countMap[`${month}|${slot}`] ?? 0,
          });
        }
      }
      return arr;
    } else {
      filteredReservations.forEach(res => {
        const day = format(res.date, "yyyy-MM-dd");
        const slot = slotForHour(res.heure);
        if (!slot) return;
        const key = `${day}|${slot}`;
        countMap[key] = (countMap[key] ?? 0) + 1;
      });
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
    <div className="px-2 sm:px-5 max-w-full w-full bg-restaurant-gradient dark:bg-restaurant-dark min-h-screen transition-colors duration-500">
      {/* HEADER */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0 whitespace-nowrap animated-gradient-title drop-shadow-sm">
          Statistiques
        </h1>
      </div>

      {/* BARRE DE FILTRES */}
      <FiltersBar
        salles={salles}
        selectedSalleId={selectedSalleId}
        onSalleChange={setSelectedSalleId}
        showAllSallesOption={true}
        period={period}
        onPeriodChange={setPeriod}
        currentDate={date}
        onNavigate={handleNavigate}
        className="mb-5"
        searchTerm={clientNameFilter}
        onSearchChange={setClientNameFilter}
        searchPlaceholder="Rechercher un client…"
      />

      {/* RESUME STATS */}
      <div className="mb-5">
        <StatisticSummary
          reservations={totalReservations}
          personnes={totalPersonnes}
          jours={distinctDaysWithReservation}
        />
      </div>
      
      {/* GRAPHIQUE GLOBAL (Barres/ligne) */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Nb de réservations (ligne) & Nb de personnes (barres)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[350px]">
              <CombinedReservationChart data={chartData} period={period} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HEATMAP RÉPARTITION PAR CRÉNEAUX */}
      <Card className="mb-5">
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

      {/* TABLEAU DES RESERVATIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Détail des réservations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <ReservationTable 
            reservations={filteredReservations} 
            tables={tables}
            salles={salles}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default Statistiques;
