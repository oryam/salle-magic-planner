import React, { useMemo, useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import StatisticSummary from "@/components/statistics/StatisticSummary";
import StatisticsChart from "@/components/statistics/StatisticsChart";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ReservationLineChart from "@/components/statistics/ReservationLineChart";

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
  const nbJours = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime())/(1000*60*60*24)));

  // Sélection multi pour salle/table/horaires (UI réactive)
  const handleSalleSelect = (id: string) => setSelectedSalleIds(ids => ids.includes(id) ? ids.filter(val => val !== id) : [...ids, id]);
  const handleTableSelect = (id: string) => setSelectedTableIds(ids => ids.includes(id) ? ids.filter(val => val !== id) : [...ids, id]);
  const handleTimeSelect = (key: string) => setSelectedTimes(times =>
    key === "all"
      ? ["all"]
      : times.includes(key) ? times.filter(t => t !== key) : [...times.filter(t => t !== "all"), key]
  );

  // Sélecteur de période et d’intervalle
  return (
    <div className="container max-w-6xl mx-auto py-6">
      <h2 className="font-bold text-2xl mb-6">Statistiques des réservations</h2>

      {/* Indicateurs principaux */}
      <StatisticSummary
        reservations={totalReservations}
        personnes={totalPersonnes}
        jours={nbJours}
      />

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-center bg-muted py-3 px-4 mb-4 rounded-lg">
        {/* Période principale */}
        <div className="flex gap-2 flex-wrap items-center">
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
        {/* Si custom intervalle, deux calendriers */}
        {period === "custom" && (
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
        )}
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

        {/* Multi-sélecteurs Salles/Tables */}
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
    </div>
  );
}

export default Statistiques;
