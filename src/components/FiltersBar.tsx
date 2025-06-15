
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Search, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import SalleSelector from '@/components/SalleSelector';
import { Salle } from '@/types/restaurant';

type PeriodType = 'jour' | 'semaine' | 'mois' | 'annee' | '12mois' | 'custom';

interface FiltersBarProps {
  // Sélection des salles
  salles: Salle[];
  selectedSalleId: string;
  onSalleChange: (id: string) => void;
  showAllSallesOption?: boolean;
  
  // Recherche client (optionnel)
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
  
  // Navigation par période
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  
  // Vue calendrier (optionnel)
  calendarView?: boolean;
  onCalendarViewToggle?: () => void;
  
  // Styles personnalisés
  className?: string;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  salles,
  selectedSalleId,
  onSalleChange,
  showAllSallesOption = false,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Rechercher un client",
  period,
  onPeriodChange,
  currentDate,
  onNavigate,
  calendarView,
  onCalendarViewToggle,
  className = "",
}) => {
  const formatPeriodDisplay = () => {
    switch (period) {
      case 'jour':
        return format(currentDate, 'EEEE dd MMMM yyyy', { locale: fr });
      case 'semaine':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `Semaine du ${format(weekStart, 'dd/MM', { locale: fr })} au ${format(weekEnd, 'dd/MM/yyyy', { locale: fr })}`;
      case 'mois':
        return format(currentDate, 'MMMM yyyy', { locale: fr });
      case 'annee':
        return format(currentDate, 'yyyy', { locale: fr });
      case '12mois':
        return `12 derniers mois (${format(currentDate, 'yyyy', { locale: fr })})`;
      case 'custom':
        return 'Période personnalisée';
      default:
        return format(currentDate, 'MMMM yyyy', { locale: fr });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Première ligne : Sélection salle et recherche */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <SalleSelector
          salles={salles}
          selectedSalleId={selectedSalleId}
          onSalleChange={onSalleChange}
          className="w-56"
          showAllOption={showAllSallesOption}
        />
        
        {/* Recherche client (si activée) */}
        {onSearchChange && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm || ""}
                onChange={e => onSearchChange(e.target.value)}
                className="pl-8 pr-3 py-2 border border-input rounded-md w-full text-sm bg-background"
              />
            </div>
          </div>
        )}
      </div>

      {/* Deuxième ligne : Navigation par période */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-6 border rounded-lg bg-card">
        <div className="flex items-center space-x-2 sm:space-x-4 w-full">
          <Select value={period} onValueChange={(value: PeriodType) => onPeriodChange(value)}>
            <SelectTrigger className="w-24 sm:w-32 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jour">Jour</SelectItem>
              <SelectItem value="semaine">Semaine</SelectItem>
              <SelectItem value="mois">Mois</SelectItem>
              <SelectItem value="annee">Année</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="outline" size="sm" className="px-2 py-1 sm:px-3 sm:py-2" onClick={() => onNavigate('prev')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-32 sm:min-w-48 text-center text-xs sm:text-base">
              {formatPeriodDisplay()}
            </span>
            <Button variant="outline" size="sm" className="px-2 py-1 sm:px-3 sm:py-2" onClick={() => onNavigate('next')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Bouton vue calendrier (si activé) */}
          {onCalendarViewToggle && (
            <Button
              type="button"
              variant={calendarView ? "default" : "outline"}
              size="icon"
              aria-label="Vue calendrier"
              className="ml-2"
              onClick={onCalendarViewToggle}
            >
              <CalendarIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
