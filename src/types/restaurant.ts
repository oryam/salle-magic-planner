
export type TableShape = 'ronde' | 'carre' | 'rectangulaire';
export type TableStatus = 'libre' | 'reservee' | 'attente';
export type PeriodType = 'jour' | 'semaine' | 'mois' | 'annee' | '12mois' | 'custom';

export type SalleId = string;

export interface Salle {
  id: SalleId;
  nom: string;
}

export interface Table {
  id: string;
  numero: number;
  forme: TableShape;
  nombrePersonnes: number;
  salleId: SalleId;
  couleur?: string;
  position?: { x: number; y: number };
  rotation?: number; // Pour les tables rectangulaires
}

export interface Reservation {
  id: string;
  tableId: string;
  date: Date;
  heure: string;
  nombrePersonnes: number;
  nomClient?: string;
}

export interface TableWithReservations extends Table {
  reservations: Reservation[];
  statut: TableStatus;
  prochaineDateReservation?: Date;
}
