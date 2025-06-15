
import { Salle, Table, Reservation } from '@/types/restaurant';

// Salles par défaut
export const defaultSalles: Salle[] = [
  { id: 'salle1', nom: 'Salle 1' },
  { id: 'salle2', nom: 'Salle 2' },
  { id: 'terrasse1', nom: 'Terrasse 1' },
  { id: 'etage1a', nom: "Salle A à l'étage 1" },
];

// Tables par défaut
export const defaultTables: Table[] = [
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

// Fonction pour générer les réservations aléatoires
export function generateRandomReservations(
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
    const d = new Date(
      start.getTime() +
        Math.random() * (end.getTime() - start.getTime())
    );
    const heureStr = heures[Math.floor(Math.random() * heures.length)];
    const [h, m] = heureStr.split(":").map(Number);
    d.setHours(h, m, 0, 0);

    const table = tables[Math.floor(Math.random() * tables.length)];
    const nbPers = 2 + Math.floor(Math.random() * Math.max(1, (table.nombrePersonnes-1)));

    const nomClient = noms[i % noms.length] + " #" + (i + 1);

    resas.push({
      id: (1000 + i).toString(),
      tableId: table.id,
      date: new Date(d),
      heure: heureStr,
      nombrePersonnes: nbPers,
      nomClient
    });
  }
  return resas;
}

export const defaultReservations: Reservation[] = [
  ...generateRandomReservations(
    defaultTables,
    100,
    new Date(2024, 0, 1),
    new Date(2025, 5, 15)
  ),
];
