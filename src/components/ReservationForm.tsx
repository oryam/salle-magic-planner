import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus } from 'lucide-react';
import { useRestaurant } from '@/context/RestaurantContext';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import TableIcon from './TableIcon';
import TableSelector from './TableSelector';
import ReservationDetailsForm from './ReservationDetailsForm';

interface ReservationFormProps {
  currentDate?: Date;
  period?: string;
  newReservationDate?: Date | null;
  newReservationTableId?: string | null;
  onDialogClose?: () => void;
  salleId?: string;
}

const ReservationForm = ({
  currentDate = new Date(),
  period = 'jour',
  newReservationDate,
  newReservationTableId,
  onDialogClose,
  salleId,
}: ReservationFormProps) => {
  const { tables, reservations, addReservation, getTableStatus } = useRestaurant();
  const [open, setOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [nombrePersonnes, setNombrePersonnes] = useState('');
  const [nomClient, setNomClient] = useState('');

  // Ouvrir le dialogue si déclenché depuis le calendrier ou Etat de table
  useEffect(() => {
    if (newReservationDate || newReservationTableId) {
      setOpen(true);
    }
  }, [newReservationDate, newReservationTableId]);

  // Pré-remplir la date
  useEffect(() => {
    if (open) {
      let defaultDate: Date;
      if (newReservationDate) {
        defaultDate = newReservationDate;
      } else if (period === 'jour') {
        defaultDate = currentDate;
      } else {
        // Pour semaine, mois, année : aujourd'hui + 1
        defaultDate = addDays(new Date(), 1);
      }
      setDate(format(defaultDate, 'yyyy-MM-dd'));
    }
  }, [open, currentDate, period, newReservationDate]);

  // Pré-remplir la table sélectionnée si newReservationTableId
  useEffect(() => {
    if (open && newReservationTableId) {
      setSelectedTableId(newReservationTableId);
    }
  }, [open, newReservationTableId]);

  // Pré-remplir le nombre de personnes selon la table sélectionnée
  useEffect(() => {
    if (selectedTableId) {
      const selectedTable = tables.find(table => table.id === selectedTableId);
      if (selectedTable) {
        setNombrePersonnes(selectedTable.nombrePersonnes.toString());
      }
    }
  }, [selectedTableId, tables]);

  // Obtenir le statut de chaque table pour la date sélectionnée
  const getTableStatusForDate = (tableId: string) => {
    if (!date) return 'libre';
    return getTableStatus(tableId, new Date(date));
  };

  // Obtenir les réservations pour une table à la date sélectionnée
  const getTableReservationsForDate = (tableId: string) => {
    if (!date) return [];
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    return reservations.filter(res => {
      const resDate = new Date(res.date);
      resDate.setHours(0, 0, 0, 0);
      return res.tableId === tableId && resDate.getTime() === selectedDate.getTime();
    });
  };

  const resetForm = () => {
    setSelectedTableId('');
    setDate('');
    setHeure('');
    setNombrePersonnes('');
    setNomClient('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
      if (onDialogClose) {
        onDialogClose();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine la date (yyyy-MM-dd) et l'heure (HH:mm) en un objet Date complet
    let finalDate = new Date(date);
    if (heure) {
      const [hh, mm] = heure.split(':');
      finalDate.setHours(Number(hh), Number(mm), 0, 0);
    }

    addReservation({
      tableId: selectedTableId,
      date: finalDate,
      heure,
      nombrePersonnes: Number(nombrePersonnes),
      nomClient
    });

    handleOpenChange(false);
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEE dd/MM HH:mm', { locale: fr });
  };

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'reservee': return 'bg-red-100 text-red-800';
      case 'attente': return 'bg-yellow-100 text-yellow-800';
      case 'libre': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'reservee': return 'Réservée';
      case 'attente': return 'En attente';
      case 'libre': return 'Libre';
      default: return statut;
    }
  };

  // Restriction des tables à celles de la salle si salleId fourni
  const tablesFiltered = salleId ? tables.filter(t => t.salleId === salleId) : tables;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-0 sm:mr-2" />
          <span className="hidden sm:inline">Réserver une table</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle réservation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <TableSelector
            tables={tablesFiltered}
            date={date}
            selectedTableId={selectedTableId}
            getTableStatusForDate={getTableStatusForDate}
            getStatusBadgeColor={getStatusBadgeColor}
            getStatusText={getStatusText}
            getTableReservationsForDate={getTableReservationsForDate}
            onSelect={setSelectedTableId}
          />
          <ReservationDetailsForm
            date={date}
            heure={heure}
            nombrePersonnes={nombrePersonnes}
            nomClient={nomClient}
            onDateChange={setDate}
            onHeureChange={setHeure}
            onNombrePersonnesChange={setNombrePersonnes}
            onNomClientChange={setNomClient}
            onSubmit={handleSubmit}
            disabled={!selectedTableId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ReservationForm;
