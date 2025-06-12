
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRestaurant } from '@/context/RestaurantContext';
import DraggableTable from '@/components/DraggableTable';
import TableIcon from '@/components/TableIcon';
import { useState } from 'react';

const Salle = () => {
  const { getTablesWithReservations, updateTable } = useRestaurant();
  const tablesWithReservations = getTablesWithReservations();
  const tablesInSidebar = tablesWithReservations.filter(table => !table.position);
  const tablesOnFloor = tablesWithReservations.filter(table => table.position);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);

  // Gestionnaires pour les tables dans la sidebar
  const handleSidebarDragStart = (e: React.DragEvent, tableId: string) => {
    setDraggedTable(tableId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSidebarTouchStart = (tableId: string) => {
    setDraggedTable(tableId);
  };

  // Gestionnaires pour la zone de dépôt du plan de salle
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
      <div className="flex">
        {/* Panneau latéral */}
        <div className="w-80 bg-card border-r border-border p-4">
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
        </div>

        {/* Plan de salle */}
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
