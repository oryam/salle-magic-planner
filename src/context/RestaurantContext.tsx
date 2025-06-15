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

  // Tables par défaut
  const tableData: Table[] = [
    {
      id: '1',
      numero: 1,
      forme: 'ronde',
      nombrePersonnes: 6,
      salleId: 'salle1',
      position: { x: 120, y: 110 }
    },
    {
      id: '2',
      numero: 2,
      forme: 'carre',
      nombrePersonnes: 4,
      salleId: 'salle1',
      position: { x: 230, y: 160 }
    },
    {
      id: '3',
      numero: 3,
      forme: 'rectangulaire',
      nombrePersonnes: 8,
      salleId: 'salle2',
      position: { x: 340, y: 210 },
      rotation: 0
    }
  ];

  const today = new Date();
  const lastDayOfMonth = endOfMonth(today);

  const defaultTables = [...tableData];

  // Génère n réservations sur une période pour les tables disponibles
  function generateSampleReservations(
    refDate: Date,
    months: number,
    minPerMonth: number,
    maxPerMonth: number,
    tables: Table[]
  ) {
    const noms = [
      'M. Dupond', 'Patrick', 'Julie', 'Fatima', 'Guillaume',
      'Alice', 'Sophie', 'Karim', 'Laure', 'Xavier'
    ];
    const heuresMatin = ['07:30', '09:30', '10:45'];
    const heuresMidi = ['12:00', '12:30', '13:00', '14:15'];
    const heuresSoir = ['18:30', '20:00', '21:00', '22:15'];
    const reservations: Reservation[] = [];
    let rid = 10; // Avoid collision with existing demos

    for (let m = 0; m <= months; m++) {
      // Target month: add m months to refDate
      const baseMonth = new Date(refDate.getFullYear(), refDate.getMonth() + m, 1);
      const nbRes = Math.floor(Math.random() * (maxPerMonth - minPerMonth + 1)) + minPerMonth;
      for (let i = 0; i < nbRes; i++) {
        // Choose a date in the month (between 1 and 25 for simplicity)
        const day = Math.floor(Math.random() * 25) + 1;
        let date = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), day);
        // Randomly choose meal slot and hour
        const slotType = Math.floor(Math.random() * 3);
        let heure, heureArr, personnes;
        if (slotType === 0) { // matin
          heure = heuresMatin[Math.floor(Math.random() * heuresMatin.length)];
          personnes = 2 + Math.floor(Math.random()*2);
        } else if (slotType ===1) { // midi
          heure = heuresMidi[Math.floor(Math.random() * heuresMidi.length)];
          personnes = 2 + Math.floor(Math.random()*5);
        } else { // soir
          heure = heuresSoir[Math.floor(Math.random() * heuresSoir.length)];
          personnes = 2 + Math.floor(Math.random()*6);
        }
        // S'assurer que l'heure est bien valide (string -> {h, mn})
        heureArr = heure.split(':');
        date.setHours(parseInt(heureArr[0]), parseInt(heureArr[1]));
        // Table au hasard
        const table = tables[Math.floor(Math.random()*tables.length)];
        // Nom client fictif
        const nomClient = noms[(rid + i)%noms.length] + ` (${m+1}/${i+1})`;

        reservations.push({
          id: (rid++).toString(),
          tableId: table.id,
          date,
          heure,
          nombrePersonnes: personnes,
          nomClient
        });
      }
    }
    return reservations;
  }

  // Données démo enrichies
  const defaultReservations: Reservation[] = [
    // Les 3 exemples initiaux
    {
      id: '1',
      tableId: '1',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30),
      heure: '12:30',
      nombrePersonnes: 4,
      nomClient: 'M. Dupond'
    },
    {
      id: '2',
      tableId: '3',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0),
      heure: '20:00',
      nombrePersonnes: 7,
      nomClient: 'Patrick'
    },
    {
      id: '3',
      tableId: '2',
      date: new Date(lastDayOfMonth.getFullYear(), lastDayOfMonth.getMonth(), lastDayOfMonth.getDate(), 19, 15),
      heure: '19:15',
      nombrePersonnes: 4,
    },
    // + enrichissement : entre 1 et 5 résas par mois sur 4 mois (mois courant +3)
    ...generateSampleReservations(today, 3, 1, 5, tableData)
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
