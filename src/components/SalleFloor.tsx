
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DraggableTable from "@/components/DraggableTable";

interface SalleFloorProps {
  tables: any[]; // Tables "on the floor"
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  currentDate: Date;
}

const SalleFloor: React.FC<SalleFloorProps> = ({
  tables,
  handleDragOver,
  handleDrop,
  handleTouchMove,
  handleTouchEnd,
  currentDate
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Plan de salle</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div 
          className="relative w-full h-96 bg-muted rounded-lg overflow-hidden"
          style={{ minHeight: '600px' }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {tables.map(table => (
            <DraggableTable
              key={table.id}
              table={table}
              statut={table.statut}
              reservations={table.reservations}
              currentDate={currentDate}
            />
          ))}
          {tables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">
                Glissez les tables depuis le panneau latéral pour les placer
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalleFloor;
