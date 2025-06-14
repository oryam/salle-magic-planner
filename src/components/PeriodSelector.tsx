
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import React from "react";

type PeriodType = 'jour' | 'semaine' | 'mois' | 'annee';

interface PeriodSelectorProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  onPeriodChange,
  currentDate,
  onNavigate
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
    }
  };

  return (
    <div className="p-4 border-b">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Select value={period} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jour">Jour</SelectItem>
                <SelectItem value="semaine">Semaine</SelectItem>
                <SelectItem value="mois">Mois</SelectItem>
                <SelectItem value="annee">Année</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => onNavigate('prev')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-48 text-center">{formatPeriodDisplay()}</span>
              <Button variant="outline" size="sm" onClick={() => onNavigate('next')}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodSelector;
