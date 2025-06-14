
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TableIcon from '@/components/TableIcon';
import React from 'react';

interface TableSidebarTable {
  id: string;
  forme: string;
  numero: number;
  nombrePersonnes: number;
  statut: 'libre' | 'reservee' | 'attente';
}

interface TablesSidebarProps {
  tables: TableSidebarTable[];
  onDragStart: (e: React.DragEvent, tableId: string) => void;
  onTouchStart: (tableId: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const TablesSidebar: React.FC<TablesSidebarProps> = ({
  tables,
  onDragStart,
  onTouchStart,
  sidebarCollapsed,
  toggleSidebar
}) => {
  return (
    <div className={`transition-all duration-300 bg-card border-r border-border ${
      sidebarCollapsed ? 'w-12' : 'w-80'
    }`}>
      <div className="p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="w-full mb-4"
        >
          {sidebarCollapsed ? (
            <span aria-label="Ouvrir">{"<"}</span>
          ) : (
            <span aria-label="Fermer">{">"}</span>
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
                  {tables.map(table => (
                    <div
                      key={table.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-move select-none"
                      draggable
                      onDragStart={(e) => onDragStart(e, table.id)}
                      onTouchStart={() => onTouchStart(table.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <TableIcon forme={table.forme as any} />
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
                  {tables.length === 0 && (
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
  );
};

export default TablesSidebar;
