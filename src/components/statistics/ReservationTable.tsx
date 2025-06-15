
import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Reservation, Table as TableType } from "@/types/restaurant";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import SimplePagination from "@/components/SimplePagination";

type SortField = 'table' | 'date' | 'client';
type SortDirection = 'asc' | 'desc';

type Props = {
  reservations: Reservation[];
  tables: TableType[];
};

const ReservationTable: React.FC<Props> = ({ reservations, tables }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  // Créer un map pour récupérer rapidement les informations des tables
  const tableMap = useMemo(() => {
    return new Map(tables.map(table => [table.id, table]));
  }, [tables]);

  // Fonction de tri
  const sortedReservations = useMemo(() => {
    return [...reservations].sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'table':
          const tableA = tableMap.get(a.tableId);
          const tableB = tableMap.get(b.tableId);
          const numeroA = tableA?.numero || 0;
          const numeroB = tableB?.numero || 0;
          compareValue = numeroA - numeroB;
          break;
        case 'date':
          compareValue = a.date.getTime() - b.date.getTime();
          break;
        case 'client':
          const clientA = a.nomClient || '';
          const clientB = b.nomClient || '';
          compareValue = clientA.localeCompare(clientB);
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
  }, [reservations, sortField, sortDirection, tableMap]);

  // Pagination
  const totalPages = perPage === -1 ? 1 : Math.ceil(sortedReservations.length / perPage);
  const paginatedReservations = useMemo(() => {
    if (perPage === -1) return sortedReservations;
    const startIndex = (currentPage - 1) * perPage;
    return sortedReservations.slice(startIndex, startIndex + perPage);
  }, [sortedReservations, currentPage, perPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field;
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSort(field)}
        className="h-auto p-0 font-medium hover:bg-transparent"
      >
        <span className="flex items-center gap-1">
          {children}
          {isActive ? (
            sortDirection === 'asc' ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )
          ) : (
            <ChevronUp className="h-3 w-3 opacity-30" />
          )}
        </span>
      </Button>
    );
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="table">Table</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="date">Date</SortButton>
              </TableHead>
              <TableHead>Heure</TableHead>
              <TableHead>Personnes</TableHead>
              <TableHead>
                <SortButton field="client">Client</SortButton>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aucune réservation trouvée pour cette période
                </TableCell>
              </TableRow>
            ) : (
              paginatedReservations.map((reservation) => {
                const table = tableMap.get(reservation.tableId);
                return (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      Table {table?.numero || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {format(reservation.date, "dd/MM/yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>{reservation.heure}</TableCell>
                    <TableCell>{reservation.nombrePersonnes}</TableCell>
                    <TableCell>{reservation.nomClient || '-'}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {reservations.length} réservation{reservations.length > 1 ? 's' : ''} trouvée{reservations.length > 1 ? 's' : ''}
        </div>
        
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          setPage={setCurrentPage}
          setPerPage={handlePerPageChange}
          perPageOptions={[5, 20, 100, -1]}
        />
      </div>
    </div>
  );
};

export default ReservationTable;
