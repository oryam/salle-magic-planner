
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Table, Reservation, TableWithReservations, TableStatus } from '@/types/restaurant';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface RestaurantContextType {
  tables: Table[];
  reservations: Reservation[];
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (id: string, table: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  getTablesWithReservations: (date?: Date, period?: string) => TableWithReservations[];
  getTableStatus: (tableId: string, date: Date) => TableStatus;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [tables, setTables] = useState<Table[]>([
    {
      id: '1',
      numero: 1,
      forme: 'ronde',
      nombrePersonnes: 4,
      position: { x: 100, y: 100 }
    },
    {
      id: '2',
      numero: 2,
      forme: 'rectangulaire',
      nombrePersonnes: 6,
      position: { x: 200, y: 150 },
      rotation: 0
    }
  ]);

  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: '1',
      tableId: '1',
      date: new Date(),
      heure: '19:30',
      nombrePersonnes: 4,
      nomClient: 'Dupont'
    }
  ]);

  const addTable = (tableData: Omit<Table, 'id'>) => {
    const newTable: Table = {
      ...tableData,
      id: Date.now().toString(),
    };
    setTables(prev => [...prev, newTable]);
  };

  const updateTable = (id: string, tableData: Partial<Table>) => {
    setTables(prev => prev.map(table => 
      table.id === id ? { ...table, ...tableData } : table
    ));
  };

  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(table => table.id !== id));
    setReservations(prev => prev.filter(res => res.tableId !== id));
  };

  const addReservation = (reservationData: Omit<Reservation, 'id'>) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: Date.now().toString(),
    };
    setReservations(prev => [...prev, newReservation]);
  };

  const updateReservation = (id: string, reservationData: Partial<Reservation>) => {
    setReservations(prev => prev.map(res => 
      res.id === id ? { ...res, ...reservationData } : res
    ));
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(res => res.id !== id));
  };

  const getTableStatus = (tableId: string, date: Date): TableStatus => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const tableReservations = reservations.filter(res => {
      const resDate = new Date(res.date);
      resDate.setHours(0, 0, 0, 0);
      return res.tableId === tableId && resDate.getTime() === targetDate.getTime();
    });

    if (tableReservations.length > 0) {
      return 'reservee';
    }
    
    return 'libre';
  };

  const getTablesWithReservations = (date?: Date, period?: string): TableWithReservations[] => {
    const targetDate = date || new Date();
    
    // Déterminer la plage de dates selon la période
    let startDate: Date;
    let endDate: Date;
    
    switch (period) {
      case 'jour':
        startDate = startOfDay(targetDate);
        endDate = endOfDay(targetDate);
        break;
      case 'semaine':
        startDate = startOfWeek(targetDate, { weekStartsOn: 1 });
        endDate = endOfWeek(targetDate, { weekStartsOn: 1 });
        break;
      case 'mois':
        startDate = startOfMonth(targetDate);
        endDate = endOfMonth(targetDate);
        break;
      case 'annee':
        startDate = startOfYear(targetDate);
        endDate = endOfYear(targetDate);
        break;
      default:
        startDate = startOfDay(targetDate);
        endDate = endOfDay(targetDate);
    }
    
    return tables.map(table => {
      const tableReservations = reservations.filter(res => {
        const resDate = new Date(res.date);
        return res.tableId === table.id && resDate >= startDate && resDate <= endDate;
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const statut = getTableStatus(table.id, targetDate);
      const prochaineDateReservation = tableReservations[0]?.date;

      return {
        ...table,
        reservations: tableReservations,
        statut,
        prochaineDateReservation
      };
    });
  };

  return (
    <RestaurantContext.Provider value={{
      tables,
      reservations,
      addTable,
      updateTable,
      deleteTable,
      addReservation,
      updateReservation,
      deleteReservation,
      getTablesWithReservations,
      getTableStatus
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};
