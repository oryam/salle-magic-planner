
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Calendar, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useRestaurant } from '@/context/RestaurantContext';
import DraggableTable from '@/components/DraggableTable';
import TableIcon from '@/components/TableIcon';
import { useState } from 'react';
import { format, addDays, addMonths, addYears, addWeeks, startOfDay, startOfMonth, startOfYear, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import PeriodSelector from '@/components/PeriodSelector';
import TablesSidebar from '@/components/TablesSidebar';
import SalleFloor from '@/components/SalleFloor';
import SalleSelector from '@/components/SalleSelector';

type PeriodType = 'jour' | 'semaine' | 'mois' | 'annee';

const Salle = () => {
  const { getTablesWithReservations, salles } = useRestaurant();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState<PeriodType>('jour');
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [selectedSalleId, setSelectedSalleId] = useState<string>(salles[0]?.id || "");

  const getCurrentPeriodStart = () => {
    switch (period) {
      case 'jour': return startOfDay(currentDate);
      case 'semaine': return startOfWeek(currentDate, { weekStartsOn: 1 });
      case 'mois': return startOfMonth(currentDate);
      case 'annee': return startOfYear(currentDate);
    }
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      switch (period) {
        case 'jour':
          return direction === 'next' ? addDays(prev, 1) : addDays(prev, -1);
        case 'semaine':
          return direction === 'next' ? addWeeks(prev, 1) : addWeeks(prev, -1);
        case 'mois':
          return direction === 'next' ? addMonths(prev, 1) : addMonths(prev, -1);
        case 'annee':
          return direction === 'next' ? addYears(prev, 1) : addYears(prev, -1);
      }
    });
  };

  const tablesWithReservations = getTablesWithReservations(getCurrentPeriodStart(), period, selectedSalleId);
  const tablesInSidebar = tablesWithReservations.filter(table => !table.position);
  const tablesOnFloor = tablesWithReservations.filter(table => table.position);

  const handleSidebarDragStart = (e: React.DragEvent, tableId: string) => {
    setDraggedTable(tableId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSidebarTouchStart = (tableId: string) => {
    setDraggedTable(tableId);
  };

  const handleFloorDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleFloorDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTable) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // ... (même code)
    }
  };

  const handleFloorTouchMove = (e: React.TouchEvent) => {
    if (draggedTable) e.preventDefault();
  };

  const handleFloorTouchEnd = (e: React.TouchEvent) => {
    if (draggedTable) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.changedTouches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      // ... (même code)
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex gap-3 items-center mb-2">
          <SalleSelector
            salles={salles}
            selectedSalleId={selectedSalleId}
            onSalleChange={setSelectedSalleId}
            className="w-52"
          />
          {/* Peut rajouter gestion de création de salle ici si on veut */}
        </div>
      </div>
      <PeriodSelector
        period={period}
        onPeriodChange={setPeriod}
        currentDate={currentDate}
        onNavigate={navigatePeriod}
      />
      <div className="flex">
        <TablesSidebar
          tables={tablesInSidebar}
          onDragStart={handleSidebarDragStart}
          onTouchStart={handleSidebarTouchStart}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 p-4">
          <SalleFloor
            tables={tablesOnFloor}
            handleDragOver={handleFloorDragOver}
            handleDrop={handleFloorDrop}
            handleTouchMove={handleFloorTouchMove}
            handleTouchEnd={handleFloorTouchEnd}
            currentDate={getCurrentPeriodStart()}
          />
        </div>
      </div>
    </div>
  );
};

export default Salle;
