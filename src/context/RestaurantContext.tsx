import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Table, Reservation, TableWithReservations, 
  TableStatus, TableShape, Salle, SalleId 
} from '@/types/restaurant';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { toast } from "@/hooks/use-toast";

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

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  // Salles par défaut
  const defaultSalles: Salle[] = [
    { id: 'salle1', nom: 'Salle 1' },
    { id: 'salle2', nom: 'Salle 2' },
    { id: 'terrasse1', nom: 'Terrasse 1' },
    { id: 'etage1a', nom: 'Salle A à l\'étage 1' }
  ];
  const [salles, setSalles] = useState<Salle[]>(defaultSalles);

  // Nouvelles tables : 2 en salle 1, 4 en salle 2, 6 en terrasse 1
  const defaultTables: Table[] = [
    // Salle 1 (2 tables)
    { id: 't1', numero: 1, forme: 'ronde', nombrePersonnes: 6, salleId: 'salle1', position: { x: 80, y: 100 } },
    { id: 't2', numero: 2, forme: 'carre', nombrePersonnes: 4, salleId: 'salle1', position: { x: 130, y: 150 } },
    // Salle 2 (4 tables)
    { id: 't3', numero: 3, forme: 'ronde', nombrePersonnes: 4, salleId: 'salle2', position: { x: 220, y: 100 } },
    { id: 't4', numero: 4, forme: 'rectangulaire', nombrePersonnes: 8, salleId: 'salle2', position: { x: 300, y: 180 } },
    { id: 't5', numero: 5, forme: 'carre', nombrePersonnes: 2, salleId: 'salle2', position: { x: 340, y: 210 } },
    { id: 't6', numero: 6, forme: 'carre', nombrePersonnes: 2, salleId: 'salle2', position: { x: 180, y: 180 } },
    // Terrasse 1 (6 tables)
    { id: 't7', numero: 7, forme: 'ronde', nombrePersonnes: 5, salleId: 'terrasse1', position: { x: 80, y: 350 } },
    { id: 't8', numero: 8, forme: 'carre', nombrePersonnes: 4, salleId: 'terrasse1', position: { x: 120, y: 380 } },
    { id: 't9', numero: 9, forme: 'rectangulaire', nombrePersonnes: 6, salleId: 'terrasse1', position: { x: 200, y: 390 } },
    { id: 't10', numero: 10, forme: 'carre', nombrePersonnes: 2, salleId: 'terrasse1', position: { x: 280, y: 350 } },
    { id: 't11', numero: 11, forme: 'ronde', nombrePersonnes: 3, salleId: 'terrasse1', position: { x: 320, y: 370 } },
    { id: 't12', numero: 12, forme: 'carre', nombrePersonnes: 2, salleId: 'terrasse1', position: { x: 360, y: 390 } },
  ];

  // Générer 100 réservations pour les 12 tables, entre 01/01/2024 et 15/06/2025
  function generateRandomReservations(
    tables: Table[],
    n: number,
    start: Date,
    end: Date
  ): Reservation[] {
    const noms = [
      'M. Dupond', 'Patrick', 'Julie', 'Fatima', 'Guillaume',
      'Alice', 'Sophie', 'Karim', 'Laure', 'Xavier'
    ];
    const heures = [
      "08:00", "09:30", "12:00", "12:30", "13:00",
      "18:30", "19:30", "20:00", "21:00", "22:15"
    ];
    const resas: Reservation[] = [];
    for (let i = 0; i < n; i++) {
      // Date aléatoire
      const d = new Date(
        start.getTime() +
          Math.random() * (end.getTime() - start.getTime())
      );
      // Heure aléatoire pour la réservation
      const heureStr = heures[Math.floor(Math.random() * heures.length)];
      const [h, m] = heureStr.split(":").map(Number);
      d.setHours(h, m, 0, 0);

      // Table aléatoire
      const table = tables[Math.floor(Math.random() * tables.length)];
      // Nombre de personnes (2 - capacité max de la table)
      const nbPers = 2 + Math.floor(Math.random() * Math.max(1, (table.nombrePersonnes-1)));

      // Nom client
      const nomClient = noms[i % noms.length] + " #" + (i + 1);

      resas.push({
        id: (1000 + i).toString(),
        tableId: table.id,
        date: new Date(d), // Copie pour éviter mutation
        heure: heureStr,
        nombrePersonnes: nbPers,
        nomClient
      });
    }
    return resas;
  }

  const defaultReservations: Reservation[] = [
    ...generateRandomReservations(
      defaultTables,
      100,
      new Date(2024, 0, 1), // 01/01/2024
      new Date(2025, 5, 15) // 15/06/2025 (mois=5=Juin)
    )
  ];

  const [tables, setTables] = useState<Table[]>(defaultTables);
  const [reservations, setReservations] = useState<Reservation[]>(defaultReservations);

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
      resetAllData, // <-- On expose la nouvelle fonction ici
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};
