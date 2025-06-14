
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ReservationDetailsFormProps {
  date: string;
  heure: string;
  nombrePersonnes: string;
  nomClient: string;
  onDateChange: (v: string) => void;
  onHeureChange: (v: string) => void;
  onNombrePersonnesChange: (v: string) => void;
  onNomClientChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
}

const ReservationDetailsForm: React.FC<ReservationDetailsFormProps> = ({
  date, heure, nombrePersonnes, nomClient,
  onDateChange, onHeureChange, onNombrePersonnesChange, onNomClientChange,
  onSubmit, disabled,
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="heure">Heure</Label>
        <Input
          id="heure"
          type="time"
          value={heure}
          onChange={(e) => onHeureChange(e.target.value)}
          required
        />
      </div>
    </div>

    <div>
      <Label htmlFor="nombrePersonnes">Nombre de personnes</Label>
      <Input
        id="nombrePersonnes"
        type="number"
        value={nombrePersonnes}
        onChange={(e) => onNombrePersonnesChange(e.target.value)}
        required
      />
    </div>

    <div>
      <Label htmlFor="nomClient">Nom du client</Label>
      <Input
        id="nomClient"
        value={nomClient}
        onChange={(e) => onNomClientChange(e.target.value)}
        placeholder="Optionnel"
      />
    </div>

    <Button type="submit" className="w-full" disabled={disabled}>
      Confirmer la réservation
    </Button>
  </form>
);

export default ReservationDetailsForm;
