
import React from "react";
import { PERIODS, TIME_FILTERS } from "./filtersConfig";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

interface SalleOption { value: string; label: string }
interface TableOption { value: string; label: string }

type Props = {
  period: string;
  setPeriod: (p: string) => void;
  date: Date;
  setDate: (d: Date) => void;
  customRange: { start: Date | null; end: Date | null };
  setCustomRange: (range: { start: Date | null; end: Date | null }) => void;
  salleOptions: SalleOption[];
  selectedSalleIds: string[];
  handleSalleSelect: (id: string) => void;
  tableOptions: TableOption[];
  selectedTableIds: string[];
  handleTableSelect: (id: string) => void;
  selectedTimes: string[];
  handleTimeSelect: (key: string) => void;
  advancedFiltersVisible: boolean;
  setAdvancedFiltersVisible: (v: boolean) => void;
  onNavigate: (d: "prev" | "next") => void;
};

const StatisticsFilters: React.FC<Props> = ({
  period, setPeriod, date, setDate, customRange, setCustomRange,
  salleOptions, selectedSalleIds, handleSalleSelect,
  tableOptions, selectedTableIds, handleTableSelect,
  selectedTimes, handleTimeSelect,
  advancedFiltersVisible, setAdvancedFiltersVisible,
  onNavigate
}) => (
  <div>
    {/* Filtres de date/période */}
    <div className="mb-4 flex flex-wrap gap-4 items-center bg-muted py-3 px-4 rounded-lg">
      <div className="flex gap-2 flex-wrap items-center">
        {/* Navigation */}
        <div className="flex gap-1">
          <Button variant="secondary" size="sm" onClick={() => onNavigate("prev")}>{"<"}</Button>
          <Button variant="secondary" size="sm" onClick={() => onNavigate("next")}>{">"}</Button>
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
      {/* Sélection de date(s) */}
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
                selected={customRange.start ?? undefined}
                onSelect={v => setCustomRange({ ...customRange, start: v ?? null })}
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
                selected={customRange.end ?? undefined}
                onSelect={v => setCustomRange({ ...customRange, end: v ?? null })}
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
      {/* BOUTON FILTRES AVANCES */}
      <Button
        variant="outline"
        size="sm"
        className="ml-auto"
        onClick={() => setAdvancedFiltersVisible(v => !v)}
      >
        {advancedFiltersVisible ? "Masquer les filtres avancés" : "Afficher les filtres avancés"}
      </Button>
    </div>
    {/* Filtres avancés */}
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
  </div>
);

export default StatisticsFilters;
