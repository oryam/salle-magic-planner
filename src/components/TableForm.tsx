
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Table, TableShape } from '@/types/restaurant';
import { useRestaurant } from '@/context/RestaurantContext';

interface TableFormProps {
  table?: Table;
  isEdit?: boolean;
  onClose?: () => void;
  salleId: string; // <--- ADD THIS PROP
}

const TableForm = ({ table, isEdit = false, onClose, salleId }: TableFormProps) => {
  const { addTable, updateTable, tables } = useRestaurant();
  const [open, setOpen] = useState(false);
  const [numero, setNumero] = useState(table?.numero || '');
  const [forme, setForme] = useState<TableShape>(table?.forme || 'ronde');
  const [nombrePersonnes, setNombrePersonnes] = useState(table?.nombrePersonnes || '');

  // Pré-remplir le numéro de table suivant lors de l'ouverture du dialog
  useEffect(() => {
    if (open && !isEdit) {
      const existingNumbers = tables.filter(t => t.salleId === salleId).map(t => t.numero).sort((a, b) => a - b);
      let nextNumber = 1;
      
      // Trouver le premier numéro disponible
      for (let i = 0; i < existingNumbers.length; i++) {
        if (existingNumbers[i] !== nextNumber) {
          break;
        }
        nextNumber++;
      }
      
      setNumero(nextNumber.toString());
    }
  }, [open, isEdit, tables, salleId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Always use salleId from props
    const tableData = {
      numero: Number(numero),
      forme,
      nombrePersonnes: Number(nombrePersonnes),
      salleId,
      ...(table && { position: table.position, rotation: table.rotation, couleur: table.couleur })
    };

    if (isEdit && table) {
      updateTable(table.id, tableData);
      onClose?.();
    } else {
      addTable(tableData);
      setOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setNumero('');
    setForme('ronde');
    setNombrePersonnes('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  if (isEdit) {
    return (
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="numero">Numéro de table</Label>
            <Input
              id="numero"
              type="number"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="forme">Forme</Label>
            <Select value={forme} onValueChange={(value: TableShape) => setForme(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ronde">Ronde</SelectItem>
                <SelectItem value="carre">Carrée</SelectItem>
                <SelectItem value="rectangulaire">Rectangulaire</SelectItem>
              </SelectContent>
            </Select>
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
          
          <div className="flex space-x-2">
            <Button type="submit">Modifier</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-0 sm:mr-2" />
          <span className="hidden sm:inline">Ajouter une table</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle table</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="numero">Numéro de table</Label>
            <Input
              id="numero"
              type="number"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="forme">Forme</Label>
            <Select value={forme} onValueChange={(value: TableShape) => setForme(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ronde">Ronde</SelectItem>
                <SelectItem value="carre">Carrée</SelectItem>
                <SelectItem value="rectangulaire">Rectangulaire</SelectItem>
              </SelectContent>
            </Select>
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
          
          <Button type="submit" className="w-full">Ajouter</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TableForm;
