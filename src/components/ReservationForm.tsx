
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

interface ReservationFormProps {
  currentDate?: Date;
  period?: string;
}

const ReservationForm = ({ currentDate = new Date(), period = 'jour' }: ReservationFormProps) => {
  const { tables, reservations, addReservation, getTableStatus } = useRestaurant();
  const [open, setOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [nombrePersonnes, setNombrePersonnes] = useState('');
  const [nomClient, setNomClient] = useState('');

  // Pré-remplir la date selon la période
  useEffect(() => {
    if (open) {
      let defaultDate: Date;
      
      if (period === 'jour') {
        defaultDate = currentDate;
      } else {
        // Pour semaine, mois, année : aujourd'hui + 1
        defaultDate = addDays(new Date(), 1);
      }
      
      setDate(format(defaultDate, 'yyyy-MM-dd'));
    }
  }, [open, currentDate, period]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addReservation({
      tableId: selectedTableId,
      date: new Date(date),
      heure,
      nombrePersonnes: Number(nombrePersonnes),
      nomClient
    });

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedTableId('');
    setDate('');
    setHeure('');
    setNombrePersonnes('');
    setNomClient('');
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Réserver une table
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle réservation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label>Toutes les tables</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
              {tables.map(table => {
                const statut = getTableStatusForDate(table.id);
                const tableReservations = getTableReservationsForDate(table.id);
                
                return (
                  <div
                    key={table.id}
                    className={`flex items-center justify-between p-3 rounded cursor-pointer border ${
                      selectedTableId === table.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedTableId(table.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <TableIcon forme={table.forme} />
                      <span className="font-medium">Table {table.numero}</span>
                      <span className="text-sm text-muted-foreground">{table.nombrePersonnes} personnes</span>
                      <span className={`text-sm px-2 py-1 rounded ${getStatusBadgeColor(statut)}`}>
                        {getStatusText(statut)}
                      </span>
                    </div>
                    {tableReservations.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {tableReservations.length} réservation(s)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="heure">Heure</Label>
                <Input
                  id="heure"
                  type="time"
                  value={heure}
                  onChange={(e) => setHeure(e.target.value)}
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
                onChange={(e) => setNombrePersonnes(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="nomClient">Nom du client</Label>
              <Input
                id="nomClient"
                value={nomClient}
                onChange={(e) => setNomClient(e.target.value)}
                placeholder="Optionnel"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={!selectedTableId}>
              Confirmer la réservation
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationForm;
