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

type PeriodType = 'jour' | 'semaine' | 'mois' | 'annee';

const Salle = () => {
  const { getTablesWithReservations, updateTable } = useRestaurant();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState<PeriodType>('jour');
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const tablesWithReservations = getTablesWithReservations(getCurrentPeriodStart(), period);
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
      
      updateTable(draggedTable, {
        position: { x: Math.max(0, x - 30), y: Math.max(0, y - 30) }
      });
      
      setDraggedTable(null);
    }
  };

  const handleFloorTouchMove = (e: React.TouchEvent) => {
    if (draggedTable) {
      e.preventDefault();
    }
  };

  const handleFloorTouchEnd = (e: React.TouchEvent) => {
    if (draggedTable) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.changedTouches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      updateTable(draggedTable, {
        position: { x: Math.max(0, x - 30), y: Math.max(0, y - 30) }
      });
      
      setDraggedTable(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sélecteur de date */}
      <div className="p-4 border-b">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
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
                <Button variant="outline" size="sm" onClick={() => navigatePeriod('prev')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-48 text-center">{formatPeriodDisplay()}</span>
                <Button variant="outline" size="sm" onClick={() => navigatePeriod('next')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex">
        {/* Panneau latéral avec bouton de basculement */}
        <div className={`transition-all duration-300 bg-card border-r border-border ${
          sidebarCollapsed ? 'w-12' : 'w-80'
        }`}>
          <div className="p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full mb-4"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>

            {!sidebarCollapsed && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Tables disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tablesInSidebar.map(table => (
                        <div
                          key={table.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-move select-none"
                          draggable
                          onDragStart={(e) => handleSidebarDragStart(e, table.id)}
                          onTouchStart={() => handleSidebarTouchStart(table.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <TableIcon forme={table.forme} />
                            <div>
                              <span className="font-medium">Table {table.numero}</span>
                              <div className="text-sm text-muted-foreground">
                                {table.nombrePersonnes} personnes
                              </div>
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            table.statut === 'reservee' ? 'bg-green-500' :
                            table.statut === 'attente' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`} />
                        </div>
                      ))}
                      
                      {tablesInSidebar.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          Toutes les tables sont placées
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Légende</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Réservée</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">En attente</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                        <span className="text-sm">Libre</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Plan de salle</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div 
                className="relative w-full h-96 bg-muted rounded-lg overflow-hidden"
                style={{ minHeight: '600px' }}
                onDragOver={handleFloorDragOver}
                onDrop={handleFloorDrop}
                onTouchMove={handleFloorTouchMove}
                onTouchEnd={handleFloorTouchEnd}
              >
                {tablesOnFloor.map(table => (
                  <DraggableTable
                    key={table.id}
                    table={table}
                    statut={table.statut}
                    reservations={table.reservations}
                    currentDate={getCurrentPeriodStart()}
                  />
                ))}
                
                {tablesOnFloor.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Glissez les tables depuis le panneau latéral pour les placer
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Salle;
