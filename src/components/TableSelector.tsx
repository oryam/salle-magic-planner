
import React from 'react';
import TableIcon from './TableIcon';
import { Label } from '@/components/ui/label';
import { TableShape } from '@/types/restaurant'; // <-- Add this import

interface Table {
  id: string;
  numero: number;
  forme: TableShape; // <-- Fix type here
  nombrePersonnes: number;
}

interface TableSelectorProps {
  tables: Table[];
  date: string;
  selectedTableId: string;
  getTableStatusForDate: (tableId: string) => string;
  getStatusBadgeColor: (statut: string) => string;
  getStatusText: (statut: string) => string;
  getTableReservationsForDate: (tableId: string) => any[];
  onSelect: (id: string) => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  tables,
  date,
  selectedTableId,
  getTableStatusForDate,
  getStatusBadgeColor,
  getStatusText,
  getTableReservationsForDate,
  onSelect,
}) => (
  <div>
    <Label>Toutes les tables</Label>
    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
      {tables.map(table => {
        const statut = getTableStatusForDate(table.id);
        const tableReservations = getTableReservationsForDate(table.id);

        return (
          <div
            key={table.id}
            className={`flex items-center justify-between p-3 rounded cursor-pointer border ${
              selectedTableId === table.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            onClick={() => onSelect(table.id)}
          >
            <div className="flex items-center space-x-3">
              <TableIcon forme={table.forme} />
              <span className="font-medium">Table {table.numero}</span>
              <span className="text-sm text-muted-foreground">{table.nombrePersonnes} personnes</span>
              <span className={`text-sm px-2 py-1 rounded ${getStatusBadgeColor(statut)}`}>
                {getStatusText(statut)}
              </span>
            </div>
            {tableReservations.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {tableReservations.length} réservation(s)
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default TableSelector;
