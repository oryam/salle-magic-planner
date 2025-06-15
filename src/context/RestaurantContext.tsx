
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  Table, Reservation, TableWithReservations, 
  TableStatus, TableShape, Salle, SalleId 
} from '@/types/restaurant';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { 
  defaultSalles, 
  defaultTables, 
  defaultReservations, 
  generateRandomReservations
} from '@/data/restaurantInitialData';

// Clés pour localStorage
const STORAGE_KEYS = {
  SALLES: 'restaurant-salles',
  TABLES: 'restaurant-tables',
  RESERVATIONS: 'restaurant-reservations'
};

interface RestaurantContextType {
  salles: Salle[];
  tables: Table[];
  reservations: Reservation[];
  addSalle: (nom: string) => void;
  deleteSalle: (id: string) => void;
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (id: string, table: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  getTablesWithReservations: (date?: Date, period?: string, salleId?: SalleId) => TableWithReservations[];
  getTableStatus: (tableId: string, date: Date) => TableStatus;
  importSalles: (items: Salle[]) => void;
  importTables: (items: Table[]) => void;
  importReservations: (items: Reservation[]) => void;
  resetAllData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// Fonctions utilitaires pour localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde en localStorage:', error);
  }
};

const loadFromStorage = <T extends any>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erreur lors du chargement depuis localStorage:', error);
  }
  return defaultValue;
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  // Chargement initial depuis localStorage ou données par défaut
  const [salles, setSalles] = useState<Salle[]>(() => 
    loadFromStorage(STORAGE_KEYS.SALLES, defaultSalles)
  );
  const [tables, setTables] = useState<Table[]>(() => 
    loadFromStorage(STORAGE_KEYS.TABLES, defaultTables)
  );
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const stored = loadFromStorage(STORAGE_KEYS.RESERVATIONS, defaultReservations);
    // S'assurer que les dates sont bien désérialisées
    return stored.map((r: any) => ({
      ...r,
      date: typeof r.date === "string" ? new Date(r.date) : r.date,
    }));
  });

  // Sauvegarde automatique lors des changements
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SALLES, salles);
  }, [salles]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TABLES, tables);
  }, [tables]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RESERVATIONS, reservations);
  }, [reservations]);

  // Fonctions d'import
  const importSalles = (newSalles: Salle[]) => {
    setSalles([...newSalles]);
  };
  const importTables = (newTables: Table[]) => {
    setTables([...newTables]);
  };
  const importReservations = (newReservations: Reservation[]) => {
    // On s'assure que les dates sont bien désérialisées
    const validatedReservations = newReservations.map((r) => ({
      ...r,
      date: typeof r.date === "string" ? new Date(r.date) : r.date,
    }));
    setReservations([...validatedReservations]);
  };

  // GESTION DES SALLES
  const addSalle = (nom: string) => {
    const newSalle: Salle = { id: Date.now().toString(), nom };
    setSalles(prev => [...prev, newSalle]);
  };
  const deleteSalle = (id: string) => {
    setSalles(prev => prev.filter(salle => salle.id !== id));
    setTables(prev => prev.filter(table => table.salleId !== id));
  };

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

  // Nouvel argument salleId
  const getTablesWithReservations = (date?: Date, period?: string, salleId?: SalleId): TableWithReservations[] => {
    const targetDate = date || new Date();
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
    return tables
      .filter(table => !salleId || table.salleId === salleId)
      .map(table => {
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

  // Nouvelle fonction pour remettre toutes les données à zéro (utilise les nouvelles résas démo)
  const resetAllData = () => {
    setSalles([...defaultSalles]);
    setTables([...defaultTables]);
    setReservations([...defaultReservations]);
    // Nettoyer localStorage
    localStorage.removeItem(STORAGE_KEYS.SALLES);
    localStorage.removeItem(STORAGE_KEYS.TABLES);
    localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
    toast({
      title: "Données réinitialisées",
      description: "Les données ont été réinitialisées avec un jeu d'exemple enrichi.",
    });
  };

  return (
    <RestaurantContext.Provider value={{
      salles,
      tables,
      reservations,
      addSalle,
      deleteSalle,
      addTable,
      updateTable,
      deleteTable,
      addReservation,
      updateReservation,
      deleteReservation,
      getTablesWithReservations,
      getTableStatus,
      importSalles,
      importTables,
      importReservations,
      resetAllData,
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};
