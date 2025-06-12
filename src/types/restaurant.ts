
export type TableShape = 'ronde' | 'carre' | 'rectangulaire';
export type TableStatus = 'libre' | 'reservee' | 'attente';

export interface Table {
  id: string;
  numero: number;
  forme: TableShape;
  nombrePersonnes: number;
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
